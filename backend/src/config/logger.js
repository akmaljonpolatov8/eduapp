const winston = require("winston");
const { env } = require("./env");

const logger = winston.createLogger({
  level: env.NODE_ENV === "production" ? "info" : "debug",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.printf(({ timestamp, level, message, stack, ...meta }) => {
      const details =
        Object.keys(meta).length > 0 ? ` ${JSON.stringify(meta)}` : "";
      const errorStack = stack ? `\n${stack}` : "";
      return `${timestamp} [${level}] ${message}${details}${errorStack}`;
    }),
  ),
  transports: [new winston.transports.Console()],
});

module.exports = {
  logger,
};
