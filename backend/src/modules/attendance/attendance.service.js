const { AppError } = require("../../utils/AppError");

async function markAttendance() {
  throw new AppError(
    501,
    "NOT_IMPLEMENTED",
    "Attendance moduli hali ulanmagan",
  );
}

module.exports = {
  markAttendance,
};
