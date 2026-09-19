const mongoose = require("mongoose");

const siteSettingsSchema =
  new mongoose.Schema(
    {
      key: {
        type: String,
        default: "main",
        unique: true,
        trim: true,
      },

      websiteName: {
        type: String,
        default: "I Love Latinas",
        trim: true,
      },

      supportEmail: {
        type: String,
        default: "",
        trim: true,
        lowercase: true,
      },

      registrationOpen: {
        type: Boolean,
        default: true,
      },

      menRegistrationOpen: {
        type: Boolean,
        default: true,
      },

      womenRegistrationOpen: {
        type: Boolean,
        default: true,
      },

      minimumAge: {
        type: Number,
        default: 21,
        min: 18,
        max: 99,
      },

      maximumAge: {
        type: Number,
        default: 99,
        min: 18,
        max: 120,
      },

      applicationManagement: {
        type: Boolean,
        default: true,
      },

      approvalMode: {
        type: String,
        enum: [
          "manual",
          "auto",
        ],
        default: "manual",
      },

      mediaUploads: {
        type: Boolean,
        default: true,
      },

      maintenanceMode: {
        type: Boolean,
        default: false,
      },
    },
    {
      timestamps: true,
    }
  );

module.exports =
  mongoose.model(
    "SiteSettings",
    siteSettingsSchema
  );