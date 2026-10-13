const express = require("express");
const cors = require("cors");
require("dotenv").config();

const appointmentRoutes = require("./modules/appointments/appointment.routes");
const rosterRoutes = require("./modules/rosters/roster.routes");
const queueRoutes = require("./modules/queue/queue.routes");
const notFound = require("./middleware/not-found.middleware");
const errorHandler = require("./middleware/error.middleware");
const pool = require("./config/db");

const app = express();

app.use(cors());
app.use(express.json());

// Health Check
app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Hospital Management System API is healthy",
    timestamp: new Date().toISOString(),
  });
});

// Quick Metadata Directory (Convenient for testing IDs and UI dropdowns)
app.get("/api/meta", async (req, res, next) => {
  try {
    const [departments, doctors, patients, rooms] = await Promise.all([
      pool.query("SELECT id, name, code, description FROM departments WHERE is_active = true ORDER BY name"),
      pool.query("SELECT d.id, d.full_name, d.employee_code, d.department_id, dep.name AS department_name, d.room_id FROM doctors d JOIN departments dep ON dep.id = d.department_id WHERE d.is_active = true ORDER BY d.full_name"),
      pool.query("SELECT id, uhid, full_name, mobile, gender FROM patients ORDER BY full_name"),
      pool.query("SELECT id, room_number, name, floor FROM rooms WHERE is_active = true ORDER BY room_number"),
    ]);

    res.status(200).json({
      success: true,
      data: {
        departments: departments.rows,
        doctors: doctors.rows,
        patients: patients.rows,
        rooms: rooms.rows,
      },
    });
  } catch (e) {
    next(e);
  }
});

// Module 3: Appointments Submodules
// 3.1 Book / Reschedule Appointment
app.use("/api/appointments", appointmentRoutes);

// 3.2 Doctor Roster & Shift Planning
app.use("/api/rosters", rosterRoutes);

// 3.3 Token Queue / Waiting Room Display
app.use("/api/queue", queueRoutes);

// 404 & Global Error Handling
app.use(notFound);
app.use(errorHandler);

module.exports = app;