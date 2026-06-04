const { AppError } = require("../../utils/AppError");

async function markAttendanceController(_req, _res, next) {
  return next(
    new AppError(501, "NOT_IMPLEMENTED", "Attendance route hali ulanmagan"),
  );
}

module.exports = {
  markAttendanceController,
};
