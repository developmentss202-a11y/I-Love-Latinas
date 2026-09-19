require("dotenv").config();

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const Admin = require("./models/Admin");

async function createAdmin() {
  try {
    const {
      MONGO_URI,
      ADMIN_NAME,
      ADMIN_EMAIL,
      ADMIN_PASSWORD,
    } = process.env;

    if (
      !MONGO_URI ||
      !ADMIN_EMAIL ||
      !ADMIN_PASSWORD
    ) {
      throw new Error(
        "MONGO_URI, ADMIN_EMAIL and ADMIN_PASSWORD are required in .env"
      );
    }

    await mongoose.connect(MONGO_URI);

    const email =
      ADMIN_EMAIL.trim().toLowerCase();

    const hashedPassword =
      await bcrypt.hash(
        ADMIN_PASSWORD,
        10
      );

    const admin =
      await Admin.findOneAndUpdate(
        { email },
        {
          $set: {
            name:
              ADMIN_NAME?.trim() ||
              "Admin",
            email,
            password:
              hashedPassword,
            role: "admin",
          },
        },
        {
          upsert: true,
          returnDocument: "after",
          setDefaultsOnInsert: true,
        }
      );

    console.log(
      "Admin ready:",
      admin.email
    );
  } catch (error) {
    console.error(
      "CREATE ADMIN ERROR:",
      error.message
    );
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
}

createAdmin();
