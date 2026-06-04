const express = require('express');
const { z } = require('zod');
const { validate } = require('../../middleware/validate');
const { authLimiter } = require('../../middleware/rateLimiter');
const { loginController, logoutController, refreshController } = require('./auth.controller');

const router = express.Router();

const loginSchema = z.object({
  phone: z.string().min(6),
  password: z.string().min(6)
});

const refreshSchema = z.object({
  refreshToken: z.string().min(1)
});

router.post('/login', authLimiter, validate(loginSchema), loginController);
router.post('/refresh', validate(refreshSchema), refreshController);
router.post('/logout', validate(refreshSchema), logoutController);

module.exports = router;