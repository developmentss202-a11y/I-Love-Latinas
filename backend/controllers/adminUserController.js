
const User = require("../models/User");

/* =========================================
   GET ALL USERS
========================================= */

const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({})
      .select("-password")
      .populate({
        path: "applicationId",
        select:
          "firstName name age gender countryOfResidence location photos",
      })
      .sort({ createdAt: -1 })
      .lean();

    const formattedUsers = users.map((user) => {
      const application =
        user.applicationId &&
        typeof user.applicationId === "object"
          ? user.applicationId
          : {};

      return {
        _id: user._id,

        name:
          user.name ||
          application.firstName ||
          application.name ||
          "",

        email: user.email || "",

        age: application.age ?? "",

        gender: application.gender || "",

        location:
          user.location ||
          application.countryOfResidence ||
          application.location ||
          "",

        photos:
          Array.isArray(application.photos)
            ? application.photos
            : [],

        status:
          user.status || "active",

        role:
          user.role || "user",

        approvedAt:
          user.approvedAt || null,

        createdAt:
          user.createdAt,

        updatedAt:
          user.updatedAt,
      };
    });

    return res.status(200).json({
      success: true,
      users: formattedUsers,
    });

  } catch (error) {
    console.error(
      "GET ALL USERS ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Unable to load users",
      error: error.message,
    });
  }
};


/* =========================================
   BLOCK / UNBLOCK USER
========================================= */

const updateUserStatus =
  async (req, res) => {
    try {
      const { status } =
        req.body || {};

      if (
        ![
          "active",
          "blocked",
        ].includes(status)
      ) {
        return res
          .status(400)
          .json({
            success: false,
            message:
              "Status must be active or blocked",
          });
      }

      const user =
        await User.findByIdAndUpdate(
          req.params.id,
          {
            status,
          },
          {
            returnDocument: "after",
            runValidators: true,
          }
        )
          .select("-password")
          .lean();

      if (!user) {
        return res
          .status(404)
          .json({
            success: false,
            message:
              "User not found",
          });
      }

      return res.json({
        success: true,

        message:
          status === "blocked"
            ? "User blocked successfully"
            : "User activated successfully",

        user,
      });

    } catch (error) {
      console.error(
        "UPDATE USER STATUS ERROR:",
        error
      );

      return res
        .status(500)
        .json({
          success: false,
          message:
            "Unable to update user status",
          error:
            error.message,
        });
    }
  };


module.exports = {
  getAllUsers,
  updateUserStatus,
};