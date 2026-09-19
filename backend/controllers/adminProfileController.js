const Admin = require("../models/Admin");

const getAdminProfile =
  async (req, res) => {
    try {
      const admin =
        await Admin.findById(
          req.admin.adminId
        ).select(
          "-password -resetOtpHash -resetOtpExpires"
        );

      if (!admin) {
        return res.status(404).json({
          success: false,
          message:
            "Admin not found",
        });
      }

      return res.json({
        success: true,
        admin,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message:
          "Could not load admin profile",
      });
    }
  };

const updateAdminProfile =
  async (req, res) => {
    try {
      const {
        name,
        email,
      } = req.body;

      if (!name || !email) {
        return res.status(400).json({
          success: false,
          message:
            "Name and email are required",
        });
      }

      const cleanEmail =
        String(email)
          .trim()
          .toLowerCase();

      const duplicate =
        await Admin.findOne({
          email:
            cleanEmail,
          _id: {
            $ne:
              req.admin.adminId,
          },
        });

      if (duplicate) {
        return res.status(400).json({
          success: false,
          message:
            "Email is already in use",
        });
      }

      const admin =
        await Admin
          .findByIdAndUpdate(
            req.admin.adminId,
            {
              $set: {
                name:
                  String(name).trim(),
                email:
                  cleanEmail,
              },
            },
            {
              new: true,
              runValidators: true,
            }
          )
          .select(
            "-password -resetOtpHash -resetOtpExpires"
          );

      return res.json({
        success: true,
        message:
          "Profile updated successfully",
        admin,
      });
    } catch (error) {
      console.error(
        "PROFILE UPDATE ERROR:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Profile update failed",
      });
    }
  };

module.exports = {
  getAdminProfile,
  updateAdminProfile,
};
