// ============================================================
//  Middleware/format.middleware.js
//  Multer configuration for document file uploads
//  Supports: PDF, Word, Excel, PowerPoint, HTML, XML, OpenDocument
// ============================================================

const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

// ─── Ensure upload directory exists ───────────────────────────────────────────
const uploadDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

// ─── Allowed MIME types for document conversion ────────────────────────────────
const ALLOWED_MIMES = [
  // PDF
  'application/pdf',
  // Word
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  // Excel
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  // PowerPoint
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  // HTML
  'text/html',
  // XML
  'text/xml',
  'application/xml',
  // OpenDocument
  'application/vnd.oasis.opendocument.text',           // ODT
  'application/vnd.oasis.opendocument.spreadsheet',    // ODS
  'application/vnd.oasis.opendocument.presentation',   // ODP
  // Plain text (for XML/HTML edge cases)
  'text/plain',
];

const ALLOWED_EXTENSIONS = [
  '.pdf', '.doc', '.docx', '.xls', '.xlsx',
  '.ppt', '.pptx', '.html', '.htm', '.xml',
  '.odt', '.ods', '.odp', '.txt',
];

// ─── Storage config ───────────────────────────────────────────────────────────
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${uuidv4()}${ext}`);
  },
});

// ─── File filter ──────────────────────────────────────────────────────────────
const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  const mimeOk = ALLOWED_MIMES.includes(file.mimetype);
  const extOk = ALLOWED_EXTENSIONS.includes(ext);

  console.log('[FORMAT-UPLOAD] File:', file.originalname, 'MIME:', file.mimetype, 'Ext:', ext, 'mimeOk:', mimeOk, 'extOk:', extOk);

  if (mimeOk || extOk) {
    cb(null, true);
  } else {
    const errMsg = `Unsupported file type: ${ext} (${file.mimetype}). Supported: PDF, DOCX, XLSX, PPTX, HTML, XML, ODT, ODS, ODP`;
    console.log('[FORMAT-UPLOAD] Rejected:', errMsg);
    cb(new Error(errMsg), false);
  }
};

// ─── Export multer instance for document uploads ────────────────────────────────
const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50 MB max
});

module.exports = upload;
