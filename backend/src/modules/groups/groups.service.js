const { prisma } = require("../../config/database");
const { AppError } = require("../../utils/AppError");

async function createGroup(centerId, data) {
  return prisma.group.create({
    data: {
      centerId,
      name: data.name,
      subject: data.subject,
      startTime: data.startTime,
      endTime: data.endTime,
      days: data.days,
      monthlyFee: data.monthlyFee,
    },
  });
}

async function listGroups(centerId) {
  return prisma.group.findMany({
    where: { centerId },
    orderBy: { createdAt: "desc" },
    include: {
      teachers: true,
      students: true,
    },
  });
}

async function updateGroup(centerId, groupId, data) {
  const group = await prisma.group.findFirst({
    where: { id: groupId, centerId },
  });

  if (!group) {
    throw new AppError(404, "NOT_FOUND", "Guruh topilmadi");
  }

  return prisma.group.update({
    where: { id: groupId },
    data: {
      name: data.name,
      subject: data.subject,
      startTime: data.startTime,
      endTime: data.endTime,
      days: data.days,
      monthlyFee: data.monthlyFee,
      isActive: data.isActive,
    },
  });
}

async function assignTeacher(centerId, groupId, teacherId) {
  const teacher = await prisma.user.findFirst({
    where: { id: teacherId, centerId, role: "TEACHER", isActive: true },
  });

  if (!teacher) {
    throw new AppError(404, "NOT_FOUND", "O'qituvchi topilmadi");
  }

  const group = await prisma.group.findFirst({
    where: { id: groupId, centerId },
  });

  if (!group) {
    throw new AppError(404, "NOT_FOUND", "Guruh topilmadi");
  }

  return prisma.groupTeacher.create({
    data: {
      groupId,
      teacherId,
    },
  });
}

async function transferTeacher(centerId, groupId, teacherId, targetGroupId) {
  const sourceGroup = await prisma.group.findFirst({
    where: { id: groupId, centerId },
  });
  const targetGroup = await prisma.group.findFirst({
    where: { id: targetGroupId, centerId },
  });

  if (!sourceGroup || !targetGroup) {
    throw new AppError(404, "NOT_FOUND", "Guruh topilmadi");
  }

  await prisma.groupTeacher.delete({
    where: {
      groupId_teacherId: {
        groupId,
        teacherId,
      },
    },
  });

  return prisma.groupTeacher.create({
    data: {
      groupId: targetGroupId,
      teacherId,
    },
  });
}

module.exports = {
  assignTeacher,
  createGroup,
  listGroups,
  transferTeacher,
  updateGroup,
};
