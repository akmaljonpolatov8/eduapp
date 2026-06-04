const express = require("express");
const { z } = require("zod");
const { authenticate, requireRole } = require("../../middleware/auth");
const { validate } = require("../../middleware/validate");
const {
  createUserController,
  deleteUserController,
  listUsersController,
  updateUserController,
} = require("./users.controller");

const router = express.Router();

const createUserSchema = z.object({
  name: z.string().min(2),
  phone: z.string().min(6),
  password: z.string().min(6),
  role: z.enum(["TEACHER", "STUDENT"]),
  parentPhone: z.string().optional(),
});

const updateUserSchema = createUserSchema.partial().extend({
  isActive: z.boolean().optional(),
});

router.use(authenticate, requireRole("MANAGER"));
router.post("/", validate(createUserSchema), createUserController);
router.get("/", listUsersController);
router.put("/:id", validate(updateUserSchema), updateUserController);
router.delete("/:id", deleteUserController);

module.exports = router;
