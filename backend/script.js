



const dns = require("dns");

/* =========================================
   MONGODB DNS FIX
========================================= */

dns.setServers([
  "1.1.1.1",
  "8.8.8.8",
]);

require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
const multer = require("multer");

const Admin = require("./models/Admin");


/* =========================================
   ROUTES IMPORT
========================================= */

const settingsRoutes =
  require("./routes/settingsRoutes");

const adminLoginRoutes =
  require("./routes/adminLoginRoutes");

const adminProfileRoutes =
  require("./routes/adminProfileRoutes");

const adminPasswordRoutes =
  require("./routes/adminPasswordRoutes");

const adminDashboardRoutes =
  require("./routes/adminDashboardRoutes");

const adminUserRoutes =
  require("./routes/adminUserRoutes");

/*
  NEW:
  Men form + Men admin applications routes.
*/
const menApplicationRoutes =
  require("./routes/menApplicationRoutes");

/*
  Existing Women / main application routes.
  Is file ko change nahi kiya gaya.
*/
const applicationRoutes =
  require("./routes/applicationRoutes");


const app = express();


/* =========================================
   MIDDLEWARE
========================================= */

app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "http://localhost:5174",
      "http://localhost:5175",
      "http://localhost:5176",
      "http://localhost:3002",

      "https://latina.myaibusiness.online",
      "https://latinas.myaibusiness.online",
      "https://admin.latina.myaibusiness.online",
    ],

    methods: [
      "GET",
      "POST",
      "PUT",
      "PATCH",
      "DELETE",
      "OPTIONS",
    ],

    allowedHeaders: [
      "Content-Type",
      "Authorization",
    ],

    credentials: true,
  })
);


app.use(
  express.json({
    limit: "20mb",
  })
);


app.use(
  express.urlencoded({
    extended: true,
    limit: "20mb",
  })
);


/* =========================================
   STATIC UPLOADS
========================================= */

app.use(
  "/uploads",
  express.static(
    path.join(
      __dirname,
      "uploads"
    )
  )
);


/* =========================================
   HOME TEST ROUTE
========================================= */

app.get(
  "/",
  (req, res) => {
    return res.json({
      success: true,
      message:
        "I Love Latinas API is running",
    });
  }
);


/* =========================================
   ADMIN ROUTES
========================================= */

app.use(
  "/api/admin",
  adminLoginRoutes
);


app.use(
  "/api/admin",
  adminProfileRoutes
);


app.use(
  "/api/admin",
  adminPasswordRoutes
);


app.use(
  "/api/admin",
  adminDashboardRoutes
);


app.use(
  "/api/admin",
  adminUserRoutes
);


/* =========================================
   PUBLIC / APPLICATION ROUTES

   IMPORTANT:
   Men routes ko applicationRoutes se
   PAHLE mount kiya gaya hai.
========================================= */

app.use(
  "/api",
  menApplicationRoutes
);


app.use(
  "/api",
  settingsRoutes
);


/*
  Existing Women application routes.
  Women flow me koi change nahi.
*/
app.use(
  "/api",
  applicationRoutes
);


/* =========================================
   GLOBAL ERROR HANDLER
========================================= */

app.use(
  (
    error,
    req,
    res,
    next
  ) => {
    console.error(
      "SERVER ERROR:",
      error
    );

    if (
      error instanceof
      multer.MulterError
    ) {
      return res
        .status(400)
        .json({
          success: false,
          message:
            "File upload failed",
          error:
            error.message,
        });
    }

    return res
      .status(
        error.statusCode ||
        500
      )
      .json({
        success: false,
        message:
          error.message ||
          "Something went wrong",
        error:
          error.message ||
          "Unknown server error",
      });
  }
);


/* =========================================
   404 ROUTE
========================================= */

app.use(
  (req, res) => {
    return res
      .status(404)
      .json({
        success: false,
        message:
          `Route not found: ${req.method} ${req.originalUrl}`,
      });
  }
);


/* =========================================
   SERVER START
========================================= */

const PORT =
  process.env.PORT ||
  5000;


if (!process.env.MONGO_URI) {
  console.error(
    "MONGO_URI is missing in .env"
  );

  process.exit(1);
}


mongoose
  .connect(
    process.env.MONGO_URI
  )

  .then(
    async () => {
      console.log(
        "MongoDB connected successfully"
      );

      const adminCount =
        await Admin.countDocuments(
          {}
        );

      if (
        adminCount > 1
      ) {
        console.warn(
          `WARNING: ${adminCount} admins exist`
        );
      }

      app.listen(
        PORT,
        () => {
          console.log(
            `Server running on http://localhost:${PORT}`
          );
        }
      );
    }
  )

  .catch(
    (error) => {
      console.error(
        "MongoDB connection failed:",
        error.message
      );

      process.exit(1);
    }
  );
