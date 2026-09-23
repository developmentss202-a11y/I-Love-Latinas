



const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const fs = require("fs");

const Application = require("../models/Application");
const User = require("../models/User");
const SiteSettings = require("../models/SiteSettings");


/* =========================
   SETTINGS
========================= */

async function getOrCreateSettings() {
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


/* =========================
   UPLOADED FILE HELPERS
========================= */

function getUploadedFiles(req) {
  if (!req?.files) {
    return [];
  }

  return Object.values(
    req.files
  )
    .flat()
    .filter(Boolean);
}


async function cleanupUploadedFiles(
  req
) {
  const files =
    getUploadedFiles(req);

  await Promise.all(
    files.map(
      async (file) => {
        if (!file?.path) {
          return;
        }

        try {
          await fs.promises.unlink(
            file.path
          );
        } catch {
          // Ignore missing file
        }
      }
    )
  );
}


function hasUploadedMedia(req) {
  return (
    getUploadedFiles(req)
      .length > 0
  );
}


const PRIVATE_APPLICATION_FIELDS = [
];


function sanitizePublicApplication(application) {
  const plain = application?.toObject
    ? application.toObject()
    : { ...(application || {}) };

  PRIVATE_APPLICATION_FIELDS.forEach((field) => {
    delete plain[field];
  });

  return plain;
}


/* =========================
   SLUG
========================= */

function slugifyName(name) {
  const base =
    String(name || "")
      .normalize("NFD")
      .replace(
        /[\u0300-\u036f]/g,
        ""
      )
      .toLowerCase()
      .trim()
      .replace(
        /[^a-z0-9]+/g,
        "-"
      )
      .replace(
        /^-+|-+$/g,
        ""
      );

  return base || "member";
}


function randomSlugSuffix(
  length = 6
) {
  return crypto
    .randomBytes(
      Math.ceil(
        length / 2
      )
    )
    .toString("hex")
    .slice(
      0,
      length
    );
}


async function createUniqueSlug(
  firstName,
  preferredSlug
) {
  const base =
    slugifyName(
      firstName
    );

  const preferred =
    slugifyName(
      preferredSlug || ""
    );

  const preferredHasUniqueTail =
    preferred.startsWith(
      `${base}-`
    ) &&
    preferred.length >
      base.length + 1;

  let candidate =
    preferredHasUniqueTail
      ? preferred
      : `${base}-${randomSlugSuffix()}`;

  for (
    let attempt = 0;
    attempt < 12;
    attempt += 1
  ) {
    const exists =
      await Application.exists({
        slug: candidate,
      });

    if (!exists) {
      return candidate;
    }

    candidate =
      `${base}-${randomSlugSuffix()}`;
  }

  return (
    `${base}-` +
    `${Date.now().toString(36)}-` +
    `${randomSlugSuffix(4)}`
  );
}


function isDuplicateSlugError(
  error
) {
  return (
    error?.code === 11000 &&
    (
      error?.keyPattern?.slug ||
      String(
        error?.message ||
        ""
      ).includes("slug")
    )
  );
}


/* =========================
   GENDER NORMALIZE
========================= */

function normalizeGender(
  value
) {
  const gender =
    String(value || "")
      .trim()
      .toLowerCase();

  if (
    [
      "male",
      "man",
      "men",
      "m",
    ].includes(gender)
  ) {
    return "male";
  }

  if (
    [
      "female",
      "woman",
      "women",
      "f",
    ].includes(gender)
  ) {
    return "female";
  }

  return "";
}


/* =========================
   APPROVE HELPER
========================= */

async function approveApplicationRecord(
  application
) {
  if (
    !application.slug
  ) {
    application.slug =
      await createUniqueSlug(
        application.firstName
      );
  }


  let member =
    await User.findOne({
      applicationId:
        application._id,
    });


  if (!member) {
    const internalEmail =
      `application-${
        application._id
          .toString()
      }@application.local`;


    const randomPassword =
      crypto
        .randomBytes(32)
        .toString("hex");


    const hashedPassword =
      await bcrypt.hash(
        randomPassword,
        10
      );


    member =
      await User.create({
        name:
          application.firstName ||
          "Member",

        email:
          internalEmail,

        password:
          hashedPassword,

        location:
          application
            .countryOfResidence ||
          "",

        status:
          "active",

        role:
          "user",

        applicationId:
          application._id,

        approvedAt:
          new Date(),
      });
  }


  application.status =
    "approved";


  await application.save();


  const fullMember =
    await User
      .findById(
        member._id
      )
      .select(
        "-password"
      )
      .populate({
        path:
          "applicationId",

        select:
          "-__v",
      });


  return fullMember;
}


/* =========================
   CREATE APPLICATION
========================= */

const createApplication =
  async (req, res) => {
    try {

      /* =====================
         LOAD SETTINGS
      ===================== */

      const settings =
        await getOrCreateSettings();


      /* =====================
         MAINTENANCE MODE
      ===================== */

      if (
        settings
          .maintenanceMode ===
        true
      ) {
        await cleanupUploadedFiles(
          req
        );

        return res
          .status(503)
          .json({
            success: false,

            message:
              "Website is currently under maintenance. Please try again later.",
          });
      }


      /* =====================
         APPLICATION MANAGEMENT
      ===================== */

      if (
        settings
          .applicationManagement ===
        false
      ) {
        await cleanupUploadedFiles(
          req
        );

        return res
          .status(403)
          .json({
            success: false,

            message:
              "Application submission is currently disabled.",
          });
      }


      /* =====================
         REGISTRATION
      ===================== */

      if (
        settings
          .registrationOpen ===
        false
      ) {
        await cleanupUploadedFiles(
          req
        );

        return res
          .status(403)
          .json({
            success: false,

            message:
              "Registration is currently closed.",
          });
      }


      console.log(
        "TEXT DATA:",
        req.body
      );

      console.log(
        "FILES:",
        req.files
      );


      /* =====================
         GENDER
      ===================== */

      const normalizedGender =
        normalizeGender(
          req.body?.gender
        );


      if (
        !normalizedGender
      ) {
        await cleanupUploadedFiles(
          req
        );

        return res
          .status(400)
          .json({
            success: false,

            message:
              "Please select Male or Female",
          });
      }


      const phone =
        String(req.body?.phone || "")
          .trim();

      const email =
        String(req.body?.email || "")
          .trim()
          .toLowerCase();

      const emailPattern =
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      if (!phone || phone.length < 7) {
        await cleanupUploadedFiles(req);

        return res.status(400).json({
          success: false,
          message: "Please enter a valid phone number.",
        });
      }

      if (!email || !emailPattern.test(email)) {
        await cleanupUploadedFiles(req);

        return res.status(400).json({
          success: false,
          message: "Please enter a valid email address.",
        });
      }


      /* =====================
         WOMEN REGISTRATION
      ===================== */

      if (
        normalizedGender ===
          "female" &&
        settings
          .womenRegistrationOpen ===
          false
      ) {
        await cleanupUploadedFiles(
          req
        );

        return res
          .status(403)
          .json({
            success: false,

            message:
              "Women registration is currently closed.",
          });
      }


      /* =====================
         MEN REGISTRATION
      ===================== */

      if (
        normalizedGender ===
          "male" &&
        settings
          .menRegistrationOpen ===
          false
      ) {
        await cleanupUploadedFiles(
          req
        );

        return res
          .status(403)
          .json({
            success: false,

            message:
              "Men registration is currently closed.",
          });
      }


      /* =====================
         AGE SETTINGS
      ===================== */

      const minimumAge =
        Number(
          settings.minimumAge
        );

      const maximumAge =
        Number(
          settings.maximumAge
        );

      const age =
        Number(
          req.body?.age
        );


      if (
        !Number.isFinite(
          age
        )
      ) {
        await cleanupUploadedFiles(
          req
        );

        return res
          .status(400)
          .json({
            success: false,

            message:
              "Please enter a valid age.",
          });
      }


      if (
        age <
        minimumAge
      ) {
        await cleanupUploadedFiles(
          req
        );

        return res
          .status(400)
          .json({
            success: false,

            message:
              `Minimum age is ${minimumAge} years.`,
          });
      }


      if (
        age >
        maximumAge
      ) {
        await cleanupUploadedFiles(
          req
        );

        return res
          .status(400)
          .json({
            success: false,

            message:
              `Maximum age is ${maximumAge} years.`,
          });
      }


      /* =====================
         MEDIA UPLOAD SETTING
      ===================== */

      if (
        settings
          .mediaUploads ===
          false &&
        hasUploadedMedia(req)
      ) {
        await cleanupUploadedFiles(
          req
        );

        return res
          .status(403)
          .json({
            success: false,

            message:
              "Media uploads are currently disabled.",
          });
      }


      /* =====================
         PHOTOS
      ===================== */

      const photos =
        req.files
          ?.photos
          ?.map(
            (file) =>
              `/uploads/${file.filename}`
          ) ||
        [];


      /* =====================
         VOICE
      ===================== */

      let voiceRecording =
        "";


      if (
        req.files
          ?.voiceRecording
          ?.[0]
      ) {
        voiceRecording =
          `/uploads/${
            req.files
              .voiceRecording[0]
              .filename
          }`;
      }


      /* =====================
         VIDEO
      ===================== */

      let videoRecording =
        "";


      if (
        req.files
          ?.videoRecording
          ?.[0]
      ) {
        videoRecording =
          `/uploads/${
            req.files
              .videoRecording[0]
              .filename
          }`;
      }


      /* =====================
         PAYLOAD
      ===================== */

      const payload = {
        ...req.body,

        age,

        gender:
          normalizedGender,

        phone,

        email,

        photos,

        voiceRecording,

        videoRecording,

        status:
          "pending",
      };


      console.log(
        "FINAL APPLICATION PAYLOAD:",
        {
          firstName:
            payload.firstName,

          age:
            payload.age,

          gender:
            payload.gender,

          countryOfBirth:
            payload
              .countryOfBirth,

          countryOfResidence:
            payload
              .countryOfResidence,

          status:
            payload.status,

          slug:
            payload.slug,
        }
      );


      /* =====================
         CREATE APPLICATION
      ===================== */

      let application;

      let lastError;


      for (
        let attempt = 0;
        attempt < 5;
        attempt += 1
      ) {
        try {

          payload.slug =
            await createUniqueSlug(
              payload.firstName,

              attempt === 0
                ? req.body.slug
                : ""
            );


          application =
            await Application.create(
              payload
            );


          lastError =
            null;


          break;

        } catch (error) {

          lastError =
            error;


          if (
            !isDuplicateSlugError(
              error
            )
          ) {
            throw error;
          }
        }
      }


      if (
        !application
      ) {
        throw (
          lastError ||
          new Error(
            "Failed to create a unique slug"
          )
        );
      }


      /* =====================
         AUTO APPROVAL
      ===================== */

      let member =
        null;


      if (
        settings
          .approvalMode ===
        "auto"
      ) {
        member =
          await approveApplicationRecord(
            application
          );
      }


      /* =====================
         SUCCESS
      ===================== */

      return res
        .status(201)
        .json({
          success: true,

          message:
            application.status ===
            "approved"
              ? "Application submitted and approved successfully"
              : "Application submitted successfully",

          application,

          ...(member
            ? {
                member,
              }
            : {}),
        });

    } catch (error) {

      console.error(
        "Application error:",
        error
      );


      return res
        .status(400)
        .json({
          success: false,

          message:
            error.message ||
            "Failed to submit application",

          error:
            error.message,
        });
    }
  };


/* =========================
   GET APPLICATIONS
========================= */

const getApplications =
  async (req, res) => {
    try {

      const applications =
        await Application
          .find({})
          .sort({
            createdAt:
              -1,
          });


      return res.json({
        success: true,

        applications,
      });

    } catch (error) {

      console.error(
        "GET APPLICATIONS ERROR:",
        error
      );


      return res
        .status(500)
        .json({
          success: false,

          message:
            "Applications load failed",
        });
    }
  };


/* =========================
   GET SINGLE APPLICATION
========================= */

const getSingleApplication =
  async (req, res) => {
    try {

      const application =
        await Application
          .findById(
            req.params.id
          );


      if (
        !application
      ) {
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

        application,
      });

    } catch (error) {

      console.error(
        "GET APPLICATION ERROR:",
        error
      );


      return res
        .status(500)
        .json({
          success: false,

          message:
            "Application details load failed",
        });
    }
  };


