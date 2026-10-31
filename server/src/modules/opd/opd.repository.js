const pool = require("../../config/db");

// In-memory cache & fallback dataset for live clinic simulation and persistence
let memCabins = [
  {
    cabin: "Cabin 101",
    specialty: "Internal Medicine",
    doctor: "Dr. N. Joshi",
    shift: "Morning (09:00 - 13:00)",
    status: "In Consultation",
    currentPatient: "Rohan Mehra (Token #04)",
    waitingCount: 4,
    avgConsultTime: "12 min",
    floor: "Ground Floor",
    tokenCapacity: 30,
    fee: 800,
  },
  {
    cabin: "Cabin 102",
    specialty: "Cardiology",
    doctor: "Dr. V. Singhal",
    shift: "Morning (09:30 - 13:30)",
    status: "Ready for Next",
    currentPatient: "-",
    waitingCount: 6,
    avgConsultTime: "15 min",
    floor: "1st Floor North",
    tokenCapacity: 35,
    fee: 1200,
  },
  {
    cabin: "Cabin 103",
    specialty: "Orthopedics & Joint",
    doctor: "Dr. P. Sen",
    shift: "Full Day (09:00 - 17:00)",
    status: "In Consultation",
    currentPatient: "Sunita Sharma (Token #03)",
    waitingCount: 5,
    avgConsultTime: "14 min",
    floor: "1st Floor South",
    tokenCapacity: 40,
    fee: 900,
  },
  {
    cabin: "Cabin 104",
    specialty: "Gynecology & ART",
    doctor: "Dr. S. K. Roy",
    shift: "Morning (10:00 - 14:00)",
    status: "In Consultation",
    currentPatient: "Meera Kapur (Token #02)",
    waitingCount: 3,
    avgConsultTime: "18 min",
    floor: "2nd Floor East",
    tokenCapacity: 25,
    fee: 1000,
  },
];

let memQueue = [
  {
    id: "opd-v-001",
    tokenNo: "T-01",
    uhid: "UHID-89401",
    patientName: "Anil Deshmukh",
    age: 68,
    gender: "Male",
    phone: "+91 98201 12345",
    doctor: "Dr. N. Joshi",
    specialty: "Internal Medicine",
    cabin: "Cabin 101",
    category: "Senior Citizen",
    checkInTime: "09:05 AM",
    status: "Completed",
    fee: "₹800 (Paid - Cash)",
    invoiceNo: "INV-OPD-2026-08145",
    isPriority: false,
    followUpDate: "2026-10-31",
    createdAt: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: "opd-v-002",
    tokenNo: "T-02",
    uhid: "UHID-89402",
    patientName: "Meera Kapur",
    age: 33,
    gender: "Female",
    phone: "+91 98202 23456",
    doctor: "Dr. S. K. Roy",
    specialty: "Gynecology & ART",
    cabin: "Cabin 104",
    category: "General",
    checkInTime: "09:20 AM",
    status: "In Cabin",
    fee: "₹1,000 (Paid - UPI)",
    invoiceNo: "INV-OPD-2026-08146",
    isPriority: false,
    followUpDate: "Pending",
    createdAt: new Date(Date.now() - 3000000).toISOString(),
  },
  {
    id: "opd-v-003",
    tokenNo: "T-03",
    uhid: "UHID-89403",
    patientName: "Sunita Sharma",
    age: 62,
    gender: "Female",
    phone: "+91 98203 34567",
    doctor: "Dr. P. Sen",
    specialty: "Orthopedics & Joint",
    cabin: "Cabin 103",
    category: "Senior Citizen",
    checkInTime: "09:35 AM",
    status: "In Cabin",
    fee: "₹800 (Paid - Card)",
    invoiceNo: "INV-OPD-2026-08147",
    isPriority: false,
    followUpDate: "Pending",
    createdAt: new Date(Date.now() - 2400000).toISOString(),
  },
  {
    id: "opd-v-004",
    tokenNo: "T-04",
    uhid: "UHID-89404",
    patientName: "Rohan Mehra",
    age: 48,
    gender: "Male",
    phone: "+91 98204 45678",
    doctor: "Dr. N. Joshi",
    specialty: "Internal Medicine",
    cabin: "Cabin 101",
    category: "Emergency / STAT",
    checkInTime: "09:40 AM",
    status: "In Cabin",
    fee: "₹800 (Paid - UPI)",
    invoiceNo: "INV-OPD-2026-08148",
    isPriority: true,
    followUpDate: "Pending",
    createdAt: new Date(Date.now() - 1800000).toISOString(),
  },
  {
    id: "opd-v-005",
    tokenNo: "T-05",
    uhid: "UHID-89405",
    patientName: "Divya Nambiar",
    age: 27,
    gender: "Female",
    phone: "+91 98205 56789",
    doctor: "Dr. V. Singhal",
    specialty: "Cardiology",
    cabin: "Cabin 102",
    category: "General",
    checkInTime: "09:55 AM",
    status: "Waiting in Lobby",
    fee: "₹1,200 (Paid - Dynamic UPI QR)",
    invoiceNo: "INV-OPD-2026-08149",
    isPriority: false,
    followUpDate: "Pending",
    createdAt: new Date(Date.now() - 1200000).toISOString(),
  },
  {
    id: "opd-v-006",
    tokenNo: "T-06",
    uhid: "UHID-89406",
    patientName: "Vikram Patel",
    age: 54,
    gender: "Male",
    phone: "+91 98206 67890",
    doctor: "Dr. V. Singhal",
    specialty: "Cardiology",
    cabin: "Cabin 102",
    category: "General",
    checkInTime: "10:10 AM",
    status: "Scheduled",
    fee: "Unpaid (Pay at Counter)",
    invoiceNo: "INV-OPD-2026-08150",
    isPriority: false,
    followUpDate: "Pending",
    createdAt: new Date(Date.now() - 600000).toISOString(),
  },
];

