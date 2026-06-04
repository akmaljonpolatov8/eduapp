const request = require("supertest");

jest.mock("../../../config/database", () => ({
  prisma: {
    user: {
      create: jest.fn(),
      findMany: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
    },
  },
}));

// keep actual auth.requireRole but mock authenticate to inject test user
jest.mock("../../../middleware/auth", () => {
  const actual = jest.requireActual("../../../middleware/auth");
  return {
    ...actual,
    authenticate: (req, _res, next) => {
      // test will set global.__TEST_USER__ before request
      req.user = global.__TEST_USER__ || null;
      return next();
    },
  };
});

jest.mock("bcrypt", () => ({
  hash: jest.fn().mockResolvedValue("hashedpw"),
}));

const { prisma } = require("../../../config/database");
const app = require("../../../app");

describe("Users API", () => {
  afterEach(() => {
    jest.resetAllMocks();
    delete global.__TEST_USER__;
  });

  test("POST /api/users - MANAGER creates TEACHER -> 201", async () => {
    global.__TEST_USER__ = {
      id: "mgr-1",
      role: "MANAGER",
      centerId: "center-1",
    };

    const created = {
      id: "u-1",
      centerId: "center-1",
      name: "Teacher",
      phone: "+998901111111",
      role: "TEACHER",
      isActive: true,
    };
    prisma.user.create.mockResolvedValue(created);

    const res = await request(app)
      .post("/api/users")
      .send({
        name: "Teacher",
        phone: "+998901111111",
        password: "secret1",
        role: "TEACHER",
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toMatchObject({
      id: created.id,
      phone: created.phone,
    });
  });

  test("POST /api/users - TEACHER tries to create user -> 403", async () => {
    global.__TEST_USER__ = { id: "t-1", role: "TEACHER", centerId: "center-1" };

    const res = await request(app)
      .post("/api/users")
      .send({
        name: "Student1",
        phone: "+998902222222",
        password: "pw",
        role: "STUDENT",
      });

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe("FORBIDDEN");
  });

  test("GET /api/users - returns list", async () => {
    global.__TEST_USER__ = {
      id: "mgr-1",
      role: "MANAGER",
      centerId: "center-1",
    };

    const list = [
      {
        id: "u1",
        name: "A",
        phone: "+998901",
        role: "TEACHER",
        isActive: true,
      },
      {
        id: "u2",
        name: "B",
        phone: "+998902",
        role: "STUDENT",
        isActive: true,
      },
    ];

    prisma.user.findMany.mockResolvedValue(list);

    const res = await request(app).get("/api/users");
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data).toHaveLength(2);
  });
});
