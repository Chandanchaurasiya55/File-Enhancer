// ============================================================
//  Routes/video.route.js
//  Yahan sirf routes define hain
//  Actual logic video.controller.js mein hai
// ============================================================

const express = require("express");
const router = express.Router();
const authenticateUser = require("../Middleware/auth.middleware");

// Controller import
const {
  upload,
  compressVideo,
  getJobStatus,
  downloadVideo,
} = require("../Controller/video.controller");

// ─────────────────────────────────────────────────────────────
//  POST /api/video/compress
//  Step 1: User video upload karta hai
//  upload.single("video") → multer pehle file save karega
//  phir compressVideo controller chalega
// ─────────────────────────────────────────────────────────────
router.post("/compress", authenticateUser, upload.single("video"), compressVideo);

// ─────────────────────────────────────────────────────────────
//  GET /api/video/status/:jobId
//  Step 2: Frontend baar baar yeh call karta hai
//  jab tak status "done" ya "error" na ho
// ─────────────────────────────────────────────────────────────
router.get("/status/:jobId", authenticateUser, getJobStatus);

// ─────────────────────────────────────────────────────────────
//  GET /api/video/download/:jobId
//  Step 3: "done" hone ke baad user download karta hai
// ─────────────────────────────────────────────────────────────
router.get("/download/:jobId", authenticateUser, downloadVideo);

module.exports = router;
