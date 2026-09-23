



const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const adminAuth =
  require("../middleware/adminAuth");

const {
  createApplication,
  getApplications,
  getApprovedApplications,
  getSingleApplication,
  getApplicationStatus,
  getApplicationBySlug,
  approveApplication,
  rejectApplication,
} = require(
  "../controllers/applicationController"
);

const router =
  express.Router();


// =====================================================
// UPLOAD DIRECTORY
// =====================================================

const uploadDirectory =
  path.join(
    __dirname,
    "../uploads"
  );


if (
  !fs.existsSync(
    uploadDirectory
  )
) {
  fs.mkdirSync(
    uploadDirectory,
    {
      recursive: true,
    }
  );
}


// =====================================================
// FILE SIZE LIMITS
// =====================================================

const PHOTO_MAX_SIZE =
  3 * 1024 * 1024;
// 3 MB

const VOICE_MAX_SIZE =
  5 * 1024 * 1024;
// 5 MB

const VIDEO_MAX_SIZE =
  10 * 1024 * 1024;
// 10 MB


// =====================================================
// STORAGE
// =====================================================

const storage =
  multer.diskStorage({

    destination: function (
      req,
      file,
      callback
    ) {

      callback(
        null,
        uploadDirectory
      );
    },


    filename: function (
      req,
      file,
      callback
    ) {

      const extension =
        path.extname(
          file.originalname
        );


      const uniqueName =
        `${Date.now()}-${Math.round(
          Math.random() *
          1e9
        )}${extension}`;


      callback(
        null,
        uniqueName
      );
    },
  });


// =====================================================
// FILE TYPE VALIDATION
// =====================================================

const fileFilter = (
  req,
  file,
  callback
) => {

  console.log(
    "FILE RECEIVED:",
    // {
    //   fieldname:
    //     file.fieldname,

    //   originalname:
    //     file.originalname,

    //   mimetype:
    //     file.mimetype,
    // }
  );


  const ext =
    path
      .extname(
        file.originalname ||
        ""
      )
      .toLowerCase();


  // ===================================================
  // PHOTO
  // ===================================================

  if (
    file.fieldname ===
    "photos"
  ) {

    const validPhoto =
      file.mimetype
        ?.startsWith(
          "image/"
        ) ||
      [
        ".jpg",
        ".jpeg",
        ".png",
        ".webp",
      ].includes(ext);


    if (validPhoto) {

      return callback(
        null,
        true
      );
    }


    return callback(
      new Error(
        "Invalid photo file. Please upload JPG, JPEG, PNG or WEBP."
      ),
      false
    );
  }


  // ===================================================
  // VOICE
  // ===================================================

  if (
    file.fieldname ===
    "voiceRecording"
  ) {

    const validVoice =
      file.mimetype
        ?.startsWith(
          "audio/"
        ) ||

      file.mimetype ===
        "application/octet-stream" ||

      file.mimetype ===
        "video/webm" ||

      [
        ".webm",
        ".mp3",
        ".wav",
        ".m4a",
        ".ogg",
      ].includes(ext);


    if (validVoice) {

      return callback(
        null,
        true
      );
    }


    return callback(
      new Error(
        "Invalid voice recording file."
      ),
      false
    );
  }


  // ===================================================
  // VIDEO
  // ===================================================

  if (
    file.fieldname ===
    "videoRecording"
  ) {

    const validVideo =
      file.mimetype
        ?.startsWith(
          "video/"
        ) ||

      file.mimetype ===
        "application/octet-stream" ||

      [
        ".webm",
        ".mp4",
        ".mov",
        ".mkv",
      ].includes(ext);


    if (validVideo) {

      return callback(
        null,
        true
      );
    }


    return callback(
      new Error(
        "Invalid video recording file."
      ),
      false
    );
  }


  // ===================================================
  // UNKNOWN FIELD
  // ===================================================

  return callback(
    new Error(
      "Unknown upload field."
    ),
    false
  );
};


// =====================================================
// MULTER
// =====================================================

const upload =
  multer({

    storage,

    fileFilter,

    limits: {

      // Largest allowed file is video = 10 MB
      fileSize:
        VIDEO_MAX_SIZE,

      // Photo + Voice + Video
      files: 3,
    },
  });


// =====================================================
// APPLICATION UPLOAD FIELDS
// =====================================================

