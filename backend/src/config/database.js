const { PrismaClient } = require("@prisma/client");
const { env } = require("./env");
const { logger } = require("./logger");

const globalForPrisma = global;

const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });

if (env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

prisma.$on("error", (event) => {
  logger.error("Prisma error", event);
});

module.exports = {
  prisma,
};
