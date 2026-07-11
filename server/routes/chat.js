/**
 * @fileoverview Chat router for operational AI queries.
 * Integrates input validation, rate limiting, and the Gemini service.
 */

const express = require("express");
const router = express.Router();
const { chatLimiter } = require("../middleware/rateLimiter");
const { validateChat } = require("../middleware/validateInput");
const { generateOperationalResponse } = require("../services/geminiService");

/**
 * @route POST /api/chat
 * @desc Submit operational queries to the Gemini AI operations assistant.
 * @access Public (Protected by rate limiter)
 */
router.post("/", chatLimiter, validateChat, async (req, res, next) => {
  const { message, lang } = req.body;

  try {
    const aiResponse = await generateOperationalResponse(message, lang || "en");
    
    res.json({
      status: "success",
      timestamp: new Date().toISOString(),
      data: {
        response: aiResponse
      }
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
