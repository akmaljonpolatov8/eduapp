const express = require("express");
const { z } = require("zod");
const { authenticate, requireRole } = require("../../middleware/auth");
const { upload } = require("../../middleware/upload");
const { validate } = require("../../middleware/validate");
const {
  checkHomeworkController,
  generateTestController,
} = require("./ai.controller");

const router = express.Router();

const generateTestSchema = z.object({
  subject: z.string().min(1),
  topic: z.string().min(1),
  count: z.coerce.number().int().positive().default(5),
  difficulty: z.string().default("medium"),
  language: z.string().default("UZ"),
});

router.post(
  "/check-homework",
  authenticate,
  requireRole("STUDENT"),
  upload.single("file"),
  checkHomeworkController,
);
router.post(
  "/generate-test",
  authenticate,
  requireRole("TEACHER"),
  validate(generateTestSchema),
  generateTestController,
);

module.exports = router;