/* =========================
   APPLICATION STATUS
========================= */

const getApplicationStatus =
  async (req, res) => {
    try {

      const id =
        req.params.id;


      if (
        !id ||
        !/^[a-fA-F0-9]{24}$/.test(
          id
        )
      ) {
        return res
          .status(404)
          .json({
            success: false,

            message:
              "Application not found",
          });
      }


      const application =
        await Application
          .findById(
            id
          )
          .select(
            "_id firstName slug status photos"
          );


      if (
        !application
      ) {
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

        application,
      });

    } catch (error) {

      console.error(
        "APPLICATION STATUS ERROR:",
        error
      );


      return res
        .status(500)
        .json({
          success: false,

          message:
            "Application details load failed",
        });
    }
  };


/* =========================
   APPROVED APPLICATIONS (public)
   Used by homepage cards + SHE IS dropdown
========================= */

const getApprovedApplications =
  async (req, res) => {
    try {
      const applications =
        await Application
          .find({
            status: "approved",
          })
          .sort({
            createdAt: -1,
          })
          .select(
            "firstName slug age photos profession countryOfResidence countryOfBirth relationshipDesired visionStatement personalityType"
          )
          .lean();

      return res.json({
        success: true,
        applications,
      });
    } catch (error) {
      console.error(
        "GET APPROVED APPLICATIONS ERROR:",
        error
      );

      return res
        .status(500)
        .json({
          success: false,
          message:
            "Approved applications load failed",
        });
    }
  };


