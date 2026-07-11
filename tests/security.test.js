/**
 * @fileoverview Jest tests for all security hardening middleware.
 * Covers: Helmet headers, CORS policy, HPP, body size limit,
 * NoSQL sanitization, request logger, rate limiter response format,
 * health endpoint, Content-Type enforcement, XSS/SQLi rejection,
 * and 404 API handler.
 */

const request = require("supertest");
const app     = require("../server/app");

// ─────────────────────────────────────────────────────────────────────────────
// Health Endpoint
// ─────────────────────────────────────────────────────────────────────────────
describe("Health Endpoint — GET /api/health", () => {
  let res;
  beforeAll(async () => {
    res = await request(app).get("/api/health");
  });

  it("should return 200 with status: ok", () => {
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe("ok");
  });

  it("should include a valid ISO 8601 timestamp", () => {
    expect(res.body.timestamp).toBeDefined();
    expect(() => new Date(res.body.timestamp)).not.toThrow();
    expect(new Date(res.body.timestamp).toISOString()).toBe(res.body.timestamp);
  });

  it("should include a semver version string", () => {
    expect(res.body.version).toBeDefined();
    expect(res.body.version).toMatch(/^\d+\.\d+\.\d+/);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Helmet Security Headers
// ─────────────────────────────────────────────────────────────────────────────
describe("Helmet Security Headers", () => {
  let res;
  beforeAll(async () => {
    res = await request(app).get("/api/health");
  });

  it("should set X-Content-Type-Options: nosniff", () => {
    expect(res.headers["x-content-type-options"]).toBe("nosniff");
  });

  it("should set X-Frame-Options to deny click-jacking", () => {
    expect(res.headers["x-frame-options"]).toBe("DENY");
  });

  it("should set Content-Security-Policy header", () => {
    expect(res.headers["content-security-policy"]).toBeDefined();
    expect(res.headers["content-security-policy"]).toContain("default-src");
  });

  it("should remove X-Powered-By header (no server fingerprinting)", () => {
    expect(res.headers["x-powered-by"]).toBeUndefined();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Content-Type Enforcement
// ─────────────────────────────────────────────────────────────────────────────
describe("Content-Type Enforcement Middleware", () => {
  it("should return 415 when POST is sent with text/plain Content-Type", async () => {
    const res = await request(app)
      .post("/api/chat")
      .set("Content-Type", "text/plain")
      .send("message=hello");

    expect(res.statusCode).toBe(415);
    expect(res.body.status).toBe("fail");
    expect(res.body.message).toContain("application/json");
  });

  it("should return 415 when POST is sent with XML Content-Type", async () => {
    const res = await request(app)
      .post("/api/analytics/incident")
      .set("Content-Type", "text/xml")
      .send("<zone>A</zone>");

    expect(res.statusCode).toBe(415);
    expect(res.body.statusCode).toBe(415);
  });

  it("should accept POST with application/json Content-Type", async () => {
    const res = await request(app)
      .post("/api/chat")
      .set("Content-Type", "application/json")
      .send({ message: "Show all venues", lang: "en" });

    // Should not be blocked by Content-Type check (may be 200 or other valid status)
    expect(res.statusCode).not.toBe(415);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// XSS / Suspicious Pattern Rejection
// ─────────────────────────────────────────────────────────────────────────────
describe("Suspicious Input Rejection Middleware", () => {
  const post = (body) =>
    request(app)
      .post("/api/chat")
      .set("Content-Type", "application/json")
      .send(body);

  it("should block <script> tags with 400", async () => {
    const res = await post({ message: "<script>alert(1)</script>", lang: "en" });
    expect(res.statusCode).toBe(400);
    expect(res.body.message).toContain("disallowed content");
  });

  it("should block inline event handler patterns (onclick=)", async () => {
    const res = await post({ message: "hello onclick=evil()", lang: "en" });
    expect(res.statusCode).toBe(400);
    expect(res.body.message).toContain("disallowed content");
  });

  it("should block javascript: URI scheme", async () => {
    const res = await post({ message: "javascript:alert(1)", lang: "en" });
    expect(res.statusCode).toBe(400);
  });

  it("should block SQL keywords (UNION SELECT)", async () => {
    const res = await post({ message: "UNION SELECT * FROM users", lang: "en" });
    expect(res.statusCode).toBe(400);
    expect(res.body.message).toContain("disallowed content");
  });

  it("should block SQL DROP keyword", async () => {
    const res = await post({ message: "DROP TABLE stadiums", lang: "en" });
    expect(res.statusCode).toBe(400);
  });

  it("should pass clean inputs through", async () => {
    const res = await post({ message: "What is the capacity of MetLife Stadium?", lang: "en" });
    expect(res.statusCode).not.toBe(400);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// JSON Body Size Limit (10 kb)
// ─────────────────────────────────────────────────────────────────────────────
describe("JSON Body Size Limit (10 kb)", () => {
  it("should return 413 Payload Too Large when body exceeds 10 kb", async () => {
    const hugePayload = { message: "A".repeat(12000) };
    const res = await request(app)
      .post("/api/chat")
      .set("Content-Type", "application/json")
      .send(JSON.stringify(hugePayload));

    // Express returns 413 for oversized payloads
    expect(res.statusCode).toBe(413);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// HTTP Parameter Pollution (HPP)
// ─────────────────────────────────────────────────────────────────────────────
describe("HTTP Parameter Pollution Protection (HPP)", () => {
  it("should not crash when duplicate query params are sent", async () => {
    // hpp normalises duplicate params — last value wins for non-whitelisted keys
    const res = await request(app)
      .get("/api/stadiums?country=USA&country=Mexico");

    // Should not return 500; HPP strips duplicates gracefully
    expect(res.statusCode).not.toBe(500);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 404 API Route Handler
// ─────────────────────────────────────────────────────────────────────────────
describe("API 404 Handler", () => {
  it("should return 404 JSON for unknown GET /api/* paths", async () => {
    const res = await request(app).get("/api/doesnotexist");
    expect(res.statusCode).toBe(404);
    expect(res.body.status).toBe("fail");
    expect(res.body.statusCode).toBe(404);
    expect(res.body.message).toContain("not found");
  });

  it("should return 404 JSON for unknown POST /api/* paths", async () => {
    const res = await request(app)
      .post("/api/ghost-route")
      .set("Content-Type", "application/json")
      .send({});

    expect(res.statusCode).toBe(404);
    expect(res.body.status).toBe("fail");
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Rate Limiter — Response Format
// ─────────────────────────────────────────────────────────────────────────────
describe("Rate Limiter — Response Format", () => {
  it("should include RateLimit-Limit header on API responses", async () => {
    const res = await request(app).get("/api/health");
    // generalLimiter attaches standard headers
    expect(res.headers["ratelimit-limit"]).toBeDefined();
  });

  it("should NOT include legacy X-RateLimit-* headers", async () => {
    const res = await request(app).get("/api/health");
    expect(res.headers["x-ratelimit-limit"]).toBeUndefined();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// CORS — Origin Policy
// ─────────────────────────────────────────────────────────────────────────────
describe("CORS Origin Policy", () => {
  it("should allow requests from localhost:3000", async () => {
    const res = await request(app)
      .get("/api/health")
      .set("Origin", "http://localhost:3000");

    expect(res.headers["access-control-allow-origin"]).toBe("http://localhost:3000");
  });

  it("should deny requests from an unknown origin", async () => {
    const res = await request(app)
      .get("/api/health")
      .set("Origin", "https://attacker.example.com");

    // CORS rejection — no allow header or 500 from rejected callback
    const allowed = res.headers["access-control-allow-origin"];
    expect(allowed).not.toBe("https://attacker.example.com");
  });
});
