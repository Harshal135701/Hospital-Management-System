
const cron = require("node-cron");
const service = require("./notification.service");

const startNotificationScheduler = () => {
  cron.schedule("* * * * *", async () => {
    // Run every single minute
    try {
      const results = await service.processDueNotifications();

      if (results.length) {
        console.log(`Processed ${results.length} notifications`);
      }
    } catch (error) {
      console.error("Notification scheduler error:", error.message);
    }
  });

  console.log("Notification scheduler started");
};

module.exports = startNotificationScheduler;
