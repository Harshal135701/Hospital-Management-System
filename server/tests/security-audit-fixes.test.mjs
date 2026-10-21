import { test, describe, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);

// Ensure test environment variables are set to prevent env.js validation error
process.env.DB_HOST = 'mock-host';
process.env.DB_PORT = '5432';
process.env.DB_NAME = 'mock-db';
process.env.DB_USER = 'mock-user';
process.env.DB_PASSWORD = 'mock-password';
process.env.JWT_SECRET = 'medicsprime-test-suite-secure-secret-key-at-least-32-chars';

const aptRepo = require('../src/modules/appointments/appointment.repository');
const aptService = require('../src/modules/appointments/appointment.service');
const queueRepo = require('../src/modules/queue/queue.repository');
const queueService = require('../src/modules/queue/queue.service');
const rosterRepo = require('../src/modules/rosters/roster.repository');
const rosterService = require('../src/modules/rosters/roster.service');
const emrRepo = require('../src/modules/emr/emr.repository');
const emrService = require('../src/modules/emr/emr.service');
const settlementRepo = require('../src/modules/billing/settlement.repository');
const settlementService = require('../src/modules/billing/settlement.service');

const DOCTOR_ALICE_ID = '11111111-1111-1111-1111-111111111111';
const DOCTOR_BOB_ID = '22222222-2222-2222-2222-222222222222';
const APPOINTMENT_ID = '33333333-3333-3333-3333-333333333333';
const PATIENT_ID = '44444444-4444-4444-4444-444444444444';
const LEAVE_ID = '55555555-5555-5555-5555-555555555555';

