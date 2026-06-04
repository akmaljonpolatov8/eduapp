const crypto = require("crypto");
const multer = require("multer");
const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
const { env } = require("../config/env");
const { AppError } = require("../utils/AppError");

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: env.MAX_FILE_SIZE_MB * 1024 * 1024,
  },
});

let s3Client = null;

function getS3Client() {
  if (
    !env.AWS_ACCESS_KEY_ID ||
    !env.AWS_SECRET_ACCESS_KEY ||
    !env.AWS_BUCKET_NAME
  ) {
    throw new AppError(500, "STORAGE_NOT_CONFIGURED", "S3 sozlanmagan");
  }

  if (!s3Client) {
    s3Client = new S3Client({
      region: env.AWS_REGION,
      credentials: {
        accessKeyId: env.AWS_ACCESS_KEY_ID,
        secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
      },
    });
  }

  return s3Client;
}

async function uploadToS3(file, folder = "uploads") {
  const client = getS3Client();
  const extension = file.originalname.split(".").pop() || "bin";
  const key = `${folder}/${crypto.randomUUID()}.${extension}`;

  await client.send(
    new PutObjectCommand({
      Bucket: env.AWS_BUCKET_NAME,
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype,
    }),
  );

  return `https://${env.AWS_BUCKET_NAME}.s3.${env.AWS_REGION}.amazonaws.com/${key}`;
}

module.exports = {
  upload,
  uploadToS3,
};
