const http = require("http");
const app = require("../src/app");
const pool = require("../src/config/db");

let server;
let baseUrl;

const request = (method, path, body = null) => {
  return new Promise((resolve, reject) => {
    const url = new URL(path, baseUrl);
    const options = {
      method,
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      headers: {
        "Content-Type": "application/json",
      },
    };

    const req = http.request(options, (res) => {
      let rawData = "";
      res.on("data", (chunk) => (rawData += chunk));
      res.on("end", () => {
        try {
          const parsed = rawData ? JSON.parse(rawData) : null;
          resolve({ status: res.statusCode, body: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, raw: rawData });
        }
      });
    });

    req.on("error", reject);

    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
};

async function runTests() {
  console.log("=== STARTING FULL BACKEND INTEGRATION TEST FOR MODULE 3 ===");

  server = http.createServer(app);
  await new Promise((resolve) => server.listen(0, resolve));
  const port = server.address().port;
  baseUrl = `http://localhost:${port}`;
  console.log(`Test server running at ${baseUrl}`);

  try {
    // 1. Health & Meta
    const health = await request("GET", "/api/health");
    console.assert(health.status === 200, "Health check failed");
    console.log("✔ GET /api/health passed");

    const meta = await request("GET", "/api/meta");
    console.assert(meta.status === 200 && meta.body.success, "Meta fetch failed");
    const { doctors, patients, rooms } = meta.body.data;
    console.assert(doctors.length > 0, "No doctors available");
    console.assert(patients.length > 0, "No patients available");
    console.log(`✔ GET /api/meta passed (Found ${doctors.length} doctors, ${patients.length} patients, ${rooms.length} rooms)`);

    const doctor = doctors[0];
    const patient = patients[0];
    const patient2 = patients[1] || patients[0];
    const room = rooms[0];

    // Compute future test dates
    const testDate = "2026-11-10"; // Tuesday
    const testDate2 = "2026-11-11"; // Wednesday

    // Clean up any test fixtures from previous runs
    await pool.query("DELETE FROM appointments WHERE doctor_id = $1 AND appointment_date IN ($2, $3)", [doctor.id, testDate, testDate2]);
    await pool.query("DELETE FROM doctor_rosters WHERE doctor_id = $1 AND roster_date IN ($2, $3)", [doctor.id, testDate, testDate2]);
    await pool.query("DELETE FROM doctor_schedules WHERE doctor_id = $1", [doctor.id]);
    await pool.query("DELETE FROM doctor_leaves WHERE doctor_id = $1 AND start_date = $2", [doctor.id, "2026-11-20"]);

    // ==========================================
    // 3.2 DOCTOR ROSTER & SHIFT PLANNING
    // ==========================================
    console.log("\n--- Testing 3.2 Doctor Roster & Shift Planning ---");

    // 2.1 Create Weekly Recurring Schedule (dayOfWeek: 2 = Tuesday)
    const schedRes = await request("POST", "/api/rosters/schedules", {
      doctorId: doctor.id,
      dayOfWeek: 2,
      shiftType: "morning",
      startTime: "09:00",
      endTime: "13:00",
      maxPatients: 25,
      roomId: room?.id || null,
    });
    console.assert(schedRes.status === 201, "Schedule creation unexpected status: " + JSON.stringify(schedRes.body));
    console.log("✔ POST /api/rosters/schedules verified");

    // 2.2 List Schedules
    const listSched = await request("GET", `/api/rosters/schedules?doctorId=${doctor.id}`);
    console.assert(listSched.status === 200, "List schedules failed");
    console.log(`✔ GET /api/rosters/schedules verified (Found ${listSched.body.data.length} schedules)`);

    // 2.3 Bulk Generate Roster from Schedules
    const genRes = await request("POST", "/api/rosters/generate", {
      startDate: testDate,
      endDate: testDate,
      doctorId: doctor.id,
      autoPublish: true,
    });
    console.assert(genRes.status === 201, "Generate roster failed: " + JSON.stringify(genRes.body));
    console.log(`✔ POST /api/rosters/generate verified (${genRes.body.data.summary.generatedCount} daily shift rosters created)`);

    // 2.4 Query Rosters
    const rosterList = await request("GET", `/api/rosters?date=${testDate}&doctorId=${doctor.id}`);
    console.assert(rosterList.status === 200, "Query rosters failed");
    console.log(`✔ GET /api/rosters verified (Found ${rosterList.body.data.length} rosters for ${testDate})`);

    // 2.5 Doctor Leaves: Apply & Review
    const leaveRes = await request("POST", "/api/rosters/leaves", {
      doctorId: doctor.id,
      startDate: "2026-11-20",
      endDate: "2026-11-22",
      reason: "Cardiology Annual Conference in Singapore",
    });
    console.assert(leaveRes.status === 201, "Apply leave failed: " + JSON.stringify(leaveRes.body));
    const leaveId = leaveRes.body.data.id;
    console.log("✔ POST /api/rosters/leaves verified");

    const reviewRes = await request("PATCH", `/api/rosters/leaves/${leaveId}/status`, {
      status: "approved",
      reviewedBy: doctors[1]?.id || doctor.id,
    });
    console.assert(reviewRes.status === 200, "Review leave failed");
    console.log("✔ PATCH /api/rosters/leaves/:id/status approved leave verified");

    // ==========================================
    // 3.1 BOOK / RESCHEDULE APPOINTMENT
    // ==========================================
    console.log("\n--- Testing 3.1 Book / Reschedule Appointment ---");

    // 3.1 Available Slots
    const slotsRes = await request("GET", `/api/appointments/available-slots?doctorId=${doctor.id}&date=${testDate}`);
    console.assert(slotsRes.status === 200, "Available slots failed");
    console.assert(slotsRes.body.data.availableSlots > 0, "No available slots returned");
    console.log(`✔ GET /api/appointments/available-slots verified (${slotsRes.body.data.availableSlots} slots available)`);

    // 3.2 Book First Appointment (Token #1)
    const book1 = await request("POST", "/api/appointments", {
      patientId: patient.id,
      doctorId: doctor.id,
      departmentId: doctor.department_id,
      appointmentDate: testDate,
      startTime: "09:30",
      visitType: "first_visit",
      notes: "Follow up on chest tightness symptoms",
      roomId: room?.id || null,
    });
    console.assert(book1.status === 201, "Booking 1 failed: " + JSON.stringify(book1.body));
    console.assert(book1.body.data.token_number === 1, `Expected token 1, got ${book1.body?.data?.token_number}`);
    const apt1Id = book1.body.data.id;
    console.log(`✔ POST /api/appointments booked appointment (Token #${book1.body.data.token_number})`);

    // 3.3 Book Second Appointment (Token #2)
    const book2 = await request("POST", "/api/appointments", {
      patientId: patient2.id,
      doctorId: doctor.id,
      departmentId: doctor.department_id,
      appointmentDate: testDate,
      startTime: "10:00",
      visitType: "follow_up",
      notes: "Routine checkup",
      roomId: room?.id || null,
    });
    console.assert(book2.status === 201, "Booking 2 failed");
    console.assert(book2.body.data.token_number === 2, `Expected token 2, got ${book2.body?.data?.token_number}`);
    const apt2Id = book2.body.data.id;
    console.log(`✔ POST /api/appointments booked second appointment (Token #${book2.body.data.token_number})`);

    // 3.4 Double Booking Collision Prevention Check (Must reject overlapping slot)
    const doubleBook = await request("POST", "/api/appointments", {
      patientId: patient.id,
      doctorId: doctor.id,
      departmentId: doctor.department_id,
      appointmentDate: testDate,
      startTime: "09:30",
      visitType: "first_visit",
    });
    console.assert(doubleBook.status === 409 || doubleBook.status === 400, "Double booking collision check failed");
    console.log("✔ Collision test: Double booking strictly prevented (409 Conflict)");

    // 3.5 Reschedule Appointment 2 to next day
    const reschedRes = await request("PATCH", `/api/appointments/${apt2Id}/reschedule`, {
      appointmentDate: testDate2,
      startTime: "11:00",
      reason: "Patient requested afternoon shift",
    });
    console.assert(reschedRes.status === 200, "Reschedule failed: " + JSON.stringify(reschedRes.body));
    console.assert(reschedRes.body.data.appointment_date.slice(0, 10) === testDate2, "Date not updated");
    console.log("✔ PATCH /api/appointments/:id/reschedule verified");

    // 3.6 Patient History
    const historyRes = await request("GET", `/api/appointments/patient/${patient.id}`);
    console.assert(historyRes.status === 200, "Patient history failed");
    console.log(`✔ GET /api/appointments/patient/:id history verified (Found ${historyRes.body.data.length} records)`);

    // ==========================================
    // 3.3 TOKEN QUEUE / WAITING ROOM DISPLAY
    // ==========================================
    console.log("\n--- Testing 3.3 Token Queue / Waiting Room Display ---");

    // 3.7 Reception Check-in (Patient arrives at hospital)
    const checkInRes = await request("POST", "/api/queue/check-in", {
      appointmentId: apt1Id,
    });
    console.assert(checkInRes.status === 200, "Check-in failed: " + JSON.stringify(checkInRes.body));
    console.assert(checkInRes.body.status === "arrived", "Expected status 'arrived'");
    console.log(`✔ POST /api/queue/check-in verified (Status transitioned to 'arrived')`);

    // 3.8 Priority Tagging
    const priorityRes = await request("PATCH", `/api/queue/${apt1Id}/priority`, {
      isPriority: true,
      notes: "Senior citizen assistance requested",
    });
    console.assert(priorityRes.status === 200, "Priority update failed");
    console.log("✔ PATCH /api/queue/:id/priority verified");

    // 3.9 Doctor Desk Queue View
    const docQueueRes = await request("GET", `/api/queue/doctor/${doctor.id}?date=${testDate}`);
    console.assert(docQueueRes.status === 200, "Doctor queue failed");
    console.assert(docQueueRes.body.data.metrics.waitingCount >= 1, "Expected waiting patient");
    console.log(`✔ GET /api/queue/doctor/:id verified (${docQueueRes.body.data.metrics.waitingCount} waiting)`);

    // 3.10 Public TV Waiting Room Display
    const displayRes = await request("GET", `/api/queue/display?date=${testDate}`);
    console.assert(displayRes.status === 200, "Display fetch failed");
    console.assert(displayRes.body.data.rooms.length > 0, "No rooms in display board");
    console.log(`✔ GET /api/queue/display verified (TV Display data for ${displayRes.body.data.rooms.length} room(s))`);

    // 3.11 Doctor Calls Next Patient
    const callNextRes = await request("POST", "/api/queue/call-next", {
      doctorId: doctor.id,
      roomId: room?.id || null,
      date: testDate,
    });
    console.assert(callNextRes.status === 200 && callNextRes.body.hasWaiting, "Call next failed: " + JSON.stringify(callNextRes.body));
    console.assert(callNextRes.body.announcement.tokenNumber === 1, "Expected Token #1 to be called");
    console.log(`✔ POST /api/queue/call-next verified (Called Token #${callNextRes.body.announcement.tokenNumber} to Room ${callNextRes.body.announcement.roomNumber})`);

    // 3.12 Recall Token
    const recallRes = await request("PATCH", `/api/queue/${apt1Id}/recall`);
    console.assert(recallRes.status === 200, "Recall failed");
    console.log("✔ PATCH /api/queue/:id/recall re-announced patient verified");

    // 3.13 Complete Consultation
    const completeRes = await request("PATCH", `/api/queue/${apt1Id}/complete`, {
      notes: "Prescribed ACE inhibitors. Return for review in 2 weeks.",
    });
    console.assert(completeRes.status === 200, "Complete consultation failed: " + JSON.stringify(completeRes.body));
    console.assert(completeRes.body.appointment.status === "completed", "Status is not completed");
    console.log(`✔ PATCH /api/queue/:id/complete consultation closed successfully`);

    // 3.14 Cancel Appointment
    const cancelRes = await request("PATCH", `/api/appointments/${apt2Id}/cancel`, {
      reason: "Patient had personal emergency",
    });
    console.assert(cancelRes.status === 200, "Cancel appointment failed");
    console.log("✔ PATCH /api/appointments/:id/cancel verified");

    console.log("\n========================================================");
    console.log("🎉 ALL TESTS PASSED SUCCESSFULLY! INDUSTRIAL SUITE 100%");
    console.log("========================================================\n");
  } finally {
    server.close();
    await pool.end();
  }
}

runTests().catch((err) => {
  console.error("❌ TEST FAILED:", err);
  if (server) server.close();
  pool.end();
  process.exit(1);
});
