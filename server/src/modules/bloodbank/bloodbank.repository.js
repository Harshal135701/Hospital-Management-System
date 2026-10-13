const pool = require('../../config/db');
const ApiError = require('../../utils/ApiError');

class BloodBankRepository {
  async withTransaction(callback) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const result = await callback(client);
      await client.query('COMMIT');
      return result;
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }

  // =========================================================================
  // 5.1 DONORS & SCREENINGS
  // =========================================================================

  async findAllDonors({ search, status, bloodGroup, limit = 50, offset = 0 } = {}) {
    let query = `
      SELECT 
        d.id, d.donor_code, d.full_name, d.date_of_birth, d.gender,
        d.blood_group, d.rh_factor, d.mobile, d.email, d.national_id,
        d.address, d.emergency_contact_name, d.emergency_contact_phone,
        d.donor_status, d.permanent_deferral_reason, d.permanent_deferral_date,
        d.total_donations, d.last_donation_date, d.created_at, d.updated_at,
        (
          SELECT json_build_object(
            'id', s.id,
            'screening_number', s.screening_number,
            'screening_date', s.screening_date,
            'weight_kg', s.weight_kg,
            'hemoglobin_g_dl', s.hemoglobin_g_dl,
            'blood_pressure', s.blood_pressure_systolic || '/' || s.blood_pressure_diastolic,
            'pulse_bpm', s.pulse_bpm,
            'temperature_c', s.temperature_c,
            'consent_obtained', s.consent_obtained,
            'questionnaire_answers', s.questionnaire_answers,
            'medical_history_notes', s.medical_history_notes,
            'eligibility_status', s.eligibility_status,
            'deferral_reason', s.deferral_reason,
            'deferred_until', s.deferred_until,
            'reviewed_by_name', s.reviewed_by_name
          )
          FROM blood_donor_screenings s
          WHERE s.donor_id = d.id
          ORDER BY s.screening_date DESC
          LIMIT 1
        ) AS last_screening
      FROM blood_donors d
      WHERE 1=1
    `;
    const params = [];

    if (search) {
      params.push(`%${search}%`);
      query += ` AND (d.full_name ILIKE $${params.length} OR d.donor_code ILIKE $${params.length} OR d.mobile ILIKE $${params.length})`;
    }
    if (status) {
      params.push(status);
      query += ` AND d.donor_status = $${params.length}`;
    }
    if (bloodGroup) {
      params.push(bloodGroup);
      query += ` AND d.blood_group = $${params.length}`;
    }

    params.push(limit, offset);
    query += ` ORDER BY d.created_at DESC LIMIT $${params.length - 1} OFFSET $${params.length}`;

    const res = await pool.query(query, params);
    return res.rows;
  }

  async findDonorById(id, client = pool) {
    const res = await client.query(
      `SELECT d.*,
        (
          SELECT json_build_object(
            'id', s.id,
            'screening_number', s.screening_number,
            'screening_date', s.screening_date,
            'weight_kg', s.weight_kg,
            'hemoglobin_g_dl', s.hemoglobin_g_dl,
            'blood_pressure', s.blood_pressure_systolic || '/' || s.blood_pressure_diastolic,
            'pulse_bpm', s.pulse_bpm,
            'temperature_c', s.temperature_c,
            'consent_obtained', s.consent_obtained,
            'questionnaire_answers', s.questionnaire_answers,
            'medical_history_notes', s.medical_history_notes,
            'eligibility_status', s.eligibility_status,
            'deferral_reason', s.deferral_reason,
            'deferred_until', s.deferred_until,
            'reviewed_by_name', s.reviewed_by_name
          )
          FROM blood_donor_screenings s
          WHERE s.donor_id = d.id
          ORDER BY s.screening_date DESC
          LIMIT 1
        ) AS last_screening
       FROM blood_donors d
       WHERE d.id = $1`,
      [id]
    );
    return res.rows[0] || null;
  }

  async findDonorByCode(code, client = pool) {
    const res = await client.query(
      `SELECT * FROM blood_donors WHERE donor_code = $1`,
      [code]
    );
    return res.rows[0] || null;
  }

  async createDonor(data, client = pool) {
    const res = await client.query(
      `INSERT INTO blood_donors (
        donor_code, full_name, date_of_birth, gender, blood_group, rh_factor,
        mobile, email, national_id, address, emergency_contact_name,
        emergency_contact_phone, donor_status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
      RETURNING *`,
      [
        data.donor_code,
        data.full_name,
        data.date_of_birth,
        data.gender,
        data.blood_group || null,
        data.rh_factor || null,
        data.mobile,
        data.email || null,
        data.national_id || null,
        data.address || null,
        data.emergency_contact_name || null,
        data.emergency_contact_phone || null,
        data.donor_status || 'active'
      ]
    );
    return res.rows[0];
  }

  async updateDonor(id, data, client = pool) {
    const fields = [];
    const params = [id];
    let idx = 2;

    for (const [key, val] of Object.entries(data)) {
      if (val !== undefined && key !== 'id') {
        fields.push(`${key} = $${idx}`);
        params.push(val);
        idx++;
      }
    }

    if (fields.length === 0) return this.findDonorById(id, client);

    fields.push(`updated_at = NOW()`);
    const query = `UPDATE blood_donors SET ${fields.join(', ')} WHERE id = $1 RETURNING *`;
    const res = await client.query(query, params);
    return res.rows[0];
  }

  async createScreening(data, client = pool) {
    const res = await client.query(
      `INSERT INTO blood_donor_screenings (
        donor_id, screening_number, screening_date, weight_kg, height_cm,
        hemoglobin_g_dl, blood_pressure_systolic, blood_pressure_diastolic,
        pulse_bpm, temperature_c, consent_obtained, questionnaire_answers,
        medical_history_notes, eligibility_status, deferral_reason, deferred_until,
        reviewed_by_name
      ) VALUES ($1, $2, NOW(), $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
      RETURNING *`,
      [
        data.donor_id,
        data.screening_number,
        data.weight_kg,
        data.height_cm || null,
        data.hemoglobin_g_dl,
        data.blood_pressure_systolic,
        data.blood_pressure_diastolic,
        data.pulse_bpm,
        data.temperature_c || null,
        data.consent_obtained,
        JSON.stringify(data.questionnaire_answers || {}),
        data.medical_history_notes || null,
        data.eligibility_status,
        data.deferral_reason || null,
        data.deferred_until || null,
        data.reviewed_by_name
      ]
    );
    return res.rows[0];
  }

  async findScreeningById(id, client = pool) {
    const res = await client.query(
      `SELECT * FROM blood_donor_screenings WHERE id = $1`,
      [id]
    );
    return res.rows[0] || null;
  }

  // =========================================================================
  // 5.2 BAG COLLECTION & PHLEBOTOMY
  // =========================================================================

  async findAllDonations({ limit = 50, offset = 0 } = {}) {
    const query = `
      SELECT 
        don.id, don.donation_number, don.donor_id, don.screening_id,
        don.primary_bag_barcode, don.collection_started_at, don.collection_ended_at,
        don.volume_ml, don.bag_type, don.collection_type, don.collection_status,
        don.phlebotomist_name, don.donation_notes, don.created_at,
        d.full_name AS donor_name, d.donor_code, d.blood_group, d.rh_factor,
        COALESCE(
          (
            SELECT json_agg(c.component_barcode)
            FROM blood_components c
            WHERE c.parent_donation_id = don.id
          ),
          '[]'::json
        ) AS components_separated,
        COALESCE(
          (
            SELECT json_agg(
              json_build_object(
                'sample_barcode', s.sample_barcode,
                'tube_type', s.tube_type,
                'status', s.status
              )
            )
            FROM blood_samples s
            WHERE s.donation_id = don.id
          ),
          '[]'::json
        ) AS pilot_samples
      FROM blood_donations don
      JOIN blood_donors d ON don.donor_id = d.id
      ORDER BY don.collection_started_at DESC
      LIMIT $1 OFFSET $2
    `;
    const res = await pool.query(query, [limit, offset]);
    return res.rows;
  }

  async findDonationById(id, client = pool) {
    const query = `
      SELECT 
        don.*,
        d.full_name AS donor_name, d.donor_code, d.blood_group, d.rh_factor,
        COALESCE(
          (
            SELECT json_agg(
              json_build_object(
                'sample_barcode', s.sample_barcode,
                'tube_type', s.tube_type,
                'status', s.status
              )
            )
            FROM blood_samples s
            WHERE s.donation_id = don.id
          ),
          '[]'::json
        ) AS pilot_samples
      FROM blood_donations don
      JOIN blood_donors d ON don.donor_id = d.id
      WHERE don.id = $1
    `;
    const res = await client.query(query, [id]);
    return res.rows[0] || null;
  }

  async createDonation(data, client = pool) {
    const res = await client.query(
      `INSERT INTO blood_donations (
        donation_number, donor_id, screening_id, primary_bag_barcode,
        collection_started_at, collection_ended_at, volume_ml, bag_type,
        collection_type, collection_status, phlebotomist_name, donation_notes
      ) VALUES ($1, $2, $3, $4, $5, NOW(), $6, $7, $8, 'completed', $9, $10)
      RETURNING *`,
      [
        data.donation_number,
        data.donor_id,
        data.screening_id,
        data.primary_bag_barcode,
        data.collection_started_at || new Date().toISOString(),
        data.volume_ml,
        data.bag_type,
        data.collection_type || 'voluntary',
        data.phlebotomist_name,
        data.donation_notes || null
      ]
    );
    const donation = res.rows[0];

    // Automatically generate linked traceable pilot sample tubes (Requirement 5.2 & 5.4)
    const tubes = [
      { type: 'edta', suffix: 'EDTA' },
      { type: 'plain_clot', suffix: 'CLOT' },
      { type: 'nat', suffix: 'NAT' }
    ];
    for (const tube of tubes) {
      const sampleBarcode = `${data.primary_bag_barcode}-${tube.suffix}`;
      await client.query(
        `INSERT INTO blood_samples (donation_id, sample_barcode, tube_type, status)
         VALUES ($1, $2, $3, 'collected')
         ON CONFLICT (sample_barcode) DO NOTHING`,
        [donation.id, sampleBarcode, tube.type]
      );
    }

    return donation;
  }

  // =========================================================================
  // 5.3 COMPONENTS & STORAGE INVENTORY
  // =========================================================================

  async findAllComponents({ status, type, bloodGroup, search, limit = 100, offset = 0 } = {}) {
    let query = `
      SELECT 
        c.id, c.parent_donation_id, c.component_barcode, c.component_type,
        c.abo_group, c.rh_factor, c.volume_ml, c.storage_location,
        c.storage_min_temp_c, c.storage_max_temp_c, c.requires_agitator,
        c.prepared_at, c.expires_at, c.status, c.notes, c.created_at, c.updated_at,
        don.donation_number, d.donor_code, d.full_name AS donor_name
      FROM blood_components c
      JOIN blood_donations don ON c.parent_donation_id = don.id
      JOIN blood_donors d ON don.donor_id = d.id
      WHERE 1=1
    `;
    const params = [];

    if (status) {
      params.push(status);
      query += ` AND c.status = $${params.length}`;
    }
    if (type) {
      params.push(type);
      query += ` AND c.component_type = $${params.length}`;
    }
    if (bloodGroup) {
      params.push(bloodGroup);
      query += ` AND c.abo_group = $${params.length}`;
    }
    if (search) {
      params.push(`%${search}%`);
      query += ` AND (c.component_barcode ILIKE $${params.length} OR don.donation_number ILIKE $${params.length})`;
    }

    params.push(limit, offset);
    query += ` ORDER BY c.prepared_at DESC LIMIT $${params.length - 1} OFFSET $${params.length}`;

    const res = await pool.query(query, params);
    return res.rows;
  }

  async findComponentById(id, client = pool) {
    const res = await client.query(
      `SELECT c.*, don.donation_number, d.full_name AS donor_name
       FROM blood_components c
       JOIN blood_donations don ON c.parent_donation_id = don.id
       JOIN blood_donors d ON don.donor_id = d.id
       WHERE c.id = $1`,
      [id]
    );
    return res.rows[0] || null;
  }

  async findComponentByBarcode(barcode, client = pool) {
    const res = await client.query(
      `SELECT c.*, don.donation_number, d.full_name AS donor_name
       FROM blood_components c
       JOIN blood_donations don ON c.parent_donation_id = don.id
       JOIN blood_donors d ON don.donor_id = d.id
       WHERE c.component_barcode = $1`,
      [barcode]
    );
    return res.rows[0] || null;
  }

  async createComponent(data, client = pool) {
    const res = await client.query(
      `INSERT INTO blood_components (
        parent_donation_id, component_barcode, component_type, abo_group,
        rh_factor, volume_ml, storage_location, storage_min_temp_c,
        storage_max_temp_c, requires_agitator, prepared_at, expires_at,
        status, notes
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW(), $11, $12, $13)
      RETURNING *`,
      [
        data.parent_donation_id,
        data.component_barcode,
        data.component_type,
        data.abo_group || null,
        data.rh_factor || null,
        data.volume_ml,
        data.storage_location || null,
        data.storage_min_temp_c,
        data.storage_max_temp_c,
        data.requires_agitator || false,
        data.expires_at,
        data.status || 'quarantined',
        data.notes || null
      ]
    );
    return res.rows[0];
  }

  async updateComponentStatus(id, newStatus, { actionType, performedByName, reason, referenceTable, referenceId } = {}, client = pool) {
    const res = await client.query(
      `UPDATE blood_components
       SET status = $2,
           audit_action_context = $3,
           audit_actor_name = $4,
           audit_reason = $5,
           audit_ref_table = $6,
           audit_ref_id = $7,
           updated_at = NOW()
       WHERE id = $1
       RETURNING *`,
      [id, newStatus, actionType || 'status_update', performedByName || 'System', reason || null, referenceTable || null, referenceId || null]
    );
    return res.rows[0];
  }

  // =========================================================================
  // 5.4 SEROLOGY & SAFE RELEASE WORKBENCH
  // =========================================================================

  async getSerologyWorkbench() {
    const query = `
      SELECT 
        don.id AS donation_id,
        don.donation_number,
        d.full_name AS donor_name,
        d.donor_code,
        (d.blood_group || CASE WHEN d.rh_factor = 'positive' THEN '+' ELSE '-' END) AS blood_group_claimed,
        
        -- Dual grouping verification
        (
          SELECT json_build_object(
            'id', bg.id,
            'technician1', bg.technician1_name,
            'technician2', bg.technician2_name,
            'concur', bg.technicians_concur,
            'verified', (bg.technician2_verified_at IS NOT NULL),
            'determined_group', bg.determined_abo_group || ' ' || initcap(bg.determined_rh_factor)
          )
          FROM blood_grouping_verifications bg
          WHERE bg.donation_id = don.id
          ORDER BY bg.created_at DESC
          LIMIT 1
        ) AS dual_grouping,

        -- TTI Tests array
        COALESCE(
          (
            SELECT json_agg(
              json_build_object(
                'id', st.id,
                'name', st.test_name,
                'result', st.result,
                'method', st.test_method,
                'tested_at', st.tested_at,
                'tested_by', st.tested_by_name
              )
              ORDER BY st.created_at ASC
            )
            FROM blood_serology_tests st
            WHERE st.donation_id = don.id
          ),
          '[]'::json
        ) AS tti_tests,

        -- Safe release authorization
        (
          SELECT json_build_object(
            'id', ra.id,
            'status', ra.release_decision,
            'authorized_by', ra.authorized_by_name,
            'authorized_at', ra.authorized_at,
            'dual_grouping_verified', ra.dual_grouping_verified,
            'all_tti_non_reactive', ra.all_tti_non_reactive,
            'notes', ra.notes
          )
          FROM blood_release_authorizations ra
          WHERE ra.donation_id = don.id
          ORDER BY ra.created_at DESC
          LIMIT 1
        ) AS release_authorization

      FROM blood_donations don
      JOIN blood_donors d ON don.donor_id = d.id
      ORDER BY don.collection_started_at DESC
    `;
    const res = await pool.query(query);
    return res.rows;
  }

  async createGroupingVerification(data, client = pool) {
    const res = await client.query(
      `INSERT INTO blood_grouping_verifications (
        donation_id, sample_id, forward_anti_a, forward_anti_b, forward_anti_ab,
        forward_anti_d, reverse_a_cells, reverse_b_cells, reverse_o_cells,
        determined_abo_group, determined_rh_factor, technician1_name,
        technician2_name, technician2_verified_at, technicians_concur,
        resolution_notes
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
      RETURNING *`,
      [
        data.donation_id,
        data.sample_id || null,
        data.forward_anti_a,
        data.forward_anti_b,
        data.forward_anti_ab || null,
        data.forward_anti_d,
        data.reverse_a_cells,
        data.reverse_b_cells,
        data.reverse_o_cells || null,
        data.determined_abo_group,
        data.determined_rh_factor,
        data.technician1_name,
        data.technician2_name || null,
        data.technicians_concur ? new Date().toISOString() : null,
        data.technicians_concur || false,
        data.resolution_notes || null
      ]
    );
    return res.rows[0];
  }

  async createSerologyTest(data, client = pool) {
    const res = await client.query(
      `INSERT INTO blood_serology_tests (
        donation_id, sample_id, test_name, test_method, result,
        cutoff_value, observed_value, unit, tested_by_name, notes
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *`,
      [
        data.donation_id,
        data.sample_id || null,
        data.test_name,
        data.test_method,
        data.result,
        data.cutoff_value || null,
        data.observed_value || null,
        data.unit || null,
        data.tested_by_name,
        data.notes || null
      ]
    );
    return res.rows[0];
  }

  async createReleaseAuthorization(data, client = pool) {
    const res = await client.query(
      `INSERT INTO blood_release_authorizations (
        donation_id, release_decision, all_tti_non_reactive, dual_grouping_verified,
        authorized_by_name, escalation_reason, notes
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *`,
      [
        data.donation_id,
        data.release_decision,
        data.all_tti_non_reactive,
        data.dual_grouping_verified,
        data.authorized_by_name,
        data.escalation_reason || null,
        data.notes || null
      ]
    );
    return res.rows[0];
  }

  // =========================================================================
  // 5.5 REQUISITIONS & CROSSMATCHING
  // =========================================================================

  async findAllRequisitions({ status, urgency, search, limit = 50, offset = 0 } = {}) {
    let query = `
      SELECT 
        r.id, r.requisition_number, r.patient_id, r.department_id, r.room_id,
        r.doctor_id, r.requester_name, r.urgency, r.requested_component,
        r.units_requested, r.units_reserved, r.units_issued,
        r.patient_blood_group, r.patient_rh_factor, r.clinical_indication,
        r.required_by, r.status, r.created_at, r.updated_at,
        p.full_name AS patient_name, p.uhid AS patient_uhid,
        
        -- Latest crossmatch if available
        (
          SELECT json_build_object(
            'crossmatch_id', xm.id,
            'component_barcode', c.component_barcode,
            'major_result', xm.major_crossmatch,
            'compatibility', xm.compatibility_result,
            'technique', xm.technique,
            'tested_at', xm.tested_at,
            'unit_blood_group', c.abo_group || ' ' || initcap(c.rh_factor)
          )
          FROM blood_crossmatches xm
          JOIN blood_components c ON xm.component_id = c.id
          WHERE xm.requisition_id = r.id
          ORDER BY xm.tested_at DESC
          LIMIT 1
        ) AS crossmatch

      FROM blood_requisitions r
      JOIN patients p ON r.patient_id = p.id
      WHERE 1=1
    `;
    const params = [];

    if (status) {
      params.push(status);
      query += ` AND r.status = $${params.length}`;
    }
    if (urgency) {
      params.push(urgency);
      query += ` AND r.urgency = $${params.length}`;
    }
    if (search) {
      params.push(`%${search}%`);
      query += ` AND (r.requisition_number ILIKE $${params.length} OR p.full_name ILIKE $${params.length} OR p.uhid ILIKE $${params.length})`;
    }

    params.push(limit, offset);
    query += ` ORDER BY r.created_at DESC LIMIT $${params.length - 1} OFFSET $${params.length}`;

    const res = await pool.query(query, params);
    return res.rows;
  }

  async findRequisitionById(id, client = pool) {
    const res = await client.query(
      `SELECT r.*, p.full_name AS patient_name, p.uhid AS patient_uhid
       FROM blood_requisitions r
       JOIN patients p ON r.patient_id = p.id
       WHERE r.id = $1`,
      [id]
    );
    return res.rows[0] || null;
  }

  async createRequisition(data, client = pool) {
    const res = await client.query(
      `INSERT INTO blood_requisitions (
        requisition_number, patient_id, requester_name, urgency,
        requested_component, units_requested, units_reserved, units_issued,
        patient_blood_group, patient_rh_factor, clinical_indication,
        required_by, status
      ) VALUES ($1, $2, $3, $4, $5, $6, 0, 0, $7, $8, $9, $10, 'pending')
      RETURNING *`,
      [
        data.requisition_number,
        data.patient_id,
        data.requester_name,
        data.urgency || 'routine',
        data.requested_component,
        data.units_requested,
        data.patient_blood_group || null,
        data.patient_rh_factor || null,
        data.clinical_indication,
        data.required_by || null
      ]
    );
    return res.rows[0];
  }

  async createCrossmatch(data, client = pool) {
    const res = await client.query(
      `INSERT INTO blood_crossmatches (
        requisition_id, patient_id, component_id, patient_sample_barcode,
        technique, major_crossmatch, minor_crossmatch, compatibility_result,
        performed_by_name, notes
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *`,
      [
        data.requisition_id,
        data.patient_id,
        data.component_id,
        data.patient_sample_barcode || null,
        data.technique,
        data.major_crossmatch,
        data.minor_crossmatch || null,
        data.compatibility_result,
        data.performed_by_name,
        data.notes || null
      ]
    );
    return res.rows[0];
  }

  async findCrossmatchById(id, client = pool) {
    const res = await client.query(
      `SELECT * FROM blood_crossmatches WHERE id = $1`,
      [id]
    );
    return res.rows[0] || null;
  }

  // =========================================================================
  // RESERVATIONS (With strict deterministic lock ordering)
  // =========================================================================

  async createReservation(data, client) {
    // 1. Lock requisition (Order 1)
    const reqRes = await client.query(
      `SELECT * FROM blood_requisitions WHERE id = $1 FOR UPDATE`,
      [data.requisition_id]
    );
    const requisition = reqRes.rows[0];
    if (!requisition) throw ApiError.notFound('Requisition not found');

    // 2. Lock component (Order 2)
    const compRes = await client.query(
      `SELECT * FROM blood_components WHERE id = $1 FOR UPDATE`,
      [data.component_id]
    );
    const component = compRes.rows[0];
    if (!component) throw ApiError.notFound('Component not found');
    if (component.status !== 'safe_for_release') {
      throw ApiError.conflict(`Component is not safe for release (current status: ${component.status})`);
    }

    // 3. Insert reservation (trg_blood_reservation_safety will transition component to reserved,
    // increment requisition units_reserved, and record immutable audit context)
    const expiresAt = new Date(Date.now() + (data.hours_valid || 48) * 3600 * 1000).toISOString();
    const resRes = await client.query(
      `INSERT INTO blood_component_reservations (
        requisition_id, component_id, crossmatch_id, reserved_for_patient_id,
        reserved_at, expires_at, status, reserved_by_name
      ) VALUES ($1, $2, $3, $4, NOW(), $5, 'active', $6)
      RETURNING *`,
      [
        data.requisition_id,
        data.component_id,
        data.crossmatch_id || null,
        requisition.patient_id,
        expiresAt,
        data.reserved_by_name
      ]
    );

    return resRes.rows[0];
  }

  async cancelReservation({ reservation_id, cancellation_reason, cancelled_by_name }, client) {
    // Lock in order: requisition -> component -> reservation
    const resRes = await client.query(
      `SELECT * FROM blood_component_reservations WHERE id = $1 FOR UPDATE`,
      [reservation_id]
    );
    const reservation = resRes.rows[0];
    if (!reservation) throw new Error('Reservation not found');
    if (reservation.status !== 'active') throw new Error(`Reservation is not active (current status: ${reservation.status})`);

    // Lock requisition
    await client.query(
      `SELECT * FROM blood_requisitions WHERE id = $1 FOR UPDATE`,
      [reservation.requisition_id]
    );

    // Lock component
    await client.query(
      `SELECT * FROM blood_components WHERE id = $1 FOR UPDATE`,
      [reservation.component_id]
    );

    // Cancel reservation (trg_handle_reservation_lifecycle automatically decrements requisition
    // units_reserved and transitions component back to safe_for_release with audit logging)
    const updatedRes = await client.query(
      `UPDATE blood_component_reservations
       SET status = 'cancelled',
           cancelled_at = NOW(),
           cancelled_by_name = $2,
           cancellation_reason = $3
       WHERE id = $1
       RETURNING *`,
      [reservation_id, cancelled_by_name, cancellation_reason]
    );

    return updatedRes.rows[0];
  }

  // =========================================================================
  // 5.6 BLOOD ISSUE & HANDOVER
  // =========================================================================

  async findAllIssues({ requisitionId, patientId, limit = 50, offset = 0 } = {}) {
    let query = `
      SELECT 
        iss.id, iss.issue_slip_number, iss.requisition_id, iss.component_id,
        iss.reservation_id, iss.patient_id, iss.crossmatch_id,
        iss.issued_by_name, iss.verified_by_name, iss.received_by_name,
        iss.received_by_designation, iss.dispatch_time, iss.transport_box_id,
        iss.transport_temperature_c, iss.cold_chain_maintained, iss.notes,
        iss.is_emergency_unmatched, iss.emergency_clinical_justification,
        iss.emergency_authorizer_name AS emergency_authorized_by_name, iss.created_at,
        p.full_name AS patient_name, p.uhid AS patient_uhid,
        r.requisition_number, r.urgency,
        c.component_barcode, c.component_type, c.abo_group, c.rh_factor,
        xm.compatibility_result AS crossmatch_status
      FROM blood_issues iss
      JOIN patients p ON iss.patient_id = p.id
      JOIN blood_requisitions r ON iss.requisition_id = r.id
      JOIN blood_components c ON iss.component_id = c.id
      LEFT JOIN blood_crossmatches xm ON iss.crossmatch_id = xm.id
      WHERE 1=1
    `;
    const params = [];

    if (requisitionId) {
      params.push(requisitionId);
      query += ` AND iss.requisition_id = $${params.length}`;
    }
    if (patientId) {
      params.push(patientId);
      query += ` AND iss.patient_id = $${params.length}`;
    }

    params.push(limit, offset);
    query += ` ORDER BY iss.dispatch_time DESC LIMIT $${params.length - 1} OFFSET $${params.length}`;

    const res = await pool.query(query, params);
    return res.rows;
  }

  async findIssueById(id, client = pool) {
    const res = await client.query(
      `SELECT iss.*,
        iss.emergency_authorizer_name AS emergency_authorized_by_name,
        p.full_name AS patient_name, p.uhid AS patient_uhid,
        r.requisition_number,
        c.component_barcode, c.component_type, c.abo_group, c.rh_factor
       FROM blood_issues iss
       JOIN patients p ON iss.patient_id = p.id
       JOIN blood_requisitions r ON iss.requisition_id = r.id
       JOIN blood_components c ON iss.component_id = c.id
       WHERE iss.id = $1`,
      [id]
    );
    return res.rows[0] || null;
  }

  async createIssue(data, client) {
    // 1. Lock requisition (Lock Order 1)
    const reqRes = await client.query(
      `SELECT * FROM blood_requisitions WHERE id = $1 FOR UPDATE`,
      [data.requisition_id]
    );
    const requisition = reqRes.rows[0];
    if (!requisition) throw new Error('Requisition not found');

    // 2. Lock component (Lock Order 2)
    const compRes = await client.query(
      `SELECT * FROM blood_components WHERE id = $1 FOR UPDATE`,
      [data.component_id]
    );
    const component = compRes.rows[0];
    if (!component) throw new Error('Component not found');

    // 3. Insert into blood_issues
    // Database triggers trg_validate_blood_issue and trg_after_blood_issue enforce:
    // - Compatible crossmatch matching patient and component (or stat_emergency uncrossed release)
    // - Safe-release preconditions verified
    // - Automatically transitions component status to 'issued' and writes immutable audit log
    // - Automatically increments requisition units_issued
    // - Automatically transitions active reservation to 'issued'
    const res = await client.query(
      `INSERT INTO blood_issues (
        issue_slip_number, requisition_id, component_id, reservation_id,
        patient_id, crossmatch_id, issued_by_name, verified_by_name,
        received_by_name, received_by_designation, dispatch_time,
        transport_box_id, transport_temperature_c, cold_chain_maintained,
        is_emergency_unmatched, emergency_clinical_justification,
        emergency_authorizer_name, notes
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW(), $11, $12, $13, $14, $15, $16, $17)
      RETURNING *`,
      [
        data.issue_slip_number,
        data.requisition_id,
        data.component_id,
        data.reservation_id || null,
        requisition.patient_id,
        data.crossmatch_id || null,
        data.issued_by_name,
        data.verified_by_name,
        data.received_by_name,
        data.received_by_designation,
        data.transport_box_id || null,
        data.transport_temperature_c || null,
        data.cold_chain_maintained !== false,
        data.is_emergency_unmatched || false,
        data.emergency_clinical_justification || null,
        data.emergency_authorizer_name || data.emergency_authorized_by_name || null,
        data.notes || null
      ]
    );

    return res.rows[0];
  }

  // =========================================================================
  // IMMUTABLE AUDIT LOGS
  // =========================================================================

  async findAuditLogs({ componentId, actionType, limit = 50, offset = 0 } = {}) {
    let query = `
      SELECT 
        l.id, l.component_id, l.previous_status, l.new_status,
        l.action_type, l.reference_table, l.reference_id,
        l.performed_by_name, l.reason, l.metadata, l.created_at,
        c.component_barcode, c.component_type, c.abo_group, c.rh_factor
      FROM blood_inventory_audit_logs l
      JOIN blood_components c ON l.component_id = c.id
      WHERE 1=1
    `;
    const params = [];

    if (componentId) {
      params.push(componentId);
      query += ` AND l.component_id = $${params.length}`;
    }
    if (actionType) {
      params.push(actionType);
      query += ` AND l.action_type = $${params.length}`;
    }

    params.push(limit, offset);
    query += ` ORDER BY l.created_at DESC LIMIT $${params.length - 1} OFFSET $${params.length}`;

    const res = await pool.query(query, params);
    return res.rows;
  }
}

module.exports = new BloodBankRepository();
