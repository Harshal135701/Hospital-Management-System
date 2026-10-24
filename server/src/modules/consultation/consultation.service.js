
const repository = require("./consultation.repository");

async function createEncounter(data) {
  const { appointment_id, patient_id, doctor_id } = data;

  if (!appointment_id || !patient_id || !doctor_id) {
    throw Object.assign(
      new Error("Appointment ID, patient ID, and doctor ID are required"),
      { statusCode: 400 }
    );
  }

  // Verify that the appointment exists and belongs to the supplied patient and doctor.
  const pool = require("../../config/db");

  const appointmentResult = await pool.query(
    `SELECT id, patient_id, doctor_id, status
     FROM appointments
     WHERE id = $1`,
    [appointment_id]
  );

  const appointment = appointmentResult.rows[0];

  if (!appointment) {
    throw Object.assign(new Error("Appointment not found"), {
      statusCode: 404,
    });
  }

  if (
    appointment.patient_id !== patient_id ||
    appointment.doctor_id !== doctor_id
  ) {
    throw Object.assign(
      new Error("Patient or doctor does not match the appointment"),
      { statusCode: 400 }
    );
  }

  if (!["arrived", "waiting", "in_consultation"].includes(appointment.status)) {
    throw Object.assign(
      new Error("Patient must arrive before consultation can start"),
      { statusCode: 400 }
    );
  }

  return repository.createEncounter({
    appointment_id,
    patient_id,
    doctor_id,
  });
}

async function getEncounters(filters) {
  return repository.getEncounters(filters);
}

async function getEncounterById(id) {
  const encounter = await repository.getEncounterById(id);

  if (!encounter) {
    throw Object.assign(new Error("Consultation encounter not found"), {
      statusCode: 404,
    });
  }

  return encounter;
}

async function completeEncounter(id) {
  const encounter = await getEncounterById(id);

  if (encounter.status !== "in_progress") {
    throw Object.assign(
      new Error("Only an in-progress consultation can be completed"),
      { statusCode: 400 }
    );
  }

  return repository.completeEncounter(id);
}

module.exports = {
  createEncounter,
  getEncounters,
  getEncounterById,
  completeEncounter,
};
