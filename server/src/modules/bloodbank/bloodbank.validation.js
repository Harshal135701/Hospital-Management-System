const { z } = require('zod');

const createDonorSchema = z.object({
  full_name: z.string().min(2, 'Full name must be at least 2 characters'),
  date_of_birth: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date of birth must be YYYY-MM-DD'),
  gender: z.enum(['male', 'female', 'other']),
  blood_group: z.enum(['A', 'B', 'AB', 'O']).optional().nullable(),
  rh_factor: z.enum(['positive', 'negative']).optional().nullable(),
  mobile: z.string().min(8, 'Mobile number must be at least 8 digits'),
  email: z.string().email().optional().nullable().or(z.literal('')),
  national_id: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
  emergency_contact_name: z.string().optional().nullable(),
  emergency_contact_phone: z.string().optional().nullable()
});

const createScreeningSchema = z.object({
  donor_id: z.string().uuid('donor_id must be a valid UUID'),
  weight_kg: z.coerce.number().positive('Weight must be positive'),
  height_cm: z.coerce.number().positive().optional().nullable(),
  hemoglobin_g_dl: z.coerce.number().positive('Hemoglobin must be positive'),
  blood_pressure_systolic: z.coerce.number().int().min(60).max(250),
  blood_pressure_diastolic: z.coerce.number().int().min(40).max(160),
  pulse_bpm: z.coerce.number().int().min(40).max(200),
  temperature_c: z.coerce.number().min(35).max(42).optional().nullable(),
  consent_obtained: z.boolean(),
  questionnaire_answers: z.record(z.any()).optional().default({}),
  medical_history_notes: z.string().optional().nullable(),
  eligibility_status: z.enum(['approved', 'temporarily_deferred', 'permanently_deferred', 'rejected']),
  deferral_reason: z.string().optional().nullable(),
  deferred_until: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional().nullable().or(z.literal('')),
  reviewed_by_name: z.string().min(2, 'Reviewed by name is required')
});

const createDonationSchema = z.object({
  donor_id: z.string().uuid('donor_id must be a valid UUID'),
  screening_id: z.string().uuid('screening_id must be a valid UUID'),
  primary_bag_barcode: z.string().min(3, 'Barcode must be provided'),
  volume_ml: z.coerce.number().int().positive('Volume must be positive'),
  bag_type: z.enum(['single', 'double', 'triple', 'quadruple']),
  collection_type: z.enum(['voluntary', 'replacement', 'autologous', 'directed']).optional().default('voluntary'),
  phlebotomist_name: z.string().min(2, 'Phlebotomist name is required'),
  collection_started_at: z.string().optional(),
  donation_notes: z.string().optional().nullable()
});

const createComponentsSchema = z.object({
  parent_donation_id: z.string().uuid('parent_donation_id must be a valid UUID'),
  components: z.array(z.object({
    component_barcode: z.string().min(3),
    component_type: z.enum(['prbc', 'ffp', 'platelets', 'cryoprecipitate', 'whole_blood', 'cryo_poor_plasma']),
    abo_group: z.enum(['A', 'B', 'AB', 'O']).optional().nullable(),
    rh_factor: z.enum(['positive', 'negative']).optional().nullable(),
    volume_ml: z.coerce.number().int().positive(),
    storage_location: z.string().optional().nullable(),
    storage_min_temp_c: z.coerce.number(),
    storage_max_temp_c: z.coerce.number(),
    requires_agitator: z.boolean().optional().default(false),
    expires_at: z.string(),
    notes: z.string().optional().nullable()
  })).min(1, 'At least one component must be specified')
});

const createGroupingSchema = z.object({
  donation_id: z.string().uuid('donation_id must be a valid UUID'),
  sample_id: z.string().uuid().optional().nullable(),
  forward_anti_a: z.string().min(1),
  forward_anti_b: z.string().min(1),
  forward_anti_ab: z.string().optional().nullable(),
  forward_anti_d: z.string().min(1),
  reverse_a_cells: z.string().min(1),
  reverse_b_cells: z.string().min(1),
  reverse_o_cells: z.string().optional().nullable(),
  determined_abo_group: z.enum(['A', 'B', 'AB', 'O']),
  determined_rh_factor: z.enum(['positive', 'negative']),
  technician1_name: z.string().min(2),
  technician2_name: z.string().min(2).optional().nullable(),
  technicians_concur: z.boolean().optional().default(false),
  resolution_notes: z.string().optional().nullable()
});

