const express = require("express");
const adminAuth = require("../middleware/adminAuth");

const {
  getDashboard,
} = require(
  "../controllers/adminDashboardController"
);

const router = express.Router();

router.get( 
  "/dashboard",
  adminAuth,
  getDashboard
);

module.exports = router;
