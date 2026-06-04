const { AppError } = require("../../utils/AppError");
const { env } = require("../../config/env");
const { logger } = require("../../config/logger");

const BASE_URL = "https://api.textup.uz";

async function sendSms(phone, message) {
  if (!env.TEXTUP_API_KEY) {
    throw new AppError(500, "SMS_NOT_CONFIGURED", "TEXTUP_API_KEY sozlanmagan");
  }

  // Ensure message <= 160 chars
  let text = String(message || "").slice(0, 160);

  try {
    const res = await fetch(`${BASE_URL}/send`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${env.TEXTUP_API_KEY}`,
      },
      body: JSON.stringify({
        phone,
        message: text,
        from: env.TEXTUP_SENDER_NAME || "EduCenter",
      }),
    });

    const data = await res.json().catch(() => null);

    if (!res.ok) {
      logger.error("SMS send failed", {
        phone,
        status: res.status,
        body: data,
      });
      throw new AppError(
        502,
        "SMS_SEND_FAILED",
        `SMS yuborilmadi: ${res.status}`,
      );
    }

    logger.info("SMS sent", { phone, message: text, response: data });
    return data;
  } catch (err) {
    logger.error("SMS send error", {
      phone,
      error: err?.message || String(err),
    });
    if (err instanceof AppError) throw err;
    throw new AppError(502, "SMS_REQUEST_FAILED", err?.message || String(err));
  }
}

function formatPaymentReminder({
  studentName,
  parentPhone,
  groupName,
  amount,
  dueDate,
  overdueDays,
}) {
  const dateStr = new Date(dueDate).toLocaleDateString("uz-UZ");
  const text = `${studentName}ning to'lovi ${groupName} uchun ${amount} so'm. Muddat: ${dateStr}. Kechikdi: ${overdueDays} kun. Iltimos to'lang.`;
  return text.slice(0, 160);
}

function formatAttendanceAlert({
  studentName,
  parentPhone,
  date,
  groupName,
  status,
}) {
  const dateStr = new Date(date).toLocaleDateString("uz-UZ");
  let text = "";
  if (status === "ABSENT") {
    text = `${studentName} (${groupName}) ${dateStr} da darsga kelmadi. Iltimos xabardor bo'ling.`;
  } else if (status === "LATE") {
    text = `${studentName} (${groupName}) ${dateStr} da kechikdi. Iltimos kuzating.`;
  } else {
    text = `${studentName} (${groupName}) haqida xabardor: ${status}`;
  }

  return text.slice(0, 160);
}

async function sendPaymentReminder({
  studentName,
  parentPhone,
  groupName,
  amount,
  dueDate,
  overdueDays,
}) {
  if (!parentPhone) {
    logger.warn("No parentPhone for payment reminder", {
      studentName,
      groupName,
    });
    return null;
  }

  const message = formatPaymentReminder({
    studentName,
    parentPhone,
    groupName,
    amount,
    dueDate,
    overdueDays,
  });
  const result = await sendSms(parentPhone, message);
  logger.info("Payment reminder sent", {
    studentName,
    parentPhone,
    groupName,
    amount,
    overdueDays,
    result,
  });
  return result;
}

async function sendAttendanceAlert({
  studentName,
  parentPhone,
  date,
  groupName,
  status,
}) {
  if (!parentPhone) {
    logger.warn("No parentPhone for attendance alert", {
      studentName,
      groupName,
      status,
    });
    return null;
  }

  const message = formatAttendanceAlert({
    studentName,
    parentPhone,
    date,
    groupName,
    status,
  });
  const result = await sendSms(parentPhone, message);
  logger.info("Attendance alert sent", {
    studentName,
    parentPhone,
    groupName,
    status,
    result,
  });
  return result;
}

module.exports = {
  sendSms,
  sendPaymentReminder,
  sendAttendanceAlert,
};
