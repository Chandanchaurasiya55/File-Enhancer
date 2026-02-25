const express = require("express");
const router = express.Router();

const { convertFile, getSupportedFormats } = require("../Controller/formate.controller");
const { upload, validateTargetFormat, handleUploadError } = require("../Middleware/formate.middleware");

// ─── GET /api/formats ─────────────────────────────────────────────────────────
// Returns all supported input/output formats and conversion matrix
// Example: GET http://localhost:5000/api/formats
router.get("/formats", getSupportedFormats);

// ─── POST /api/convert ────────────────────────────────────────────────────────
// Upload a file and convert it to desired format
//
// Form-data:
//   file         → The file to convert  (required)
//   targetFormat → Target format string  (required) e.g. "pdf", "docx", "html"
//
// Example (curl - Windows CMD):
//   curl -X POST http://localhost:5000/api/convert ^
//     -F "file=@C:\Users\YourName\document.docx" ^
//     -F "targetFormat=pdf" ^
//     --output converted.pdf
//
// Example (curl - PowerShell):
//   curl.exe -X POST http://localhost:5000/api/convert `
//     -F "file=@C:/Users/YourName/document.docx" `
//     -F "targetFormat=pdf" `
//     --output converted.pdf
//
// Example (Postman):
//   POST http://localhost:5000/api/convert
//   Body → form-data
//     key: file        | type: File  | value: <upload your file>
//     key: targetFormat| type: Text  | value: pdf
// ─────────────────────────────────────────────────────────────────────────────
router.post(
  "/convert",
  (req, res, next) => {
    upload.single("file")(req, res, (err) => {
      handleUploadError(err, req, res, next);
    });
  },
  validateTargetFormat,
  convertFile
);

module.exports = router;