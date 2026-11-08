const express = require("express");
const rateLimit = require("express-rate-limit");
const authController = require("../controllers/authController");
const { authenticate } = require("../middleware/authenticate");
const validateRequest = require("../middleware/validateRequest");
const { validateRegister, validateLogin } = require("../validators/authValidator");

const router = express.Router();

// Rate limiter for authentication endpoints: 100 requests per 15 minutes in dev/test, 20 in prod
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: process.env.NODE_ENV === "production" ? 20 : 200,
  message: {
    success: false,
    statusCode: 429,
    message: "Too many authentication attempts. Please try again after 15 minutes.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

router.post(
  "/register",
  authLimiter,
  validateRequest(validateRegister),
  authController.register
);

router.post(
  "/login",
  authLimiter,
  validateRequest(validateLogin),
  authController.login
);

// Backward-compatible alias for signup
router.post(
  "/signup",
  authLimiter,
  validateRequest(validateRegister),
  authController.register
);

router.get("/me", authenticate, authController.getCurrentUser);
router.patch("/me", authenticate, async (req, res, next) => {
  try {
    const updates = {};
    for (const key of ["name", "phone", "company"]) if (req.body[key] !== undefined) updates[key] = req.body[key];
    const user = await require("../services/userService").updateUser(req.user._id, updates);
    res.json({ success: true, user });
  } catch (error) { next(error); }
});
router.post("/logout", authController.logout);

module.exports = router;

