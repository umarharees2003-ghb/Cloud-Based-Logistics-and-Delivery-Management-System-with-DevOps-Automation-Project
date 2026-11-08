const request = require("supertest");
const app = require("../src/app");
const User = require("../src/models/User");
const Notification = require("../src/models/Notification");
const { generateToken } = require("../src/utils/generateToken");

describe("Notifications API", () => {
  let userA;
  let tokenA;
  let userB;
  let tokenB;

  beforeEach(async () => {
    userA = await User.create({
      name: "User A",
      email: "userA@example.com",
      password: "Password123!",
      role: "customer",
    });
    tokenA = generateToken(userA);

    userB = await User.create({
      name: "User B",
      email: "userB@example.com",
      password: "Password123!",
      role: "customer",
    });
    tokenB = generateToken(userB);

    await Notification.create([
      {
        recipient: userA._id,
        title: "Order Dispatched",
        message: "Your package is on the way.",
        type: "status_updated",
        isRead: false,
      },
      {
        recipient: userA._id,
        title: "Welcome",
        message: "Welcome to Routeflow.",
        type: "system",
        isRead: true,
      },
      {
        recipient: userB._id,
        title: "Private Notification",
        message: "Secret note for User B.",
        type: "system",
        isRead: false,
      },
    ]);
  });

  describe("GET /api/notifications", () => {
    it("should return only notifications for the authenticated user", async () => {
      const res = await request(app)
        .get("/api/notifications")
        .set("Authorization", `Bearer ${tokenA}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.length).toBe(2);
      expect(res.body.unreadCount).toBe(1);
    });

    it("should filter for unread notifications when unreadOnly=true", async () => {
      const res = await request(app)
        .get("/api/notifications?unreadOnly=true")
        .set("Authorization", `Bearer ${tokenA}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.data.length).toBe(1);
      expect(res.body.data[0].title).toBe("Order Dispatched");
    });
  });

  describe("PATCH /api/notifications/:id/read", () => {
    it("should mark a single notification as read", async () => {
      const unread = await Notification.findOne({ recipient: userA._id, isRead: false });

      const res = await request(app)
        .patch(`/api/notifications/${unread._id}/read`)
        .set("Authorization", `Bearer ${tokenA}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.data.isRead).toBe(true);

      const check = await Notification.findById(unread._id);
      expect(check.isRead).toBe(true);
    });
  });

  describe("PATCH /api/notifications/read-all", () => {
    it("should mark all user notifications as read", async () => {
      const res = await request(app)
        .patch("/api/notifications/read-all")
        .set("Authorization", `Bearer ${tokenA}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);

      const unreadCount = await Notification.countDocuments({
        recipient: userA._id,
        isRead: false,
      });
      expect(unreadCount).toBe(0);
    });
  });
});

