const express = require("express");
const adminAuth = require("../middleware/adminAuth");

const {
  getAdminProfile,
  updateAdminProfile,
} = require(
  "../controllers/adminProfileController"
);

const router = express.Router();

router.get(
  "/me",
  adminAuth,
  getAdminProfile
);

router.put(
  "/profile",
  adminAuth,
  updateAdminProfile
);

module.exports = router;
