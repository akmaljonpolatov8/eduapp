const { login, logout, refresh } = require("./auth.service");
const { sendSuccess } = require("../../utils/response");

async function loginController(req, res, next) {
  try {
    const result = await login(req.body);
    return sendSuccess(res, result);
  } catch (error) {
    return next(error);
  }
}

async function refreshController(req, res, next) {
  try {
    const result = await refresh(req.body.refreshToken);
    return sendSuccess(res, result);
  } catch (error) {
    return next(error);
  }
}

async function logoutController(req, res, next) {
  try {
    const result = await logout(req.body.refreshToken);
    return sendSuccess(res, result);
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  loginController,
  logoutController,
  refreshController,
};
