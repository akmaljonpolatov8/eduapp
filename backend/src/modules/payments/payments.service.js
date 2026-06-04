const { AppError } = require("../../utils/AppError");

async function listPayments() {
  throw new AppError(501, "NOT_IMPLEMENTED", "Payments moduli hali ulanmagan");
}

module.exports = {
  listPayments,
};
