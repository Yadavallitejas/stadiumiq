/**
 * @fileoverview Analytics router.
 * Aggregates data from stadiums, matches, and vendors to provide operations metrics.
 * Also exposes Ops Dashboard endpoints: crowd density, staff recommendations, and incidents.
 */

const express = require("express");
const router = express.Router();
const stadiums = require("../data/stadiums");
const matches = require("../data/matches");
const vendors = require("../data/vendors");
const { body, validationResult } = require("express-validator");

// ─────────────────────────────────────────────
// In-memory incident store (resets on restart)
// ─────────────────────────────────────────────
/** @type {Array<Object>} */
const incidentStore = [
  {
    id: "inc-001",
    zone: "B",
    type: "Medical",
    severity: "medium",
    description: "Fan reported dizziness near section B-14. Medical team en-route.",
    reportedAt: new Date(Date.now() - 12 * 60 * 1000).toISOString(),
    status: "active"
  },
  {
    id: "inc-002",
    zone: "D",
    type: "Security",
    severity: "high",
    description: "Unauthorised access attempt at Gate D3. Security units deployed.",
    reportedAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
    status: "active"
  },
  {
    id: "inc-003",
    zone: "A",
    type: "Crowd Control",
    severity: "low",
    description: "Minor bottleneck near concession stand A-02. Queue management in progress.",
    reportedAt: new Date(Date.now() - 28 * 60 * 1000).toISOString(),
    status: "resolved"
  }
];

// Seed for realistic pseudo-random crowd density — shifts on each refresh cycle
let crowdSeed = Date.now();

/**
 * Generates a seeded pseudo-random float in [min, max].
 * Uses a simple LCG so values feel live but deterministic per seed.
 * @param {number} min
 * @param {number} max
 * @returns {number}
 */
function seededRandom(min, max) {
  crowdSeed = (crowdSeed * 1664525 + 1013904223) & 0xffffffff;
  const t = (crowdSeed >>> 0) / 0xffffffff;
  return parseFloat((min + t * (max - min)).toFixed(1));
}

/**
 * Generates realistic crowd density data for zones A-F.
 * Zones near the pitch (A, B) tend to fill faster; outer zones (E, F) are lighter.
 * @returns {Array<{zone: string, label: string, density: number}>}
 */
function getCrowdDensity() {
  const zoneProfiles = [
    { zone: "A", label: "Lower Bowl — Pitch Side",  min: 72, max: 98 },
    { zone: "B", label: "Lower Bowl — End Stands",  min: 65, max: 92 },
    { zone: "C", label: "Mid-Tier — Main Stand",    min: 55, max: 85 },
    { zone: "D", label: "Mid-Tier — Away End",      min: 50, max: 80 },
    { zone: "E", label: "Upper Tier — East",        min: 30, max: 68 },
    { zone: "F", label: "Upper Tier — West",        min: 25, max: 62 }
  ];
  return zoneProfiles.map(({ zone, label, min, max }) => ({
    zone,
    label,
    density: seededRandom(min, max)
  }));
}

/**
 * Computes staff deployment recommendation for a zone based on density threshold.
 *  density >= 80  → 1 staff per 40 fans  (critical)
 *  density >= 60  → 1 staff per 60 fans  (elevated)
 *  density <  60  → 1 staff per 80 fans  (normal)
 * Zone base capacity: 5 000 seats.
 *
 * @param {number} density
 * @param {string} zone
 * @returns {{zone, occupancy, assigned, recommended, gap, status}}
 */
function getStaffRecommendation(density, zone) {
  const ZONE_CAPACITY = 5000;
  const occupancy = Math.round((density / 100) * ZONE_CAPACITY);
  let ratio, status;
  if (density >= 80)      { ratio = 40; status = "critical"; }
  else if (density >= 60) { ratio = 60; status = "elevated"; }
  else                    { ratio = 80; status = "normal"; }

  const recommended = Math.ceil(occupancy / ratio);
  const factor = density >= 80 ? 0.75 : density >= 60 ? 0.85 : 0.95;
  const assigned = Math.max(1, Math.round(recommended * factor));
  const gap = recommended - assigned;
  return { zone, occupancy, assigned, recommended, gap, status };
}

// ─────────────────────────────────────────────
//  GET /api/analytics  (existing root route)
// ─────────────────────────────────────────────

/**
 * @route GET /api/analytics
 * @desc Aggregated KPI metrics for the control room dashboard.
 * @access Public
 */
