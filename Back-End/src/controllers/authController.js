const authService = require("../services/authService");

class AuthController {
  async register(req, res, next) {
    try {
      const result = await authService.register(req.body);
      res.status(201).json({
        success: true,
        message: "Registration successful",
        data: result,
        // Direct top-level fields for frontend compatibility
        token: result.token,
        user: result.user,
        name: result.name,
        roleId: result.roleId,
      });
    } catch (error) {
      next(error);
    }
  }

  async login(req, res, next) {
    try {
      const result = await authService.login(req.body);
      res.status(200).json({
        success: true,
        message: "Login successful",
        data: result,
        token: result.token,
        user: result.user,
        name: result.name,
        roleId: result.roleId,
      });
    } catch (error) {
      next(error);
    }
  }

  async getCurrentUser(req, res, next) {
    try {
      const result = await authService.getCurrentUser(req.user._id);
      res.status(200).json({
        success: true,
        data: result,
        user: result.user,
        name: result.name,
        roleId: result.roleId,
      });
    } catch (error) {
      next(error);
    }
  }

  async logout(req, res) {
    res.status(200).json({
      success: true,
      message: "Logged out successfully",
    });
  }
}

module.exports = new AuthController();

