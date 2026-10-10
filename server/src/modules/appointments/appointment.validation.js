
const { z } = require("zod");

const createAppointmentSchema = z.object({
  patientId: z.string().uuid(),
  doctorId: z.string().uuid(),
  departmentId: z.string().uuid(),
  appointmentDate: z.string().date(),
  startTime: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/),
  visitType: z.enum(["first_visit", "follow_up"]),
});

module.exports = { createAppointmentSchema };
