const express = require('express');
const { z } = require('zod');
const { authenticate, requireRole } = require('../../middleware/auth');
const { validate } = require('../../middleware/validate');
const {
  assignTeacherController,
  createGroupController,
  listGroupsController,
  transferTeacherController,
  updateGroupController
} = require('./groups.controller');

const router = express.Router();

const groupSchema = z.object({
  name: z.string().min(2),
  subject: z.enum(['MATH', 'PHYSICS', 'CHEMISTRY', 'ENGLISH', 'RUSSIAN', 'OTHER']),
  startTime: z.string().min(1),
  endTime: z.string().min(1),
  days: z.array(z.string().min(1)).min(1),
  monthlyFee: z.number().nonnegative()
});

const updateGroupSchema = groupSchema.partial().extend({
  isActive: z.boolean().optional()
});

const assignTeacherSchema = z.object({
  teacherId: z.string().min(1)
});

const transferTeacherSchema = z.object({
  teacherId: z.string().min(1),
  targetGroupId: z.string().min(1)
});

router.use(authenticate, requireRole('MANAGER'));
router.post('/', validate(groupSchema), createGroupController);
router.get('/', listGroupsController);
router.put('/:id', validate(updateGroupSchema), updateGroupController);
router.post('/:id/assign-teacher', validate(assignTeacherSchema), assignTeacherController);
router.post('/:id/transfer-teacher', validate(transferTeacherSchema), transferTeacherController);

module.exports = router;