/* =========================
   APPLICATION BY SLUG
   Unique profile URL for the woman form.
========================= */

const getApplicationBySlug =
  async (req, res) => {
    try {
      const slug =
        String(
          req.params.slug ||
          ""
        )
          .trim()
          .toLowerCase();

      if (
        !slug ||
        !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(
          slug
        )
      ) {
        return res
          .status(404)
          .json({
            success: false,
            message:
              "Application not found",
          });
      }

      const application =
        await Application
          .findOne({
            slug,
          })
          .lean();

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
        application,
      });
    } catch (error) {
      console.error(
        "APPLICATION SLUG ERROR:",
        error
      );

      return res
        .status(500)
        .json({
          success: false,
          message:
            "Application details load failed",
        });
    }
  };


/* =========================
   APPROVE APPLICATION
========================= */

const approveApplication =
  async (req, res) => {
    try {

      const settings =
        await getOrCreateSettings();


      if (
        settings
          .applicationManagement ===
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


      const application =
        await Application
          .findById(
            req.params.id
          );


      if (
        !application
      ) {
        return res
          .status(404)
          .json({
            success: false,

            message:
              "Application not found",
          });
      }


      if (
        application.status !==
        "pending"
      ) {
        return res
          .status(400)
          .json({
            success: false,

            message:
              `Application is already ${application.status}`,
          });
      }


      const fullMember =
        await approveApplicationRecord(
          application
        );


      return res.json({
        success: true,

        message:
          "Application approved and member created successfully",

        member:
          fullMember,
      });

    } catch (error) {

      console.error(
        "APPROVE ERROR:",
        error
      );


      return res
        .status(500)
        .json({
          success: false,

          message:
            "Application approval failed",

          error:
            error.message,
        });
    }
  };


/* =========================
   REJECT APPLICATION
========================= */

const rejectApplication =
  async (req, res) => {
    try {

      const settings =
        await getOrCreateSettings();


      if (
        settings
          .applicationManagement ===
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


      const application =
        await Application
          .findById(
            req.params.id
          );


      if (
        !application
      ) {
        return res
          .status(404)
          .json({
            success: false,

            message:
              "Application not found",
          });
      }


      if (
        application.status !==
        "pending"
      ) {
        return res
          .status(400)
          .json({
            success: false,

            message:
              `Application is already ${application.status}`,
          });
      }


      if (
        !application.slug
      ) {
        application.slug =
          await createUniqueSlug(
            application.firstName
          );
      }


      application.status =
        "rejected";


      const reason =
        String(
          req.body?.reason ||
          ""
        ).trim();


      if (
        application.schema
          .path(
            "rejectionReason"
          )
      ) {
        application
          .rejectionReason =
          reason;
      }


      if (
        application.schema
          .path(
            "rejectReason"
          )
      ) {
        application
          .rejectReason =
          reason;
      }


      await application.save();


      return res.json({
        success: true,

        message:
          "Application rejected successfully",
      });

    } catch (error) {

      console.error(
        "REJECT ERROR:",
        error
      );


      return res
        .status(500)
        .json({
          success: false,

          message:
            "Application rejection failed",

          error:
            error.message,
        });
    }
  };


/* =========================
   EXPORTS
========================= */

module.exports = {
  createApplication,
  getApplications,
  getApprovedApplications,
  getSingleApplication,
  getApplicationStatus,
  getApplicationBySlug,
  approveApplication,
  rejectApplication,
};