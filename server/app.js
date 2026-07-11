/**
 * @fileoverview Express application configuration.
 * Implements a defence-in-depth security stack:
 *   1. Strict Helmet CSP headers
 *   2. CORS — whitelist only GitHub Pages + localhost
 *   3. JSON body limit (10 kb) — large payload attack prevention
 *   4. HPP — HTTP Parameter Pollution protection
 *   5. express-mongo-sanitize — NoSQL injection prevention
 *   6. Custom request logger
 *   7. Rate limiting (general + chat-specific)
 *   8. API routes
 *   9. Health endpoint
 *  10. Static SPA serving
 *  11. 404 handler
 *  12. Global error handler
 */

const express    = require("express");
const cors       = require("cors");
const helmet     = require("helmet");
const hpp        = require("hpp");
const mongoSanitize = require("express-mongo-sanitize");
const path       = require("path");

const config        = require("./config");
const { generalLimiter, chatLimiter } = require("./middleware/rateLimiter");
const errorHandler  = require("./middleware/errorHandler");
const { enforceJsonContentType } = require("./middleware/validateInput");

// Import Route Handlers
const stadiumsRouter  = require("./routes/stadiums");
const matchesRouter   = require("./routes/matches");
const analyticsRouter = require("./routes/analytics");
const chatRouter      = require("./routes/chat");

const app = express();

// ─────────────────────────────────────────────────────────────────────────────
// 1. SECURITY HEADERS — Helmet with strict Content-Security-Policy
// ─────────────────────────────────────────────────────────────────────────────
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc:  ["'self'"],
        scriptSrc:   ["'self'", "'unsafe-inline'"],
        styleSrc:    ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        fontSrc:     ["'self'", "https://fonts.gstatic.com"],
        imgSrc:      ["'self'", "data:"],
        connectSrc:  ["'self'"],
        objectSrc:   ["'none'"],
        frameAncestors: ["'none'"],
        upgradeInsecureRequests: []
      }
    },
    // Force HTTPS in production
    hsts: {
      maxAge: 31536000,         // 1 year
      includeSubDomains: true,
      preload: true
    },
    // Prevent MIME-type sniffing
    noSniff: true,
    // Disable X-Powered-By header
    hidePoweredBy: true,
    // Prevent click-jacking
    frameguard: { action: "deny" },
    // Enable XSS filter (legacy browsers)
    xssFilter: true,
    // Restrict referrer information
    referrerPolicy: { policy: "strict-origin-when-cross-origin" }
  })
);

// ─────────────────────────────────────────────────────────────────────────────
// 2. CORS — whitelist only GitHub Pages and localhost for development
// ─────────────────────────────────────────────────────────────────────────────
const ALLOWED_ORIGINS = [
  "http://localhost:3000",
  "http://localhost:5000",
  "https://localhost:3000",
  // GitHub Pages domain — update YOUR_GH_USERNAME to match your account
  "https://YOUR_GH_USERNAME.github.io"
];

const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (e.g. server-to-server, curl, Postman in dev)
    if (!origin) return callback(null, true);
    if (ALLOWED_ORIGINS.includes(origin)) {
      return callback(null, true);
    }
    callback(new Error(`CORS policy: origin '${origin}' is not allowed.`));
  },
  methods:            ["GET", "POST", "OPTIONS"],
  allowedHeaders:     ["Content-Type", "Authorization"],
  exposedHeaders:     ["RateLimit-Limit", "RateLimit-Remaining", "RateLimit-Reset"],
  credentials:        false,
  optionsSuccessStatus: 200  // Some legacy browsers (IE11) choke on 204
};

app.use(cors(corsOptions));

// ─────────────────────────────────────────────────────────────────────────────
// 3. BODY PARSERS — 10 kb JSON limit prevents large-payload DoS attacks
// ─────────────────────────────────────────────────────────────────────────────
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true, limit: "10kb" }));

// ─────────────────────────────────────────────────────────────────────────────
// 4. HTTP PARAMETER POLLUTION (HPP) protection
//    Strips duplicate query-string parameters that could confuse route handlers.
//    Whitelist params that legitimately allow multiple values.
// ─────────────────────────────────────────────────────────────────────────────
app.use(hpp({
  whitelist: ["status", "country"] // allow ?status=live&status=scheduled
}));

