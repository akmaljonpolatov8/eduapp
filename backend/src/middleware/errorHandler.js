const { Prisma } = require("@prisma/client");
const { ZodError } = require("zod");
const { AppError } = require("../utils/AppError");
const { logger } = require("../config/logger");

function errorHandler(error, _req, res, _next) {
  let statusCode = 500;
  let code = "INTERNAL_ERROR";
  let message = "Kutilmagan xato";
  let details;

  if (error instanceof AppError) {
    statusCode = error.statusCode;
    code = error.code;
    message = error.message;
    details = error.details;
  } else if (error instanceof ZodError) {
    statusCode = 400;
    code = "BAD_REQUEST";
    message = "Validatsiya xatosi";
    details = error.flatten();
  } else if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === "P2002") {
      statusCode = 409;
      code = "CONFLICT";
      message = "Dublikat ma'lumot";
    } else if (error.code === "P2025") {
      statusCode = 404;
      code = "NOT_FOUND";
      message = "Ma'lumot topilmadi";
    }
    details = { prismaCode: error.code };
  }

  logger.error(error.message, {
    stack: error.stack,
    code,
    statusCode,
    details,
  });

  return res.status(statusCode).json({
    success: false,
    error: {
      code,
      message,
      ...(details ? { details } : {}),
    },
  });
}

module.exports = {
  errorHandler,
};
