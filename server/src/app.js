const express = require("express");
const cors = require("cors");
require("dotenv").config();

const patientRoutes = require("./modules/patients/patient.routes");
const bloodBankRoutes = require("./modules/bloodbank/bloodbank.routes");
const errorHandler = require("./middleware/error.middleware");
const notFoundHandler = require("./middleware/not-found.middleware");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Hospital Management System API is healthy",
  });
});

// Modular Routes
app.use("/api/patients", patientRoutes);
app.use("/api/blood-bank", bloodBankRoutes);

// Catch-all & Error Handlers
app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;