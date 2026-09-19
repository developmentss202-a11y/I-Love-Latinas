const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      required: true,
    },

    location: {
      type: String,
      default: "",
      trim: true,
    },

status: {
  type: String,
  enum: [
    "active",
    "blocked",
    "deleted",
  ],
  default: "active",
},

deletedAt: {
  type: Date,
  default: null,
},

    role: {
      type: String,
      enum: ["user"],
      default: "user",
    },

    applicationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Application",
      default: null,
      index: true,
    },

    approvedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

module.exports =
  mongoose.model("User", userSchema);





