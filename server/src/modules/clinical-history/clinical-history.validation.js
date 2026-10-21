const { z } = require('zod');

const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const createHistorySchema = z.object({
  encounter_id: z.string().regex(uuidRegex, 'Valid encounter UUID is required').optional(),
  encounterId: z.string().regex(uuidRegex, 'Valid encounter UUID is required').optional(),

  chief_complaints: z.string().max(5000).optional(),
  presentingComplaint: z.string().max(5000).optional(),

  onset_duration: z.string().max(1000).optional(),
  onsetDuration: z.string().max(1000).optional(),

  severity: z.string().max(100).optional(),

  aggravating_factors: z.string().max(2000).optional(),
  aggravatingFactors: z.string().max(2000).optional(),

  relieving_factors: z.string().max(2000).optional(),
  relievingFactors: z.string().max(2000).optional(),

  history_of_present_illness: z.string().max(5000).optional(),

  past_medical_history: z.string().max(5000).optional(),
  medicalHistory: z.string().max(5000).optional(),

  past_surgical_history: z.string().max(5000).optional(),
  surgicalHistory: z.string().max(5000).optional(),

  medication_history: z.string().max(5000).optional(),
  currentMedications: z.string().max(5000).optional(),

  allergy_history: z.string().max(5000).optional(),
  allergies: z.string().max(5000).optional(),

  family_history: z.string().max(5000).optional(),
  familyHistory: z.string().max(5000).optional(),

  social_history: z.string().max(5000).optional(),
  review_of_systems: z.string().max(5000).optional(),
}).refine((data) => data.encounter_id || data.encounterId, {
  message: 'encounter_id or encounterId is required',
  path: ['encounter_id'],
});

const updateHistorySchema = z.object({
  chief_complaints: z.string().max(5000).optional(),
  presentingComplaint: z.string().max(5000).optional(),

  onset_duration: z.string().max(1000).optional(),
  onsetDuration: z.string().max(1000).optional(),

  severity: z.string().max(100).optional(),

  aggravating_factors: z.string().max(2000).optional(),
  aggravatingFactors: z.string().max(2000).optional(),

  relieving_factors: z.string().max(2000).optional(),
  relievingFactors: z.string().max(2000).optional(),

  history_of_present_illness: z.string().max(5000).optional(),

  past_medical_history: z.string().max(5000).optional(),
  medicalHistory: z.string().max(5000).optional(),

  past_surgical_history: z.string().max(5000).optional(),
  surgicalHistory: z.string().max(5000).optional(),

  medication_history: z.string().max(5000).optional(),
  currentMedications: z.string().max(5000).optional(),

  allergy_history: z.string().max(5000).optional(),
  allergies: z.string().max(5000).optional(),

  family_history: z.string().max(5000).optional(),
  familyHistory: z.string().max(5000).optional(),

  social_history: z.string().max(5000).optional(),
  review_of_systems: z.string().max(5000).optional(),
});

module.exports = {
  createHistorySchema,
  updateHistorySchema,
};
