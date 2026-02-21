const multer = require("multer");
const path = require("path");
const fs = require("fs");

const TEMP_DIR = path.join(__dirname, "../uploads/temp");
if (!fs.existsSync(TEMP_DIR)) {
  fs.mkdirSync(TEMP_DIR, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, TEMP_DIR),
  filename: (req, file, cb) => {
    const uid = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    cb(null, `upload_${uid}${path.extname(file.originalname)}`);
  },
});

const ALLOWED_MIMES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/svg+xml",
];

const fileFilter = (req, file, cb) => {
  ALLOWED_MIMES.includes(file.mimetype)
    ? cb(null, true)
    : cb(
        new multer.MulterError(
          "LIMIT_UNEXPECTED_FILE",
          `Unsupported type: ${file.mimetype}`
        ),
        false
      );
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 25 * 1024 * 1024 },
});

const checkImageUpload = (req, res, next) => {
  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: "No file uploaded",
    });
  }
  next();
};

module.exports = {
  upload,
  checkImageUpload,
};
