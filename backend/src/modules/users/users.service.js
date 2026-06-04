const bcrypt = require('bcrypt');
const { prisma } = require('../../config/database');
const { AppError } = require('../../utils/AppError');

function selectUser() {
  return {
    id: true,
    centerId: true,
    name: true,
    phone: true,
    role: true,
    isActive: true,
    parentPhone: true,
    createdAt: true
  };
}

async function createUser(centerId, data) {
  const password = await bcrypt.hash(data.password, 10);

  return prisma.user.create({
    data: {
      centerId,
      name: data.name,
      phone: data.phone,
      password,
      role: data.role,
      parentPhone: data.parentPhone
    },
    select: selectUser()
  });
}

async function listUsers(centerId) {
  return prisma.user.findMany({
    where: { centerId },
    orderBy: { createdAt: 'desc' },
    select: selectUser()
  });
}

async function updateUser(centerId, userId, data) {
  const user = await prisma.user.findFirst({ where: { id: userId, centerId } });

  if (!user) {
    throw new AppError(404, 'NOT_FOUND', 'Foydalanuvchi topilmadi');
  }

  const updateData = {
    name: data.name,
    phone: data.phone,
    role: data.role,
    isActive: data.isActive,
    parentPhone: data.parentPhone
  };

  if (data.password) {
    updateData.password = await bcrypt.hash(data.password, 10);
  }

  Object.keys(updateData).forEach((key) => updateData[key] === undefined && delete updateData[key]);

  return prisma.user.update({
    where: { id: userId },
    data: updateData,
    select: selectUser()
  });
}

async function deleteUser(centerId, userId) {
  const user = await prisma.user.findFirst({ where: { id: userId, centerId } });

  if (!user) {
    throw new AppError(404, 'NOT_FOUND', 'Foydalanuvchi topilmadi');
  }

  return prisma.user.update({
    where: { id: userId },
    data: { isActive: false },
    select: selectUser()
  });
}

module.exports = {
  createUser,
  deleteUser,
  listUsers,
  updateUser
};