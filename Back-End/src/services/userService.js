const User = require("../models/User");
const ApiError = require("../utils/ApiError");

class UserService {
  /**
   * List users with optional role/status filter and search
   */
  async listUsers({ role, status, search, limit = 50, page = 1 } = {}) {
    const filter = {};
    if (role) filter.role = role;
    if (status) filter.status = status;
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);
    const [users, total] = await Promise.all([
      User.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit, 10)),
      User.countDocuments(filter),
    ]);

    return {
      users: users.map((u) => u.toSafeObject()),
      pagination: {
        total,
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
        pages: Math.ceil(total / limit) || 1,
      },
    };
  }

  /**
   * Get user by ID
   */
  async getUserById(userId) {
    const user = await User.findById(userId);
    if (!user) {
      throw ApiError.notFound("User not found");
    }
    return user.toSafeObject();
  }

  /**
   * Admin creation of users (including privileged roles)
   */
  async createUser(data) {
    const email = String(data.email).trim().toLowerCase();
    const existing = await User.findOne({ email });
    if (existing) {
      throw ApiError.conflict(`User with email '${email}' already exists.`);
    }

    const user = await User.create({
      name: String(data.name).trim(),
      email,
      password: data.password,
      role: data.role || "customer",
      phone: data.phone || "",
      company: data.company || "",
      status: data.status || "active",
    });

    return user.toSafeObject();
  }

  /**
   * Update user details
   */
  async updateUser(userId, updates) {
    const allowed = ["name", "phone", "company", "role", "status"];
    const payload = {};
    for (const key of allowed) {
      if (updates[key] !== undefined) {
        payload[key] = updates[key];
      }
    }

    if (updates.email) {
      const email = String(updates.email).trim().toLowerCase();
      const existing = await User.findOne({ email, _id: { $ne: userId } });
      if (existing) {
        throw ApiError.conflict(`Email '${email}' is already taken.`);
      }
      payload.email = email;
    }

    const user = await User.findByIdAndUpdate(userId, payload, {
      new: true,
      runValidators: true,
    });

    if (!user) {
      throw ApiError.notFound("User not found");
    }

    return user.toSafeObject();
  }

  /**
   * Update user status (active/inactive/suspended)
   */
  async updateUserStatus(userId, status) {
    if (!["active", "inactive", "suspended"].includes(status)) {
      throw ApiError.badRequest("Invalid status value");
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { status },
      { new: true, runValidators: true }
    );

    if (!user) {
      throw ApiError.notFound("User not found");
    }

    return user.toSafeObject();
  }
}

module.exports = new UserService();