describe('Security Audit Fixes — Unit Test Suite', () => {

  describe('1. Queue Doctor Ownership & Status Transitions', () => {
    beforeEach(() => {
      // Mock appointment assigned to DOCTOR_ALICE
      aptRepo.findAppointmentById = async (id) => ({
        id,
        patient_id: PATIENT_ID,
        doctor_id: DOCTOR_ALICE_ID,
        doctor_name: 'Dr. Alice Smith',
        patient_name: 'John Doe',
        status: 'waiting',
        token_number: 101,
        arrived_at: new Date('2026-10-21T09:00:00Z'),
        consultation_started_at: new Date('2026-10-21T09:15:00Z'),
      });

      aptRepo.findDoctorById = async (id) => ({
        id,
        full_name: id === DOCTOR_ALICE_ID ? 'Dr. Alice Smith' : 'Dr. Bob Jones',
        room_id: 'room-101',
      });
    });

    test('startConsultation rejects with 403 when clinician doctor targets another doctor appointment', async () => {
      const userBob = {
        id: 'user-bob',
        role: 'clinician_doctor',
        doctor_id: DOCTOR_BOB_ID,
      };

      await assert.rejects(
        async () => {
          await queueService.startConsultation(APPOINTMENT_ID, userBob);
        },
        (err) => {
          assert.equal(err.statusCode, 403);
          assert.match(err.message, /Clinician doctors may only update status for their own assigned appointments/i);
          return true;
        }
      );
    });

    test('startConsultation delegates to appointmentService and succeeds for assigned doctor', async () => {
      const userAlice = {
        id: 'user-alice',
        role: 'clinician_doctor',
        doctor_id: DOCTOR_ALICE_ID,
      };

      let currentStatus = 'waiting';
      aptRepo.findAppointmentById = async (id) => ({
        id,
        patient_id: PATIENT_ID,
        doctor_id: DOCTOR_ALICE_ID,
        doctor_name: 'Dr. Alice Smith',
        patient_name: 'John Doe',
        status: currentStatus,
        token_number: 101,
        arrived_at: new Date('2026-10-21T09:00:00Z'),
        consultation_started_at: new Date('2026-10-21T09:15:00Z'),
      });

      aptRepo.updateStatusAtomic = async (id, newStatus) => {
        currentStatus = newStatus;
        return {
          id,
          doctor_id: DOCTOR_ALICE_ID,
          status: newStatus,
          token_number: 101,
        };
      };

      const res = await queueService.startConsultation(APPOINTMENT_ID, userAlice);
      assert.equal(res.status, 'in_consultation');
    });

    test('completeConsultation rejects with 403 when clinician doctor targets another doctor appointment', async () => {
      aptRepo.findAppointmentById = async (id) => ({
        id,
        patient_id: PATIENT_ID,
        doctor_id: DOCTOR_ALICE_ID,
        status: 'in_consultation',
        token_number: 101,
        consultation_started_at: new Date('2026-10-21T09:15:00Z'),
      });

      const userBob = {
        id: 'user-bob',
        role: 'clinician_doctor',
        doctor_id: DOCTOR_BOB_ID,
      };

      await assert.rejects(
        async () => {
          await queueService.completeConsultation(APPOINTMENT_ID, 'done', userBob);
        },
        (err) => {
          assert.equal(err.statusCode, 403);
          assert.match(err.message, /Clinician doctors may only update status for their own assigned appointments/i);
          return true;
        }
      );
    });

    test('markNoShow rejects with 403 when clinician doctor targets another doctor appointment', async () => {
      const userBob = {
        id: 'user-bob',
        role: 'clinician_doctor',
        doctor_id: DOCTOR_BOB_ID,
      };

      await assert.rejects(
        async () => {
          await queueService.markNoShow(APPOINTMENT_ID, userBob);
        },
        (err) => {
          assert.equal(err.statusCode, 403);
          assert.match(err.message, /Clinician doctors may only update status for their own assigned appointments/i);
          return true;
        }
      );
    });

    test('recallToken rejects with 403 when clinician doctor targets another doctor appointment', async () => {
      const userBob = {
        id: 'user-bob',
        role: 'clinician_doctor',
        doctor_id: DOCTOR_BOB_ID,
      };

      await assert.rejects(
        async () => {
          await queueService.recallToken(APPOINTMENT_ID, userBob);
        },
        (err) => {
          assert.equal(err.statusCode, 403);
          assert.match(err.message, /Clinician doctors may only recall tokens for their own assigned appointments/i);
          return true;
        }
      );
    });

    test('recallToken rejects with 400 when appointment is completed', async () => {
      aptRepo.findAppointmentById = async (id) => ({
        id,
        patient_id: PATIENT_ID,
        doctor_id: DOCTOR_ALICE_ID,
        status: 'completed',
        token_number: 101,
      });

      const userAlice = {
        id: 'user-alice',
        role: 'clinician_doctor',
        doctor_id: DOCTOR_ALICE_ID,
      };

      await assert.rejects(
        async () => {
          await queueService.recallToken(APPOINTMENT_ID, userAlice);
        },
        (err) => {
          assert.equal(err.statusCode, 400);
          assert.match(err.message, /Expected active queue status/i);
          return true;
        }
      );
    });

    test('callNext rejects with 403 when clinician doctor attempts to spoof another doctorId', async () => {
      const userAlice = {
        id: 'user-alice',
        role: 'clinician_doctor',
        doctor_id: DOCTOR_ALICE_ID,
      };

      await assert.rejects(
        async () => {
          await queueService.callNext(DOCTOR_BOB_ID, null, '2026-10-21', userAlice);
        },
        (err) => {
          assert.equal(err.statusCode, 403);
          assert.match(err.message, /Clinician doctors may only advance their own consultation queue/i);
          return true;
        }
      );
    });

    test('callNext rejects with 403 when clinician account has no linked doctor profile', async () => {
      const unlinkedUser = {
        id: 'user-unlinked',
        role: 'clinician_doctor',
        doctor_id: null,
      };

      await assert.rejects(
        async () => {
          await queueService.callNext(null, null, '2026-10-21', unlinkedUser);
        },
        (err) => {
          assert.equal(err.statusCode, 403);
          assert.match(err.message, /Clinician account is not linked to an active doctor profile/i);
          return true;
        }
      );
    });

    test('callNext rejects with 403 when called by unauthorized role', async () => {
      const receptionistUser = {
        id: 'user-rec',
        role: 'receptionist',
      };

      await assert.rejects(
        async () => {
          await queueService.callNext(DOCTOR_ALICE_ID, null, '2026-10-21', receptionistUser);
        },
        (err) => {
          assert.equal(err.statusCode, 403);
          assert.match(err.message, /Only attending clinicians and administrators/i);
          return true;
        }
      );
    });

    test('callNext advances own queue when doctorId is omitted or matches', async () => {
      const userAlice = {
        id: 'user-alice',
        role: 'clinician_doctor',
        doctor_id: DOCTOR_ALICE_ID,
      };

      queueRepo.callNextPatient = async (doctorId, date, roomId) => ({
        id: APPOINTMENT_ID,
        doctor_id: doctorId,
        token_number: 102,
        status: 'in_consultation',
      });

      const res = await queueService.callNext(null, null, '2026-10-21', userAlice);
      assert.equal(res.hasWaiting, true);
      assert.equal(res.announcement.tokenNumber, 101);
    });

    test('getDoctorQueue rejects with 403 when clinician doctor accesses another doctor queue', async () => {
      const userAlice = {
        id: 'user-alice',
        role: 'clinician_doctor',
        doctor_id: DOCTOR_ALICE_ID,
      };

      await assert.rejects(
        async () => {
          await queueService.getDoctorQueue(DOCTOR_BOB_ID, '2026-10-21', userAlice);
        },
        (err) => {
          assert.equal(err.statusCode, 403);
          assert.match(err.message, /Clinician doctors may only access their own consultation queue board/i);
          return true;
        }
      );
    });

    test('getDoctorQueue allows clinician doctor to access their own queue board', async () => {
      const userAlice = {
        id: 'user-alice',
        role: 'clinician_doctor',
        doctor_id: DOCTOR_ALICE_ID,
      };

      queueRepo.getDoctorQueue = async (doctorId, date) => [];

      const res = await queueService.getDoctorQueue(DOCTOR_ALICE_ID, '2026-10-21', userAlice);
      assert.equal(res.doctor.id, DOCTOR_ALICE_ID);
      assert.equal(res.metrics.totalAppointments, 0);
    });
  });

  describe('2. Roster Leave Ownership', () => {
    beforeEach(() => {
      aptRepo.findDoctorById = async (id) => ({
        id,
        full_name: id === DOCTOR_ALICE_ID ? 'Dr. Alice' : 'Dr. Bob',
      });
      rosterRepo.getLeaves = async () => [];
      rosterRepo.createLeave = async (data) => ({ id: LEAVE_ID, ...data, status: 'pending' });
    });

    test('applyLeave rejects with 403 when clinician doctor attempts to spoof another doctorId', async () => {
      const userAlice = {
        id: 'user-alice',
        role: 'clinician_doctor',
        doctor_id: DOCTOR_ALICE_ID,
      };

      const payload = {
        doctorId: DOCTOR_BOB_ID,
        startDate: '2026-12-01',
        endDate: '2026-12-05',
        reason: 'Vacation',
      };

      await assert.rejects(
        async () => {
          await rosterService.applyLeave(payload, userAlice);
        },
        (err) => {
          assert.equal(err.statusCode, 403);
          assert.match(err.message, /Clinician doctors may only apply for their own leave/i);
          return true;
        }
      );
    });

    test('applyLeave binds doctorId to currentUser.doctor_id for clinician doctor', async () => {
      const userAlice = {
        id: 'user-alice',
        role: 'clinician_doctor',
        doctor_id: DOCTOR_ALICE_ID,
      };

      const payload = {
        startDate: '2026-12-01',
        endDate: '2026-12-05',
        reason: 'Medical Conference',
      };

      const res = await rosterService.applyLeave(payload, userAlice);
      assert.equal(res.doctorId, DOCTOR_ALICE_ID);
      assert.equal(res.status, 'pending');
    });

    test('deleteLeave rejects with 403 when clinician doctor attempts to delete another doctor leave', async () => {
      rosterRepo.findLeaveById = async (id) => ({
        id,
        doctor_id: DOCTOR_BOB_ID,
        status: 'pending',
      });

      const userAlice = {
        id: 'user-alice',
        role: 'clinician_doctor',
        doctor_id: DOCTOR_ALICE_ID,
      };

      await assert.rejects(
        async () => {
          await rosterService.deleteLeave(LEAVE_ID, userAlice);
        },
        (err) => {
          assert.equal(err.statusCode, 403);
          assert.match(err.message, /Clinician doctors may only delete their own leave requests/i);
          return true;
        }
      );
    });

    test('deleteLeave allows clinician doctor to delete their own pending leave request', async () => {
      rosterRepo.findLeaveById = async (id) => ({
        id,
        doctor_id: DOCTOR_ALICE_ID,
        status: 'pending',
      });
      rosterRepo.deleteLeave = async (id) => ({ id, deleted: true });

      const userAlice = {
        id: 'user-alice',
        role: 'clinician_doctor',
        doctor_id: DOCTOR_ALICE_ID,
      };

      const res = await rosterService.deleteLeave(LEAVE_ID, userAlice);
      assert.equal(res.deleted, true);
    });

    test('getLeaves restricts results to currentUser.doctor_id for clinician doctor', async () => {
      let capturedFilters = null;
      rosterRepo.getLeaves = async (filters) => {
        capturedFilters = filters;
        return [{ id: LEAVE_ID, doctor_id: filters.doctorId }];
      };

      const userAlice = {
        id: 'user-alice',
        role: 'clinician_doctor',
        doctor_id: DOCTOR_ALICE_ID,
      };

      const res = await rosterService.getLeaves({ doctorId: DOCTOR_BOB_ID }, userAlice);
      assert.equal(capturedFilters.doctorId, DOCTOR_ALICE_ID);
      assert.equal(res[0].doctor_id, DOCTOR_ALICE_ID);
    });
  });

  describe('3. EMR Prescription Author Identity', () => {
    beforeEach(() => {
      emrRepo.createPrescription = async (data) => ({
        id: 'rx-01',
        ...data,
      });
    });

    test('createPrescription rejects with 403 when clinician doctor attempts to spoof doctor_id', async () => {
      const userAlice = {
        id: 'user-alice',
        role: 'clinician_doctor',
        doctor_id: DOCTOR_ALICE_ID,
      };

      const payload = {
        patient_id: PATIENT_ID,
        doctor_id: DOCTOR_BOB_ID,
        items: [{ medication_name: 'Paracetamol 500mg' }],
      };

      await assert.rejects(
        async () => {
          await emrService.createPrescription(payload, userAlice);
        },
        (err) => {
          assert.equal(err.statusCode, 403);
          assert.match(err.message, /Clinician doctors may only issue prescriptions under their own doctor identity/i);
          return true;
        }
      );
    });

    test('createPrescription rejects with 403 when clinician doctor attempts to spoof prescribed_by', async () => {
      const userAlice = {
        id: 'user-alice',
        role: 'clinician_doctor',
        doctor_id: DOCTOR_ALICE_ID,
      };

      const payload = {
        patient_id: PATIENT_ID,
        prescribed_by: DOCTOR_BOB_ID,
        items: [{ medication_name: 'Amoxicillin 500mg' }],
      };

      await assert.rejects(
        async () => {
          await emrService.createPrescription(payload, userAlice);
        },
        (err) => {
          assert.equal(err.statusCode, 403);
          assert.match(err.message, /Clinician doctors may only issue prescriptions under their own doctor identity/i);
          return true;
        }
      );
    });

    test('createPrescription binds doctor_id to currentUser.doctor_id for clinician doctor', async () => {
      const userAlice = {
        id: 'user-alice',
        role: 'clinician_doctor',
        doctor_id: DOCTOR_ALICE_ID,
      };

      const payload = {
        patient_id: PATIENT_ID,
        items: [{ medication_name: 'Metformin 500mg' }],
      };

      const res = await emrService.createPrescription(payload, userAlice);
      assert.equal(res.doctor_id, DOCTOR_ALICE_ID);
      assert.equal(res.prescribed_by, DOCTOR_ALICE_ID);
    });

    test('createPrescription rejects with 403 when non-clinician role attempts to prescribe', async () => {
      const nurseUser = {
        id: 'user-nurse',
        role: 'staff_nurse',
      };

      const payload = {
        patient_id: PATIENT_ID,
        items: [{ medication_name: 'Ibuprofen 400mg' }],
      };

      await assert.rejects(
        async () => {
          await emrService.createPrescription(payload, nurseUser);
        },
        (err) => {
          assert.equal(err.statusCode, 403);
          assert.match(err.message, /Only clinician doctors and administrators may issue prescriptions/i);
          return true;
        }
      );
    });
  });

  describe('4. Cashier Variance Precision & Mathematical Exactness', () => {
    test('Cashier settlement minor unit arithmetic eliminates floating-point drift and guarantees exact variance', async () => {
      let createdPayload = null;
      settlementRepo.getSettlementFigures = async (date) => ({
        total_collected: '12450.70',
        total_refunded: '1450.25',
        cash_collected: '8200.40',
        cash_refunded: '300.15',
      });

      settlementRepo.createSettlement = async (payload) => {
        createdPayload = payload;
        return { id: 'set-01', ...payload };
      };

      const res = await settlementService.closeSettlement({
        businessDate: '2026-10-21',
        cashierName: 'Cashier John',
        openingCash: 500.10,
        countedCash: 8400.35,
        notes: 'End of day closing',
      });

      assert.ok(createdPayload);
      assert.equal(createdPayload.openingCash, 500.10);
      assert.equal(createdPayload.expectedCash, 8400.35);
      assert.equal(createdPayload.countedCash, 8400.35);
      assert.equal(createdPayload.cashVariance, 0);

      // Verify DB constraint equation holds with exact precision:
      assert.equal(
        Number((createdPayload.countedCash - createdPayload.expectedCash).toFixed(2)),
        createdPayload.cashVariance
      );

      // Verify net amount: 12450.70 - 1450.25 = 11000.45
      assert.equal(createdPayload.netAmount, 11000.45);
    });
  });
});
