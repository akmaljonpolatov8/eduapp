const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { prisma } = require('../../config/database');
const { AppError } = require('../../utils/AppError');
const { blacklistToken, isTokenBlacklisted } = require('../../config/redis');
const { signAccessToken, signRefreshToken, verifyRefreshToken } = require('../../utils/jwt');

function sanitizeUser(user) {
  return {
    id: user.id,
    centerId: user.centerId,
    name: user.name,
    phone: user.phone,
    role: user.role,
    isActive: user.isActive,
    parentPhone: user.parentPhone,
    createdAt: user.createdAt
  };
}

function buildTokenPayload(user) {
  return {
    sub: user.id,
    centerId: user.centerId,
    role: user.role,
    phone: user.phone
  };
}

async function login({ phone, password }) {
  const user = await prisma.user.findUnique({ where: { phone } });

  if (!user || !user.isActive) {
    throw new AppError(401, 'UNAUTHORIZED', 'Telefon yoki parol noto\'g\'ri');
  }

  const isValidPassword = await bcrypt.compare(password, user.password);

  if (!isValidPassword) {
    throw new AppError(401, 'UNAUTHORIZED', 'Telefon yoki parol noto\'g\'ri');
  }

  const payload = buildTokenPayload(user);
  const accessToken = signAccessToken(payload);
  const refreshToken = signRefreshToken(payload);

  return {
    accessToken,
    refreshToken,
    user: sanitizeUser(user)
  };
}

async function refresh(refreshToken) {
  if (!refreshToken) {
    throw new AppError(400, 'BAD_REQUEST', 'Refresh token kerak');
  }

  if (await isTokenBlacklisted(refreshToken)) {
    throw new AppError(401, 'UNAUTHORIZED', 'Token bekor qilingan');
  }

  let payload;

  try {
    payload = verifyRefreshToken(refreshToken);
  } catch {
    throw new AppError(401, 'UNAUTHORIZED', 'Refresh token yaroqsiz');
  }

  const user = await prisma.user.findUnique({
    where: { id: payload.sub }
  });

  if (!user || !user.isActive) {
    throw new AppError(401, 'UNAUTHORIZED', 'Foydalanuvchi topilmadi');
  }

  return {
    accessToken: signAccessToken(buildTokenPayload(user))
  };
}

async function logout(refreshToken) {
  if (!refreshToken) {
    throw new AppError(400, 'BAD_REQUEST', 'Refresh token kerak');
  }

  const decoded = jwt.decode(refreshToken);

  if (!decoded || typeof decoded !== 'object' || !decoded.exp) {
    throw new AppError(400, 'BAD_REQUEST', 'Refresh token yaroqsiz');
  }

  const ttlSeconds = Math.max(1, decoded.exp - Math.floor(Date.now() / 1000));
  await blacklistToken(refreshToken, ttlSeconds);

  return { loggedOut: true };
}

module.exports = {
  login,
  logout,
  refresh,
  sanitizeUser
};