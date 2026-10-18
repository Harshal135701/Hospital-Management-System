
const express = require("express");
const cors = require("cors");
require("dotenv").config();

const appointmentRoutes = require("./modules/appointments/appointment.routes");
const bloodRequestRoutes = require("./modules/appointments/bloodRequest.routes");
const rosterRoutes = require("./modules/rosters/roster.routes");
const queueRoutes = require("./modules/queue/queue.routes");
const notificationRoutes = require("./modules/notifications/notification.routes");
const startNotificationScheduler = require("./modules/notifications/notification.scheduler");

const billingRoutes = require("./modules/billing/billing.routes");
const ipdBillingRoutes = require("./modules/billing/ipd-billing.routes");
const dischargeBillingRoutes = require("./modules/billing/discharge-billing.routes");
const depositRoutes = require("./modules/billing/deposit.routes");
const refundRoutes = require("./modules/billing/refund.routes");
const settlementRoutes = require("./modules/billing/settlement.routes");

const authRoutes = require("./modules/auth/auth.routes");
const patientRoutes = require("./modules/patients/patient.routes");
const bloodBankRoutes = require("./modules/bloodbank/bloodbank.routes");

const doctorRoutes = require("./modules/doctors/doctor.routes");
const departmentRoutes = require("./modules/departments/department.routes");

const consultationRoutes = require("./modules/consultations/consultation.routes");
const vitalsRoutes = require("./modules/vitals/vitals.routes");
const clinicalHistoryRoutes = require("./modules/clinical-history/clinical-history.routes");
const providerOrdersRoutes = require("./modules/provider-orders/provider-orders.routes");
const clinicalNotesRoutes = require("./modules/clinical-notes/clinical-notes.routes");

const preauthorizationRoutes = require("./modules/insurance-tpa/preauthorization.routes");
const enhancementRoutes = require("./modules/insurance-tpa/enhancement.routes");
const claimDossierRoutes = require("./modules/insurance-tpa/claim-dossier.routes");
const responsibilityRoutes = require("./modules/insurance-tpa/responsibility.routes");
const reconciliationRoutes = require("./modules/insurance-tpa/reconciliation.routes");

const daycareRoutes = require("./modules/daycare/daycare.routes");
const dietaryRoutes = require("./modules/dietary/dietary.routes");
const ivfRoutes = require("./modules/ivf/ivf.routes");
const emergencyRoutes = require("./modules/emergency/emergency.routes");
const emrRoutes = require("./modules/emr/emr.routes");
const financeRoutes = require("./modules/finance/finance.routes");
const assetRoutes = require("./modules/assets/assets.routes");
const enterpriseRoutes = require("./modules/enterprise/enterprise.routes");

const { globalApiRateLimiter } = require("./middleware/rate-limiter.middleware");
const notFoundHandler = require("./middleware/not-found.middleware");
const errorHandler = require("./middleware/error.middleware");
const pool = require("./config/db");

const app = express();

app.use(cors());
app.use(express.json());

// Apply API rate limiting before registering API endpoints.
app.use("/api", globalApiRateLimiter);

// Health check
app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Hospital Management System API is healthy",
    timestamp: new Date().toISOString(),
  });
});

// Quick metadata directory
app.get("/api/meta", async (req, res, next) => {
  try {
    const [departments, doctors, patients, rooms] = await Promise.all([
      pool.query(
        "SELECT id, name, code, description FROM departments WHERE is_active = true ORDER BY name"
      ),
      pool.query(
        "SELECT d.id, d.full_name, d.employee_code, d.department_id, dep.name AS department_name, d.room_id FROM doctors d JOIN departments dep ON dep.id = d.department_id WHERE d.is_active = true ORDER BY d.full_name"
      ),
      pool.query(
        "SELECT id, uhid, full_name, mobile, gender FROM patients ORDER BY full_name"
      ),
      pool.query(
        "SELECT id, room_number, name, floor FROM rooms WHERE is_active = true ORDER BY room_number"
      ),
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
  } catch (err) {
    next(err);
  }
});

// Authentication, patients, blood bank and clinical directory
app.use("/api/auth", authRoutes);
app.use("/api/patients", patientRoutes);
app.use("/api/blood-bank", bloodBankRoutes);
app.use("/api/blood-requests", bloodRequestRoutes);
app.use("/api/doctors", doctorRoutes);
app.use("/api/departments", departmentRoutes);

// Appointments, roster, queue and notifications
app.use("/api/appointments", appointmentRoutes);
app.use("/api/rosters", rosterRoutes);
app.use("/api/queue", queueRoutes);
app.use("/api/notifications", notificationRoutes);

// Billing and payments
app.use("/api/billing", billingRoutes);
app.use("/api/billing/ipd", ipdBillingRoutes);
app.use("/api/billing/ipd", dischargeBillingRoutes);
app.use("/api/billing/deposits", depositRoutes);
app.use("/api/billing/refunds", refundRoutes);
app.use("/api/billing/settlement", settlementRoutes);

// Clinical services — register each router only once
app.use("/api/consultations", consultationRoutes);
app.use("/api/vitals", vitalsRoutes);
app.use("/api/clinical-history", clinicalHistoryRoutes);
app.use("/api/provider-orders", providerOrdersRoutes);
app.use("/api/clinical-notes", clinicalNotesRoutes);

// Insurance and TPA
app.use("/api/insurance/preauthorizations", preauthorizationRoutes);
app.use("/api/insurance/enhancements", enhancementRoutes);
app.use("/api/insurance/claims", claimDossierRoutes);
app.use("/api/insurance/responsibilities", responsibilityRoutes);
app.use("/api/insurance/reconciliations", reconciliationRoutes);

// Module 8: Day Care / Ambulatory Surgery
app.use("/api/daycare", daycareRoutes);

// Module 9: Dietary & Kitchen Management
app.use("/api/dietary", dietaryRoutes);

// Module 10: IVF / ART (Assisted Reproductive Technology)
app.use("/api/ivf", ivfRoutes);

// Module 11: Emergency Department & Trauma
app.use("/api/emergency", emergencyRoutes);

// Module 12: EMR & Clinical Records
app.use("/api/emr", emrRoutes);

// Module 13: Hospital Financials & Accounts
app.use("/api/finance", financeRoutes);

// Module 14: Biomedical & Hospital Asset Management
app.use("/api/assets", assetRoutes);

// Module 15: Hospital Enterprise Master Data
app.use("/api/enterprise", enterpriseRoutes);

// Not-found and error handling must remain last.
app.use(notFoundHandler);
app.use(errorHandler);

// Start notification scheduler
startNotificationScheduler();

module.exports = app;
