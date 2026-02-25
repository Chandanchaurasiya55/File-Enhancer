const multer = require("multer");
const path = require("path");
const fs = require("fs");

// ─── Allowed Input Formats ────────────────────────────────────────────────────
const ALLOWED_INPUT_FORMATS = [
  ".pdf", ".docx", ".doc",
  ".pptx", ".ppt",
  ".xml", ".html", ".htm",
  ".xlsx", ".xls",
];

// ─── Ensure Uploads Folder Exists ────────────────────────────────────────────
const uploadDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// ─── Multer Disk Storage (Windows Safe Filenames) ────────────────────────────
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Remove spaces & special chars for Windows path safety
    const safeName = file.originalname
      .replace(/\s+/g, "_")
      .replace(/[^a-zA-Z0-9._-]/g, "");
    const uniqueName = `${Date.now()}-${safeName}`;
    cb(null, uniqueName);
  },
});

// ─── File Type Filter ─────────────────────────────────────────────────────────
const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  if (ALLOWED_INPUT_FORMATS.includes(ext)) {
    cb(null, true);
  } else {
    cb(
      new Error(
        `Unsupported format "${ext}". Allowed: ${ALLOWED_INPUT_FORMATS.join(", ")}`
      ),
      false
    );
  }
};

// ─── Multer Upload Instance 
const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50 MB
});

// ─── Validate Target Format Middleware 
const VALID_OUTPUT_FORMATS = [
  "pdf", "docx", "pptx", "xlsx",
  "html", "txt", "xml", "csv",
  "png", "jpg",
];

const validateTargetFormat = (req, res, next) => {
  const { targetFormat } = req.body;

  if (!targetFormat) {
    return res.status(400).json({
      success: false,
      message: "targetFormat is required. Example: 'pdf', 'docx', 'html'",
    });
  }

  const fmt = targetFormat.toLowerCase().replace(".", "");

  if (!VALID_OUTPUT_FORMATS.includes(fmt)) {
    return res.status(400).json({
      success: false,
      message: `Invalid targetFormat "${fmt}". Supported: ${VALID_OUTPUT_FORMATS.join(", ")}`,
    });
  }

  req.targetFormat = fmt;
  next();
};

// ─── Multer Error Handler Middleware 
const handleUploadError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({
        success: false,
        message: "File too large. Max allowed size is 50MB.",
      });
    }
    return res.status(400).json({ success: false, message: err.message });
  }
  if (err) {
    return res.status(400).json({ success: false, message: err.message });
  }
  next();
};

module.exports = { upload, validateTargetFormat, handleUploadError };