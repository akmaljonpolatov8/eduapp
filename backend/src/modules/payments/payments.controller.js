const { AppError } = require("../../utils/AppError");

async function listPaymentsController(_req, _res, next) {
  return next(
    new AppError(501, "NOT_IMPLEMENTED", "Payments route hali ulanmagan"),
  );
}

module.exports = {
  listPaymentsController,
};
