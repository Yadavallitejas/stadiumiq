/**
 * @fileoverview Comprehensive Jest tests for the Stadiums API routes.
 * Covers: listing all 16 stadiums, required shape fields, country filtering,
 * single stadium lookup, 404 for unknown IDs, kebab-case validation,
 * and nearest-stadium geolocation.
 */

const request  = require("supertest");
const app      = require("../server/app");
const stadiums = require("../server/data/stadiums");

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/stadiums  — full list
// ─────────────────────────────────────────────────────────────────────────────
describe("GET /api/stadiums — Full List", () => {
  let res;
  beforeAll(async () => {
    res = await request(app).get("/api/stadiums");
  });

  it("should return HTTP 200 with status: success", () => {
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe("success");
  });

  it("should return exactly 16 stadiums", () => {
    expect(res.body.results).toBe(16);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBe(16);
  });

  it("should include a top-level timestamp in the response", () => {
    expect(res.body.timestamp).toBeDefined();
    expect(new Date(res.body.timestamp).toISOString()).toBe(res.body.timestamp);
  });

  // ── Shape validation for every stadium ───────────────────────────────────

  it("should ensure every stadium has a non-empty id string", () => {
    res.body.data.forEach((s) => {
      expect(typeof s.id).toBe("string");
      expect(s.id.length).toBeGreaterThan(0);
    });
  });

  it("should ensure every stadium has a non-empty name string", () => {
    res.body.data.forEach((s) => {
      expect(typeof s.name).toBe("string");
      expect(s.name.length).toBeGreaterThan(0);
    });
  });

  it("should ensure every stadium has a non-empty city string", () => {
    res.body.data.forEach((s) => {
      expect(typeof s.city).toBe("string");
      expect(s.city.length).toBeGreaterThan(0);
    });
  });

  it("should ensure every stadium has a country of USA, Mexico, or Canada", () => {
    const validCountries = ["USA", "Mexico", "Canada"];
    res.body.data.forEach((s) => {
      expect(validCountries).toContain(s.country);
    });
  });

  it("should ensure every stadium has a positive integer capacity", () => {
    res.body.data.forEach((s) => {
      expect(typeof s.capacity).toBe("number");
      expect(Number.isInteger(s.capacity)).toBe(true);
      expect(s.capacity).toBeGreaterThan(0);
    });
  });

  it("should ensure every stadium has a coordinates object with lat and lng", () => {
    res.body.data.forEach((s) => {
      expect(s.coordinates).toBeDefined();
      expect(typeof s.coordinates.lat).toBe("number");
      expect(typeof s.coordinates.lng).toBe("number");
    });
  });

  it("should ensure every stadium lat is in the valid range [-90, 90]", () => {
    res.body.data.forEach((s) => {
      expect(s.coordinates.lat).toBeGreaterThanOrEqual(-90);
      expect(s.coordinates.lat).toBeLessThanOrEqual(90);
    });
  });

  it("should ensure every stadium lng is in the valid range [-180, 180]", () => {
    res.body.data.forEach((s) => {
      expect(s.coordinates.lng).toBeGreaterThanOrEqual(-180);
      expect(s.coordinates.lng).toBeLessThanOrEqual(180);
    });
  });

  it("should ensure every stadium has a features array with at least one item", () => {
    res.body.data.forEach((s) => {
      expect(Array.isArray(s.features)).toBe(true);
      expect(s.features.length).toBeGreaterThan(0);
    });
  });

  it("should have 11 USA stadiums, 3 Mexico stadiums, and 2 Canada stadiums", () => {
    const counts = res.body.data.reduce((acc, s) => {
      acc[s.country] = (acc[s.country] || 0) + 1;
      return acc;
    }, {});
    expect(counts.USA).toBe(11);
    expect(counts.Mexico).toBe(3);
    expect(counts.Canada).toBe(2);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/stadiums?country=  — country filter
// ─────────────────────────────────────────────────────────────────────────────
describe("GET /api/stadiums — Country Filter", () => {

  it("should return only USA stadiums when country=USA", async () => {
    const res = await request(app).get("/api/stadiums?country=USA");
    expect(res.statusCode).toBe(200);
    expect(res.body.results).toBe(11);
    res.body.data.forEach((s) => expect(s.country).toBe("USA"));
  });

  it("should return only Mexico stadiums when country=Mexico", async () => {
    const res = await request(app).get("/api/stadiums?country=Mexico");
    expect(res.statusCode).toBe(200);
    expect(res.body.results).toBe(3);
    res.body.data.forEach((s) => expect(s.country).toBe("Mexico"));
  });

  it("should return only Canada stadiums when country=Canada", async () => {
    const res = await request(app).get("/api/stadiums?country=Canada");
    expect(res.statusCode).toBe(200);
    expect(res.body.results).toBe(2);
    res.body.data.forEach((s) => expect(s.country).toBe("Canada"));
  });

  it("should perform case-insensitive country filtering (mexico → Mexico)", async () => {
    const res = await request(app).get("/api/stadiums?country=mexico");
    expect(res.statusCode).toBe(200);
    expect(res.body.results).toBe(3);
  });

  it("should perform case-insensitive country filtering (USA → USA)", async () => {
    const res = await request(app).get("/api/stadiums?country=usa");
    expect(res.statusCode).toBe(200);
    expect(res.body.results).toBe(11);
  });

  it("should return an empty array for an unknown country filter", async () => {
    const res = await request(app).get("/api/stadiums?country=Germany");
    expect(res.statusCode).toBe(200);
    expect(res.body.results).toBe(0);
    expect(res.body.data.length).toBe(0);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/stadiums/:id  — single stadium lookup
// ─────────────────────────────────────────────────────────────────────────────
describe("GET /api/stadiums/:id — Single Stadium", () => {

  it("should return the correct stadium for a valid ID (metlife-stadium)", async () => {
    const res = await request(app).get("/api/stadiums/metlife-stadium");
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe("success");
    expect(res.body.data.id).toBe("metlife-stadium");
    expect(res.body.data.name).toBe("MetLife Stadium");
    expect(res.body.data.city).toBe("New York/New Jersey");
    expect(res.body.data.country).toBe("USA");
  });

  it("should return the correct stadium for estadio-azteca", async () => {
    const res = await request(app).get("/api/stadiums/estadio-azteca");
    expect(res.statusCode).toBe(200);
    expect(res.body.data.name).toContain("Azteca");
    expect(res.body.data.country).toBe("Mexico");
  });

  it("should return the full shape for a single stadium response", async () => {
    const res = await request(app).get("/api/stadiums/metlife-stadium");
    const s = res.body.data;
    expect(s.id).toBeDefined();
    expect(s.name).toBeDefined();
    expect(s.city).toBeDefined();
    expect(s.country).toBeDefined();
    expect(s.capacity).toBeDefined();
    expect(s.coordinates).toBeDefined();
    expect(s.features).toBeDefined();
  });

  it("should return 404 with status: fail for a non-existent stadium ID", async () => {
    const res = await request(app).get("/api/stadiums/fake-stadium-id");
    expect(res.statusCode).toBe(404);
    expect(res.body.status).toBe("fail");
    expect(res.body.message).toContain("not found");
  });

  it("should return 404 for another non-existent ID (ghost-arena)", async () => {
    const res = await request(app).get("/api/stadiums/ghost-arena");
    expect(res.statusCode).toBe(404);
    expect(res.body.status).toBe("fail");
  });

  it("should return 400 for IDs containing underscores (not kebab-case)", async () => {
    const res = await request(app).get("/api/stadiums/metlife_stadium");
    expect(res.statusCode).toBe(400);
    expect(res.body.status).toBe("fail");
    expect(res.body.errors[0].param).toBe("id");
  });

  it("should return 400 for IDs containing uppercase letters", async () => {
    const res = await request(app).get("/api/stadiums/MetLife-Stadium");
    expect(res.statusCode).toBe(400);
    expect(res.body.status).toBe("fail");
  });

  it("should return 400 for IDs with special characters", async () => {
    const res = await request(app).get("/api/stadiums/stadium@123");
    expect(res.statusCode).toBe(400);
    expect(res.body.status).toBe("fail");
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/stadiums/nearest  — geolocation
// ─────────────────────────────────────────────────────────────────────────────
describe("GET /api/stadiums/nearest — Geolocation", () => {

  it("should find MetLife Stadium as nearest to New York City coordinates", async () => {
    const res = await request(app)
      .get("/api/stadiums/nearest")
      .query({ lat: 40.8, lng: -74.0 });

    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe("success");
    expect(res.body.data.stadium.id).toBe("metlife-stadium");
    expect(res.body.data.distanceKm).toBeLessThan(10);
  });

  it("should find Estadio Azteca as nearest to Mexico City coordinates", async () => {
    const res = await request(app)
      .get("/api/stadiums/nearest")
      .query({ lat: 19.3, lng: -99.1 });

    expect(res.statusCode).toBe(200);
    expect(res.body.data.stadium.id).toBe("estadio-azteca");
    expect(res.body.data.distanceKm).toBeLessThan(10);
  });

  it("should include distanceKm as a positive number in the response", async () => {
    const res = await request(app)
      .get("/api/stadiums/nearest")
      .query({ lat: 40.8, lng: -74.0 });

    expect(typeof res.body.data.distanceKm).toBe("number");
    expect(res.body.data.distanceKm).toBeGreaterThan(0);
  });

  it("should return 400 when lat is above the maximum value (> 90)", async () => {
    const res = await request(app)
      .get("/api/stadiums/nearest")
      .query({ lat: 95.0, lng: -74.0 });

    expect(res.statusCode).toBe(400);
    expect(res.body.status).toBe("fail");
    expect(res.body.errors[0].param).toBe("lat");
  });

  it("should return 400 when lat is below the minimum value (< -90)", async () => {
    const res = await request(app)
      .get("/api/stadiums/nearest")
      .query({ lat: -91.0, lng: 0.0 });

    expect(res.statusCode).toBe(400);
    expect(res.body.status).toBe("fail");
    expect(res.body.errors[0].param).toBe("lat");
  });

  it("should return 400 when lng is out of range (> 180)", async () => {
    const res = await request(app)
      .get("/api/stadiums/nearest")
      .query({ lat: 40.0, lng: 200.0 });

    expect(res.statusCode).toBe(400);
    expect(res.body.errors[0].param).toBe("lng");
  });

  it("should return 400 when lat parameter is missing", async () => {
    const res = await request(app)
      .get("/api/stadiums/nearest")
      .query({ lng: -74.0 });

    expect(res.statusCode).toBe(400);
    expect(res.body.errors[0].param).toBe("lat");
  });

  it("should return 400 when lng parameter is missing", async () => {
    const res = await request(app)
      .get("/api/stadiums/nearest")
      .query({ lat: 40.0 });

    expect(res.statusCode).toBe(400);
    expect(res.body.errors[0].param).toBe("lng");
  });

  it("should return 400 when both lat and lng are missing", async () => {
    const res = await request(app).get("/api/stadiums/nearest");
    expect(res.statusCode).toBe(400);
    expect(res.body.status).toBe("fail");
    expect(Array.isArray(res.body.errors)).toBe(true);
    expect(res.body.errors.length).toBeGreaterThanOrEqual(2);
  });
});
