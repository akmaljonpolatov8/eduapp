const { sendSuccess } = require('../../utils/response');
const { createUser, deleteUser, listUsers, updateUser } = require('./users.service');

async function createUserController(req, res, next) {
  try {
    const result = await createUser(req.user.centerId, req.body);
    return res.status(201).json({ success: true, data: result });
  } catch (error) {
    return next(error);
  }
}

async function listUsersController(req, res, next) {
  try {
    const data = await listUsers(req.user.centerId);
    return sendSuccess(res, data);
  } catch (error) {
    return next(error);
  }
}

async function updateUserController(req, res, next) {
  try {
    const result = await updateUser(req.user.centerId, req.params.id, req.body);
    return sendSuccess(res, result);
  } catch (error) {
    return next(error);
  }
}

async function deleteUserController(req, res, next) {
  try {
    const result = await deleteUser(req.user.centerId, req.params.id);
    return sendSuccess(res, result);
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  createUserController,
  deleteUserController,
  listUsersController,
  updateUserController
};