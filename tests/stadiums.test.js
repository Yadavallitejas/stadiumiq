/**
 * @fileoverview Jest tests for the stadiums API routes.
 * Verifies listing, filtering, invalid parameters, and geolocation matching.
 */

const request = require("supertest");
const app = require("../server/app");
const stadiums = require("../server/data/stadiums");

describe("Stadiums API Endpoints", () => {
  // Test listing all stadiums
  it("should return a list of all 16 stadiums with status 200", async () => {
    const res = await request(app).get("/api/stadiums");
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe("success");
    expect(res.body.results).toBe(16);
    expect(res.body.data.length).toBe(16);
  });

  // Test country filtering
  it("should filter stadiums in USA correctly", async () => {
    const res = await request(app).get("/api/stadiums?country=USA");
    expect(res.statusCode).toBe(200);
    expect(res.body.data.every((s) => s.country === "USA")).toBe(true);
    expect(res.body.results).toBe(11); // 11 stadiums in USA
  });

  it("should filter stadiums in Mexico correctly", async () => {
    const res = await request(app).get("/api/stadiums?country=Mexico");
    expect(res.statusCode).toBe(200);
    expect(res.body.data.every((s) => s.country === "Mexico")).toBe(true);
    expect(res.body.results).toBe(3); // 3 stadiums in Mexico
  });

  it("should filter stadiums in Canada correctly", async () => {
    const res = await request(app).get("/api/stadiums?country=Canada");
    expect(res.statusCode).toBe(200);
    expect(res.body.data.every((s) => s.country === "Canada")).toBe(true);
    expect(res.body.results).toBe(2); // 2 stadiums in Canada
  });

  it("should perform country filtering in a case-insensitive manner", async () => {
    const res = await request(app).get("/api/stadiums?country=mexico");
    expect(res.statusCode).toBe(200);
    expect(res.body.results).toBe(3);
  });

  it("should return empty list if country filter is invalid", async () => {
    const res = await request(app).get("/api/stadiums?country=Germany");
    expect(res.statusCode).toBe(200);
    expect(res.body.results).toBe(0);
    expect(res.body.data.length).toBe(0);
  });

  // Test specific stadium ID endpoints
  it("should fetch details for a single valid stadium ID", async () => {
    const res = await request(app).get("/api/stadiums/metlife-stadium");
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe("success");
    expect(res.body.data.name).toBe("MetLife Stadium");
    expect(res.body.data.city).toBe("New York/New Jersey");
  });

  it("should return 404 if stadium ID does not exist", async () => {
    const res = await request(app).get("/api/stadiums/fake-stadium-id");
    expect(res.statusCode).toBe(404);
    expect(res.body.status).toBe("fail");
    expect(res.body.message).toContain("not found");
  });

  it("should return 400 for stadium ID that fails kebab-case validation", async () => {
    const res = await request(app).get("/api/stadiums/metlife_stadium");
    expect(res.statusCode).toBe(400);
    expect(res.body.status).toBe("fail");
    expect(res.body.errors[0].param).toBe("id");
  });

  // Test nearest stadium geolocation endpoints
  it("should find the nearest stadium near New York coordinates", async () => {
    // MetLife coordinates: lat 40.8135, lng -74.0745
    const res = await request(app)
      .get("/api/stadiums/nearest")
      .query({ lat: 40.8, lng: -74.0 });
    
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe("success");
    expect(res.body.data.stadium.id).toBe("metlife-stadium");
    expect(res.body.data.distanceKm).toBeLessThan(10); // Very close
  });

  it("should find the nearest stadium near Mexico City coordinates", async () => {
    // Estadio Azteca coordinates: lat 19.3029, lng -99.1505
    const res = await request(app)
      .get("/api/stadiums/nearest")
      .query({ lat: 19.3, lng: -99.1 });
    
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe("success");
    expect(res.body.data.stadium.id).toBe("estadio-azteca");
  });

  it("should fail with 400 if coordinates are out of bounds", async () => {
    const res = await request(app)
      .get("/api/stadiums/nearest")
      .query({ lat: 95.0, lng: -74.0 }); // lat > 90
    
    expect(res.statusCode).toBe(400);
    expect(res.body.status).toBe("fail");
    expect(res.body.errors[0].param).toBe("lat");
  });

  it("should fail with 400 if required coordinates are missing", async () => {
    const res = await request(app)
      .get("/api/stadiums/nearest")
      .query({ lat: 40.0 }); // missing lng
    
    expect(res.statusCode).toBe(400);
    expect(res.body.status).toBe("fail");
    expect(res.body.errors[0].param).toBe("lng");
  });
});