let memFollowUps = [
  {
    id: "fu-001",
    uhid: "UHID-89401",
    patientName: "Anil Deshmukh",
    phone: "+91 98201 12345",
    doctor: "Dr. N. Joshi",
    specialty: "Internal Medicine",
    timeframe: "7 Days Post-Consult",
    dueDate: "2026-11-07",
    status: "Pending Re-booking",
    channels: { whatsapp: true, sms: true, ivrCall: false },
    whatsappStatus: "Queued (48h)",
    smsStatus: "Scheduled",
    instructions: "Review fasting blood sugar & serum creatinine. Continue Tab Metformin 500mg BD.",
    createdAt: new Date().toISOString(),
  },
  {
    id: "fu-002",
    uhid: "UHID-89388",
    patientName: "Preeti Desai",
    phone: "+91 98208 90123",
    doctor: "Dr. V. Singhal",
    specialty: "Cardiology",
    timeframe: "Follow up in 2 weeks",
    dueDate: "2026-11-14",
    status: "Pending Re-booking",
    channels: { whatsapp: true, sms: true, ivrCall: false },
    whatsappStatus: "Queued (48h)",
    smsStatus: "Scheduled",
    instructions: "Repeat 2D Echocardiogram and 24-hr Holter monitor review. Check BP daily.",
    createdAt: new Date().toISOString(),
  },
  {
    id: "fu-003",
    uhid: "UHID-89350",
    patientName: "Gopal Krishna Rao",
    phone: "+91 98209 01234",
    doctor: "Dr. P. Sen",
    specialty: "Orthopedics & Joint",
    timeframe: "3 Days Post-Op",
    dueDate: "2026-11-03",
    status: "Re-booked (Confirmed)",
    channels: { whatsapp: true, sms: true, ivrCall: false },
    whatsappStatus: "Delivered",
    smsStatus: "Sent",
    instructions: "Knee arthroscopy surgical wound inspection and suture removal. Physical therapy review.",
    createdAt: new Date().toISOString(),
  },
  {
    id: "fu-004",
    uhid: "UHID-89299",
    patientName: "Ayesha Siddiqui",
    phone: "+91 98210 12345",
    doctor: "Dr. S. K. Roy",
    specialty: "Gynecology & ART",
    timeframe: "14 Days (Beta hCG Review)",
    dueDate: "2026-10-30",
    status: "Overdue - Reminder Sent",
    channels: { whatsapp: true, sms: true, ivrCall: false },
    whatsappStatus: "Delivered",
    smsStatus: "Sent",
    instructions: "Serum Beta hCG blood pregnancy titer check post-embryo transfer cycle #2.",
    createdAt: new Date(Date.now() - 86400000).toISOString(),
  },
];