// ─────────────────────────────────────────────────────────────────────────────
// 5. NOSQL INJECTION PREVENTION — sanitize req.body, req.query, req.params
//    Replaces any key starting with '$' or containing '.' to defeat MongoDB
//    operator injection (e.g. { "$gt": "" }).
// ─────────────────────────────────────────────────────────────────────────────
app.use(
  mongoSanitize({
    replaceWith:    "_",      // replace dangerous chars instead of removing
    onSanitize: ({ req, key }) => {
      console.warn(`[Security] MongoSanitize: suspicious key '${key}' stripped from ${req.method} ${req.path}`);
    }
  })
);

// ─────────────────────────────────────────────────────────────────────────────
// 6. REQUEST LOGGER — method, path, IP, timestamp, response time
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Custom request logger middleware.
 * Logs: timestamp | method | path | client IP | response time (ms)
 * Only API routes are logged (static files are excluded).
 *
 * @param {import('express').Request}  req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
const requestLogger = (req, res, next) => {
  const start = Date.now();
  const timestamp = new Date().toISOString();

  // Resolve real client IP — trust proxy if behind load balancer / Render
  const ip =
    (req.headers["x-forwarded-for"] || "").split(",")[0].trim() ||
    req.socket?.remoteAddress ||
    "unknown";

  // Log response details after it finishes
  res.on("finish", () => {
    const ms       = Date.now() - start;
    const status   = res.statusCode;
    const method   = req.method.padEnd(6);
    const path     = req.path;
    // Colour codes for status ranges (stripped in production if no TTY)
    const colour =
      status >= 500 ? "\x1b[31m" : // red
      status >= 400 ? "\x1b[33m" : // yellow
      status >= 300 ? "\x1b[36m" : // cyan
                      "\x1b[32m";  // green
    const reset = "\x1b[0m";
    console.log(
      `[${timestamp}] ${colour}${status}${reset} ${method} ${path} — IP: ${ip} — ${ms}ms`
    );
  });

  next();
};

// Apply logger to all API routes
app.use("/api", requestLogger);

// ─────────────────────────────────────────────────────────────────────────────
// 7. CONTENT-TYPE ENFORCEMENT — global guard for all mutating API requests
//    Ensures every POST / PUT / PATCH to /api/* carries Content-Type: application/json.
//    Individual route chains may repeat this check; here it acts as a catch-all.
// ─────────────────────────────────────────────────────────────────────────────
app.use("/api", enforceJsonContentType);

// ─────────────────────────────────────────────────────────────────────────────
// 8. RATE LIMITING
//    General: 100 req / 15 min per IP
//    Chat:    15 req / 1 min per IP (applied at the route level in chatRouter)
// ─────────────────────────────────────────────────────────────────────────────
app.use("/api", generalLimiter);

// ─────────────────────────────────────────────────────────────────────────────
// 8. HEALTH ENDPOINT — lightweight liveness probe (no rate limiting, no auth)
// ─────────────────────────────────────────────────────────────────────────────
const { version } = require("../package.json");

/**
 * @route GET /api/health
 * @desc Liveness probe. Returns service status, UTC timestamp, and semver version.
 * @access Public
 */
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    version
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 9. MOUNT API ROUTES
// ─────────────────────────────────────────────────────────────────────────────
app.use("/api/stadiums",  stadiumsRouter);
app.use("/api/matches",   matchesRouter);
app.use("/api/analytics", analyticsRouter);
app.use("/api/chat",      chatRouter);

// ─────────────────────────────────────────────────────────────────────────────
// 10. STATIC ASSETS — serve static SPA files from docs/
// ─────────────────────────────────────────────────────────────────────────────
const clientPath = path.join(__dirname, "../docs");
app.use(express.static(clientPath, {
  // Aggressive caching for immutable assets; HTML must not be cached
  setHeaders: (res, filePath) => {
    if (filePath.endsWith(".html")) {
      res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
    }
  }
}));

// ─────────────────────────────────────────────────────────────────────────────
// 11. 404 HANDLER — for unmatched API routes (before the SPA fallback)
// ─────────────────────────────────────────────────────────────────────────────
app.use("/api", (req, res) => {
  res.status(404).json({
    status: "fail",
    statusCode: 404,
    message: `Cannot ${req.method} ${req.originalUrl} — API route not found.`
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 12. SPA FALLBACK — serve index.html for all non-API client-side routes
//     Regex excludes /api/* paths so API 404s are never caught here.
// ─────────────────────────────────────────────────────────────────────────────
app.get(/^(?!\/api\/).*$/, (req, res) => {
  res.sendFile(path.join(clientPath, "index.html"));
});

// ─────────────────────────────────────────────────────────────────────────────
// 13. GLOBAL ERROR HANDLER
// ─────────────────────────────────────────────────────────────────────────────
app.use(errorHandler);

module.exports = app;
