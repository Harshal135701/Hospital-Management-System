const { z } = require('zod');

const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const createEncounterSchema = z.object({
  appointment_id: z.string().regex(uuidRegex, 'Valid appointment UUID is required').optional(),
  appointmentId: z.string().regex(uuidRegex, 'Valid appointment UUID is required').optional(),
  patient_id: z.string().regex(uuidRegex, 'Valid patient UUID is required').optional(),
  patientId: z.string().regex(uuidRegex, 'Valid patient UUID is required').optional(),
}).refine((data) => data.appointment_id || data.appointmentId, {
  message: 'appointment_id or appointmentId is required',
  path: ['appointment_id'],
}).refine((data) => data.patient_id || data.patientId, {
  message: 'patient_id or patientId is required',
  path: ['patient_id'],
});

const completeEncounterSchema = z.object({
  notes: z.string().max(2000).optional(),
  summary: z.string().max(2000).optional(),
});

module.exports = {
  createEncounterSchema,
  completeEncounterSchema,
};
