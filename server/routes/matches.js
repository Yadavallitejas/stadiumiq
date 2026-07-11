/**
 * @fileoverview Matches router.
 * Provides endpoints for retrieving and filtering World Cup fixture schedules.
 */

const express = require("express");
const router = express.Router();
const matches = require("../data/matches");
const { validateMatchFilter } = require("../middleware/validateInput");

/**
 * @route GET /api/matches
 * @desc Get all matches with optional filters (stadiumId, date, status).
 * @access Public
 */
router.get("/", validateMatchFilter, (req, res) => {
  const { stadiumId, date, status } = req.query;
  let filteredMatches = [...matches];

  if (stadiumId) {
    filteredMatches = filteredMatches.filter((m) => m.stadiumId === stadiumId);
  }

  if (date) {
    filteredMatches = filteredMatches.filter((m) => m.date === date);
  }

  if (status) {
    filteredMatches = filteredMatches.filter((m) => m.status === status);
  }

  res.json({
    status: "success",
    results: filteredMatches.length,
    data: filteredMatches
  });
});

/**
 * @route GET /api/matches/live
 * @desc Quick helper to fetch all current live matches.
 * @access Public
 */
router.get("/live", (req, res) => {
  const liveMatches = matches.filter((m) => m.status === "live");
  res.json({
    status: "success",
    results: liveMatches.length,
    data: liveMatches
  });
});

module.exports = router;
