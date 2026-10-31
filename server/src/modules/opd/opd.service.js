const repo = require("./opd.repository");

const getDashboard = async () => {
  return await repo.getDashboardData();
};

const getCabins = async () => {
  return await repo.getCabins();
};

const activateSession = async (sessionData) => {
  return await repo.activateSession(sessionData);
};

const getQueue = async (filters) => {
  return await repo.getQueue(filters);
};

const checkIn = async (payload) => {
  return await repo.checkInPatient(payload);
};

const callNext = async (cabin) => {
  return await repo.callNextPatient(cabin);
};

const setPriority = async (id, isPriority, category, notes) => {
  return await repo.updatePriority(id, isPriority, category, notes);
};

const getVisitSlip = async (id) => {
  return await repo.getVisitSlip(id);
};

const getFollowUps = async () => {
  return await repo.getFollowUps();
};

const scheduleFollowUp = async (payload) => {
  return await repo.scheduleFollowUp(payload);
};

const sendReminder = async (id) => {
  return await repo.sendReminder(id);
};

const broadcastReminders = async () => {
  return await repo.broadcastReminders();
};

module.exports = {
  getDashboard,
  getCabins,
  activateSession,
  getQueue,
  checkIn,
  callNext,
  setPriority,
  getVisitSlip,
  getFollowUps,
  scheduleFollowUp,
  sendReminder,
  broadcastReminders,
};