const applicationUpload =
  upload.fields([
    {
      name: "photos",
      maxCount: 1,
    },

    {
      name:
        "voiceRecording",
      maxCount: 1,
    },

    {
      name:
        "videoRecording",
      maxCount: 1,
    },
  ]);


// =====================================================
// DELETE UPLOADED FILES
// Used when validation fails
// =====================================================

function deleteUploadedFiles(
  files
) {

  if (!files) {
    return;
  }


  Object.values(files)
    .flat()
    .forEach((file) => {

      if (
        file?.path &&
        fs.existsSync(
          file.path
        )
      ) {

        try {

          fs.unlinkSync(
            file.path
          );

        } catch (error) {

          console.error(
            "File delete error:",
            error
          );
        }
      }
    });
}


// =====================================================
// MULTER UPLOAD MIDDLEWARE
// =====================================================

function handleApplicationUpload(
  req,
  res,
  next
) {

  applicationUpload(
    req,
    res,
    function (error) {

      if (error) {

        deleteUploadedFiles(
          req.files
        );


        if (
          error instanceof
          multer.MulterError
        ) {

          // File larger than 10 MB
          if (
            error.code ===
            "LIMIT_FILE_SIZE"
          ) {

            return res
              .status(400)
              .json({
                success: false,

                message:
                  "File is too large. Photo max 3 MB, voice max 5 MB and video max 10 MB.",
              });
          }


          // More files than allowed
          if (
            error.code ===
            "LIMIT_UNEXPECTED_FILE"
          ) {

            return res
              .status(400)
              .json({
                success: false,

                message:
                  "Only 1 photo, 1 voice recording and 1 video are allowed.",
              });
          }


          return res
            .status(400)
            .json({
              success: false,

              message:
                error.message,
            });
        }


        return res
          .status(400)
          .json({
            success: false,

            message:
              error.message ||
              "File upload failed.",
          });
      }


      next();
    }
  );
}


// =====================================================
// INDIVIDUAL FILE SIZE VALIDATION
// =====================================================

function validateApplicationFiles(
  req,
  res,
  next
) {

  const photo =
    req.files
      ?.photos?.[0];


  const voice =
    req.files
      ?.voiceRecording?.[0];


  const video =
    req.files
      ?.videoRecording?.[0];


  // ===================================================
  // PHOTO MAX 3 MB
  // ===================================================

  if (
    photo &&
    photo.size >
      PHOTO_MAX_SIZE
  ) {

    deleteUploadedFiles(
      req.files
    );


    return res
      .status(400)
      .json({
        success: false,

        message:
          "Photo must be maximum 3 MB.",
      });
  }


  // ===================================================
  // VOICE MAX 5 MB
  // ===================================================

  if (
    voice &&
    voice.size >
      VOICE_MAX_SIZE
  ) {

    deleteUploadedFiles(
      req.files
    );


    return res
      .status(400)
      .json({
        success: false,

        message:
          "Voice recording must be maximum 5 MB.",
      });
  }


  // ===================================================
  // VIDEO MAX 10 MB
  // ===================================================

  if (
    video &&
    video.size >
      VIDEO_MAX_SIZE
  ) {

    deleteUploadedFiles(
      req.files
    );


    return res
      .status(400)
      .json({
        success: false,

        message:
          "Video must be maximum 10 MB.",
      });
  }


  next();
}


// =====================================================
// PUBLIC APPLICATION FORM
// =====================================================

router.post(
  "/applications",

  handleApplicationUpload,

  validateApplicationFiles,

  createApplication
);


// Public — unique profile link from the woman slug
router.get(
  "/applications/by-slug/:slug",

  getApplicationBySlug
);


// Public — approved women for cards + contact dropdown
router.get(
  "/applications/approved",

  getApprovedApplications
);


// Public — website /pending page polls approval status
router.get(
  "/applications/:id",

  getApplicationStatus
);


// =====================================================
// ADMIN APPLICATION APIs
// =====================================================

router.get(
  "/admin/applications",

  adminAuth,

  getApplications
);


router.get(
  "/admin/applications/:id",

  adminAuth,

  getSingleApplication
);


router.patch(
  "/admin/applications/:id/approve",

  adminAuth,

  approveApplication
);


router.patch(
  "/admin/applications/:id/reject",

  adminAuth,

  rejectApplication
);


// =====================================================
// EXPORT
// =====================================================

module.exports =
  router;