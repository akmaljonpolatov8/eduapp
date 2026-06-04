const { sendSuccess } = require("../../utils/response");
const {
  assignTeacher,
  createGroup,
  listGroups,
  transferTeacher,
  updateGroup,
} = require("./groups.service");

async function createGroupController(req, res, next) {
  try {
    const result = await createGroup(req.user.centerId, req.body);
    return res.status(201).json({ success: true, data: result });
  } catch (error) {
    return next(error);
  }
}

async function listGroupsController(req, res, next) {
  try {
    const data = await listGroups(req.user.centerId);
    return sendSuccess(res, data);
  } catch (error) {
    return next(error);
  }
}

async function updateGroupController(req, res, next) {
  try {
    const result = await updateGroup(
      req.user.centerId,
      req.params.id,
      req.body,
    );
    return sendSuccess(res, result);
  } catch (error) {
    return next(error);
  }
}

async function assignTeacherController(req, res, next) {
  try {
    const result = await assignTeacher(
      req.user.centerId,
      req.params.id,
      req.body.teacherId,
    );
    return sendSuccess(res, result);
  } catch (error) {
    return next(error);
  }
}

async function transferTeacherController(req, res, next) {
  try {
    const result = await transferTeacher(
      req.user.centerId,
      req.params.id,
      req.body.teacherId,
      req.body.targetGroupId,
    );
    return sendSuccess(res, result);
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  assignTeacherController,
  createGroupController,
  listGroupsController,
  transferTeacherController,
  updateGroupController,
};
