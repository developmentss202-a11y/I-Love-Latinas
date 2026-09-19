
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Admin = require("../models/Admin");

function escapeRegex(value = "") {
  return String(value).replace(
    /[.*+?^${}()|[\]\\]/g,
    "\\$&"
  );
}

const adminLogin = async (req, res) => {
  try {
    const {
      identifier,
      password,
    } = req.body;

    if (!identifier || !password) {
      return res.status(400).json({
        success: false,
        message:
          "Username/Email and password are required",
      });
    }

    const cleanIdentifier =
      String(identifier).trim();

    const safeIdentifier =
      escapeRegex(cleanIdentifier);

    const admin =
      await Admin.findOne({
        $or: [
          {
            email:
              cleanIdentifier.toLowerCase(),
          },
          {
            name: {
              $regex:
                `^${safeIdentifier}$`,
              $options: "i",
            },
          },
        ],
      });

    if (!admin) {
      return res.status(401).json({
        success: false,
        message:
          "Invalid username/email or password",
      });
    }

    const passwordMatch =
      await bcrypt.compare(
        password,
        admin.password
      );

    if (!passwordMatch) {
      return res.status(401).json({
        success: false,
        message:
          "Invalid username/email or password",
      });
    }

    admin.lastLogin = new Date();
    await admin.save();

    const token =
      jwt.sign(
        {
          adminId:
            admin._id.toString(),
          email:
            admin.email,
          role:
            "admin",
        },
        process.env.JWT_SECRET,
        {
          expiresIn: "7d",
        }
      );

    return res.json({
      success: true,
      message:
        "Login successful",
      token,
      admin: {
        id:
          admin._id,
        name:
          admin.name,
        email:
          admin.email,
        role:
          "admin",
        lastLogin:
          admin.lastLogin,
      },
    });
  } catch (error) {
    console.error(
      "LOGIN ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Login failed",
    });
  }
};

module.exports = {
  adminLogin,
};
