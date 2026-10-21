
const express = require("express");
const {
  authenticateToken,
  requireRoles,
} = require("../../middleware/auth.middleware");

const router = express.Router();

// Require authentication for all notification routes
router.use(authenticateToken);

// Safe fallback handler pending notifications table schema migration
const pendingSchemaHandler = (req, res) => {
  if (req.method === "GET") {
    return res.status(200).json({
      success: true,
      data: [],
      message: "Notification service is active; no notifications stored pending schema initialization",
    });
  }
  return res.status(503).json({
    success: false,
    message: "Notification queuing is temporarily disabled pending database schema migration",
  });
};

router.get("/", requireRoles("receptionist", "clinician_doctor", "super_admin"), pendingSchemaHandler);
router.post("/appointments/:appointmentId/events", requireRoles("receptionist", "super_admin"), pendingSchemaHandler);
router.post("/appointments/:appointmentId/reminders", requireRoles("receptionist", "super_admin"), pendingSchemaHandler);
router.patch("/appointments/:appointmentId/cancel-pending", requireRoles("receptionist", "super_admin"), pendingSchemaHandler);
router.post("/:id/send", requireRoles("super_admin"), pendingSchemaHandler);

module.exports = router;
