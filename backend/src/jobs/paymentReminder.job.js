const cron = require("node-cron");
const { logger } = require("../config/logger");
const { prisma } = require("../config/database");
const { sendPaymentReminder } = require("../modules/sms/sms.service");

function daysBetween(a, b) {
  return Math.floor((a - b) / (1000 * 60 * 60 * 24));
}

function startPaymentReminderJob() {
  return cron.schedule("0 9 * * *", async () => {
    logger.info("Payment reminder job tick");
    try {
      const now = new Date();

      const payments = await prisma.payment.findMany({
        where: {
          status: "OVERDUE",
          OR: [
            { smsSentAt: null },
            { smsSentAt: { lte: new Date(Date.now() - 24 * 60 * 60 * 1000) } },
          ],
        },
        include: {
          student: true,
          group: true,
        },
      });

      for (const p of payments) {
        try {
          const overdueDays = daysBetween(now, p.createdAt);
          const parentPhone = p.student?.parentPhone || p.student?.phone;
          if (!parentPhone) {
            logger.warn("Skipping payment SMS - no parentPhone", {
              paymentId: p.id,
            });
            continue;
          }

          await sendPaymentReminder({
            studentName: p.student.name,
            parentPhone,
            groupName: p.group?.name || "",
            amount: p.amount,
            dueDate: p.createdAt,
            overdueDays,
          });

          await prisma.payment.update({
            where: { id: p.id },
            data: { smsSentAt: new Date() },
          });
        } catch (err) {
          logger.error("Failed sending payment reminder", {
            paymentId: p.id,
            error: err.message || String(err),
          });
        }
      }
    } catch (err) {
      logger.error("Payment reminder job failed", {
        error: err.message || String(err),
      });
    }
  });
}

module.exports = {
  startPaymentReminderJob,
};
