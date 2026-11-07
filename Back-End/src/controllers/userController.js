const userService = require("../services/userService");

class UserController {
  async getUsers(req, res, next) {
    try {
      const result = await userService.listUsers(req.query);
      res.status(200).json({
        success: true,
        data: result.users,
        pagination: result.pagination,
      });
    } catch (error) {
      next(error);
    }
  }

  async getUserById(req, res, next) {
    try {
      const user = await userService.getUserById(req.params.id);
      res.status(200).json({
        success: true,
        data: user,
      });
    } catch (error) {
      next(error);
    }
  }

  async createUser(req, res, next) {
    try {
      const user = await userService.createUser(req.body);
      res.status(201).json({
        success: true,
        message: "User created successfully",
        data: user,
      });
    } catch (error) {
      next(error);
    }
  }

  async updateUser(req, res, next) {
    try {
      const user = await userService.updateUser(req.params.id, req.body);
      res.status(200).json({
        success: true,
        message: "User updated successfully",
        data: user,
      });
    } catch (error) {
      next(error);
    }
  }

  async updateUserStatus(req, res, next) {
    try {
      const user = await userService.updateUserStatus(req.params.id, req.body.status);
      res.status(200).json({
        success: true,
        message: `User status changed to ${req.body.status}`,
        data: user,
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new UserController();