router.get("/", (req, res, next) => {
  try {
    const totalCapacity = stadiums.reduce((sum, s) => sum + s.capacity, 0);
    const avgCapacity = Math.round(totalCapacity / stadiums.length);
    const countryCount = stadiums.reduce((acc, s) => {
      acc[s.country] = (acc[s.country] || 0) + 1;
      return acc;
    }, {});

    const matchCounts = matches.reduce(
      (acc, m) => {
        acc[m.status] = (acc[m.status] || 0) + 1;
        return acc;
      },
      { completed: 0, live: 0, scheduled: 0 }
    );
    const totalMatches = matches.length;

    const openVendors = vendors.filter((v) => v.status === "open" || v.status === "busy");
    const avgQueueTime = openVendors.length
      ? parseFloat(
          (openVendors.reduce((sum, v) => sum + v.queueTimeMinutes, 0) / openVendors.length).toFixed(1)
        )
      : 0;

    const busiestVendor = vendors.reduce((max, v) => {
      if (!max || v.queueTimeMinutes > max.queueTimeMinutes) return v;
      return max;
    }, null);

    const alerts = [];
    if (busiestVendor && busiestVendor.queueTimeMinutes >= 20) {
      const targetStadium = stadiums.find((s) => s.id === busiestVendor.stadiumId);
      alerts.push({
        level: "warning",
        category: "concessions",
        message: `High wait time (${busiestVendor.queueTimeMinutes}m) at '${busiestVendor.name}' in ${targetStadium ? targetStadium.name : busiestVendor.stadiumId} (${busiestVendor.section}). Suggest crowd redirection.`
      });
    }
    if (matchCounts.live > 1) {
      alerts.push({
        level: "info",
        category: "security",
        message: `${matchCounts.live} live matches are concurrently in progress. Operations staff on high alert.`
      });
    }

    res.json({
      status: "success",
      timestamp: new Date().toISOString(),
      data: {
        stadiums: { totalVenues: stadiums.length, totalCapacity, averageCapacity: avgCapacity, byCountry: countryCount },
        matches: { totalMatches, ...matchCounts },
        vendors: {
          totalVendors: vendors.length,
          activeVendors: openVendors.length,
          averageWaitTimeMinutes: avgQueueTime,
          busiestVendor: busiestVendor
            ? { name: busiestVendor.name, section: busiestVendor.section, queueTimeMinutes: busiestVendor.queueTimeMinutes, stadiumId: busiestVendor.stadiumId }
            : null
        },
        alerts
      }
    });
  } catch (error) {
    next(error);
  }
});

// ─────────────────────────────────────────────
//  GET /api/analytics/crowd
// ─────────────────────────────────────────────

/**
 * @route GET /api/analytics/crowd
 * @desc Real-time crowd density per zone (A–F) with colour-coded status.
 * @access Public
 */
router.get("/crowd", (req, res) => {
  crowdSeed = Date.now();
  const zones = getCrowdDensity();

  const result = zones.map(({ zone, label, density }) => {
    let status;
    if (density >= 80)      status = "critical";
    else if (density >= 60) status = "elevated";
    else                    status = "normal";
    return { zone, label, density, status };
  });

  res.json({ status: "success", timestamp: new Date().toISOString(), data: result });
});

// ─────────────────────────────────────────────
//  GET /api/analytics/staff
// ─────────────────────────────────────────────

/**
 * @route GET /api/analytics/staff
 * @desc Staff deployment recommendations per zone based on current crowd density.
 * @access Public
 */
router.get("/staff", (req, res) => {
  const zones = getCrowdDensity();
  const staffData = zones.map(({ zone, density }) => getStaffRecommendation(density, zone));
  res.json({ status: "success", timestamp: new Date().toISOString(), data: staffData });
});

// ─────────────────────────────────────────────
//  GET /api/analytics/incidents
// ─────────────────────────────────────────────

/**
 * @route GET /api/analytics/incidents
 * @desc All logged operational incidents, sorted most-recent first.
 * @access Public
 */
router.get("/incidents", (req, res) => {
  const sorted = [...incidentStore].sort(
    (a, b) => new Date(b.reportedAt) - new Date(a.reportedAt)
  );
  res.json({ status: "success", timestamp: new Date().toISOString(), results: sorted.length, data: sorted });
});

// ─────────────────────────────────────────────
//  POST /api/analytics/incident
// ─────────────────────────────────────────────

/** Validation rules for incident report POST body. */
const validateIncident = [
  body("zone")
    .isString().withMessage("Zone must be a string")
    .trim()
    .isIn(["A", "B", "C", "D", "E", "F"])
    .withMessage("Zone must be one of: A, B, C, D, E, F"),
  body("type")
    .isString().withMessage("Type must be a string")
    .trim()
    .notEmpty().withMessage("Incident type is required")
    .isLength({ max: 80 }).withMessage("Type must be 80 characters or fewer")
    .escape(),
  body("severity")
    .isIn(["low", "medium", "high"])
    .withMessage("Severity must be one of: low, medium, high"),
  body("description")
    .isString().withMessage("Description must be a string")
    .trim()
    .notEmpty().withMessage("Description is required")
    .isLength({ min: 10, max: 500 })
    .withMessage("Description must be between 10 and 500 characters")
    .escape()
];

/**
 * @route POST /api/analytics/incident
 * @desc Report a new operational incident. Validates zone, type, severity, description.
 * @access Public
 */
router.post("/incident", validateIncident, (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      status: "fail",
      message: "Validation failed",
      errors: errors.array().map((e) => ({ param: e.path, message: e.msg }))
    });
  }

  const { zone, type, severity, description } = req.body;
  const newIncident = {
    id: `inc-${String(incidentStore.length + 1).padStart(3, "0")}`,
    zone,
    type,
    severity,
    description,
    reportedAt: new Date().toISOString(),
    status: "active"
  };

  incidentStore.push(newIncident);

  return res.status(201).json({
    status: "success",
    message: "Incident reported successfully.",
    data: newIncident
  });
});

module.exports = router;
