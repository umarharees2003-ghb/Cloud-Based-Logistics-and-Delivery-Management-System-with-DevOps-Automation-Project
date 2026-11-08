const User = require("../models/User");
const ApiError = require("../utils/ApiError");
const { generateToken } = require("../utils/generateToken");
const notificationService = require("./notificationService");
const logger = require("../config/logger");

class AuthService {
  /**
   * Register a new user
   * @param {Object} data - { name, email, password, role, phone, company }
   * @returns {Promise<{ user: Object, token: string }>}
   */
  async register(data) {
    const email = String(data.email).trim().toLowerCase();
    const name = String(data.name || data.fullName).trim();
    const roleInput = String(data.role || data.roleId || "customer").trim();

    // Enforce role security: public register can only create customer or merchant
    let finalRole = "customer";
    if (roleInput === "merchant") {
      finalRole = "merchant";
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw ApiError.conflict(`Email '${email}' is already registered.`);
    }

    const user = await User.create({
      name,
      email,
      password: data.password,
      role: finalRole,
      phone: data.phone || "",
      company: data.company || "",
      status: "active",
    });

    const token = generateToken(user);
    logger.info("New user registered: %s (%s, role: %s)", user.name, user.email, user.role);

    // Create welcome notification
    await notificationService.createNotification({
      recipient: user._id,
      title: "Welcome to Routeflow",
      message: `Welcome ${user.name}! Your ${user.role} workspace is ready.`,
      type: "system",
    });

    const safeUser = user.toSafeObject();
    return {
      user: safeUser,
      token,
      // Top-level aliases for direct frontend compatibility
      name: safeUser.name,
      email: safeUser.email,
      roleId: safeUser.roleId,
    };
  }

  /**
   * Log in user
   * @param {Object} credentials - { email, password, roleId }
   * @returns {Promise<{ user: Object, token: string }>}
   */
  async login({ email, password, roleId }) {
    const cleanEmail = String(email || "").trim().toLowerCase();
    if (!cleanEmail || !password) {
      throw ApiError.badRequest("Email and password are required.");
    }

    const user = await User.findOne({ email: cleanEmail }).select("+password");
    if (!user) {
      throw ApiError.unauthorized("Invalid email or password.");
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      throw ApiError.unauthorized("Invalid email or password.");
    }

    if (user.status !== "active") {
      throw ApiError.forbidden("Account is inactive or suspended. Please contact an administrator.");
    }

    if (roleId && roleId !== user.role) throw ApiError.forbidden("Selected role does not match your account.");

    const token = generateToken(user);
    logger.info("User logged in: %s (%s)", user.name, user.role);

    const safeUser = user.toSafeObject();
    return {
      user: safeUser,
      token,
      name: safeUser.name,
      email: safeUser.email,
      roleId: safeUser.roleId,
    };
  }

  /**
   * Get current authenticated user profile
   */
  async getCurrentUser(userId) {
    const user = await User.findById(userId);
    if (!user) {
      throw ApiError.notFound("User not found.");
    }
    const safeUser = user.toSafeObject();
    return {
      user: safeUser,
      name: safeUser.name,
      email: safeUser.email,
      roleId: safeUser.roleId,
    };
  }
}

module.exports = new AuthService();

