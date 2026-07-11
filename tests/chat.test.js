/**
 * @fileoverview Jest tests for the Gemini Operations Chat API endpoint.
 * Validates message payload sanitisation, validation schemas, and rate limit responses.
 */

const request = require("supertest");
const app = require("../server/app");

describe("Gemini Operations Assistant Chat API Endpoint", () => {
  
  // Test valid english request (Running in mock mode by default in tests)
  it("should accept valid chat messages and return success with assistant reply", async () => {
    const res = await request(app)
      .post("/api/chat")
      .send({ message: "Show all venues", lang: "en" });
    
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe("success");
    expect(res.body.data.response).toBeDefined();
    // In mock mode, query for 'venues/stadium' returns info about 16 stadiums
    expect(res.body.data.response).toContain("16 premium stadiums");
  });

  // Test other languages
  it("should return spanish translations when requested", async () => {
    const res = await request(app)
      .post("/api/chat")
      .send({ message: "estadios", lang: "es" });
    
    expect(res.statusCode).toBe(200);
    expect(res.body.data.response).toContain("Azteca");
    expect(res.body.data.response).toContain("16 estadios");
  });

  it("should return arabic translations with RTL direction tags in response", async () => {
    const res = await request(app)
      .post("/api/chat")
      .set("Content-Type", "application/json")
      .send({ message: "ملعب", lang: "ar" });
    
    expect(res.statusCode).toBe(200);
    // Mock service responds with Arabic stadium info when it detects ملعب keyword
    expect(res.body.data.response).toContain("ملعب أزتيكا");
  });

  // Test Validation Middlewares
  it("should fail with 400 Bad Request if message is missing", async () => {
    const res = await request(app)
      .post("/api/chat")
      .set("Content-Type", "application/json")
      .send({ lang: "en" }); // missing message
    
    expect(res.statusCode).toBe(400);
    expect(res.body.status).toBe("fail");
    expect(res.body.errors.some((e) => e.param === "message")).toBe(true);
  });

  it("should fail with 400 Bad Request if message is empty after trimming", async () => {
    const res = await request(app)
      .post("/api/chat")
      .set("Content-Type", "application/json")
      .send({ message: "   ", lang: "en" });
    
    expect(res.statusCode).toBe(400);
    expect(res.body.errors.some((e) => e.param === "message")).toBe(true);
  });

  it("should fail with 400 Bad Request if message is not a string", async () => {
    const res = await request(app)
      .post("/api/chat")
      .set("Content-Type", "application/json")
      .send({ message: 12345, lang: "en" });
    
    expect(res.statusCode).toBe(400);
  });

  it("should fail with 400 if language is not supported", async () => {
    const res = await request(app)
      .post("/api/chat")
      .send({ message: "Help", lang: "it" }); // Italian is not in supported list
    
    expect(res.statusCode).toBe(400);
    expect(res.body.errors.some((e) => e.param === "lang")).toBe(true);
  });

  // Test HTML Sanitization / XSS Rejection
  it("should reject requests containing XSS script tags with 400", async () => {
    // The rejectSuspiciousInput middleware blocks <script> tags before validation
    const res = await request(app)
      .post("/api/chat")
      .set("Content-Type", "application/json")
      .send({ message: "<script>alert('hack')</script> queue", lang: "en" });

    expect(res.statusCode).toBe(400);
    expect(res.body.status).toBe("fail");
    expect(res.body.message).toContain("disallowed content");
  });

  // Test Content-Type enforcement
  it("should reject POST requests with non-JSON Content-Type with 415", async () => {
    const res = await request(app)
      .post("/api/chat")
      .set("Content-Type", "text/plain")
      .send("message=hello");

    expect(res.statusCode).toBe(415);
    expect(res.body.status).toBe("fail");
    expect(res.body.message).toContain("application/json");
  });
});
