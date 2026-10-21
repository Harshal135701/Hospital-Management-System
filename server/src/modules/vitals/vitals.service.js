const repository = require('./vitals.repository');
const ApiError = require('../../utils/ApiError');

function convertTemperatureToCelsius(rawTemp, tempUnit) {
  if (rawTemp === undefined || rawTemp === null || rawTemp === '') {
    return null;
  }
  const num = Number(rawTemp);
  if (!Number.isFinite(num) || num <= 0) {
    throw ApiError.badRequest('Temperature must be a valid positive number');
  }

  if (tempUnit === 'F') {
    const celsius = ((num - 32) * 5) / 9;
    return Math.round(celsius * 10) / 10;
  }

  return Math.round(num * 10) / 10;
}

function calculateBMI(heightCm, weightKg) {
  if (!heightCm || !weightKg) return null;
  const h = Number(heightCm);
  const w = Number(weightKg);
  if (h <= 0 || w <= 0) return null;

  const heightM = h / 100;
  const bmi = w / (heightM * heightM);
  return Math.round(bmi * 10) / 10;
}

function assembleExaminationFindings(data) {
  const parts = [];
  if (data.examination_findings && data.examination_findings.trim()) {
    parts.push(data.examination_findings.trim());
  }

  const systemic = [];
  if (data.cvs && data.cvs.trim()) systemic.push(`CVS: ${data.cvs.trim()}`);
  if (data.rs && data.rs.trim()) systemic.push(`RS: ${data.rs.trim()}`);
  if (data.abdomen && data.abdomen.trim()) systemic.push(`Abdomen: ${data.abdomen.trim()}`);
  if (data.cns && data.cns.trim()) systemic.push(`CNS: ${data.cns.trim()}`);

  if (systemic.length > 0) {
    parts.push(`[Systemic Examination] ${systemic.join('; ')}`);
  }

  return parts.length > 0 ? parts.join('\n') : null;
}

async function createVitals(data, currentUser = {}) {
  const encounterId = data.encounter_id || data.encounterId;
  if (!encounterId) {
    throw ApiError.badRequest('Encounter ID is required');
  }

  // 1. Role validation: Doctors, Nurses, and Super Admin can record vitals
  if (!['clinician_doctor', 'staff_nurse', 'super_admin'].includes(currentUser.role)) {
    throw ApiError.forbidden('Only clinical staff (doctors and nurses) may record patient vitals');
  }

  // 2. Fetch and validate encounter
  const encResult = await repository.pool.query(
    `SELECT id, patient_id, doctor_id, status FROM consultation_encounters WHERE id = $1`,
    [encounterId]
  );
  const encounter = encResult.rows[0];

  if (!encounter) {
    throw ApiError.notFound('Consultation encounter not found');
  }

  // 3. Status validation: Vitals can only be recorded during active consultation
  if (encounter.status !== 'in_progress') {
    throw ApiError.badRequest(`Cannot record vitals for encounter in '${encounter.status}' status. Consultation must be active.`);
  }

  // 4. Record-level doctor check (if clinician_doctor)
  let recordedBy = null;
  if (currentUser.role === 'clinician_doctor') {
    if (String(encounter.doctor_id) !== String(currentUser.doctor_id)) {
      throw ApiError.forbidden('You are not authorized to record vitals for another doctor\'s encounter');
    }
    recordedBy = currentUser.doctor_id;
  } else if (currentUser.role === 'staff_nurse') {
    recordedBy = null;
  } else if (currentUser.role === 'super_admin') {
    recordedBy = currentUser.doctor_id || null;
  }

  // 5. Field adaptation & unit conversions
  const systolicBp = data.systolic_bp !== undefined ? data.systolic_bp : data.systolic;
  const diastolicBp = data.diastolic_bp !== undefined ? data.diastolic_bp : data.diastolic;
  const pulseRate = data.pulse_rate !== undefined ? data.pulse_rate : data.heartRate;
  const respiratoryRate = data.respiratory_rate !== undefined ? data.respiratory_rate : data.respiratoryRate;
  const oxygenSaturation = data.oxygen_saturation !== undefined ? data.oxygen_saturation : data.spo2;
  const heightCm = data.height_cm !== undefined ? data.height_cm : data.height;
  const weightKg = data.weight_kg !== undefined ? data.weight_kg : data.weight;

  // Temperature conversion
  const rawTemp = data.temperature_c !== undefined ? data.temperature_c : data.temperature;
  const tempUnit = data.tempUnit || 'C';
  const temperatureC = convertTemperatureToCelsius(rawTemp, tempUnit);

  // Range and relational checks
  if (systolicBp != null && diastolicBp != null && Number(systolicBp) <= Number(diastolicBp)) {
    throw ApiError.badRequest('Systolic blood pressure must be greater than diastolic blood pressure');
  }

  if (oxygenSaturation != null && (Number(oxygenSaturation) < 0 || Number(oxygenSaturation) > 100)) {
    throw ApiError.badRequest('Oxygen saturation must be between 0 and 100 percent');
  }

  // Auto-calculated BMI
  const computedBmi = calculateBMI(heightCm, weightKg);
  const examinationFindings = assembleExaminationFindings(data);

  const vitalsRecord = await repository.createVitals({
    encounterId,
    systolicBp: systolicBp != null && systolicBp !== '' ? Number(systolicBp) : null,
    diastolicBp: diastolicBp != null && diastolicBp !== '' ? Number(diastolicBp) : null,
    pulseRate: pulseRate != null && pulseRate !== '' ? Number(pulseRate) : null,
    temperatureC,
    tempUnit,
    respiratoryRate: respiratoryRate != null && respiratoryRate !== '' ? Number(respiratoryRate) : null,
    oxygenSaturation: oxygenSaturation != null && oxygenSaturation !== '' ? Number(oxygenSaturation) : null,
    heightCm: heightCm != null && heightCm !== '' ? Number(heightCm) : null,
    weightKg: weightKg != null && weightKg !== '' ? Number(weightKg) : null,
    bmi: computedBmi,
    cvs: data.cvs || null,
    rs: data.rs || null,
    abdomen: data.abdomen || null,
    cns: data.cns || null,
    examinationFindings,
    recordedBy,
  });

  // Sync examination notes to consultation_encounters if currently unset or updated
  if (examinationFindings) {
    await repository.pool.query(
      `UPDATE consultation_encounters
       SET examination = COALESCE(examination, $2), updated_at = NOW()
       WHERE id = $1`,
      [encounterId, examinationFindings]
    );
  }

  return vitalsRecord;
}

async function getVitalsByEncounterId(encounterId, currentUser = {}) {
  if (!['clinician_doctor', 'staff_nurse', 'super_admin'].includes(currentUser.role)) {
    throw ApiError.forbidden('Insufficient permissions to view patient vitals');
  }

  const encResult = await repository.pool.query(
    `SELECT id, patient_id, doctor_id, status FROM consultation_encounters WHERE id = $1`,
    [encounterId]
  );
  const encounter = encResult.rows[0];

  if (!encounter) {
    throw ApiError.notFound('Consultation encounter not found');
  }

  return repository.getVitalsByEncounterId(encounterId);
}

async function getVitalsByPatientId(patientId, currentUser = {}) {
  if (!['clinician_doctor', 'staff_nurse', 'super_admin'].includes(currentUser.role)) {
    throw ApiError.forbidden('Insufficient permissions to view patient vitals history');
  }

  return repository.getVitalsByPatientId(patientId);
}

module.exports = {
  createVitals,
  getVitalsByEncounterId,
  getVitalsByPatientId,
  calculateBMI,
  convertTemperatureToCelsius,
};
