

const crypto = require("crypto");
const mongoose = require("mongoose");

const MenApplication =
  require("../models/MenApplication");

const SiteSettings =
  require("../models/SiteSettings");

const LOOKING_FOR_VALUES = [
  "dating",
  "long-term",
  "marriage",
  "life-partner",
];

const LONG_TERM_MEMBER_COUNT = 3;
const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;


/* =========================================
   HELPERS
========================================= */

function clean(value) {
  return String(value || "").trim();
}


function slugifyName(name) {
  const base = String(name || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return base || "member";
}


function randomSlugSuffix(length = 6) {
  return crypto
    .randomBytes(Math.ceil(length / 2))
    .toString("hex")
    .slice(0, length);
}


function mobileDigits(value) {
  return String(value || "").replace(/\D/g, "");
}


async function createUniqueMenSlug(name) {
  const base = slugifyName(name);
  let candidate = `${base}-${randomSlugSuffix()}`;

  for (let attempt = 0; attempt < 12; attempt += 1) {
    const exists = await MenApplication.exists({ slug: candidate });
    if (!exists) {
      return candidate;
    }
    candidate = `${base}-${randomSlugSuffix()}`;
  }

  return `${base}-${Date.now().toString(36)}-${randomSlugSuffix(4)}`;
}


/*
  Same man = same email OR same phone digits.
  Reuse one shared slug so every booking shows on one profile.
*/
async function findMenByIdentity(email, mobile) {
  const normalizedEmail = clean(email).toLowerCase();
  const digits = mobileDigits(mobile);
  const or = [];

  if (normalizedEmail) {
    or.push({ email: normalizedEmail });
  }

  if (digits) {
    or.push({ mobileDigits: digits });
    or.push({ mobile: clean(mobile) });
  }

  if (!or.length) {
    return [];
  }

  return MenApplication.find({ $or: or })
    .sort({ createdAt: 1 })
    .lean();
}


async function resolveMenSlug(email, mobile, name) {
  const related = await findMenByIdentity(email, mobile);
  const existingSlug = related.find((item) => clean(item.slug))?.slug || "";
  const slug = existingSlug || (await createUniqueMenSlug(name));
  const digits = mobileDigits(mobile);

  if (related.length) {
    const ids = related.map((item) => item._id);
    const $set = { slug };

    if (digits) {
      $set.mobileDigits = digits;
    }

    await MenApplication.updateMany(
      { _id: { $in: ids } },
      { $set }
    );
  }

  return slug;
}


async function collectMenApplicationsForProfile(slug) {
  const seeded = await MenApplication.find({ slug }).lean();

  if (!seeded.length) {
    return [];
  }

  const emails = [
    ...new Set(
      seeded
        .map((item) => clean(item.email).toLowerCase())
        .filter(Boolean)
    ),
  ];

  const mobiles = [
    ...new Set(
      seeded
        .map((item) => clean(item.mobile))
        .filter(Boolean)
    ),
  ];

  const digitsList = [
    ...new Set(
      seeded
        .map((item) => item.mobileDigits || mobileDigits(item.mobile))
        .filter(Boolean)
    ),
  ];

  const or = [{ slug }];

  emails.forEach((email) => or.push({ email }));
  mobiles.forEach((mobile) => or.push({ mobile }));
  digitsList.forEach((digits) => or.push({ mobileDigits: digits }));

  const applications = await MenApplication.find({ $or: or })
    .sort({ meetingDate: 1, createdAt: -1 })
    .lean();

  const unique = [];
  const seen = new Set();

  applications.forEach((item) => {
    const id = String(item._id);
    if (seen.has(id)) return;
    seen.add(id);
    unique.push(item);
  });

  const idsNeedingSlug = unique
    .filter((item) => clean(item.slug) !== slug)
    .map((item) => item._id);

  if (idsNeedingSlug.length) {
    await MenApplication.updateMany(
      { _id: { $in: idsNeedingSlug } },
      { $set: { slug } }
    );
  }

  return unique.map((item) => ({ ...item, slug }));
}


function normalizeMemberNames(body) {
  if (Array.isArray(body.memberNames)) {
    return [
      ...new Set(
        body.memberNames
          .map((item) => clean(item))
          .filter(Boolean)
      ),
    ];
  }

  if (typeof body.memberNames === "string" && body.memberNames.trim()) {
    return [
      ...new Set(
        body.memberNames
          .split(",")
          .map((item) => clean(item))
          .filter(Boolean)
      ),
    ];
  }

  const single = clean(body.memberName);
  return single ? [single] : [];
}


function lookingForLabel(value) {
  const map = {
    dating: "Serious dating",
    "long-term": "Long-term relationship",
    marriage: "Marriage-minded",
    "life-partner": "Life partner",
  };
  return map[value] || value || "";
}


async function getSiteSettings() {
  let settings =
    await SiteSettings.findOne({
      key: "main",
    });

  if (!settings) {
    settings =
      await SiteSettings.create({
        key: "main",
      });
  }

  return settings;
}


function publicApplication(application) {
  if (!application) {
    return null;
  }

  const memberNames = Array.isArray(application.memberNames) && application.memberNames.length
    ? application.memberNames
    : application.memberName
      ? [application.memberName]
      : [];

  return {
    _id:
      application._id,

    memberName:
      application.memberName,

    memberNames,

    name:
      application.name,

    email:
      application.email,

    mobile:
      application.mobile,

    meetingDate:
      application.meetingDate,

    nightType:
      application.nightType,

    lookingFor:
      application.lookingFor || "",

    lookingForLabel:
      lookingForLabel(application.lookingFor),

    subject:
      application.subject,

    message:
      application.message,

    slug:
      application.slug || "",

    status:
      application.status,

    rejectReason:
      application.rejectReason ||
      "",

    createdAt:
      application.createdAt,

    updatedAt:
      application.updatedAt,
  };
}


/* =========================================
   CREATE MEN APPLICATION
   PUBLIC

   SETTINGS USED:
   - maintenanceMode
   - registrationOpen
   - menRegistrationOpen
   - applicationManagement
   - approvalMode
========================================= */

const createMenApplication =
  async (req, res) => {
    try {

      /* ==============================
         LOAD WEBSITE SETTINGS
      ============================== */

      const settings =
        await getSiteSettings();


      /* ==============================
         MAINTENANCE MODE
      ============================== */

      if (
        settings.maintenanceMode ===
        true
      ) {
        return res
          .status(503)
          .json({
            success: false,

            message:
              "Website is currently under maintenance. Please try again later.",
          });
      }


      /* ==============================
         GLOBAL REGISTRATION
      ============================== */

      if (
        settings.registrationOpen ===
        false
      ) {
        return res
          .status(403)
          .json({
            success: false,

            message:
              "Registration is currently closed.",
          });
      }


      /* ==============================
         MEN REGISTRATION
      ============================== */

      if (
        settings.menRegistrationOpen ===
        false
      ) {
        return res
          .status(403)
          .json({
            success: false,

            message:
              "Men registration is currently closed.",
          });
      }


      /* ==============================
         APPLICATION MANAGEMENT
      ============================== */

      if (
        settings.applicationManagement ===
        false
      ) {
        return res
          .status(403)
          .json({
            success: false,

            message:
              "Application submission is currently disabled.",
          });
      }


      /* ==============================
         FORM DATA
      ============================== */

      const memberNames =
        normalizeMemberNames(req.body);

      const memberName =
        memberNames.join(", ");

      const name =
        clean(
          req.body.name
        );

      const email =
        clean(
          req.body.email
        ).toLowerCase();

      const mobile =
        clean(
          req.body.mobile
        );

      const meetingDate =
        clean(
          req.body.meetingDate
        );

      const nightType =
        clean(
          req.body.nightType
        );

      const lookingFor =
        clean(
          req.body.lookingFor
        );

      const subject =
        clean(
          req.body.subject
        );

      const message =
        clean(
          req.body.message
        );


      /* ==============================
         REQUIRED VALIDATION
      ============================== */

      if (
        !memberNames.length ||
        !name ||
        !email ||
        !mobile ||
        !meetingDate ||
        !nightType ||
        !lookingFor ||
        !subject ||
        !message
      ) {
        return res
          .status(400)
          .json({
            success: false,

            message:
              "Please fill all required fields",
          });
      }


      if (
        !LOOKING_FOR_VALUES.includes(
          lookingFor
        )
      ) {
        return res
          .status(400)
          .json({
            success: false,

            message:
              "Please select what you are looking for",
          });
      }


      if (
        lookingFor === "long-term" &&
        memberNames.length !== LONG_TERM_MEMBER_COUNT
      ) {
        return res
          .status(400)
          .json({
            success: false,

            message:
              `For long-term relationship, please select exactly ${LONG_TERM_MEMBER_COUNT} profiles`,
          });
      }


      if (
        lookingFor !== "long-term" &&
        memberNames.length !== 1
      ) {
        return res
          .status(400)
          .json({
            success: false,

            message:
              "Please select one profile",
          });
      }


      /* ==============================
         DATE VALIDATION
      ============================== */

      const parsedMeetingDate =
        new Date(
          meetingDate
        );


      if (
        Number.isNaN(
          parsedMeetingDate
            .getTime()
        )
      ) {
        return res
          .status(400)
          .json({
            success: false,

            message:
              "Please select a valid date and time",
          });
      }


      /* ==============================
         TRACKING TOKEN + SLUG
      ============================== */

      const publicToken =
        crypto
          .randomBytes(32)
          .toString("hex");

      const digits =
        mobileDigits(mobile);

      const slug =
        await resolveMenSlug(
          email,
          mobile,
          name
        );


      /* ==============================
         APPROVAL MODE

         manual = pending
         auto   = approved
      ============================== */

      const initialStatus =
        settings.approvalMode ===
        "auto"
          ? "approved"
          : "pending";


      /* ==============================
         SAVE TO MONGODB
      ============================== */

      const application =
        await MenApplication.create({
          memberName,

          memberNames,

          name,

          email,

          mobile,

          mobileDigits:
            digits ||
            undefined,

          meetingDate:
            parsedMeetingDate,

          nightType,

          lookingFor,

          subject,

          message,

          slug,

          status:
            initialStatus,

          rejectReason:
            "",

          publicToken,
        });


      /* ==============================
         RESPONSE
      ============================== */

      return res
        .status(201)
        .json({
          success: true,

          message:
            initialStatus ===
            "approved"
              ? "Application submitted and approved successfully"
              : "Application submitted successfully",

          applicationId:
            application._id,

          slug:
            application.slug,

          trackingToken:
            publicToken,

          status:
            application.status,

          application:
            publicApplication(
              application
            ),
        });

    } catch (error) {

      console.error(
        "CREATE MEN APPLICATION ERROR:",
        error
      );


      return res
        .status(500)
        .json({
          success: false,

          message:
            error.message ||
            "Unable to submit application",
        });
    }
  };


/* =========================================
   PUBLIC STATUS CHECK

   USER SIDE:
   pending
   approved
   rejected
========================================= */

const getMenApplicationStatus =
  async (req, res) => {
    try {

      const {
        id,
      } =
        req.params;


      const token =
        clean(
          req.query.token
        );


      if (
        !mongoose.Types
          .ObjectId
          .isValid(id) ||
        !token
      ) {
        return res
          .status(400)
          .json({
            success: false,

            message:
              "Invalid application request",
          });
      }


      const application =
        await MenApplication
          .findOne({
            _id: id,

            publicToken:
              token,
          });


      if (!application) {
        return res
          .status(404)
          .json({
            success: false,

            message:
              "Application not found",
          });
      }


      return res.json({
        success: true,

        status:
          application.status,

        rejectReason:
          application.rejectReason ||
          "",

        application:
          publicApplication(
            application
          ),
      });

    } catch (error) {

      console.error(
        "GET MEN STATUS ERROR:",
        error
      );


      return res
        .status(500)
        .json({
          success: false,

          message:
            "Unable to check application status",
        });
    }
  };


/* =========================================
   PUBLIC MEN PROFILE BY SLUG
   Returns every booking entry for that man.
========================================= */

const getMenApplicationsBySlug =
  async (req, res) => {
    try {
      const slug = clean(req.params.slug).toLowerCase();

      if (!slug || !SLUG_PATTERN.test(slug)) {
        return res.status(400).json({
          success: false,
          message: "Invalid profile link",
        });
      }

      const applications =
        await collectMenApplicationsForProfile(slug);

      if (!applications.length) {
        return res.status(404).json({
          success: false,
          message: "Profile not found",
        });
      }

      const newest = [...applications].sort(
        (a, b) =>
          new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
      )[0];

      return res.json({
        success: true,
        slug,
        man: {
          slug,
          name: newest.name,
          email: newest.email,
          mobile: newest.mobile,
          entryCount: applications.length,
        },
        applications: applications.map(publicApplication),
      });
    } catch (error) {
      console.error("GET MEN BY SLUG ERROR:", error);

      return res.status(500).json({
        success: false,
        message: "Unable to load profile",
      });
    }
  };


/* =========================================
   GET ALL MEN APPLICATIONS
   ADMIN ONLY
========================================= */

const getMenApplications =
  async (req, res) => {
    try {

      const applications =
        await MenApplication
          .find()
          .sort({
            createdAt: -1,
          });


      return res.json({
        success: true,

        count:
          applications.length,

        applications:
          applications.map(
            publicApplication
          ),
      });

    } catch (error) {

      console.error(
        "GET MEN APPLICATIONS ERROR:",
        error
      );


      return res
        .status(500)
        .json({
          success: false,

          message:
            "Unable to load men applications",
        });
    }
  };


/* =========================================
   UPDATE MEN STATUS
   ADMIN ONLY
========================================= */

const updateMenApplicationStatus =
  async (req, res) => {
    try {

      /* ==============================
         LOAD SETTINGS
      ============================== */

      const settings =
        await getSiteSettings();


      /*
        Application Management OFF
        hone par approve/reject bhi
        disable rahega.
      */

      if (
        settings.applicationManagement ===
        false
      ) {
        return res
          .status(403)
          .json({
            success: false,

            message:
              "Application management is currently disabled.",
          });
      }


      const status =
        clean(
          req.body.status
        ).toLowerCase();


      const reason =
        clean(
          req.body.reason
        );


      /* ==============================
         STATUS VALIDATION
      ============================== */

      if (
        ![
          "pending",
          "approved",
          "rejected",
          "contacted",
          "duplicate",
        ].includes(
          status
        )
      ) {
        return res
          .status(400)
          .json({
            success: false,

            message:
              "Invalid status",
          });
      }


      /* ==============================
         REJECTION REASON
      ============================== */

      if (
        status ===
          "rejected" &&
        !reason
      ) {
        return res
          .status(400)
          .json({
            success: false,

            message:
              "Rejection reason is required",
          });
      }


      /* ==============================
         FIND APPLICATION
      ============================== */

      const application =
        await MenApplication
          .findById(
            req.params.id
          );


      if (!application) {
        return res
          .status(404)
          .json({
            success: false,

            message:
              "Application not found",
          });
      }


      /* ==============================
         UPDATE STATUS
      ============================== */

      application.status =
        status;


      application.rejectReason =
        status ===
        "rejected"
          ? reason
          : "";


      await application.save();


      /* ==============================
         RESPONSE
      ============================== */

      return res.json({
        success: true,

        message:
          status ===
          "contacted"

            ? "Application marked as contacted"

            : status ===
              "duplicate"

              ? "Application moved to duplicates"

            : status ===
              "approved"

              ? "Application approved successfully"

              : status ===
                "rejected"

                ? "Application rejected successfully"

                : "Application moved to pending successfully",

        application:
          publicApplication(
            application
          ),
      });

    } catch (error) {

      console.error(
        "MEN STATUS UPDATE ERROR:",
        error
      );


      return res
        .status(500)
        .json({
          success: false,

          message:
            "Unable to update application status",
        });
    }
  };


/* =========================================
   EXPORTS
========================================= */

module.exports = {
  createMenApplication,
  getMenApplicationStatus,
  getMenApplicationsBySlug,
  getMenApplications,
  updateMenApplicationStatus,
};