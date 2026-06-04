const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcrypt");

const prisma = new PrismaClient();

async function main() {
  await prisma.$transaction([
    prisma.groupTeacher.deleteMany(),
    prisma.groupStudent.deleteMany(),
    prisma.attendance.deleteMany(),
    prisma.submission.deleteMany(),
    prisma.homework.deleteMany(),
    prisma.payment.deleteMany(),
    prisma.aiUsage.deleteMany(),
    prisma.group.deleteMany(),
    prisma.user.deleteMany(),
    prisma.center.deleteMany(),
  ]);

  const center = await prisma.center.create({
    data: {
      name: "EduCenter Test",
      phone: "+998901234567",
      plan: "PRO",
    },
  });
  console.log("✅ Center created:", center);

  const manager = await prisma.user.create({
    data: {
      name: "Test Manager",
      phone: "+998901234567",
      password: await bcrypt.hash("admin123", 10),
      role: "MANAGER",
      centerId: center.id,
    },
  });
  console.log("✅ MANAGER user created:", manager);

  const teacher = await prisma.user.create({
    data: {
      name: "Test Teacher",
      phone: "+998901234568",
      password: await bcrypt.hash("teacher123", 10),
      role: "TEACHER",
      centerId: center.id,
    },
  });
  console.log("✅ TEACHER user created:", teacher);

  const student = await prisma.user.create({
    data: {
      name: "Test Student",
      phone: "+998901234569",
      password: await bcrypt.hash("student123", 10),
      role: "STUDENT",
      centerId: center.id,
      parentPhone: "+998901234560",
    },
  });
  console.log("✅ STUDENT user created:", student);

  const group = await prisma.group.create({
    data: {
      name: "Matematika 1-guruh",
      subject: "MATH",
      startTime: "09:00",
      endTime: "11:00",
      days: ["Monday", "Wednesday", "Friday"],
      monthlyFee: 500000,
      centerId: center.id,
    },
  });
  console.log("✅ Group created:", group);

  const groupTeacher = await prisma.groupTeacher.create({
    data: {
      groupId: group.id,
      teacherId: teacher.id,
    },
  });
  console.log("✅ GroupTeacher record created:", groupTeacher);

  const groupStudent = await prisma.groupStudent.create({
    data: {
      groupId: group.id,
      studentId: student.id,
    },
  });
  console.log("✅ GroupStudent record created:", groupStudent);
}

async function run() {
  try {
    await main();
  } catch (error) {
    console.error("❌ Seed failed:", error);
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
  }
}

run();
