const cron = require("node-cron");
const service = require("./notification.service");

let schedulerTask = null;

const startNotificationScheduler = () => {
  if (process.env.NODE_ENV === "test") {
    return null;
  }
  if (schedulerTask) {
    return schedulerTask;
  }

  schedulerTask = cron.schedule("* * * * *", async () => {
    // Run every single minute
    try {
      const results = await service.processDueNotifications();

      if (results && results.length) {
        console.log(`Processed ${results.length} notifications`);
      }
    } catch (error) {
      console.error("Notification scheduler error:", error.message);
    }
  });

  console.log("Notification scheduler started");
  return schedulerTask;
};

module.exports = startNotificationScheduler;
