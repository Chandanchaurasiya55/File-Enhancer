// ============================================================
//  Routes/format.route.js
//  Defines endpoints for document format conversion.
// ============================================================

const express = require('express');
const router = express.Router();

// controller functions
const {
  convertFile,
  getSupportedFormats,
  cleanupConvertedFiles // exported later for scheduler
} = require('../Controller/format.controller');

// document upload middleware
const upload = require('../Middleware/format.middleware');

// POST /api/format/convert
// Upload a file and specify targetFormat in form-data
router.post('/convert', upload.single('file'), convertFile);

// GET /api/format/formats
// Return supported conversions matrix
router.get('/formats', getSupportedFormats);

module.exports = router;