const getDashboardData = async () => {
  // Query DB stats if database pool is available
  try {
    const today = new Date().toISOString().slice(0, 10);
    const aptRes = await pool.query(
      `SELECT status, count(*) AS count FROM appointments WHERE appointment_date = $1 GROUP BY status`,
      [today]
    );

    const stats = {
      todayVisits: memQueue.length,
      consulted: memQueue.filter((v) => v.status === "Completed").length,
      inProgress: memQueue.filter((v) => v.status === "In Cabin").length,
      waitingInLobby: memQueue.filter((v) => v.status === "Waiting in Lobby").length,
      scheduled: memQueue.filter((v) => v.status === "Scheduled").length,
      activeCabinsCount: memCabins.length,
      totalCabinsPresent: memCabins.filter((c) => c.status !== "Offline").length,
      avgWaitTime: "14 mins",
      peakWaitSpecialty: "Cardiology (6)",
      followUpsDueCount: memFollowUps.filter((f) => f.status.includes("Pending") || f.status.includes("Overdue")).length,
    };

    if (aptRes && aptRes.rows && aptRes.rows.length > 0) {
      let dbTotal = 0;
      aptRes.rows.forEach((r) => {
        dbTotal += parseInt(r.count, 10);
      });
      if (dbTotal > 0) {
        stats.todayVisits = Math.max(stats.todayVisits, dbTotal);
      }
    }

    return stats;
  } catch {
    return {
      todayVisits: 142,
      consulted: 94,
      inProgress: 48,
      waitingInLobby: memQueue.filter((v) => v.status === "Waiting in Lobby").length || 18,
      scheduled: memQueue.filter((v) => v.status === "Scheduled").length || 8,
      activeCabinsCount: 4,
      totalCabinsPresent: 4,
      avgWaitTime: "14 mins",
      peakWaitSpecialty: "Cardiology (6)",
      followUpsDueCount: 24,
    };
  }
};

const getCabins = async () => {
  return memCabins;
};

const activateSession = async (sessionData) => {
  const existingIdx = memCabins.findIndex((c) => c.cabin === sessionData.cabin);
  const newCabin = {
    cabin: sessionData.cabin,
    specialty: sessionData.specialty,
    doctor: sessionData.doctor,
    shift: sessionData.shift || "Morning (09:00 - 13:00)",
    status: "Ready for Next",
    currentPatient: "-",
    waitingCount: 0,
    avgConsultTime: "12 min",
    floor: "Ground Floor",
    tokenCapacity: sessionData.tokenCapacity || 30,
    fee: sessionData.fee || 800,
  };

  if (existingIdx >= 0) {
    memCabins[existingIdx] = newCabin;
  } else {
    memCabins.push(newCabin);
  }
  return newCabin;
};

const getQueue = async (filters = {}) => {
  let list = [...memQueue];
  if (filters.cabin) {
    list = list.filter((v) => v.cabin === filters.cabin);
  }
  if (filters.status) {
    list = list.filter((v) => v.status === filters.status);
  }
  return list;
};

