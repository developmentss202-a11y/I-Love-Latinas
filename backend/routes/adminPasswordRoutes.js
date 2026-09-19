const express = require("express");
const adminAuth = require("../middleware/adminAuth");

const {
  changePassword,
  forgotPassword,
  verifyResetOtp,
  resetPassword,
} = require(
  "../controllers/adminPasswordController"
);

const router = express.Router();

router.put(
  "/change-password",
  adminAuth,
  changePassword
);

router.post(
  "/forgot-password",
  forgotPassword
);

router.post(
  "/verify-reset-otp",
  verifyResetOtp
);

router.post(
  "/reset-password",
  resetPassword
);

module.exports = router;
