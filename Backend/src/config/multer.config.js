// ============================================================
//  config/multer.config.js
//  Multer ka configuration — file kahan save ho, naam kya ho,
//  size limit kitni ho, sirf MP4 allow ho
// ============================================================

const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { v4: uuidv4 } = require("uuid");

const UPLOADS_DIR = path.join(__dirname, "..", "uploads");

// Agar directory nahi hai toh create karo
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// ─── Storage config ───────────────────────────────────────────────────────────
const storage = multer.diskStorage({
  // File kahan save ho
  destination: (req, file, cb) => {
    cb(null, UPLOADS_DIR);
  },

  // File ka naam — uuid + original extension (collision avoid karne ke liye)
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname); // ".mp4"
    const unique = `${uuidv4()}${ext}`; // "abc-123.mp4"
    cb(null, unique);
  },
});

// ─── File filter — sirf MP4 allow ─────────────────────────────────────────────
const fileFilter = (req, file, cb) => {
  const isMP4 =
    file.mimetype === "video/mp4" ||
    file.originalname.toLowerCase().endsWith(".mp4");

  if (isMP4) {
    cb(null, true); // ✅ Accept
  } else {
    cb(new Error("Sirf MP4 files allowed hain!")); // ❌ Reject
  }
};

// ─── Final multer instance ────────────────────────────────────────────────────
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 500 * 1024 * 1024, // Max 500 MB
  },
});

module.exports = upload;
