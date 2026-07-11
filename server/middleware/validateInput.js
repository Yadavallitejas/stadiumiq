/**
 * @fileoverview Request validation and sanitization middleware.
 *
 * Responsibilities:
 *  1. Uses express-validator chains for field-level validation
 *  2. Sanitizes HTML entities from string inputs using the `he` library
 *  3. Rejects requests containing suspicious patterns (XSS, SQLi probes)
 *  4. Enforces Content-Type: application/json on all POST requests
 */

const { body, query, param, validationResult } = require("express-validator");
const he = require("he");

// ─────────────────────────────────────────────────────────────────────────────
// Suspicious-pattern blocklist
// Catches obvious XSS probes (script/event handlers) and common SQL keywords.
// This is a belt-and-suspenders check; express-validator .escape() is the
// primary defence. Do NOT rely on this as a sole sanitisation strategy.
// ─────────────────────────────────────────────────────────────────────────────
const SUSPICIOUS_PATTERN = /<script[\s\S]*?>|<\/script>|on\w+\s*=|javascript\s*:|vbscript\s*:|data\s*:|(\bUNION\b|\bSELECT\b|\bINSERT\b|\bDROP\b|\bDELETE\b|\bUPDATE\b|\bEXEC\b|\bXP_\b)/i;

/**
 * Middleware that rejects any request whose body, query, or params contain
 * strings matching known XSS or SQL-injection probes.
 *
 * @param {import('express').Request}      req
 * @param {import('express').Response}     res
 * @param {import('express').NextFunction} next
 */
const rejectSuspiciousInput = (req, res, next) => {
  const targets = [req.body, req.query, req.params];

  for (const obj of targets) {
    if (!obj || typeof obj !== "object") continue;
    for (const [key, val] of Object.entries(obj)) {
      if (typeof val === "string" && SUSPICIOUS_PATTERN.test(val)) {
        console.warn(
          `[Security] Suspicious pattern detected in field '${key}' on ${req.method} ${req.path} — IP: ${(req.headers["x-forwarded-for"] || req.socket?.remoteAddress || "unknown").split(",")[0].trim()}`
        );
        return res.status(400).json({
          status: "fail",
          statusCode: 400,
          message: "Request rejected: input contains disallowed content."
        });
      }
    }
  }
  next();
};

/**
 * Middleware that enforces Content-Type: application/json on POST, PUT, and
 * PATCH requests to the API. Returns 415 Unsupported Media Type if the header
 * is absent or incorrect.
 *
 * @param {import('express').Request}      req
 * @param {import('express').Response}     res
 * @param {import('express').NextFunction} next
 */
const enforceJsonContentType = (req, res, next) => {
  const methodsRequiringJson = ["POST", "PUT", "PATCH"];
  if (!methodsRequiringJson.includes(req.method)) return next();

  const contentType = req.headers["content-type"] || "";
  if (!contentType.includes("application/json")) {
    return res.status(415).json({
      status: "fail",
      statusCode: 415,
      message: "Unsupported Media Type: Content-Type must be 'application/json' for POST requests."
    });
  }
  next();
};

/**
 * Decodes any percent-encoded or HTML-entity strings in req.body string fields
 * then re-encodes HTML-special characters (<, >, &, ', ") to neutralise injected
 * markup. Only processes ASCII-range characters to leave Unicode (e.g. Arabic,
 * CJK, emoji) completely intact.
 *
 * @param {import('express').Request}      req
 * @param {import('express').Response}     res
 * @param {import('express').NextFunction} next
 */
const sanitizeHtmlInputs = (req, res, next) => {
  if (req.body && typeof req.body === "object") {
    for (const key of Object.keys(req.body)) {
      if (typeof req.body[key] === "string") {
        // Only encode the five HTML-dangerous ASCII chars; leave all other chars untouched.
        // This preserves Arabic, CJK, emoji, and other non-ASCII scripts.
        req.body[key] = req.body[key]
          .replace(/&/g, "&amp;")
          .replace(/</g, "&lt;")
          .replace(/>/g, "&gt;")
          .replace(/"/g, "&quot;")
          .replace(/'/g, "&#x27;");
      }
    }
  }
  next();
};

// ─────────────────────────────────────────────────────────────────────────────
// Shared validation error responder
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Terminal middleware in each validation chain.
 * Evaluates accumulated express-validator errors and returns 400 if any exist.
 *
 * @param {import('express').Request}      req
 * @param {import('express').Response}     res
 * @param {import('express').NextFunction} next
 * @returns {void}
 */
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      status: "fail",
      statusCode: 400,
      message: "Validation failed",
      errors: errors.array().map((err) => ({
        location: err.location,
        param:    err.path,
        value:    err.value,
        message:  err.msg
      }))
    });
  }
  next();
};

// ─────────────────────────────────────────────────────────────────────────────
// Validation rule sets
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Validates and sanitises chat message POST bodies.
 * Order: enforce Content-Type → reject suspicious patterns → sanitise HTML → validate fields.
 * - 'message' must be a non-empty string (HTML-escaped)
 * - 'lang' must be one of the six supported locale codes if provided
 * @type {Array<Function>}
 */
const validateChat = [
  enforceJsonContentType,
  rejectSuspiciousInput,  // Must run BEFORE sanitizeHtmlInputs (which encodes < to &lt;)
  sanitizeHtmlInputs,
  body("message")
    .isString().withMessage("Message must be a string")
    .trim()
    .notEmpty().withMessage("Message cannot be empty")
    .isLength({ max: 2000 }).withMessage("Message must not exceed 2000 characters")
    .escape(),
  body("lang")
    .optional()
    .isIn(["en", "es", "fr", "pt", "ar", "de"])
    .withMessage("Language must be one of: en, es, fr, pt, ar, de"),
  handleValidationErrors
];

/**
 * Validates nearest-stadium geolocation query parameters.
 * @type {Array<Function>}
 */
const validateCoordinates = [
  rejectSuspiciousInput,
  query("lat")
    .exists().withMessage("Latitude (lat) is required")
    .isFloat({ min: -90, max: 90 })
    .withMessage("Latitude must be a float between -90 and 90")
    .toFloat(),
  query("lng")
    .exists().withMessage("Longitude (lng) is required")
    .isFloat({ min: -180, max: 180 })
    .withMessage("Longitude must be a float between -180 and 180")
    .toFloat(),
  handleValidationErrors
];

/**
 * Validates the :id path parameter for single-stadium lookups.
 * Only allows lowercase alphanumeric kebab-case identifiers.
 * @type {Array<Function>}
 */
const validateStadiumId = [
  param("id")
    .isString().withMessage("Stadium ID must be a string")
    .trim()
    .matches(/^[a-z0-9-]+$/)
    .withMessage("Stadium ID must be lowercase alphanumeric and kebab-case"),
  handleValidationErrors
];

/**
 * Validates optional query filters on the matches list endpoint.
 * @type {Array<Function>}
 */
const validateMatchFilter = [
  rejectSuspiciousInput,
  query("stadiumId")
    .optional()
    .isString()
    .trim()
    .escape(),
  query("date")
    .optional()
    .isISO8601()
    .withMessage("Date must be in YYYY-MM-DD format"),
  query("status")
    .optional()
    .isIn(["scheduled", "live", "completed"])
    .withMessage("Status must be one of: scheduled, live, completed"),
  handleValidationErrors
];

module.exports = {
  validateChat,
  validateCoordinates,
  validateStadiumId,
  validateMatchFilter,
  // Exported individually so they can be composed into other route chains
  enforceJsonContentType,
  sanitizeHtmlInputs,
  rejectSuspiciousInput
};
