/**
 * @fileoverview Comprehensive Jest tests for all analytics API endpoints.
 * Covers:
 *  - GET /api/analytics      — KPI aggregations (capacity, matches, vendors, alerts)
 *  - GET /api/analytics/crowd — all 6 zones, density 0-100, status thresholds
 *  - GET /api/analytics/staff — staff logic, understaffed gap detection
 *  - GET /api/analytics/incidents — list shape
 *  - POST /api/analytics/incident — valid, missing fields, invalid severity, invalid zone
 *  - Crowd density colour-threshold logic (green/yellow/red)
 *  - Staff recommendation algorithm (gap > 0 = understaffed)
 */

const request = require("supertest");
const app     = require("../server/app");

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/analytics  — Control Room KPI aggregations
// ─────────────────────────────────────────────────────────────────────────────
describe("GET /api/analytics — Control Room KPI Aggregations", () => {
  let res;
  beforeAll(async () => {
    res = await request(app).get("/api/analytics");
  });

  it("should return HTTP 200 with status: success", () => {
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe("success");
  });

  it("should include a valid ISO 8601 timestamp", () => {
    expect(res.body.timestamp).toBeDefined();
    expect(new Date(res.body.timestamp).toISOString()).toBe(res.body.timestamp);
  });

  // Stadium aggregations
  it("should report exactly 16 total venues", () => {
    expect(res.body.data.stadiums.totalVenues).toBe(16);
  });

  it("should sum all stadium capacities to 1,078,911", () => {
    expect(res.body.data.stadiums.totalCapacity).toBe(1078911);
  });

  it("should compute average capacity as 67,432 (1,078,911 / 16 rounded)", () => {
    expect(res.body.data.stadiums.averageCapacity).toBe(67432);
  });

  it("should group stadiums correctly — 11 USA, 3 Mexico, 2 Canada", () => {
    const c = res.body.data.stadiums.byCountry;
    expect(c.USA).toBe(11);
    expect(c.Mexico).toBe(3);
    expect(c.Canada).toBe(2);
  });

  // Match aggregations
  it("should count more than 10 total scheduled matches", () => {
    expect(res.body.data.matches.totalMatches).toBeGreaterThan(10);
  });

  it("should provide live, completed, and scheduled match counts", () => {
    const m = res.body.data.matches;
    expect(typeof m.live).toBe("number");
    expect(typeof m.completed).toBe("number");
    expect(typeof m.scheduled).toBe("number");
  });

  it("should ensure live + completed + scheduled sum equals totalMatches", () => {
    const m = res.body.data.matches;
    expect(m.live + m.completed + m.scheduled).toBe(m.totalMatches);
  });

  // Vendor aggregations
  it("should compute a positive average vendor wait time", () => {
    const t = res.body.data.vendors.averageWaitTimeMinutes;
    expect(typeof t).toBe("number");
    expect(t).toBeGreaterThan(0);
  });

  it("should identify Texas Size BBQ as the busiest vendor with 25-minute wait", () => {
    const v = res.body.data.vendors.busiestVendor;
    expect(v).not.toBeNull();
    expect(v.name).toBe("Texas Size BBQ");
    expect(v.queueTimeMinutes).toBe(25);
  });

  // Alerts
  it("should generate a concessions warning alert for Texas Size BBQ (≥20 min threshold)", () => {
    const alerts = res.body.data.alerts;
    expect(Array.isArray(alerts)).toBe(true);
    const alert = alerts.find((a) => a.category === "concessions" && a.level === "warning");
    expect(alert).toBeDefined();
    expect(alert.message).toContain("Texas Size BBQ");
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/analytics/crowd  — real-time crowd density
// ─────────────────────────────────────────────────────────────────────────────
describe("GET /api/analytics/crowd — Live Crowd Density", () => {
  let res;
  beforeAll(async () => {
    res = await request(app).get("/api/analytics/crowd");
  });

  it("should return HTTP 200 with status: success", () => {
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe("success");
  });

  it("should return exactly 6 zones (A through F)", () => {
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBe(6);
  });

  it("should include zones A, B, C, D, E, and F", () => {
    const zones = res.body.data.map((z) => z.zone);
    ["A", "B", "C", "D", "E", "F"].forEach((z) => expect(zones).toContain(z));
  });

  it("should ensure every zone has a density value between 0 and 100 inclusive", () => {
    res.body.data.forEach((z) => {
      expect(typeof z.density).toBe("number");
      expect(z.density).toBeGreaterThanOrEqual(0);
      expect(z.density).toBeLessThanOrEqual(100);
    });
  });

  it("should include a non-empty label string for every zone", () => {
    res.body.data.forEach((z) => {
      expect(typeof z.label).toBe("string");
      expect(z.label.length).toBeGreaterThan(0);
    });
  });

  it("should include a valid status field for every zone", () => {
    const valid = ["normal", "elevated", "critical"];
    res.body.data.forEach((z) => {
      expect(valid).toContain(z.status);
    });
  });

  // ── Colour-threshold (green/yellow/red) logic ─────────────────────────────

  it("should mark a zone with density < 60 as status: normal (green threshold)", () => {
    // Find a zone whose density < 60, or synthesise the check via the route logic
    // We verify the rule: if API says density < 60, status must be 'normal'
    res.body.data.forEach((z) => {
      if (z.density < 60) {
        expect(z.status).toBe("normal");
      }
    });
  });

  it("should mark a zone with density 60–79.9 as status: elevated (yellow threshold)", () => {
    res.body.data.forEach((z) => {
      if (z.density >= 60 && z.density < 80) {
        expect(z.status).toBe("elevated");
      }
    });
  });

  it("should mark a zone with density ≥ 80 as status: critical (red threshold)", () => {
    res.body.data.forEach((z) => {
      if (z.density >= 80) {
        expect(z.status).toBe("critical");
      }
    });
  });

  it("should enforce threshold consistency: status matches density on every returned zone", () => {
    res.body.data.forEach((z) => {
      const { density, status } = z;
      if (density >= 80)      expect(status).toBe("critical");
      else if (density >= 60) expect(status).toBe("elevated");
      else                    expect(status).toBe("normal");
    });
  });

  it("should include a timestamp in the response", () => {
    expect(res.body.timestamp).toBeDefined();
    expect(new Date(res.body.timestamp).toISOString()).toBe(res.body.timestamp);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/analytics/staff  — staff deployment recommendations
// ─────────────────────────────────────────────────────────────────────────────
describe("GET /api/analytics/staff — Staff Deployment", () => {
  let res;
  beforeAll(async () => {
    res = await request(app).get("/api/analytics/staff");
  });

  it("should return HTTP 200 with status: success", () => {
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe("success");
  });

  it("should return exactly 6 rows — one per zone", () => {
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBe(6);
  });

  it("should include all 6 zone labels (A–F)", () => {
    const zones = res.body.data.map((r) => r.zone);
    ["A", "B", "C", "D", "E", "F"].forEach((z) => expect(zones).toContain(z));
  });

  it("should include positive integer occupancy for every zone", () => {
    res.body.data.forEach((r) => {
      expect(typeof r.occupancy).toBe("number");
      expect(Number.isInteger(r.occupancy)).toBe(true);
      expect(r.occupancy).toBeGreaterThan(0);
    });
  });

  it("should include positive integer assigned staff for every zone", () => {
    res.body.data.forEach((r) => {
      expect(typeof r.assigned).toBe("number");
      expect(r.assigned).toBeGreaterThan(0);
    });
  });

  it("should include positive integer recommended staff for every zone", () => {
    res.body.data.forEach((r) => {
      expect(typeof r.recommended).toBe("number");
      expect(r.recommended).toBeGreaterThan(0);
    });
  });

  it("should compute gap as (recommended − assigned) for every zone", () => {
    res.body.data.forEach((r) => {
      expect(r.gap).toBe(r.recommended - r.assigned);
    });
  });

  it("should flag understaffed zones (gap > 0) and never-over-staff (gap >= 0)", () => {
    // By design assigned = floor(recommended * utilisation factor) < recommended
    // so gap should always be ≥ 0 (we never over-staff)
    res.body.data.forEach((r) => {
      expect(r.gap).toBeGreaterThanOrEqual(0);
    });
  });

  it("should detect at least one understaffed zone (gap > 0) in the response", () => {
    // The seeded random values ensure at least one high-density zone exists
    const understaffed = res.body.data.filter((r) => r.gap > 0);
    expect(understaffed.length).toBeGreaterThan(0);
  });

  it("should include a valid status field (normal/elevated/critical) per zone", () => {
    const valid = ["normal", "elevated", "critical"];
    res.body.data.forEach((r) => {
      expect(valid).toContain(r.status);
    });
  });

  it("should recommend more staff for critical zones than for normal zones", () => {
    const critical = res.body.data.filter((r) => r.status === "critical");
    const normal   = res.body.data.filter((r) => r.status === "normal");
    if (critical.length && normal.length) {
      const avgCritRatio = critical.reduce((s, r) => s + r.recommended / (r.occupancy || 1), 0) / critical.length;
      const avgNormRatio = normal.reduce((s, r) => s + r.recommended / (r.occupancy || 1), 0) / normal.length;
      // Critical zones have a 1:40 ratio → higher ratio than normal (1:80)
      expect(avgCritRatio).toBeGreaterThan(avgNormRatio);
    }
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/analytics/incidents  — incident log
// ─────────────────────────────────────────────────────────────────────────────
describe("GET /api/analytics/incidents — Incident Log", () => {
  let res;
  beforeAll(async () => {
    res = await request(app).get("/api/analytics/incidents");
  });

  it("should return HTTP 200 with status: success", () => {
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe("success");
  });

  it("should return an array in the data field", () => {
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it("should include a results count matching the data array length", () => {
    expect(res.body.results).toBe(res.body.data.length);
  });

  it("should pre-seed at least 1 sample incident", () => {
    expect(res.body.data.length).toBeGreaterThanOrEqual(1);
  });

  it("should have incidents with id, zone, type, severity, description, reportedAt, status fields", () => {
    res.body.data.forEach((inc) => {
      expect(typeof inc.id).toBe("string");
      expect(["A","B","C","D","E","F"]).toContain(inc.zone);
      expect(typeof inc.type).toBe("string");
      expect(["low","medium","high"]).toContain(inc.severity);
      expect(typeof inc.description).toBe("string");
      expect(typeof inc.reportedAt).toBe("string");
      expect(["active","resolved"]).toContain(inc.status);
    });
  });

  it("should return incidents sorted most-recent first (reportedAt descending)", () => {
    const dates = res.body.data.map((i) => new Date(i.reportedAt).getTime());
    for (let i = 1; i < dates.length; i++) {
      expect(dates[i - 1]).toBeGreaterThanOrEqual(dates[i]);
    }
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/analytics/incident  — create incident
// ─────────────────────────────────────────────────────────────────────────────
describe("POST /api/analytics/incident — Create Incident", () => {

  const validIncident = {
    zone:        "C",
    type:        "Crowd Control",
    severity:    "medium",
    description: "Large crowd gathering near Gate C blocking emergency exit. Staff redirecting."
  };

  const post = (body) =>
    request(app)
      .post("/api/analytics/incident")
      .set("Content-Type", "application/json")
      .send(body);

  // ── Valid creation ───────────────────────────────────────────────────────

  it("should return 201 Created with status: success for valid incident data", async () => {
    const res = await post(validIncident);
    expect(res.statusCode).toBe(201);
    expect(res.body.status).toBe("success");
  });

  it("should return the created incident object in the data field", async () => {
    const res = await post(validIncident);
    expect(res.body.data).toBeDefined();
    expect(res.body.data.id).toBeDefined();
    expect(res.body.data.zone).toBe("C");
    expect(res.body.data.type).toBe("Crowd Control");
    expect(res.body.data.severity).toBe("medium");
  });

  it("should assign a non-empty auto-generated id to the new incident", async () => {
    const res = await post(validIncident);
    expect(typeof res.body.data.id).toBe("string");
    expect(res.body.data.id.length).toBeGreaterThan(0);
  });

  it("should set status to 'active' for newly created incidents", async () => {
    const res = await post(validIncident);
    expect(res.body.data.status).toBe("active");
  });

  it("should add a valid ISO reportedAt timestamp to the created incident", async () => {
    const res = await post(validIncident);
    expect(res.body.data.reportedAt).toBeDefined();
    expect(new Date(res.body.data.reportedAt).toISOString()).toBe(res.body.data.reportedAt);
  });

  it("should persist the incident so it appears in GET /api/analytics/incidents", async () => {
    const created = await post({ ...validIncident, zone: "F", type: "Fire Safety", severity: "high",
      description: "Smoke reported near upper tier concourse — evacuation protocol initiated." });
    const listRes = await request(app).get("/api/analytics/incidents");
    const found = listRes.body.data.find((i) => i.id === created.body.data.id);
    expect(found).toBeDefined();
  });

  it("should accept all valid zones: A, B, C, D, E, F", async () => {
    for (const zone of ["A","B","C","D","E","F"]) {
      const res = await post({ ...validIncident, zone });
      expect(res.statusCode).toBe(201);
    }
  });

  it("should accept all valid severities: low, medium, high", async () => {
    for (const severity of ["low","medium","high"]) {
      const res = await post({ ...validIncident, severity });
      expect(res.statusCode).toBe(201);
    }
  });

  // ── Validation failures — 400 ────────────────────────────────────────────

  it("should return 400 when zone is invalid (Z is not a valid zone)", async () => {
    const res = await post({ ...validIncident, zone: "Z" });
    expect(res.statusCode).toBe(400);
    expect(res.body.status).toBe("fail");
    expect(res.body.errors.some((e) => e.param === "zone")).toBe(true);
  });

  it("should return 400 when zone is missing", async () => {
    const { zone, ...noZone } = validIncident;
    const res = await post(noZone);
    expect(res.statusCode).toBe(400);
    expect(res.body.errors.some((e) => e.param === "zone")).toBe(true);
  });

  it("should return 400 when severity is missing", async () => {
    const { severity, ...noSev } = validIncident;
    const res = await post(noSev);
    expect(res.statusCode).toBe(400);
    expect(res.body.status).toBe("fail");
    expect(res.body.errors.some((e) => e.param === "severity")).toBe(true);
  });

  it("should return 400 when severity is an unsupported value (extreme)", async () => {
    const res = await post({ ...validIncident, severity: "extreme" });
    expect(res.statusCode).toBe(400);
    expect(res.body.errors.some((e) => e.param === "severity")).toBe(true);
  });

  it("should return 400 when severity is an unsupported value (critical)", async () => {
    const res = await post({ ...validIncident, severity: "critical" });
    expect(res.statusCode).toBe(400);
    expect(res.body.errors.some((e) => e.param === "severity")).toBe(true);
  });

  it("should return 400 when type is missing", async () => {
    const { type, ...noType } = validIncident;
    const res = await post(noType);
    expect(res.statusCode).toBe(400);
    expect(res.body.errors.some((e) => e.param === "type")).toBe(true);
  });

  it("should return 400 when description is missing", async () => {
    const { description, ...noDesc } = validIncident;
    const res = await post(noDesc);
    expect(res.statusCode).toBe(400);
    expect(res.body.errors.some((e) => e.param === "description")).toBe(true);
  });

  it("should return 400 when description is too short (< 10 chars)", async () => {
    const res = await post({ ...validIncident, description: "Short" });
    expect(res.statusCode).toBe(400);
    expect(res.body.errors.some((e) => e.param === "description")).toBe(true);
  });

  it("should return 400 when description is too long (> 500 chars)", async () => {
    const res = await post({ ...validIncident, description: "X".repeat(501) });
    expect(res.statusCode).toBe(400);
    expect(res.body.errors.some((e) => e.param === "description")).toBe(true);
  });

  it("should return 400 when the body is completely empty", async () => {
    const res = await post({});
    expect(res.statusCode).toBe(400);
    expect(res.body.status).toBe("fail");
    expect(Array.isArray(res.body.errors)).toBe(true);
    expect(res.body.errors.length).toBeGreaterThan(0);
  });

  it("should return 415 when Content-Type is not application/json", async () => {
    const res = await request(app)
      .post("/api/analytics/incident")
      .set("Content-Type", "text/xml")
      .send("<incident/>");
    expect(res.statusCode).toBe(415);
  });
});
