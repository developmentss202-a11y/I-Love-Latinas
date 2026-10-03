
const mongoose = require("mongoose");

const LOOKING_FOR_VALUES = [
  "short-term",
  "long-term",
  "dating",
  "marriage",
  "life-partner",
];

const menApplicationSchema = new mongoose.Schema(
  {
    memberName: {
      type: String,
      required: true,
      trim: true,
    },

    /*
      Long-term requires exactly 3 profiles.
      Other lookingFor values keep a single name.
      memberName stays as a display string for older admin UI.
    */
    memberNames: {
      type: [String],
      default: undefined,
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },

    mobile: {
      type: String,
      required: true,
      trim: true,
    },

    /*
      Digits-only mobile for matching the same man
      across differently formatted numbers.
    */
    mobileDigits: {
      type: String,
      trim: true,
      index: true,
    },

    meetingDate: {
      type: Date,
      required: true,
    },

    nightType: {
      type: String,
      required: true,
      trim: true,
    },

    hotelName: {
      type: String,
      default: "Ecuador",
      trim: true,
    },

    /*
      Same four options as men profile filters.
    */
    lookingFor: {
      type: String,
      enum: LOOKING_FOR_VALUES,
      trim: true,
      index: true,
    },

    subject: {
      type: String,
      required: true,
      trim: true,
    },

    message: {
      type: String,
      required: true,
      trim: true,
    },

    /*
      Shared across every booking for the same man (matched by email).
      Not unique on the collection because one man can have many entries.
    */
    slug: {
      type: String,
      trim: true,
      lowercase: true,
      index: true,
    },

    /*
      Men form me gender field nahi rakha gaya hai.
      Women ka existing Application model bilkul change nahi karna.
    */

    status: {
      type: String,
      enum: [
        "pending",
        "approved",
        "rejected",
        "contacted",
        "duplicate",
      ],
      default: "pending",
      index: true,
    },

    rejectReason: {
      type: String,
      default: "",
      trim: true,
    },

    /*
      Public status check ke liye secret token.
      Is token ke bina kisi application ka status/profile
      public endpoint se nahi milega.
    */
    publicToken: {
      type: String,
      required: true,
      unique: true,
      index: true,
      select: false,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  "MenApplication",
  menApplicationSchema
);

module.exports.LOOKING_FOR_VALUES = LOOKING_FOR_VALUES;
