/**
 * @fileoverview Stadiums router.
 * Provides endpoints for retrieving stadium data and calculating the nearest stadium.
 */

const express = require("express");
const router = express.Router();
const stadiums = require("../data/stadiums");
const { validateCoordinates, validateStadiumId } = require("../middleware/validateInput");

/**
 * Calculates the distance between two geographical points using the Haversine formula.
 * @param {number} lat1 - Latitude of origin.
 * @param {number} lon1 - Longitude of origin.
 * @param {number} lat2 - Latitude of destination.
 * @param {number} lon2 - Longitude of destination.
 * @returns {number} Distance in kilometers.
 */
function haversineDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * @route GET /api/stadiums
 * @desc Get all stadiums, optionally filtered by country.
 * @access Public
 */
router.get("/", (req, res) => {
  const { country } = req.query;
  let filteredStadiums = [...stadiums];

  if (country) {
    filteredStadiums = filteredStadiums.filter(
      (s) => s.country.toLowerCase() === country.toString().toLowerCase()
    );
  }

  res.json({
    status: "success",
    results: filteredStadiums.length,
    timestamp: new Date().toISOString(),
    data: filteredStadiums
  });
});

/**
 * @route GET /api/stadiums/nearest
 * @desc Get the nearest stadium to a given lat/lng coordinate.
 * @access Public
 */
router.get("/nearest", validateCoordinates, (req, res) => {
  const { lat, lng } = req.query;

  let nearestStadium = null;
  let minDistance = Infinity;

  stadiums.forEach((stadium) => {
    const distance = haversineDistance(
      lat,
      lng,
      stadium.coordinates.lat,
      stadium.coordinates.lng
    );

    if (distance < minDistance) {
      minDistance = distance;
      nearestStadium = stadium;
    }
  });

  res.json({
    status: "success",
    data: {
      stadium: nearestStadium,
      distanceKm: parseFloat(minDistance.toFixed(2))
    }
  });
});

/**
 * @route GET /api/stadiums/:id
 * @desc Get stadium by unique kebab-case ID.
 * @access Public
 */
router.get("/:id", validateStadiumId, (req, res) => {
  const { id } = req.params;
  const stadium = stadiums.find((s) => s.id === id);

  if (!stadium) {
    return res.status(404).json({
      status: "fail",
      message: `Stadium with ID '${id}' not found.`
    });
  }

  res.json({
    status: "success",
    data: stadium
  });
});

module.exports = router;
