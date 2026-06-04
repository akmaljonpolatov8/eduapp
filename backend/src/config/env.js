const dotenv = require("dotenv");
const { z } = require("zod");

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),
  PORT: z.coerce.number().int().positive().default(3000),
  APP_URL: z.string().url().default("http://localhost:3000"),
  DATABASE_URL: z.string().min(1),
  REDIS_URL: z.string().optional(),
  JWT_SECRET: z.string().min(32),
  JWT_EXPIRES_IN: z.string().default("1d"),
  REFRESH_TOKEN_SECRET: z.string().min(32),
  REFRESH_TOKEN_EXPIRES_IN: z.string().default("7d"),
  ANTHROPIC_API_KEY: z.string().optional(),
  AI_MODEL_HEAVY: z.string().default("claude-sonnet-4-20250514"),
  AI_MODEL_LIGHT: z.string().default("claude-haiku-4-5"),
  TEXTUP_API_KEY: z.string().optional(),
  TEXTUP_SENDER_NAME: z.string().default("EduCenter"),
  STORAGE_PROVIDER: z.enum(["s3", "cloudflare"]).default("s3"),
  AWS_ACCESS_KEY_ID: z.string().optional(),
  AWS_SECRET_ACCESS_KEY: z.string().optional(),
  AWS_REGION: z.string().default("us-east-1"),
  AWS_BUCKET_NAME: z.string().optional(),
  MAX_FILE_SIZE_MB: z.coerce.number().int().positive().default(10),
  AI_MONTHLY_LIMIT_STARTER: z.coerce.number().int().positive().default(500),
  AI_MONTHLY_LIMIT_PRO: z.coerce.number().int().positive().default(2000),
  AI_MONTHLY_LIMIT_ENTERPRISE: z.coerce
    .number()
    .int()
    .positive()
    .default(99999),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  const issues = parsed.error.issues
    .map((issue) => `${issue.path.join(".") || "env"}: ${issue.message}`)
    .join("\n");

  throw new Error(`Invalid environment variables:\n${issues}`);
}

const env = parsed.data;

module.exports = {
  env,
};
