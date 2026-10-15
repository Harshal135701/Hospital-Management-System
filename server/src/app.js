const express = require("express");
const cors = require("cors");
require("dotenv").config();

const appointmentRoutes = require("./modules/appointments/appointment.routes");
const bloodRequestRoutes = require("./modules/appointments/bloodRequest.routes");
const rosterRoutes = require("./modules/rosters/roster.routes");
const queueRoutes = require("./modules/queue/queue.routes");
const notFound = require("./middleware/not-found.middleware");
const errorHandler = require("./middleware/error.middleware");
const pool = require("./config/db");
const notificationRoutes = require("./modules/notifications/notification.routes");
const startNotificationScheduler = require("./modules/notifications/notification.scheduler");
const billingRoutes = require("./modules/billing/billing.routes");
const ipdBillingRoutes = require("./modules/billing/ipd-billing.routes");
const dischargeBillingRoutes = require("./modules/billing/discharge-billing.routes");
const depositRoutes = require("./modules/billing/deposit.routes");
const refundRoutes = require("./modules/billing/refund.routes");
const settlementRoutes = require("./modules/billing/settlement.routes");
const authRoutes = require("./modules/auth/auth.routes");
const bloodBankRoutes = require("./modules/bloodbank/bloodbank.routes");

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

// 3.4 Message apis

app.use("/api/notifications", notificationRoutes);

// Module 4.1: Billing & Payments
app.use("/api/billing", billingRoutes);

// Module 4.2: IPD Interim Billing
app.use("/api/billing/ipd", ipdBillingRoutes);

// Module 4.3: Discharge Final Billing
app.use("/api/billing/ipd", dischargeBillingRoutes);

// Module 4.4: Deposite Billing
app.use("/api/billing/deposits", depositRoutes);

// Module 4.5: My Refunds
app.use("/api/billing/refunds", refundRoutes);

// Module 4.6: Day-End Cashier Settlement
app.use("/api/billing/settlement", settlementRoutes);

app.use("/api/auth", authRoutes);
app.use("/api/blood-bank", bloodBankRoutes);
app.use("/api/blood-requests", bloodRequestRoutes);

// 404 & Global Error Handling
app.use(notFound);
app.use(errorHandler);

startNotificationScheduler();


module.exports = app;