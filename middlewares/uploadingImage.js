
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const crypto = require("crypto");

// ========================================
// Upload Directory Configuration
// ========================================

const UPLOAD_ROOT = path.resolve(__dirname, "..", "uploads");

const directories = {
  mainImage: path.join(UPLOAD_ROOT, "images"),
  images: path.join(UPLOAD_ROOT, "images"),
  files: path.join(UPLOAD_ROOT, "files"),
  videoFiles: path.join(UPLOAD_ROOT, "videos"),
};

// Create upload directories on server startup
Object.values(directories).forEach((directory) => {
  fs.mkdirSync(directory, { recursive: true });
});

// ========================================
// Storage Configuration
// ========================================

const multerStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const destination = directories[file.fieldname];

    if (!destination) {
      return cb(
        new multer.MulterError(
          "LIMIT_UNEXPECTED_FILE",
          file.fieldname
        )
      );
    }

    cb(null, destination);
  },

  filename: (req, file, cb) => {
    const extension = path.extname(file.originalname);

    // Generate a unique filename to prevent collisions
    const uniqueName = `${Date.now()}-${crypto.randomUUID()}${extension}`;

    cb(null, uniqueName);
  },
});

// ========================================
// Multer Configuration
// ========================================

// No fileFilter is configured, allowing all file MIME types.
// Field validation and upload limits remain enabled.
const upload = multer({
  storage: multerStorage,

  limits: {
    fileSize: 500 * 1024 * 1024, // Maximum file size: 500 MB
    files: 31, // Maximum total number of files per request
  },
});

// ========================================
// Estate File Upload Middleware
// ========================================

exports.uploadEstateFiles = upload.fields([
  { name: "mainImage", maxCount: 1 },
  { name: "images", maxCount: 10 },
  { name: "files", maxCount: 10 },
  { name: "videoFiles", maxCount: 10 },
]);
