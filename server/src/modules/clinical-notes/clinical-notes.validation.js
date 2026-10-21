const { z } = require('zod');

const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const NOTE_TYPES = ['initial', 'progress', 'follow_up'];
const NOTE_STATUSES = ['draft', 'finalized', 'amended'];

const createNoteSchema = z.object({
  encounter_id: z.string().regex(uuidRegex, 'Valid encounter UUID is required').optional(),
  encounterId: z.string().regex(uuidRegex, 'Valid encounter UUID is required').optional(),

  note_type: z.string().optional().default('progress').transform((v) => v.toLowerCase()).refine((v) => NOTE_TYPES.includes(v), {
    message: `note_type must be one of: ${NOTE_TYPES.join(', ')}`,
  }),
  status: z.string().optional().default('finalized').transform((v) => v.toLowerCase()).refine((v) => NOTE_STATUSES.includes(v), {
    message: `status must be one of: ${NOTE_STATUSES.join(', ')}`,
  }),
  subjective: z.string().max(5000).optional(),
  objective: z.string().max(5000).optional(),
  assessment: z.string().max(5000).optional(),
  plan: z.string().max(5000).optional(),
  follow_up_instructions: z.string().max(2000).optional(),
}).refine((data) => data.encounter_id || data.encounterId, {
  message: 'encounter_id or encounterId is required',
  path: ['encounter_id'],
}).refine((data) => {
  if (data.status === 'finalized') {
    return Boolean(data.assessment && data.assessment.trim()) && Boolean(data.plan && data.plan.trim());
  }
  return true;
}, {
  message: 'Assessment and Plan are required before finalizing a progress note',
  path: ['assessment'],
});

const updateNoteSchema = z.object({
  note_type: z.string().transform((v) => v.toLowerCase()).refine((v) => NOTE_TYPES.includes(v), {
    message: `note_type must be one of: ${NOTE_TYPES.join(', ')}`,
  }).optional(),
  status: z.string().transform((v) => v.toLowerCase()).refine((v) => NOTE_STATUSES.includes(v)).optional(),
  subjective: z.string().max(5000).optional(),
  objective: z.string().max(5000).optional(),
  assessment: z.string().max(5000).optional(),
  plan: z.string().max(5000).optional(),
  follow_up_instructions: z.string().max(2000).optional(),
  amendment_reason: z.string().max(1000).optional(),
});

module.exports = {
  createNoteSchema,
  updateNoteSchema,
  NOTE_TYPES,
  NOTE_STATUSES,
};
