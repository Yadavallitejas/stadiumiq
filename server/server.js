/**
 * @fileoverview Main server entry point.
 * Imports the configured app instance and listens on the specified port.
 * Implements graceful shutdown procedures.
 */

const app = require("./app");
const config = require("./config");

const server = app.listen(config.port, () => {
  console.log(`===================================================`);
  console.log(`StadiumIQ Server Started Successfully`);
  console.log(`Environment: ${config.nodeEnv}`);
  console.log(`Port:        ${config.port}`);
  console.log(`Server URL:  http://localhost:${config.port}`);
  console.log(`===================================================`);
});

/**
 * Handle graceful shutdown of the server.
 * Closes the HTTP server and terminates the process.
 * @param {string} signal - The system signal received (e.g. SIGTERM, SIGINT).
 * @returns {void}
 */
const handleShutdown = (signal) => {
  console.log(`[Server] Received ${signal}. Shutting down gracefully...`);
  
  server.close(() => {
    console.log("[Server] HTTP server closed. Process exiting.");
    process.exit(0);
  });

  // Force exit after 10 seconds if connections refuse to close
  setTimeout(() => {
    console.error("[Server] Forceful shutdown triggered due to active connections.");
    process.exit(1);
  }, 10000);
};

process.on("SIGTERM", () => handleShutdown("SIGTERM"));
process.on("SIGINT", () => handleShutdown("SIGINT"));