const checkInPatient = async (payload) => {
  const nextTokenNum = memQueue.length + 1;
  const tokenNo = `T-${nextTokenNum < 10 ? "0" + nextTokenNum : nextTokenNum}`;
  const nowStr = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  const newVisit = {
    id: `opd-v-${Date.now()}`,
    tokenNo,
    uhid: payload.uhid,
    patientName: payload.patientName,
    age: Number(payload.age) || 30,
    gender: payload.gender || "Female",
    phone: payload.phone || "+91 98200 00000",
    doctor: payload.doctor,
    specialty: payload.specialty,
    cabin: payload.cabin,
    category: payload.category || "General",
    checkInTime: nowStr,
    status: "Waiting in Lobby",
    fee: payload.fee || "₹800 (Paid - UPI)",
    invoiceNo: `INV-OPD-2026-0${8150 + nextTokenNum}`,
    isPriority: payload.category === "Emergency / STAT",
    followUpDate: "Pending",
    createdAt: new Date().toISOString(),
  };

  memQueue.unshift(newVisit);

  // Increment cabin waiting count
  const cabin = memCabins.find((c) => c.cabin === payload.cabin);
  if (cabin) {
    cabin.waitingCount = (cabin.waitingCount || 0) + 1;
  }

  return newVisit;
};

const callNextPatient = async (cabinId) => {
  const cabin = memCabins.find((c) => c.cabin === cabinId);
  const nextCandidate = memQueue.find(
    (v) => (v.cabin === cabinId || !cabinId) && v.status === "Waiting in Lobby"
  );

  if (nextCandidate) {
    nextCandidate.status = "In Cabin";
    if (cabin) {
      cabin.status = "In Consultation";
      cabin.currentPatient = `${nextCandidate.patientName} (${nextCandidate.tokenNo})`;
      cabin.waitingCount = Math.max(0, (cabin.waitingCount || 1) - 1);
    }
    return { candidate: nextCandidate, cabin };
  }

  return { candidate: null, cabin };
};

const updatePriority = async (id, isPriority, category = "Emergency / STAT", notes = "") => {
  const item = memQueue.find((v) => v.id === id || v.tokenNo === id);
  if (item) {
    item.isPriority = isPriority;
    item.category = category;
    if (notes) item.triageNotes = notes;
    return item;
  }
  return null;
};

const getVisitSlip = async (id) => {
  const item = memQueue.find((v) => v.id === id || v.tokenNo === id || v.uhid === id);
  return item || memQueue[0];
};

const getFollowUps = async () => {
  return memFollowUps;
};

const scheduleFollowUp = async (payload) => {
  const newFollowUp = {
    id: `fu-${Date.now()}`,
    uhid: payload.uhid,
    patientName: payload.patientName,
    phone: "+91 98200 00000",
    doctor: payload.doctor,
    specialty: "Outpatient Specialty",
    timeframe: payload.timeframe || "Follow up in 2 weeks",
    dueDate: payload.dueDate,
    status: "Pending Re-booking",
    channels: payload.channels || { whatsapp: true, sms: true, ivrCall: false },
    whatsappStatus: "Queued (48h)",
    smsStatus: "Scheduled",
    instructions: payload.instructions || "General follow-up consultation.",
    createdAt: new Date().toISOString(),
  };

  memFollowUps.unshift(newFollowUp);
  return newFollowUp;
};

const sendReminder = async (id) => {
  const item = memFollowUps.find((f) => f.id === id || f.uhid === id);
  if (item) {
    item.whatsappStatus = "Delivered";
    item.smsStatus = "Sent";
    item.status = "Overdue - Reminder Sent";
    return item;
  }
  return null;
};

const broadcastReminders = async () => {
  let count = 0;
  memFollowUps.forEach((item) => {
    if (item.status.includes("Pending") || item.status.includes("Overdue")) {
      item.whatsappStatus = "Delivered";
      item.smsStatus = "Sent";
      count++;
    }
  });
  return { dispatchedCount: count };
};

module.exports = {
  getDashboardData,
  getCabins,
  activateSession,
  getQueue,
  checkInPatient,
  callNextPatient,
  updatePriority,
  getVisitSlip,
  getFollowUps,
  scheduleFollowUp,
  sendReminder,
  broadcastReminders,
};
