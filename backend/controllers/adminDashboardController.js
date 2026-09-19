const Admin = require("../models/Admin");
const Application = require("../models/Application");

const getDashboard =
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

      const applications =
        await Application
          .countDocuments({
            status: "pending",
          });

      return res.json({
        success: true,
        admin,
        stats: {
          applications,
        },
      });
    } catch (error) {
      console.error(
        "DASHBOARD ERROR:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Dashboard data load failed",
      });
    }
  };

module.exports = {
  getDashboard,
};
