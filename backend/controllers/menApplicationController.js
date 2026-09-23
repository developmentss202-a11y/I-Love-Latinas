

const crypto = require("crypto");
const mongoose = require("mongoose");

const MenApplication =
  require("../models/MenApplication");

const SiteSettings =
  require("../models/SiteSettings");


/* =========================================
   HELPERS
========================================= */

function clean(value) {
  return String(value || "").trim();
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

  return {
    _id:
      application._id,

    memberName:
      application.memberName,

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

    subject:
      application.subject,

    message:
      application.message,

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

      const memberName =
        clean(
          req.body.memberName
        );

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
        !memberName ||
        !name ||
        !email ||
        !mobile ||
        !meetingDate ||
        !nightType ||
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
         TRACKING TOKEN
      ============================== */

      const publicToken =
        crypto
          .randomBytes(32)
          .toString("hex");


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

          name,

          email,

          mobile,

          meetingDate:
            parsedMeetingDate,

          nightType,

          subject,

          message,

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

        applications,
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
  getMenApplications,
  updateMenApplicationStatus,
};