const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const crypto = require("crypto");

const Admin = require("../models/Admin");


const transporter =
  nodemailer.createTransport({
    service: "gmail",

    auth: {
      user:
        process.env.EMAIL_USER,

      pass:
        process.env.EMAIL_APP_PASSWORD,
    },
  });


/* =========================================
   CHANGE PASSWORD
========================================= */

const changePassword =
  async (req, res) => {

    try {

      const {
        currentPassword,
        newPassword,
      } = req.body;


      if (
        !currentPassword ||
        !newPassword
      ) {

        return res
          .status(400)
          .json({
            success: false,

            message:
              "Current and new password are required",
          });
      }


      if (
        String(
          newPassword
        ).length < 6
      ) {

        return res
          .status(400)
          .json({
            success: false,

            message:
              "New password must be at least 6 characters",
          });
      }


      const admin =
        await Admin.findById(
          req.admin.adminId
        );


      if (!admin) {

        return res
          .status(404)
          .json({
            success: false,

            message:
              "Admin not found",
          });
      }


      const match =
        await bcrypt.compare(
          currentPassword,
          admin.password
        );


      if (!match) {

        return res
          .status(400)
          .json({
            success: false,

            message:
              "Current password is incorrect",
          });
      }


      admin.password =
        await bcrypt.hash(
          newPassword,
          10
        );


      await admin.save();


      return res.json({
        success: true,

        message:
          "Password changed successfully",
      });

    } catch (error) {

      console.error(
        "CHANGE PASSWORD ERROR:",
        error
      );


      return res
        .status(500)
        .json({
          success: false,

          message:
            "Password change failed",
        });
    }
  };


/* =========================================
   FORGOT PASSWORD - SEND OTP
========================================= */

const forgotPassword =
  async (req, res) => {

    try {

      const email =
        String(
          req.body.email || ""
        )
          .trim()
          .toLowerCase();


      if (!email) {

        return res
          .status(400)
          .json({
            success: false,

            message:
              "Email is required",
          });
      }


      if (
        !process.env.EMAIL_USER ||
        !process.env.EMAIL_APP_PASSWORD
      ) {

        return res
          .status(500)
          .json({
            success: false,

            message:
              "Email service is not configured",
          });
      }


      const admin =
        await Admin.findOne({
          email,
        });


      if (!admin) {

        return res
          .status(404)
          .json({
            success: false,

            message:
              "Admin account not found",
          });
      }


      const otp =
        crypto.randomInt(
          100000,
          1000000
        ).toString();


      admin.resetOtpHash =
        crypto
          .createHash(
            "sha256"
          )
          .update(
            otp
          )
          .digest(
            "hex"
          );


      admin.resetOtpExpires =
        new Date(
          Date.now() +
          10 * 60 * 1000
        );


      await admin.save();


      await transporter.sendMail({
        from:
          `"I Love Latinas Admin" <${process.env.EMAIL_USER}>`,

        to:
          admin.email,

        subject:
          "Admin Password Reset OTP",

        html: `
          <div style="font-family:Arial,sans-serif;max-width:520px;margin:auto;padding:30px;border:1px solid #eee;border-radius:12px">
            <h2 style="color:#8b0b36">I Love Latinas</h2>
            <p>You requested to reset your admin password.</p>
            <p>Your verification OTP is:</p>
            <div style="font-size:32px;font-weight:bold;letter-spacing:8px;color:#d92f59;margin:24px 0">
              ${otp}
            </div>
            <p>This OTP is valid for <strong>10 minutes</strong>.</p>
            <p style="color:#777;font-size:13px">If you did not request this, you can ignore this email.</p>
          </div>
        `,
      });


      return res.json({
        success: true,

        message:
          "OTP sent successfully",
      });

    } catch (error) {

      console.error(
        "OTP ERROR:",
        error
      );


      return res
        .status(500)
        .json({
          success: false,

          message:
            "OTP could not be sent",
        });
    }
  };


/* =========================================
   VERIFY RESET OTP
========================================= */

const verifyResetOtp =
  async (req, res) => {

    try {

      const {
        email,
        otp,
      } = req.body;


      if (
        !email ||
        !otp
      ) {

        return res
          .status(400)
          .json({
            success: false,

            message:
              "Email and OTP are required",
          });
      }


      const admin =
        await Admin.findOne({
          email:
            String(
              email
            )
              .trim()
              .toLowerCase(),
        });


      if (!admin) {

        return res
          .status(404)
          .json({
            success: false,

            message:
              "Admin not found",
          });
      }


      if (
        !admin.resetOtpHash ||
        !admin.resetOtpExpires
      ) {

        return res
          .status(400)
          .json({
            success: false,

            message:
              "Please request a new OTP",
          });
      }


      if (
        admin.resetOtpExpires <
        new Date()
      ) {

        admin.resetOtpHash =
          null;

        admin.resetOtpExpires =
          null;


        await admin.save();


        return res
          .status(400)
          .json({
            success: false,

            message:
              "OTP expired",
          });
      }


      const otpHash =
        crypto
          .createHash(
            "sha256"
          )
          .update(
            String(
              otp
            )
          )
          .digest(
            "hex"
          );


      if (
        otpHash !==
        admin.resetOtpHash
      ) {

        return res
          .status(400)
          .json({
            success: false,

            message:
              "Invalid OTP",
          });
      }


      const resetToken =
        jwt.sign(
          {
            adminId:
              admin._id.toString(),

            purpose:
              "password-reset",
          },

          process.env.JWT_SECRET,

          {
            expiresIn:
              "15m",
          }
        );


      return res.json({
        success: true,

        resetToken,

        message:
          "OTP verified successfully",
      });

    } catch (error) {

      console.error(
        "VERIFY OTP ERROR:",
        error
      );


      return res
        .status(500)
        .json({
          success: false,

          message:
            "OTP verification failed",
        });
    }
  };


/* =========================================
   RESET PASSWORD
========================================= */

const resetPassword =
  async (req, res) => {

    try {

      const {
        resetToken,
        newPassword,
      } = req.body;


      if (
        !resetToken ||
        !newPassword
      ) {

        return res
          .status(400)
          .json({
            success: false,

            message:
              "Reset token and new password are required",
          });
      }


      if (
        String(
          newPassword
        ).length < 6
      ) {

        return res
          .status(400)
          .json({
            success: false,

            message:
              "Password must be at least 6 characters",
          });
      }


      const decoded =
        jwt.verify(
          resetToken,
          process.env.JWT_SECRET
        );


      if (
        decoded.purpose !==
        "password-reset"
      ) {

        return res
          .status(401)
          .json({
            success: false,

            message:
              "Invalid reset token",
          });
      }


      const admin =
        await Admin.findById(
          decoded.adminId
        );


      if (!admin) {

        return res
          .status(404)
          .json({
            success: false,

            message:
              "Admin not found",
          });
      }


      admin.password =
        await bcrypt.hash(
          newPassword,
          10
        );


      admin.resetOtpHash =
        null;

      admin.resetOtpExpires =
        null;


      await admin.save();


      return res.json({
        success: true,

        message:
          "Password reset successfully",
      });

    } catch (error) {

      console.error(
        "RESET PASSWORD ERROR:",
        error
      );


      return res
        .status(401)
        .json({
          success: false,

          message:
            "Reset token expired or invalid",
        });
    }
  };


module.exports = {
  changePassword,
  forgotPassword,
  verifyResetOtp,
  resetPassword,
};
