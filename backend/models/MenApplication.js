
const mongoose = require("mongoose");

const menApplicationSchema = new mongoose.Schema(
  {
    memberName: {
      type: String,
      required: true,
      trim: true,
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

    meetingDate: {
      type: Date,
      required: true,
    },

    nightType: {
      type: String,
      required: true,
      trim: true,
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
      Men form me gender field nahi rakha gaya hai.
      Women ka existing Application model bilkul change nahi karna.
    */

    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
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
