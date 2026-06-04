const jwt = require('jsonwebtoken');
const { prisma } = require('../config/database');
const { env } = require('../config/env');
const { AppError } = require('../utils/AppError');
const { isTokenBlacklisted } = require('../config/redis');

async function authenticate(req, _res, next) {
  try {
    const header = req.headers.authorization || '';
    const [scheme, token] = header.split(' ');

    if (scheme !== 'Bearer' || !token) {
      throw new AppError(401, 'UNAUTHORIZED', 'Token kerak');
    }

    if (await isTokenBlacklisted(token)) {
      throw new AppError(401, 'UNAUTHORIZED', 'Token bekor qilingan');
    }

    const payload = jwt.verify(token, env.JWT_SECRET);
    const user = await prisma.user.findUnique({
      where: { id: payload.sub },
      select: {
        id: true,
        centerId: true,
        name: true,
        phone: true,
        role: true,
        isActive: true,
        parentPhone: true,
        createdAt: true
      }
    });

    if (!user || !user.isActive) {
      throw new AppError(401, 'UNAUTHORIZED', 'Foydalanuvchi topilmadi');
    }

    req.user = user;
    return next();
  } catch (error) {
    return next(error instanceof AppError ? error : new AppError(401, 'UNAUTHORIZED', 'Token yaroqsiz'));
  }
}

function requireRole(...roles) {
  return (req, _res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return next(new AppError(403, 'FORBIDDEN', 'Ruxsat yo\'q'));
    }

    return next();
  };
}

module.exports = {
  authenticate,
  requireRole
};