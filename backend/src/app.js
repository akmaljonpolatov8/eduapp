const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const { env } = require("./config/env");
const { apiLimiter } = require("./middleware/rateLimiter");
const { errorHandler } = require("./middleware/errorHandler");
const { AppError } = require("./utils/AppError");
const authRoutes = require("./modules/auth/auth.routes");
const usersRoutes = require("./modules/users/users.routes");
const groupsRoutes = require("./modules/groups/groups.routes");
const aiRoutes = require("./modules/ai/ai.routes");
const { logger } = require("./config/logger");

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(apiLimiter);

app.get("/health", (_req, res) => {
  res.json({ success: true, data: { status: "ok" } });
});

app.use("/api/auth", authRoutes);
app.use("/api/users", usersRoutes);
app.use("/api/groups", groupsRoutes);
app.use("/api/ai", aiRoutes);

app.use((_req, _res, next) => {
  next(new AppError(404, "NOT_FOUND", "Route topilmadi"));
});

app.use(errorHandler);

if (require.main === module) {
  app.listen(env.PORT, () => {
    logger.info(`EduCenter backend running on port ${env.PORT}`);
  });
}

module.exports = app;
