

const express = require("express");

const adminAuth =
  require("../middleware/adminAuth");

const {
  createMenApplication,
  getMenApplicationStatus,
  getMenApplicationsBySlug,
  getMenApplications,
  updateMenApplicationStatus,
} = require(
  "../controllers/menApplicationController"
);

const router = express.Router();


/* =========================================
   PUBLIC MEN ROUTES
========================================= */

// Men form submit
router.post(
  "/men-applications",
  createMenApplication
);

// Public booking profile by shared man slug
router.get(
  "/men-applications/by-slug/:slug",
  getMenApplicationsBySlug
);

// User checks pending / approved / rejected
router.get(
  "/men-applications/:id/status",
  getMenApplicationStatus
);


/* =========================================
   ADMIN MEN ROUTES
========================================= */

// Admin Men Applications list
router.get(
  "/admin/men-applications",
  adminAuth,
  getMenApplications
);

// Admin approve / reject
router.patch(
  "/admin/men-applications/:id/status",
  adminAuth,
  updateMenApplicationStatus
);


module.exports = router;
