const { z } = require('zod');

const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const createVitalsSchema = z.object({
  encounter_id: z.string().regex(uuidRegex, 'Valid encounter UUID is required').optional(),
  encounterId: z.string().regex(uuidRegex, 'Valid encounter UUID is required').optional(),

  // Support both canonical DB names and frontend names
  systolic_bp: z.coerce.number().positive().max(300).optional(),
  systolic: z.coerce.number().positive().max(300).optional(),

  diastolic_bp: z.coerce.number().positive().max(200).optional(),
  diastolic: z.coerce.number().positive().max(200).optional(),

  pulse_rate: z.coerce.number().positive().max(300).optional(),
  heartRate: z.coerce.number().positive().max(300).optional(),

  temperature: z.coerce.number().positive().optional(),
  temperature_c: z.coerce.number().positive().optional(),
  tempUnit: z.enum(['C', 'F']).optional().default('C'),

  respiratory_rate: z.coerce.number().positive().max(100).optional(),
  respiratoryRate: z.coerce.number().positive().max(100).optional(),

  oxygen_saturation: z.coerce.number().min(0).max(100).optional(),
  spo2: z.coerce.number().min(0).max(100).optional(),

  height_cm: z.coerce.number().positive().max(300).optional(),
  height: z.coerce.number().positive().max(300).optional(),

  weight_kg: z.coerce.number().positive().max(500).optional(),
  weight: z.coerce.number().positive().max(500).optional(),

  examination_findings: z.string().max(4000).optional(),
  cvs: z.string().max(1000).optional(),
  rs: z.string().max(1000).optional(),
  abdomen: z.string().max(1000).optional(),
  cns: z.string().max(1000).optional(),
}).refine((data) => data.encounter_id || data.encounterId, {
  message: 'encounter_id or encounterId is required',
  path: ['encounter_id'],
});

module.exports = {
  createVitalsSchema,
};