const createSerologyTestSchema = z.object({
  donation_id: z.string().uuid('donation_id must be a valid UUID'),
  sample_id: z.string().uuid().optional().nullable(),
  test_name: z.enum(['hiv_1_2', 'hepatitis_b', 'hepatitis_c', 'syphilis', 'malaria', 'other']),
  test_method: z.enum(['elisa', 'nat', 'rapid_card', 'chemiluminescence', 'microscopy', 'other']),
  result: z.enum(['non_reactive', 'reactive', 'indeterminate', 'invalid']),
  cutoff_value: z.coerce.number().optional().nullable(),
  observed_value: z.coerce.number().optional().nullable(),
  unit: z.string().optional().nullable(),
  tested_by_name: z.string().min(2),
  notes: z.string().optional().nullable()
});

const createReleaseAuthSchema = z.object({
  donation_id: z.string().uuid('donation_id must be a valid UUID'),
  release_decision: z.enum(['approved_for_release', 'rejected', 'quarantined_for_retest', 'escalated_supervisor']),
  all_tti_non_reactive: z.boolean().optional().default(false),
  dual_grouping_verified: z.boolean().optional().default(false),
  authorized_by_name: z.string().min(2),
  notes: z.string().optional().nullable(),
  escalation_reason: z.string().optional().nullable()
});

const createRequisitionSchema = z.object({
  patient_id: z.string().uuid().optional().nullable(),
  patient_uhid: z.string().optional().nullable(),
  requested_component: z.enum(['prbc', 'ffp', 'platelets', 'cryoprecipitate', 'whole_blood', 'cryo_poor_plasma']),
  units_requested: z.coerce.number().int().positive('units_requested must be at least 1'),
  urgency: z.enum(['routine', 'urgent', 'stat_emergency']).default('routine'),
  clinical_indication: z.string().min(3, 'clinical_indication is required'),
  patient_blood_group: z.enum(['A', 'B', 'AB', 'O']).optional().nullable(),
  patient_rh_factor: z.enum(['positive', 'negative']).optional().nullable(),
  requester_name: z.string().min(2, 'requester_name is required'),
  required_by: z.string().optional().nullable()
});

const createCrossmatchSchema = z.object({
  requisition_id: z.string().uuid('requisition_id must be a valid UUID'),
  patient_id: z.string().uuid().optional().nullable(),
  component_id: z.string().uuid('component_id must be a valid UUID'),
  patient_sample_barcode: z.string().optional().nullable(),
  technique: z.enum(['gel_card', 'tube', 'immediate_spin', 'anti_human_globulin_ahg', 'computerized']),
  major_crossmatch: z.enum(['compatible', 'incompatible']),
  minor_crossmatch: z.enum(['compatible', 'incompatible']).optional().nullable(),
  compatibility_result: z.enum(['compatible', 'incompatible', 'indeterminate']),
  performed_by_name: z.string().min(2),
  notes: z.string().optional().nullable()
});

const createReservationSchema = z.object({
  requisition_id: z.string().uuid('requisition_id must be a valid UUID'),
  component_id: z.string().uuid('component_id must be a valid UUID'),
  crossmatch_id: z.string().uuid().optional().nullable(),
  reserved_by_name: z.string().min(2),
  hours_valid: z.coerce.number().positive().optional().default(48)
});

const cancelReservationSchema = z.object({
  reservation_id: z.string().uuid('reservation_id must be a valid UUID'),
  cancellation_reason: z.string().min(2),
  cancelled_by_name: z.string().min(2)
});

const createIssueSchema = z.object({
  requisition_id: z.string().uuid('requisition_id must be a valid UUID'),
  component_id: z.string().uuid('component_id must be a valid UUID'),
  reservation_id: z.string().uuid().optional().nullable(),
  crossmatch_id: z.string().uuid().optional().nullable(),
  issued_by_name: z.string().min(2),
  verified_by_name: z.string().min(2),
  received_by_name: z.string().min(2),
  received_by_designation: z.string().min(2),
  transport_box_id: z.string().optional().nullable(),
  transport_temperature_c: z.coerce.number().optional().nullable(),
  cold_chain_maintained: z.boolean().optional().default(true),
  is_emergency_unmatched: z.boolean().optional().default(false),
  emergency_clinical_justification: z.string().optional().nullable(),
  emergency_authorized_by_name: z.string().optional().nullable(),
  notes: z.string().optional().nullable()
});

module.exports = {
  createDonorSchema,
  createScreeningSchema,
  createDonationSchema,
  createComponentsSchema,
  createGroupingSchema,
  createSerologyTestSchema,
  createReleaseAuthSchema,
  createRequisitionSchema,
  createCrossmatchSchema,
  createReservationSchema,
  cancelReservationSchema,
  createIssueSchema
};
