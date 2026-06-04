const { AppError } = require("../../utils/AppError");

async function createHomework() {
  throw new AppError(501, "NOT_IMPLEMENTED", "Homework moduli hali ulanmagan");
}

module.exports = {
  createHomework,
};
