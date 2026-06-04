const { AppError } = require("../../utils/AppError");
const { env } = require("../../config/env");
const { prisma } = require("../../config/database");
const Anthropic = require("@anthropic-ai/sdk");

const anthropic = new Anthropic({ apiKey: env.ANTHROPIC_API_KEY });

function monthString(date = new Date()) {
  return date.toISOString().slice(0, 7); // YYYY-MM
}

async function ensureAiCredit(centerId) {
  const month = monthString();
  const usage = await prisma.aiUsage.findUnique({
    where: { centerId_month: { centerId, month } },
  });

  if (usage && usage.used >= usage.limit) {
    throw new AppError(403, "AI_LIMIT_EXCEEDED", "AI kredit limitga yetdi");
  }

  return usage;
}

async function incrementAiUsage(centerId) {
  const month = monthString();

  const center = await prisma.center.findUnique({ where: { id: centerId } });
  if (!center) throw new AppError(404, "NOT_FOUND", "Center topilmadi");

  // determine plan limit from env
  let limit = env.AI_MONTHLY_LIMIT_STARTER;
  if (center.plan === "PRO") limit = env.AI_MONTHLY_LIMIT_PRO;
  if (center.plan === "ENTERPRISE") limit = env.AI_MONTHLY_LIMIT_ENTERPRISE;

  // upsert usage record
  const where = { centerId_month: { centerId, month } };
  const existing = await prisma.aiUsage.findUnique({ where });

  if (existing) {
    return prisma.aiUsage.update({
      where,
      data: { used: { increment: 1 } },
    });
  }

  return prisma.aiUsage.create({
    data: { centerId, month, used: 1, limit },
  });
}

async function checkHomework({
  imageBase64,
  subject,
  topic,
  description,
  language,
  centerId,
}) {
  if (!env.ANTHROPIC_API_KEY) {
    throw new AppError(
      500,
      "AI_NOT_CONFIGURED",
      "Anthropic API key sozlanmagan",
    );
  }

  if (!imageBase64) {
    throw new AppError(400, "BAD_REQUEST", "Image kerak");
  }

  await ensureAiCredit(centerId);

  const systemPrompt = `Siz o'qituvchi ekspert sifatida talabaning uy vazifasini tekshirasiz. Javob JSON formatida quyidagi kalitlar bilan qaytishi kerak: { score, grade, subject_detected, summary, correct_parts, errors, teacher_note, improvement_suggestions, next_topics_to_study }. Agar mumkin bo'lsa numeric score 0-100 va grade A/B/C/D/F bo'lsin.`;

  const userContent = [
    {
      type: "image",
      source: { type: "base64", media_type: "image/jpeg", data: imageBase64 },
    },
    {
      type: "text",
      text: `Fan: ${subject}\nMavzu: ${topic}\nVazifa: ${description}\nTil: ${language}`,
    },
  ];

  try {
    const response = await anthropic.messages.create({
      model: env.AI_MODEL_HEAVY || "claude-sonnet-4-20250514",
      max_tokens: 2000,
      system: systemPrompt,
      messages: [{ role: "user", content: userContent }],
    });

    // response.content may be array; adapt to expected shape
    const text =
      Array.isArray(response.content) &&
      response.content[0] &&
      response.content[0].text
        ? response.content[0].text
        : response?.content?.text || response?.text || "";

    let parsed;
    try {
      parsed = JSON.parse(text);
    } catch (err) {
      throw new AppError(502, "AI_RESPONSE_ERROR", "AI javobi JSON emas");
    }

    // increment usage
    await incrementAiUsage(centerId);

    return {
      score: parsed.score,
      grade: parsed.grade,
      subject_detected: parsed.subject_detected,
      summary: parsed.summary,
      correct_parts: parsed.correct_parts || [],
      errors: parsed.errors || [],
      teacher_note: parsed.teacher_note || "",
      improvement_suggestions: parsed.improvement_suggestions || [],
      next_topics_to_study: parsed.next_topics_to_study || [],
    };
  } catch (err) {
    if (err instanceof AppError) throw err;
    throw new AppError(502, "AI_REQUEST_FAILED", err.message || String(err));
  }
}

async function generateTest({
  subject,
  topic,
  count = 5,
  difficulty = "medium",
  language = "UZ",
}) {
  if (!env.ANTHROPIC_API_KEY) {
    throw new AppError(
      500,
      "AI_NOT_CONFIGURED",
      "Anthropic API key sozlanmagan",
    );
  }

  const prompt = `Iltimos quyidagi formatda JSON qaytaring: { test_title: string, questions: [{ question_number: number, type: 'mcq'|'open', question: string, options: string[], correct_answer: string, explanation: string, points: number }], total_points: number, answer_key: object }\n\nMavzu: ${topic}\nFan: ${subject}\nSavollar soni: ${count}\nQiyinchilik: ${difficulty}\nTil: ${language}`;

  try {
    const response = await anthropic.messages.create({
      model: env.AI_MODEL_LIGHT || "claude-haiku-4-5-20251001",
      max_tokens: 3000,
      messages: [{ role: "user", content: prompt }],
    });

    const text =
      Array.isArray(response.content) &&
      response.content[0] &&
      response.content[0].text
        ? response.content[0].text
        : response?.content?.text || response?.text || "";

    let parsed;
    try {
      parsed = JSON.parse(text);
    } catch (err) {
      throw new AppError(502, "AI_RESPONSE_ERROR", "AI javobi JSON emas");
    }

    return parsed;
  } catch (err) {
    if (err instanceof AppError) throw err;
    throw new AppError(502, "AI_REQUEST_FAILED", err.message || String(err));
  }
}

module.exports = {
  checkHomework,
  generateTest,
};
