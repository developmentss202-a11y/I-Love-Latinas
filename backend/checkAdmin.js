
const dns = require("dns");

dns.setServers([
  "1.1.1.1",
  "8.8.8.8",
]);

require("dotenv").config();

const mongoose = require("mongoose");
const Admin = require("./models/Admin");

async function checkAdmin() {
  try {
    await mongoose.connect(
      process.env.MONGO_URI
    );

    console.log(
      "MongoDB connected successfully"
    );

    const admins =
      await Admin.find(
        {},
        "name email role"
      ).lean();

    console.log(
      "ADMIN ACCOUNTS:"
    );

    console.log(admins);

  } catch (error) {
    console.error(
      "ERROR:",
      error.message
    );

  } finally {
    await mongoose
      .disconnect()
      .catch(() => {});
  }
}

checkAdmin();