







const SiteSettings =
  require("../models/SiteSettings");


/* =========================================
   GET OR CREATE SETTINGS
========================================= */

const getOrCreateSettings =
  async () => {

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
  };


/* =========================================
   PUBLIC SETTINGS
   GET /api/settings
========================================= */

const getPublicSettings =
  async (req, res) => {

    try {

      const settings =
        await getOrCreateSettings();


      return res.json({
        success: true,

        settings: {

          websiteName:
            settings.websiteName,

          supportEmail:
            settings.supportEmail,

          registrationOpen:
            settings.registrationOpen,

          menRegistrationOpen:
            settings
              .menRegistrationOpen,

          womenRegistrationOpen:
            settings
              .womenRegistrationOpen,

          minimumAge:
            settings.minimumAge,

          maximumAge:
            settings.maximumAge,

          applicationManagement:
            settings
              .applicationManagement,

          approvalMode:
            settings.approvalMode,

          mediaUploads:
            settings.mediaUploads,

          maintenanceMode:
            settings.maintenanceMode,
        },
      });

    } catch (error) {

      console.error(
        "GET PUBLIC SETTINGS ERROR:",
        error
      );


      return res
        .status(500)
        .json({
          success: false,

          message:
            "Unable to load settings",

          error:
            error.message,
        });
    }
  };


/* =========================================
   ADMIN GET SETTINGS
   GET /api/admin/settings
========================================= */

const getAdminSettings =
  async (req, res) => {

    try {

      const settings =
        await getOrCreateSettings();


      return res.json({
        success: true,

        settings,
      });

    } catch (error) {

      console.error(
        "GET ADMIN SETTINGS ERROR:",
        error
      );


      return res
        .status(500)
        .json({
          success: false,

          message:
            "Unable to load settings",

          error:
            error.message,
        });
    }
  };


/* =========================================
   ADMIN UPDATE SETTINGS
   PUT /api/admin/settings
========================================= */

const updateAdminSettings =
  async (req, res) => {

    try {

      const settings =
        await getOrCreateSettings();


      /* ==============================
         ALLOWED SETTINGS
      ============================== */

      const allowedFields = [

        "websiteName",

        "supportEmail",

        "registrationOpen",

        "menRegistrationOpen",

        "womenRegistrationOpen",

        "minimumAge",

        "maximumAge",

        "applicationManagement",

        "approvalMode",

        "mediaUploads",

        "maintenanceMode",
      ];


      /* ==============================
         COPY REQUEST VALUES
      ============================== */

      for (
        const field of allowedFields
      ) {

        if (
          Object.prototype
            .hasOwnProperty
            .call(
              req.body,
              field
            )
        ) {

          settings[field] =
            req.body[field];
        }
      }


      /* ==============================
         NUMBER CONVERSION
      ============================== */

      settings.minimumAge =
        Number(
          settings.minimumAge
        );


      settings.maximumAge =
        Number(
          settings.maximumAge
        );


      /* ==============================
         AGE VALIDATION
      ============================== */

      if (
        Number.isNaN(
          settings.minimumAge
        ) ||
        Number.isNaN(
          settings.maximumAge
        )
      ) {

        return res
          .status(400)
          .json({
            success: false,

            message:
              "Minimum age and maximum age must be valid numbers",
          });
      }


      if (
        settings.minimumAge <
        18
      ) {

        return res
          .status(400)
          .json({
            success: false,

            message:
              "Minimum age cannot be less than 18",
          });
      }


      if (
        settings.minimumAge >
        99
      ) {

        return res
          .status(400)
          .json({
            success: false,

            message:
              "Minimum age cannot be greater than 99",
          });
      }


      if (
        settings.maximumAge <
        18
      ) {

        return res
          .status(400)
          .json({
            success: false,

            message:
              "Maximum age cannot be less than 18",
          });
      }


      if (
        settings.maximumAge >
        120
      ) {

        return res
          .status(400)
          .json({
            success: false,

            message:
              "Maximum age cannot be greater than 120",
          });
      }


      if (
        settings.minimumAge >
        settings.maximumAge
      ) {

        return res
          .status(400)
          .json({
            success: false,

            message:
              "Minimum age cannot be greater than maximum age",
          });
      }


      /* ==============================
         APPROVAL MODE VALIDATION
      ============================== */

      if (
        ![
          "manual",
          "auto",
        ].includes(
          settings.approvalMode
        )
      ) {

        return res
          .status(400)
          .json({
            success: false,

            message:
              "Invalid approval mode",
          });
      }


      /* ==============================
         CLEAN TEXT
      ============================== */

      settings.websiteName =
        String(
          settings.websiteName ||
          "I Love Latinas"
        ).trim();


      settings.supportEmail =
        String(
          settings.supportEmail ||
          ""
        )
          .trim()
          .toLowerCase();


      /* ==============================
         SAVE TO MONGODB
      ============================== */

      await settings.save();


      /* ==============================
         SUCCESS
      ============================== */

      return res.json({
        success: true,

        message:
          "Settings saved successfully",

        settings,
      });

    } catch (error) {

      console.error(
        "UPDATE SETTINGS ERROR:",
        error
      );


      return res
        .status(400)
        .json({
          success: false,

          message:
            error.message ||
            "Unable to save settings",

          error:
            error.message,
        });
    }
  };


/* =========================================
   EXPORTS
========================================= */

module.exports = {
  getPublicSettings,
  getAdminSettings,
  updateAdminSettings,
};