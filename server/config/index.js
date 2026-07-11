/**
 * @fileoverview Configuration module.
 * Loads environment variables from the root .env file and exposes a validated config object.
 */

const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../../.env") });

/**
 * Application config object.
 * @typedef {Object} Config
 * @property {number} port - The port the Express server listens on.
 * @property {string} nodeEnv - The current runtime environment ('development', 'production', 'test').
 * @property {string} geminiApiKey - The API key for accessing Google Generative AI services.
 */

/**
 * @type {Config}
 */
const config = {
  port: parseInt(process.env.PORT, 10) || 5000,
  nodeEnv: process.env.NODE_ENV || "development",
  geminiApiKey: process.env.GEMINI_API_KEY || ""
};

// Validate key configuration warnings
if (!config.geminiApiKey) {
  console.warn("WARNING: GEMINI_API_KEY is not defined in the environment. Chat assistant will run in mock mode.");
}

module.exports = config;
