const express = require("express");
const cors = require("cors");
require("dotenv").config();

const authRoutes = require("./modules/auth/auth.routes");
const patientRoutes = require("./modules/patients/patient.routes");
const bloodBankRoutes = require("./modules/bloodbank/bloodbank.routes");
const { globalApiRateLimiter } = require("./middleware/rate-limiter.middleware");
const errorHandler = require("./middleware/error.middleware");
const notFoundHandler = require("./middleware/not-found.middleware");

const app = express();

app.use(cors());
app.use(express.json());

// Public Health Check Endpoint
app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Hospital Management System API is healthy",
  });
});

// Global API rate limiter on /api
app.use("/api", globalApiRateLimiter);

// Modular Routes
app.use("/api/auth", authRoutes);
app.use("/api/patients", patientRoutes);
app.use("/api/blood-bank", bloodBankRoutes);

// Catch-all & Error Handlers
app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;