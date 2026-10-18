const { z } = require('zod');

const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const createHistorySchema = z.object({
  encounter_id: z.string().regex(uuidRegex, 'Valid encounter UUID is required').optional(),
  encounterId: z.string().regex(uuidRegex, 'Valid encounter UUID is required').optional(),

  chief_complaints: z.string().min(1, 'Chief complaints are required').max(5000),
  history_of_present_illness: z.string().max(5000).optional(),
  past_medical_history: z.string().max(5000).optional(),
  medication_history: z.string().max(5000).optional(),
  allergy_history: z.string().max(5000).optional(),
  family_history: z.string().max(5000).optional(),
  social_history: z.string().max(5000).optional(),
  review_of_systems: z.string().max(5000).optional(),
}).refine((data) => data.encounter_id || data.encounterId, {
  message: 'encounter_id or encounterId is required',
  path: ['encounter_id'],
});

const updateHistorySchema = z.object({
  chief_complaints: z.string().min(1).max(5000).optional(),
  history_of_present_illness: z.string().max(5000).optional(),
  past_medical_history: z.string().max(5000).optional(),
  medication_history: z.string().max(5000).optional(),
  allergy_history: z.string().max(5000).optional(),
  family_history: z.string().max(5000).optional(),
  social_history: z.string().max(5000).optional(),
  review_of_systems: z.string().max(5000).optional(),
});

module.exports = {
  createHistorySchema,
  updateHistorySchema,
};
