const express  = require("express");
const router   = express.Router();
const { upload, checkImageUpload } = require("../Middleware/img.middleware");

const {
  enhanceImageController,
  upscaleOnly,
  sharpenOnly,
  denoiseOnly,
  restoreOnly,
  bgRemoveOnly,
  faceOnly,
  colorOnly,
  objRemoveOnly,
  downloadImage,
  previewImage,
  getInfo,
} = require("../Controller/img.controller");


// GET /api/image/info     — img ka imfo jaise supported formats, max file size, etc.
router.get("/info", getInfo);

// ── Master Pipeline (recommended)    
// POST /api/image/enhance?preset=auto&scale=2
// All selected features run in the optimal sequence
router.post("/enhance", upload.single("file"), checkImageUpload, enhanceImageController);

// ── Single Feature Endpoints (advanced users ke liye, ya specific use cases ke liye)

// 1️⃣  Upscaling
// POST /api/image/upscale?scale=2
router.post("/upscale", upload.single("file"), checkImageUpload, upscaleOnly);

// 2️⃣  Sharpen / Blur Remove
// POST /api/image/sharpen?intensity=medium  (light|medium|strong)
router.post("/sharpen", upload.single("file"), checkImageUpload, sharpenOnly);

// 3️⃣  Noise Removal
// POST /api/image/denoise?level=medium  (light|medium|strong)
router.post("/denoise", upload.single("file"), checkImageUpload, denoiseOnly);

// 4️⃣  Old Photo Restore
// POST /api/image/restore?colorize=true
router.post("/restore", upload.single("file"), checkImageUpload, restoreOnly);

// 5️⃣  Background Remove → outputs transparent PNG
// POST /api/image/bgremove
router.post("/bgremove", upload.single("file"), checkImageUpload, bgRemoveOnly);

// 6️⃣  Face Enhancement
// POST /api/image/face
router.post("/face", upload.single("file"), checkImageUpload, faceOnly);

// 7️⃣  Color Correction
// POST /api/image/color
router.post("/color", upload.single("file"), checkImageUpload, colorOnly);

// 8️⃣  Object Remove
// POST /api/image/objremove  Body: { region: "{x,y,width,height}" }
router.post("/objremove", upload.single("file"), checkImageUpload, objRemoveOnly);

// ── Download / Preview Endpoints
// GET /api/image/download/:filename
router.get("/download/:filename", downloadImage);

// GET /api/image/preview/:filename
router.get("/preview/:filename", previewImage);

module.exports = router;