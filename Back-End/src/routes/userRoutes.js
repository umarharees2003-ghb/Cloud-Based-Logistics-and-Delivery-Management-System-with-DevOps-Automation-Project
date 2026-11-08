const express = require("express");
const userController = require("../controllers/userController");
const { authenticate } = require("../middleware/authenticate");
const authorize = require("../middleware/authorize");
const validateRequest = require("../middleware/validateRequest");
const {
  validateCreateUser,
  validateUpdateUser,
} = require("../validators/userValidator");

const router = express.Router();

// All user management routes require admin authentication
router.use(authenticate);
router.use(authorize("administrator"));

router.get("/", userController.getUsers);
router.get("/:id", userController.getUserById);
router.post("/", validateRequest(validateCreateUser), userController.createUser);
router.patch("/:id", validateRequest(validateUpdateUser), userController.updateUser);
router.patch("/:id/status", userController.updateUserStatus);

module.exports = router;

