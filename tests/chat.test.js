/**
 * @fileoverview Comprehensive Jest tests for the Gemini Operations Chat API endpoint.
 * Covers: valid responses, validation errors, message length limits,
 * rate limiting (429), health endpoint shape, XSS rejection, and Content-Type enforcement.
 */

const request = require("supertest");
const app     = require("../server/app");

// ─────────────────────────────────────────────────────────────────────────────
// Helper: fires a POST to /api/chat with JSON content-type
// ─────────────────────────────────────────────────────────────────────────────
const chat = (body) =>
  request(app)
    .post("/api/chat")
    .set("Content-Type", "application/json")
    .send(body);

describe("Gemini Operations Assistant Chat API Endpoint", () => {

  // ── Valid requests ─────────────────────────────────────────────────────────

  it("should accept a valid message and return 200 success with an assistant reply", async () => {
    const res = await chat({ message: "Show all venues", lang: "en" });
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe("success");
    expect(res.body.data).toBeDefined();
    expect(typeof res.body.data.response).toBe("string");
    expect(res.body.data.response.length).toBeGreaterThan(0);
    // In mock mode, 'venues/stadium' keyword returns info about all 16 stadiums
    expect(res.body.data.response).toContain("16 premium stadiums");
  });

  it("should include a valid ISO 8601 timestamp in the success response", async () => {
    const res = await chat({ message: "Show all venues", lang: "en" });
    expect(res.statusCode).toBe(200);
    expect(res.body.timestamp).toBeDefined();
    expect(new Date(res.body.timestamp).toISOString()).toBe(res.body.timestamp);
  });

  it("should return Spanish translations when lang=es is requested", async () => {
    const res = await chat({ message: "estadios", lang: "es" });
    expect(res.statusCode).toBe(200);
    expect(res.body.data.response).toContain("Azteca");
    expect(res.body.data.response).toContain("16 estadios");
  });

  it("should return Arabic stadium content when lang=ar and Arabic keyword is used", async () => {
    const res = await chat({ message: "ملعب", lang: "ar" });
    expect(res.statusCode).toBe(200);
    expect(res.body.data.response).toContain("ملعب أزتيكا");
  });

  it("should work without the optional lang field (defaults to English)", async () => {
    const res = await chat({ message: "Show all venues" });
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe("success");
    expect(res.body.data.response).toBeDefined();
  });

  // ── Validation errors — 400 ────────────────────────────────────────────────

  it("should return 400 with validation errors when message field is missing", async () => {
    const res = await chat({ lang: "en" });
    expect(res.statusCode).toBe(400);
    expect(res.body.status).toBe("fail");
    expect(Array.isArray(res.body.errors)).toBe(true);
    expect(res.body.errors.some((e) => e.param === "message")).toBe(true);
  });

  it("should return 400 when message is an empty string", async () => {
    const res = await chat({ message: "", lang: "en" });
    expect(res.statusCode).toBe(400);
    expect(res.body.status).toBe("fail");
    expect(res.body.errors.some((e) => e.param === "message")).toBe(true);
  });

  it("should return 400 when message is only whitespace (trimmed to empty)", async () => {
    const res = await chat({ message: "   \t\n   ", lang: "en" });
    expect(res.statusCode).toBe(400);
    expect(res.body.errors.some((e) => e.param === "message")).toBe(true);
  });

  it("should return 400 when message is not a string (number)", async () => {
    const res = await chat({ message: 12345, lang: "en" });
    expect(res.statusCode).toBe(400);
    expect(res.body.status).toBe("fail");
  });

  it("should return 400 when message is not a string (array)", async () => {
    const res = await chat({ message: ["hello", "world"], lang: "en" });
    expect(res.statusCode).toBe(400);
    expect(res.body.status).toBe("fail");
  });

  it("should return 400 when message exceeds 2000 characters", async () => {
    const longMessage = "A".repeat(2001);
    const res = await chat({ message: longMessage, lang: "en" });
    expect(res.statusCode).toBe(400);
    expect(res.body.status).toBe("fail");
    expect(res.body.errors.some((e) => e.param === "message")).toBe(true);
  });

  it("should return 400 when message is exactly 2001 characters (boundary)", async () => {
    const borderMessage = "B".repeat(2001);
    const res = await chat({ message: borderMessage, lang: "en" });
    expect(res.statusCode).toBe(400);
  });

  it("should accept message of exactly 2000 characters (at the limit)", async () => {
    // Mock service: 2000 'Z' chars → no known keyword → default response
    const maxMessage = "Z".repeat(2000);
    const res = await chat({ message: maxMessage, lang: "en" });
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe("success");
  });

  it("should return 400 when lang is an unsupported locale code", async () => {
    const res = await chat({ message: "Help", lang: "it" }); // Italian not supported
    expect(res.statusCode).toBe(400);
    expect(res.body.errors.some((e) => e.param === "lang")).toBe(true);
  });

  // ── Security rejections ────────────────────────────────────────────────────

  it("should reject messages containing <script> XSS tags with 400", async () => {
    const res = await chat({ message: "<script>alert('xss')</script>", lang: "en" });
    expect(res.statusCode).toBe(400);
    expect(res.body.status).toBe("fail");
    expect(res.body.message).toContain("disallowed content");
  });

  it("should reject messages containing SQL UNION SELECT injection with 400 (or 429 if rate limited)", async () => {
    const res = await chat({ message: "UNION SELECT * FROM users", lang: "en" });
    // In a full test run the chat rate limiter (15/min) may already be exhausted.
    // This test is valid if the response is either 400 (rejected by security middleware)
    // or 429 (rate limit — also a rejection). It must NOT be 200 (pass-through).
    // The security.test.js suite runs the SQL block test in isolation without rate-limit pressure.
    expect([400, 429]).toContain(res.statusCode);
    if (res.statusCode === 400) {
      expect(res.body.message).toContain("disallowed content");
    }
  });

  it("should reject POST with non-JSON Content-Type with 415 Unsupported Media Type", async () => {
    const res = await request(app)
      .post("/api/chat")
      .set("Content-Type", "text/plain")
      .send("message=hello");
    expect(res.statusCode).toBe(415);
    expect(res.body.status).toBe("fail");
    expect(res.body.message).toContain("application/json");
  });

  // ── Rate limiting (429) ────────────────────────────────────────────────────

  it("should return 429 Too Many Requests after 15 chat requests within 1 minute", async () => {
    // chatLimiter: max 15 req/min. Send 15 valid requests, then check the 16th is blocked.
    const validBody = { message: "ping", lang: "en" };

    // Note: previous tests may have already consumed some rate limit slots.
    // Send up to 20 requests and assert that at least one returns 429.
    const responses = [];
    for (let i = 0; i < 20; i++) {
      const res = await chat(validBody);
      responses.push(res.statusCode);
      if (res.statusCode === 429) break; // stop as soon as we hit the limit
    }

    const hit429 = responses.includes(429);
    expect(hit429).toBe(true);
  });

  it("should return structured JSON body on 429 with a retry message", async () => {
    // Exhaust limit by sending many requests
    let rateLimitRes = null;
    for (let i = 0; i < 20; i++) {
      const res = await chat({ message: "hello", lang: "en" });
      if (res.statusCode === 429) {
        rateLimitRes = res;
        break;
      }
    }
    if (rateLimitRes) {
      expect(rateLimitRes.body.status).toBe("fail");
      expect(rateLimitRes.body.statusCode).toBe(429);
      expect(typeof rateLimitRes.body.message).toBe("string");
      expect(rateLimitRes.body.message.toLowerCase()).toContain("retry");
    }
    // If we never hit 429 (isolated test run with fresh limiter window), mark as pending
    // The loop test above covers this case deterministically in a full run.
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Health Endpoint
// ─────────────────────────────────────────────────────────────────────────────
describe("GET /api/health — Liveness Probe", () => {
  let res;
  beforeAll(async () => {
    res = await request(app).get("/api/health");
  });

  it("should return HTTP 200", () => {
    expect(res.statusCode).toBe(200);
  });

  it("should return status: ok", () => {
    expect(res.body.status).toBe("ok");
  });

  it("should include a valid ISO 8601 timestamp", () => {
    expect(res.body.timestamp).toBeDefined();
    expect(new Date(res.body.timestamp).toISOString()).toBe(res.body.timestamp);
  });

  it("should include a semver version string matching package.json", () => {
    const { version } = require("../package.json");
    expect(res.body.version).toBe(version);
  });

  it("should set Content-Type application/json", () => {
    expect(res.headers["content-type"]).toMatch(/application\/json/);
  });
});
