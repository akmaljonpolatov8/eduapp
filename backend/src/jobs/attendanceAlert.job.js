const cron = require("node-cron");
const { logger } = require("../config/logger");
const { prisma } = require("../config/database");
const { sendAttendanceAlert } = require("../modules/sms/sms.service");

function startAttendanceAlertJob() {
  // runs every 30 minutes to catch recent marks
  return cron.schedule("*/30 * * * *", async () => {
    logger.info("Attendance alert job tick");
    try {
      const now = new Date();
      const since = new Date(Date.now() - 60 * 60 * 1000); // last 60 minutes

      // today's date (without time)
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const attendances = await prisma.attendance.findMany({
        where: {
          date: today,
          markedAt: { gte: since },
          status: { in: ["ABSENT", "LATE"] },
        },
        include: { student: true, group: true },
      });

      for (const a of attendances) {
        try {
          const parentPhone = a.student?.parentPhone || a.student?.phone;
          if (!parentPhone) {
            logger.warn("Skipping attendance SMS - no parentPhone", {
              attendanceId: a.id,
            });
            continue;
          }

          await sendAttendanceAlert({
            studentName: a.student.name,
            parentPhone,
            date: a.date,
            groupName: a.group?.name || "",
            status: a.status,
          });
        } catch (err) {
          logger.error("Failed sending attendance alert", {
            attendanceId: a.id,
            error: err.message || String(err),
          });
        }
      }
    } catch (err) {
      logger.error("Attendance alert job failed", {
        error: err.message || String(err),
      });
    }
  });
}

module.exports = {
  startAttendanceAlertJob,
};
