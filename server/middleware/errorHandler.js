/**
 * @fileoverview Centralised error handling middleware.
 *
 * Security guarantees:
 *  - Stack traces are NEVER sent to the client in production
 *  - Operational errors (known, trusted) surface their message safely
 *  - Programmer errors (5xx) return only a generic message in production
 *  - All errors are fully logged server-side for debugging
 *  - 404 handler included (registered in app.js for /api routes)
 */

const config = require("../config");

/**
 * Determines whether an error is an "operational" error — i.e., one that was
 * deliberately thrown with a known status code and safe message (e.g.
 * validation failures, resource not found). Programmer errors are 500s.
 *
 * @param {Error & { statusCode?: number; isOperational?: boolean }} err
 * @returns {boolean}
 */
const isOperationalError = (err) =>
  Boolean(err.isOperational) || (err.statusCode && err.statusCode < 500);

/**
 * Formats a structured server-side log line for every error.
 *
 * @param {Error}                          err
 * @param {import('express').Request}      req
 * @param {number}                         statusCode
 */
const logError = (err, req, statusCode) => {
  const ip =
    (req.headers["x-forwarded-for"] || "").split(",")[0].trim() ||
    req.socket?.remoteAddress ||
    "unknown";

  // Always log full details internally
  const sep = "─".repeat(60);
  console.error(`\n${sep}`);
  console.error(`[ERROR] ${new Date().toISOString()}`);
  console.error(`  Method  : ${req.method}`);
  console.error(`  Path    : ${req.originalUrl}`);
  console.error(`  IP      : ${ip}`);
  console.error(`  Status  : ${statusCode}`);
  console.error(`  Message : ${err.message}`);
  if (err.stack) {
    console.error(`  Stack   :\n${err.stack}`);
  }
  console.error(`${sep}\n`);
};

/**
 * Global Express error-handling middleware (4-argument signature required).
 *
 * Sends a sanitised JSON response:
 *  - 4xx operational errors → surface err.message (safe by design)
 *  - 5xx in production       → generic message only, no stack
 *  - 5xx in development      → include stack for debugging
 *
 * @param {Error & { statusCode?: number; isOperational?: boolean }} err
 * @param {import('express').Request}      req
 * @param {import('express').Response}     res
 * @param {import('express').NextFunction} next  — required even if unused (Express arity check)
 * @returns {void}
 */
const errorHandler = (err, req, res, next) => { // eslint-disable-line no-unused-vars
  const isProduction = config.nodeEnv === "production";

  // Resolve status code: prefer explicit statusCode, fall through to res, default 500
  const statusCode =
    err.statusCode ||
    (res.statusCode !== 200 ? res.statusCode : 500);

  // Full internal log — always
  logError(err, req, statusCode);

  // Build safe client response
  const isClientError = isOperationalError(err);

  const clientMessage = isClientError
    ? err.message                                         // safe, deliberate message
    : isProduction
      ? "An internal server error occurred. Please contact operations support."
      : err.message || "An unexpected error occurred.";  // dev: expose full message

  const response = {
    status:     statusCode >= 500 ? "error" : "fail",
    statusCode,
    message:    clientMessage
  };

  // Include stack only in development for non-operational errors
  if (!isProduction && !isClientError && err.stack) {
    response.stack = err.stack;
  }

  // Do not leak any partial responses
  if (res.headersSent) return;

  res.status(statusCode).json(response);
};

/**
 * Convenience factory for creating operational errors with a known HTTP status.
 * Usage: throw createError(404, "Stadium not found.");
 *
 * @param {number} statusCode
 * @param {string} message
 * @returns {Error & { statusCode: number; isOperational: boolean }}
 */
const createError = (statusCode, message) => {
  const err = new Error(message);
  err.statusCode   = statusCode;
  err.isOperational = true;
  return err;
};

module.exports = errorHandler;
module.exports.createError = createError;
