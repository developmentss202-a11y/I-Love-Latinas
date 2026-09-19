const express =
  require("express");

const adminAuth =
  require("../middleware/adminAuth");

const {
  getPublicSettings,
  getAdminSettings,
  updateAdminSettings,
} =
  require("../controllers/settingsController");

const router =
  express.Router();


/* =========================================
   PUBLIC SETTINGS
   GET /api/settings
========================================= */

router.get(
  "/settings",
  getPublicSettings
);


/* =========================================
   ADMIN GET SETTINGS
   GET /api/admin/settings
========================================= */

router.get(
  "/admin/settings",
  adminAuth,
  getAdminSettings
);


/* =========================================
   ADMIN SAVE SETTINGS
   PUT /api/admin/settings
========================================= */

router.put(
  "/admin/settings",
  adminAuth,
  updateAdminSettings
);


module.exports = router;