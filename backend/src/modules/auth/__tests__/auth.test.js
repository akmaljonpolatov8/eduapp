const request = require("supertest");

jest.mock("../../../config/database", () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
  },
}));

jest.mock("../../../config/redis", () => ({
  blacklistToken: jest.fn(),
  isTokenBlacklisted: jest.fn().mockResolvedValue(false),
}));

jest.mock("../../../utils/jwt", () => ({
  signAccessToken: jest.fn().mockReturnValue("access-token"),
  signRefreshToken: jest.fn().mockReturnValue("refresh-token"),
  verifyRefreshToken: jest.fn().mockImplementation((t) => ({ sub: "user-1" })),
}));

jest.mock("bcrypt", () => ({
  compare: jest.fn(),
}));

jest.mock("jsonwebtoken", () => ({
  decode: jest.fn(),
}));

const { prisma } = require("../../../config/database");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { blacklistToken } = require("../../../config/redis");

const app = require("../../../app");

describe("Auth API", () => {
  const testUser = {
    id: "user-1",
    centerId: "center-1",
    name: "Test User",
    phone: "+998901234567",
    password: "hashed-password",
    role: "STUDENT",
    isActive: true,
    parentPhone: null,
  };

  beforeAll(() => {
    prisma.user.findUnique.mockResolvedValue(testUser);
  });

  afterAll(() => {
    jest.resetAllMocks();
  });

  test("POST /api/auth/login - success", async () => {
    bcrypt.compare.mockResolvedValue(true);

    const res = await request(app)
      .post("/api/auth/login")
      .send({ phone: testUser.phone, password: "secretpw" });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty("accessToken", "access-token");
    expect(res.body.data).toHaveProperty("refreshToken", "refresh-token");
    expect(res.body.data.user).toMatchObject({
      id: testUser.id,
      phone: testUser.phone,
    });
  });

  test("POST /api/auth/login - wrong password", async () => {
    bcrypt.compare.mockResolvedValue(false);

    const res = await request(app)
      .post("/api/auth/login")
      .send({ phone: testUser.phone, password: "badpw1" });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe("UNAUTHORIZED");
  });

  test("POST /api/auth/login - missing fields", async () => {
    const res = await request(app).post("/api/auth/login").send({});
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe("BAD_REQUEST");
  });

  test("POST /api/auth/refresh - success", async () => {
    // mock isTokenBlacklisted already false via redis mock
    const res = await request(app)
      .post("/api/auth/refresh")
      .send({ refreshToken: "refresh-token" });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty("accessToken", "access-token");
  });

  test("POST /api/auth/logout - blacklists token", async () => {
    jwt.decode.mockReturnValue({ exp: Math.floor(Date.now() / 1000) + 3600 });

    const res = await request(app)
      .post("/api/auth/logout")
      .send({ refreshToken: "refresh-token" });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty("loggedOut", true);
    expect(blacklistToken).toHaveBeenCalledWith(
      "refresh-token",
      expect.any(Number),
    );
  });
});
