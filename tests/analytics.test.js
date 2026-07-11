/**
 * @fileoverview Jest tests for the operations control analytics API endpoint.
 * Validates dynamic aggregation of stadium capacity, vendor wait times, and alert generation.
 */

const request = require("supertest");
const app = require("../server/app");

describe("Control Room Analytics API Endpoint", () => {
  let res;

  beforeAll(async () => {
    res = await request(app).get("/api/analytics");
  });

  // Verify basic payload success
  it("should return status 200 with success status", () => {
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe("success");
    expect(res.body.timestamp).toBeDefined();
  });

  // Verify Stadium Aggregations
  it("should return the correct total number of venues", () => {
    expect(res.body.data.stadiums.totalVenues).toBe(16);
  });

  it("should sum stadium capacities accurately", () => {
    // Total capacity = sum of all 16 stadiums
    expect(res.body.data.stadiums.totalCapacity).toBe(1078911);
  });

  it("should compute average venue capacity correctly", () => {
    // 1,078,911 / 16 = 67,432
    expect(res.body.data.stadiums.averageCapacity).toBe(67432);
  });

  it("should group stadiums by host country correctly", () => {
    const countryCounts = res.body.data.stadiums.byCountry;
    expect(countryCounts.USA).toBe(11);
    expect(countryCounts.Mexico).toBe(3);
    expect(countryCounts.Canada).toBe(2);
  });

  // Verify Match Status Aggregations
  it("should count total match schedule entries correctly", () => {
    expect(res.body.data.matches.totalMatches).toBeGreaterThan(10);
  });

  it("should track live/completed/upcoming matches count correctly", () => {
    const matchCounts = res.body.data.matches;
    expect(matchCounts.completed).toBeDefined();
    expect(matchCounts.live).toBeDefined();
    expect(matchCounts.scheduled).toBeDefined();
  });

  // Verify Concessions & Queue times
  it("should compute average vendor wait time across active facilities", () => {
    const waitTime = res.body.data.vendors.averageWaitTimeMinutes;
    expect(waitTime).toBeGreaterThan(0);
    expect(typeof waitTime).toBe("number");
  });

  it("should identify the busiest vendor accurately", () => {
    const busiest = res.body.data.vendors.busiestVendor;
    expect(busiest).not.toBeNull();
    // Texas Size BBQ has 25 minutes wait time, which is the busiest
    expect(busiest.name).toBe("Texas Size BBQ");
    expect(busiest.queueTimeMinutes).toBe(25);
  });

  // Verify Operations Warnings / Safety Alerts
  it("should generate warning alerts if concession queue times exceed thresholds", () => {
    const alerts = res.body.data.alerts;
    expect(Array.isArray(alerts)).toBe(true);
    
    // An alert should be present for Texas Size BBQ at AT&T Stadium (wait time 25m >= 20m threshold)
    const queueAlert = alerts.find((a) => a.category === "concessions" && a.level === "warning");
    expect(queueAlert).toBeDefined();
    expect(queueAlert.message).toContain("Texas Size BBQ");
  });
});
