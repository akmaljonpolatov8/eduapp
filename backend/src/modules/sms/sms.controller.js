const { AppError } = require("../../utils/AppError");

async function sendSmsController(_req, _res, next) {
  return next(new AppError(501, "NOT_IMPLEMENTED", "SMS route hali ulanmagan"));
}

module.exports = {
  sendSmsController,
};
