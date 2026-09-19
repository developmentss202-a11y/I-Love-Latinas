
const express = require("express");

const adminAuth =
  require("../middleware/adminAuth");

const {
  getAllUsers,
  updateUserStatus,
} =
  require("../controllers/adminUserController");

const router = express.Router();


/* =========================================
   GET ALL USERS
========================================= */

router.get(
  "/users",
  adminAuth,
  getAllUsers
);


/* =========================================
   BLOCK / UNBLOCK USER
========================================= */

router.patch(
  "/users/:id/status",
  adminAuth,
  updateUserStatus
);


module.exports = router;