const { z } = require('zod');

const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const createEncounterSchema = z.object({
  appointment_id: z.string().regex(uuidRegex, 'Valid appointment UUID is required').optional(),
  appointmentId: z.string().regex(uuidRegex, 'Valid appointment UUID is required').optional(),
  patient_id: z.string().regex(uuidRegex, 'Valid patient UUID is required').optional(),
  patientId: z.string().regex(uuidRegex, 'Valid patient UUID is required').optional(),
  doctor_id: z.string().regex(uuidRegex, 'Valid doctor UUID is required').optional(),
  doctorId: z.string().regex(uuidRegex, 'Valid doctor UUID is required').optional(),
  summary: z.string().max(4000).optional(),
  examination: z.string().max(4000).optional(),
  impression: z.string().max(4000).optional(),
  chief_complaint: z.string().max(2000).optional(),
  chiefComplaint: z.string().max(2000).optional(),
}).refine((data) => data.appointment_id || data.appointmentId, {
  message: 'appointment_id or appointmentId is required',
  path: ['appointment_id'],
}).refine((data) => data.patient_id || data.patientId, {
  message: 'patient_id or patientId is required',
  path: ['patient_id'],
});

const updateEncounterSchema = z.object({
  summary: z.string().max(4000).optional(),
  examination: z.string().max(4000).optional(),
  impression: z.string().max(4000).optional(),
  chief_complaint: z.string().max(2000).optional(),
  chiefComplaint: z.string().max(2000).optional(),
  status: z.enum(['in_progress', 'completed', 'cancelled']).optional(),
});

const completeEncounterSchema = z.object({
  notes: z.string().max(2000).optional(),
  summary: z.string().max(4000).optional(),
  examination: z.string().max(4000).optional(),
  impression: z.string().max(4000).optional(),
  chief_complaint: z.string().max(2000).optional(),
  chiefComplaint: z.string().max(2000).optional(),
});

module.exports = {
  createEncounterSchema,
  updateEncounterSchema,
  completeEncounterSchema,
};
