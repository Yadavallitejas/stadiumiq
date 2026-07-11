/**
 * @fileoverview Rate limiting middleware using express-rate-limit.
 *
 * Two limiters are exported:
 *  - generalLimiter : 100 requests per 15 minutes per IP — applied to all /api routes
 *  - chatLimiter    : 15 requests per 1 minute per IP  — applied only to /api/chat
 *
 * Both limiters:
 *  - Return RFC-compliant RateLimit-* headers (standardHeaders: true)
 *  - Suppress the legacy X-RateLimit-* headers (legacyHeaders: false)
 *  - Return a structured JSON 429 response that is consistent with the rest of the API
 */

const rateLimit = require("express-rate-limit");

/**
 * Builds a JSON-formatted 429 rate-limit error body.
 * The `handler` override is used so the response body is identical to all
 * other API error responses and avoids express-rate-limit's own text format.
 *
 * @param {string} retryAfterSeconds - Human-readable retry guidance
 * @returns {Function} Express handler (req, res)
 */
const rateLimitHandler = (retryAfterSeconds) => (req, res) => {
  const ip =
    (req.headers["x-forwarded-for"] || "").split(",")[0].trim() ||
    req.socket?.remoteAddress ||
    "unknown";

  console.warn(
    `[RateLimit] 429 — IP: ${ip} — ${req.method} ${req.path} — limit exceeded`
  );

  res.status(429).json({
    status:     "fail",
    statusCode: 429,
    message:    `Too many requests from this IP. Please retry after ${retryAfterSeconds}.`
  });
};

// ─────────────────────────────────────────────────────────────────────────────
// General API limiter — 100 requests / 15 minutes / IP
// ─────────────────────────────────────────────────────────────────────────────

/**
 * General rate limiter applied to all /api/* routes.
 * Window: 15 minutes | Max: 100 requests
 * @type {Function}
 */
const generalLimiter = rateLimit({
  windowMs:       15 * 60 * 1000,  // 15 minutes
  max:            100,
  standardHeaders: true,           // RateLimit-Limit, RateLimit-Remaining, RateLimit-Reset
  legacyHeaders:  false,           // Disable X-RateLimit-* headers
  skipSuccessfulRequests: false,   // Count all requests, not just failures
  handler:        rateLimitHandler("15 minutes")
});

// ─────────────────────────────────────────────────────────────────────────────
// Chat route limiter — 15 requests / 1 minute / IP
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Strict rate limiter for the Gemini AI chat endpoint.
 * Prevents abuse of the paid AI API and protects against prompt-injection floods.
 * Window: 1 minute | Max: 15 requests
 * @type {Function}
 */
const chatLimiter = rateLimit({
  windowMs:       1 * 60 * 1000,   // 1 minute
  max:            15,
  standardHeaders: true,
  legacyHeaders:  false,
  handler:        rateLimitHandler("1 minute")
});

module.exports = {
  generalLimiter,
  chatLimiter
};
