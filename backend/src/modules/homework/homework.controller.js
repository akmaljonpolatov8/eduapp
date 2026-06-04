const { AppError } = require("../../utils/AppError");

async function createHomeworkController(_req, _res, next) {
  return next(
    new AppError(501, "NOT_IMPLEMENTED", "Homework route hali ulanmagan"),
  );
}

module.exports = {
  createHomeworkController,
};
