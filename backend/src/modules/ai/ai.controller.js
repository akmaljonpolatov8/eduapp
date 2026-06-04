const { AppError } = require("../../utils/AppError");
const { asyncHandler } = require("../../utils/asyncHandler");
const aiService = require("./ai.service");
const { sendSuccess } = require("../../utils/response");

const checkHomeworkController = asyncHandler(async (req, res, next) => {
  const file = req.file;
  if (!file) return next(new AppError(400, "BAD_REQUEST", "File kerak"));

  const imageBase64 = file.buffer.toString("base64");
  const { subject, topic, description, language } = req.body;

  const result = await aiService.checkHomework({
    imageBase64,
    subject,
    topic,
    description,
    language,
    centerId: req.user.centerId,
  });

  return sendSuccess(res, result);
});

const generateTestController = asyncHandler(async (req, res) => {
  const { subject, topic, count, difficulty, language } = req.body;

  const result = await aiService.generateTest({
    subject,
    topic,
    count,
    difficulty,
    language,
  });

  return sendSuccess(res, result);
});

module.exports = {
  checkHomeworkController,
  generateTestController,
};
