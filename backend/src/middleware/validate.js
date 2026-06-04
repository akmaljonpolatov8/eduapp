const { AppError } = require("../utils/AppError");

function validate(schema, source = "body") {
  return (req, _res, next) => {
    const parsed = schema.safeParse(req[source]);

    if (!parsed.success) {
      return next(
        new AppError(
          400,
          "BAD_REQUEST",
          "Invalid request data",
          parsed.error.flatten(),
        ),
      );
    }

    req[source] = parsed.data;
    return next();
  };
}

module.exports = {
  validate,
};
