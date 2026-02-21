const sharp = require("sharp");
const path  = require("path");
const fs    = require("fs");

// ─── Constants and Configurations 

const SUPPORTED_FORMATS = ["jpg", "jpeg", "png", "webp", "gif", "svg"];
const DIRS = {
  temp:     path.join(__dirname, "../uploads/temp"),
  enhanced: path.join(__dirname, "../uploads/enhanced"),
};

Object.values(DIRS).forEach(d => { if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true }); });

// ─── Helpers 

const getExt      = f => path.extname(f).replace(".", "").toLowerCase();
const fmtSize     = b => b > 1048576 ? `${(b/1048576).toFixed(2)} MB` : `${(b/1024).toFixed(2)} KB`;
const uniqueName  = (base, suffix) => {
  const name = path.basename(base, path.extname(base));
  const ext  = getExt(base);
  const out  = (ext === "svg" || ext === "gif") ? "png" : ext;
  return `${name}_${suffix}_${Date.now()}.${out}`;
};

/**
 * Apply final output encoding based on extension
 */
function applyOutputFormat(pipeline, outPath) {
  const ext = getExt(outPath);
  if (ext === "jpg" || ext === "jpeg") {
    return pipeline.jpeg({ quality: 97, chromaSubsampling: "4:4:4", mozjpeg: true });
  } else if (ext === "webp") {
    return pipeline.webp({ quality: 95, effort: 6 });
  } else {
    return pipeline.png({ compressionLevel: 6, adaptiveFiltering: true });
  }
}

// ══════════════════════════════════════════════════════════════════════════════
// FEATURE 1 — Image Upscaling
// Chhoti photo ko bada karna, quality loss minimum
// ══════════════════════════════════════════════════════════════════════════════
async function upscaleImage(inputPath, outputPath, scale = 2) {
  const meta = await sharp(inputPath).metadata();
  const w = Math.round((meta.width  || 800) * scale);
  const h = Math.round((meta.height || 600) * scale);

  let p = sharp(inputPath)
    .resize(w, h, { kernel: sharp.kernel.lanczos3, fit: "fill", withoutEnlargement: false })
    // Light sharpen after upscale to recover edge crispness
    .sharpen({ sigma: 0.8, m1: 0.5, m2: 1.5 });

  p = applyOutputFormat(p, outputPath);
  await p.toFile(outputPath);
  return { width: w, height: h, originalWidth: meta.width, originalHeight: meta.height };
}

// ══════════════════════════════════════════════════════════════════════════════
// FEATURE 2 — Blur Remove / Sharpen
// Blurry photo ko clear karna, face details improve
// ══════════════════════════════════════════════════════════════════════════════
async function sharpenImage(inputPath, outputPath, intensity = "medium") {
  const profiles = {
    light:  { sigma: 0.6, m1: 0.4, m2: 1.2, x1: 2, y2: 8,  y3: 15 },
    medium: { sigma: 1.2, m1: 1.0, m2: 2.5, x1: 2, y2: 10, y3: 25 },
    strong: { sigma: 1.8, m1: 2.0, m2: 4.0, x1: 2, y2: 15, y3: 40 },
  };
  const cfg = profiles[intensity] || profiles.medium;

  let p = sharp(inputPath)
    .median(3)           // light denoise before sharpen so we don't enhance noise
    .sharpen(cfg);

  p = applyOutputFormat(p, outputPath);
  await p.toFile(outputPath);
  return { intensityUsed: intensity };
}

// ══════════════════════════════════════════════════════════════════════════════
// FEATURE 3 — Noise Removal
// Grainy / dark photo clean karna, low-light photos improve
// ══════════════════════════════════════════════════════════════════════════════
async function removeNoise(inputPath, outputPath, level = "medium") {
  // Median removes salt-and-pepper; Gaussian smooths luminance noise
  const medianKernel = { light: 3, medium: 5, strong: 7 }[level] || 5;

  // Two-pass: median (removes speckle) → slight gaussian-like blur (smooths)
  // Then re-sharpen edges to recover detail
  let p = sharp(inputPath)
    .median(medianKernel)
    .blur(0.4)                       // very gentle luminance smoothing
    .sharpen({ sigma: 0.5, m1: 0, m2: 1.0 }); // recover fine edges

  p = applyOutputFormat(p, outputPath);
  await p.toFile(outputPath);
  return { denoiseLevel: level, medianKernel };
}

// ══════════════════════════════════════════════════════════════════════════════
// FEATURE 4 — Old Photo Restore
// Faded repair, scratches soften, B&W to warm-toned colour hint
// ══════════════════════════════════════════════════════════════════════════════
async function restoreOldPhoto(inputPath, outputPath, colorize = false) {
  const meta = await sharp(inputPath).metadata();
  const isGrayscale = meta.channels <= 2;

  let p = sharp(inputPath)
    // Normalise to fix faded/low-contrast look
    .normalise({ lower: 2, upper: 98 })
    // Slightly boost contrast and remove yellowing/fading
    .modulate({ brightness: 1.08, saturation: colorize ? 0.0 : 1.1 })
    .linear(1.18, -15)               // contrast stretch
    // Smooth out scratches / grain
    .median(3)
    .sharpen({ sigma: 0.7, m1: 0.6, m2: 1.4 });

  // If colorize requested: convert to grayscale then tint warm sepia
  if (colorize || isGrayscale) {
    const raw = await p.raw().toBuffer({ resolveWithObject: true });
    const { data, info } = raw;

    // Convert to RGB if grayscale, apply sepia tone matrix
    p = sharp(inputPath)
      .normalise({ lower: 2, upper: 98 })
      .grayscale()
      .toColorspace("srgb")
      // Sepia tint via tint()
      .tint({ r: 220, g: 180, b: 130 })
      .modulate({ brightness: 1.05, saturation: 0.6 })
      .median(3)
      .sharpen({ sigma: 0.7, m1: 0.6, m2: 1.4 });
  }

  p = applyOutputFormat(p, outputPath);
  await p.toFile(outputPath);
  return { colorized: colorize || isGrayscale, restored: true };
}

// ══════════════════════════════════════════════════════════════════════════════
// FEATURE 5 — Background Remove
// Edge-based alpha mask → transparent PNG
// Note: True AI bg removal needs @imgly/background-removal or remove.bg API
//       This implementation uses sharp's threshold + alpha channel approach
//       For production, integrate remove.bg free-tier or @tensorflow/tfjs model
// ══════════════════════════════════════════════════════════════════════════════
async function removeBackground(inputPath, outputPath) {
  const meta = await sharp(inputPath).metadata();
  const w = meta.width;
  const h = meta.height;

  // Step 1: Get greyscale version to use as luminance mask
  const greyBuf = await sharp(inputPath)
    .grayscale()
    .raw()
    .toBuffer();

  // Step 2: Create alpha mask — threshold light backgrounds (>200) as transparent
  // This works well for white/light studio backgrounds
  const alphaBuf = Buffer.alloc(w * h);
  for (let i = 0; i < greyBuf.length; i++) {
    const lum = greyBuf[i];
    // Light background → transparent; dark subject → opaque
    alphaBuf[i] = lum > 220 ? 0 : lum > 180 ? Math.round(((220 - lum) / 40) * 255) : 255;
  }

  // Step 3: Extract RGB from original and combine with alpha
  const { data: rgbData, info: rgbInfo } = await sharp(inputPath)
    .removeAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  // Build RGBA buffer
  const rgbaData = Buffer.alloc(w * h * 4);
  for (let i = 0; i < w * h; i++) {
    rgbaData[i * 4 + 0] = rgbData[i * 3 + 0]; // R
    rgbaData[i * 4 + 1] = rgbData[i * 3 + 1]; // G
    rgbaData[i * 4 + 2] = rgbData[i * 3 + 2]; // B
    rgbaData[i * 4 + 3] = alphaBuf[i];          // A
  }

  // Step 4: Always output PNG (transparency requires PNG)
  const pngPath = outputPath.replace(/\.[^/.]+$/, ".png");
  await sharp(rgbaData, { raw: { width: w, height: h, channels: 4 } })
    .png({ compressionLevel: 6 })
    .toFile(pngPath);

  return { outputPath: pngPath, transparent: true, note: "Light-background removal applied. For complex backgrounds, integrate remove.bg API." };
}

// ══════════════════════════════════════════════════════════════════════════════
// FEATURE 6 — Face Enhancement
// Skin smooth, skin tone balance, eye/edge clarity
// ══════════════════════════════════════════════════════════════════════════════
async function enhanceFace(inputPath, outputPath) {
  // Face enhancement strategy:
  // - Gentle blur pass → removes skin blemishes / pores (beauty mode)
  // - Selective sharpen on edges → keeps eyes, lips, eyebrows crisp
  // - Slight brightness + warmth boost → natural skin glow
  // - Saturation balance → healthy skin tone

  let p = sharp(inputPath)
    // Skin softening — very light blur (acts like frequency separation)
    .blur(0.6)
    // Re-sharpen structural edges (eyes, hair, lips)
    .sharpen({ sigma: 1.4, m1: 0, m2: 3.0, x1: 3, y2: 15, y3: 30 })
    // Warmth + brightness for natural glow
    .modulate({ brightness: 1.06, saturation: 1.15, hue: 3 })
    // Contrast lift — makes face pop
    .linear(1.1, -8)
    // Normalise dark face photos
    .normalise({ lower: 1, upper: 99 });

  p = applyOutputFormat(p, outputPath);
  await p.toFile(outputPath);
  return { faceEnhanced: true, skinSoftened: true, eyesSharpened: true };
}

// ══════════════════════════════════════════════════════════════════════════════
// FEATURE 7 — Color Correction
// Auto white balance, levels, vibrance, contrast
// ══════════════════════════════════════════════════════════════════════════════
async function colorCorrect(inputPath, outputPath) {
  // Auto colour correction pipeline:
  // 1. Normalise histogram (auto levels)
  // 2. Modulate saturation (vibrance)
  // 3. Linear contrast stretch
  // 4. Slight brightness lift

  // Step 1: Get channel stats for white balance
  const { channels } = await sharp(inputPath).stats();
  const rMean = channels[0]?.mean || 128;
  const gMean = channels[1]?.mean || 128;
  const bMean = channels[2]?.mean || 128;
  const overall = (rMean + gMean + bMean) / 3;

  // Gray-world white balance multipliers
  const rMult = overall / rMean;
  const gMult = overall / gMean;
  const bMult = overall / bMean;

  // Clamp multipliers to prevent crazy shifts
  const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
  const rC = clamp(rMult, 0.7, 1.4);
  const gC = clamp(gMult, 0.7, 1.4);
  const bC = clamp(bMult, 0.7, 1.4);

  // Apply colour correction
  let p = sharp(inputPath)
    // White balance via recomb matrix (3×3 colour matrix)
    .recomb([
      [rC, 0,  0 ],
      [0,  gC, 0 ],
      [0,  0,  bC],
    ])
    // Auto levels
    .normalise({ lower: 1, upper: 99 })
    // Vibrance (boost undersaturated colours more)
    .modulate({ brightness: 1.04, saturation: 1.25 })
    // Contrast punch
    .linear(1.12, -10);

  p = applyOutputFormat(p, outputPath);
  await p.toFile(outputPath);
  return {
    whiteBalance: { rMultiplier: rC.toFixed(3), gMultiplier: gC.toFixed(3), bMultiplier: bC.toFixed(3) },
    vibranceBoost: "1.25×",
    contrastStretch: "1.12×",
  };
}

// ══════════════════════════════════════════════════════════════════════════════
// FEATURE 8 — AI Object Remove (Content-Aware Fill)
// Unwanted object ko photo se hatana
// Region: { x, y, width, height } — the region to remove
// ══════════════════════════════════════════════════════════════════════════════
async function removeObject(inputPath, outputPath, region) {
  const meta = await sharp(inputPath).metadata();
  const imgW = meta.width;
  const imgH = meta.height;

  // Default region: centre strip (demo fallback)
  const rx = region?.x      ?? Math.floor(imgW * 0.3);
  const ry = region?.y      ?? Math.floor(imgH * 0.3);
  const rw = region?.width  ?? Math.floor(imgW * 0.4);
  const rh = region?.height ?? Math.floor(imgH * 0.4);

  // Content-aware fill using sharp:
  // 1. Extract pixels surrounding the region
  // 2. Create a blurred/averaged patch from neighbours
  // 3. Composite it over the unwanted region

  // Sample patch from left of the region (as background reference)
  const sampleX = Math.max(0, rx - rw);
  const sampleW = Math.min(rw, rx);

  let patchBuf;
  try {
    patchBuf = await sharp(inputPath)
      .extract({ left: sampleX, top: ry, width: sampleW || rw, height: rh })
      .resize(rw, rh, { fit: "fill" }) // stretch to fill
      .blur(8)                          // blur so it blends in
      .raw()
      .toBuffer();
  } catch {
    // Fallback: use blurred full image crop around region
    patchBuf = await sharp(inputPath)
      .extract({ left: Math.max(0, rx - 20), top: Math.max(0, ry - 20), width: rw + 40, height: rh + 40 })
      .blur(20)
      .resize(rw, rh)
      .raw()
      .toBuffer();
  }

  // Convert patch to PNG
  const patchPNG = await sharp(patchBuf, { raw: { width: rw, height: rh, channels: 3 } })
    .png()
    .toBuffer();

  // Composite patch over original at the region coordinates
  let p = sharp(inputPath)
    .composite([
      {
        input: patchPNG,
        left: rx,
        top: ry,
        blend: "over",
      },
    ])
    // Smooth the seam
    .blur(1.5)
    .sharpen({ sigma: 0.8, m1: 0.5, m2: 1.5 });

  p = applyOutputFormat(p, outputPath);
  await p.toFile(outputPath);
  return {
    objectRemoved: true,
    region: { x: rx, y: ry, width: rw, height: rh },
    note: "Content-aware fill applied. For complex scenes, integrate Stability AI Inpainting API.",
  };
}

// ══════════════════════════════════════════════════════════════════════════════
// MASTER PIPELINE — Run all selected features in sequence
// ══════════════════════════════════════════════════════════════════════════════
async function runPipeline(inputPath, features, options = {}) {
  const results = {};
  let currentPath = inputPath;
  let stepCount = 0;

  const tempFiles = [];

  for (const feature of features) {
    stepCount++;
    const isLast = stepCount === features.length;
    const outName = isLast
      ? uniqueName(path.basename(inputPath), `enhanced_final`)
      : `__temp_step${stepCount}_${Date.now()}.png`;
    const outPath = isLast
      ? path.join(DIRS.enhanced, outName)
      : path.join(DIRS.temp, outName);

    if (!isLast) tempFiles.push(outPath);

    switch (feature) {
      case "upscale":
        results.upscale = await upscaleImage(currentPath, outPath, options.scale || 2);
        break;
      case "sharpen":
        results.sharpen = await sharpenImage(currentPath, outPath, options.sharpenIntensity || "medium");
        break;
      case "denoise":
        results.denoise = await removeNoise(currentPath, outPath, options.denoiseLevel || "medium");
        break;
      case "restore":
        results.restore = await restoreOldPhoto(currentPath, outPath, options.colorize || false);
        break;
      case "bgremove":
        results.bgremove = await removeBackground(currentPath, outPath);
        // bgremove always outputs PNG
        if (results.bgremove.outputPath) outPath = results.bgremove.outputPath;
        break;
      case "face":
        results.face = await enhanceFace(currentPath, outPath);
        break;
      case "color":
        results.color = await colorCorrect(currentPath, outPath);
        break;
      case "objremove":
        results.objremove = await removeObject(currentPath, outPath, options.region || null);
        break;
      default:
        console.warn(`[Pipeline] Unknown feature: ${feature}`);
        continue;
    }

    currentPath = outPath;
  }

  // Cleanup temp files
  tempFiles.forEach(f => { try { fs.unlinkSync(f); } catch {} });

  return { finalPath: currentPath, results };
}

// ══════════════════════════════════════════════════════════════════════════════
// CONTROLLERS (Express route handlers)
// ══════════════════════════════════════════════════════════════════════════════

/**
 * POST /api/image/enhance
 * Multipart: file
 * Body JSON (or query):
 *   features   : comma-separated list  e.g. "upscale,denoise,sharpen,color"
 *   scale      : 2 | 3 | 4
 *   preset     : "portrait" | "landscape" | "product" | "restore" | "auto"
 *   colorize   : true/false (for restore feature)
 *   denoiseLevel: "light" | "medium" | "strong"
 *   sharpenIntensity: "light" | "medium" | "strong"
 *   region     : JSON { x, y, width, height } for object remove
 */
exports.enhanceImageController = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: "No file uploaded." });

    const ext = getExt(req.file.originalname);
    if (!SUPPORTED_FORMATS.includes(ext)) {
      return res.status(415).json({ success: false, message: `Unsupported format: .${ext}` });
    }

    // ── Resolve features list 
    const PRESET_FEATURES = {
      auto:      ["denoise", "upscale", "sharpen", "color"],
      portrait:  ["denoise", "face", "color", "upscale"],
      landscape: ["upscale", "sharpen", "color", "denoise"],
      product:   ["upscale", "sharpen", "color", "bgremove"],
      restore:   ["denoise", "restore", "upscale", "color"],
      full:      ["denoise", "upscale", "sharpen", "face", "color", "restore"],
    };

    const preset   = req.query.preset || req.body.preset || "auto";
    const rawFeats = req.query.features || req.body.features;
    const features = rawFeats
      ? rawFeats.split(",").map(f => f.trim())
      : (PRESET_FEATURES[preset] || PRESET_FEATURES.auto);

    // ── Options 
    let region = null;
    try { region = req.body.region ? JSON.parse(req.body.region) : null; } catch {}

    const options = {
      scale:             parseFloat(req.query.scale  || req.body.scale  || 2),
      denoiseLevel:      req.query.denoiseLevel      || req.body.denoiseLevel      || "medium",
      sharpenIntensity:  req.query.sharpenIntensity  || req.body.sharpenIntensity  || "medium",
      colorize:         (req.query.colorize          || req.body.colorize) === "true",
      region,
    };

    const inputPath = req.file.path;
    const inputStats = fs.statSync(inputPath);

    // ── Run pipeline 
    const { finalPath, results } = await runPipeline(inputPath, features, options);

    const outputStats = fs.statSync(finalPath);
    const outMeta = await sharp(finalPath).metadata();
    const inMeta  = await sharp(inputPath).metadata().catch(() => ({ width: 0, height: 0 }));

    // Cleanup original upload
    try { fs.unlinkSync(inputPath); } catch {}

    return res.status(200).json({
      success: true,
      message: "Image enhanced successfully! ✨",
      data: {
        filename:    path.basename(finalPath),
        downloadUrl: `/api/image/download/${path.basename(finalPath)}`,
        previewUrl:  `/api/image/preview/${path.basename(finalPath)}`,
        original: {
          width:  inMeta.width,
          height: inMeta.height,
          size:   fmtSize(inputStats.size),
          format: ext.toUpperCase(),
        },
        enhanced: {
          width:  outMeta.width,
          height: outMeta.height,
          size:   fmtSize(outputStats.size),
          format: getExt(finalPath).toUpperCase(),
        },
        pipeline: {
          preset,
          featuresApplied: features,
          options,
          stepResults: results,
        },
      },
    });

  } catch (err) {
    console.error("[enhanceImageController]", err);
    return res.status(500).json({ success: false, message: "Enhancement failed.", error: err.message });
  }
};

/**
 * POST /api/image/upscale-only
 * Quick single-feature endpoint
 */
exports.upscaleOnly = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: "No file uploaded." });
    const outName = uniqueName(req.file.originalname, "upscaled");
    const outPath = path.join(DIRS.enhanced, outName);
    const data = await upscaleImage(req.file.path, outPath, parseFloat(req.query.scale || 2));
    fs.unlinkSync(req.file.path);
    res.json({ success: true, data: { downloadUrl: `/api/image/download/${outName}`, ...data } });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
};

/**
 * POST /api/image/sharpen-only
 */
exports.sharpenOnly = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: "No file uploaded." });
    const outName = uniqueName(req.file.originalname, "sharpened");
    const outPath = path.join(DIRS.enhanced, outName);
    const data = await sharpenImage(req.file.path, outPath, req.query.intensity || "medium");
    fs.unlinkSync(req.file.path);
    res.json({ success: true, data: { downloadUrl: `/api/image/download/${outName}`, ...data } });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
};

/**
 * POST /api/image/denoise-only
 */
exports.denoiseOnly = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: "No file uploaded." });
    const outName = uniqueName(req.file.originalname, "denoised");
    const outPath = path.join(DIRS.enhanced, outName);
    const data = await removeNoise(req.file.path, outPath, req.query.level || "medium");
    fs.unlinkSync(req.file.path);
    res.json({ success: true, data: { downloadUrl: `/api/image/download/${outName}`, ...data } });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
};

/**
 * POST /api/image/restore-only
 */
exports.restoreOnly = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: "No file uploaded." });
    const outName = uniqueName(req.file.originalname, "restored");
    const outPath = path.join(DIRS.enhanced, outName);
    const colorize = req.query.colorize === "true";
    const data = await restoreOldPhoto(req.file.path, outPath, colorize);
    fs.unlinkSync(req.file.path);
    res.json({ success: true, data: { downloadUrl: `/api/image/download/${outName}`, ...data } });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
};

/**
 * POST /api/image/bgremove-only
 */
exports.bgRemoveOnly = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: "No file uploaded." });
    const outName = uniqueName(req.file.originalname, "nobg").replace(/\.[^/.]+$/, ".png");
    const outPath = path.join(DIRS.enhanced, outName);
    const data = await removeBackground(req.file.path, outPath);
    fs.unlinkSync(req.file.path);
    const finalName = path.basename(data.outputPath || outPath);
    res.json({ success: true, data: { downloadUrl: `/api/image/download/${finalName}`, ...data } });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
};

/**
 * POST /api/image/face-only
 */
exports.faceOnly = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: "No file uploaded." });
    const outName = uniqueName(req.file.originalname, "face");
    const outPath = path.join(DIRS.enhanced, outName);
    const data = await enhanceFace(req.file.path, outPath);
    fs.unlinkSync(req.file.path);
    res.json({ success: true, data: { downloadUrl: `/api/image/download/${outName}`, ...data } });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
};

/**
 * POST /api/image/color-only
 */
exports.colorOnly = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: "No file uploaded." });
    const outName = uniqueName(req.file.originalname, "color");
    const outPath = path.join(DIRS.enhanced, outName);
    const data = await colorCorrect(req.file.path, outPath);
    fs.unlinkSync(req.file.path);
    res.json({ success: true, data: { downloadUrl: `/api/image/download/${outName}`, ...data } });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
};

/**
 * POST /api/image/objremove-only
 * Body: region JSON { x, y, width, height }
 */
exports.objRemoveOnly = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: "No file uploaded." });
    let region = null;
    try { region = req.body.region ? JSON.parse(req.body.region) : null; } catch {}
    const outName = uniqueName(req.file.originalname, "objremoved");
    const outPath = path.join(DIRS.enhanced, outName);
    const data = await removeObject(req.file.path, outPath, region);
    fs.unlinkSync(req.file.path);
    res.json({ success: true, data: { downloadUrl: `/api/image/download/${outName}`, ...data } });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
};

/**
 * GET /api/image/download/:filename
 */
exports.downloadImage = (req, res) => {
  const fp = path.join(DIRS.enhanced, req.params.filename);
  if (!fs.existsSync(fp)) return res.status(404).json({ success: false, message: "File not found." });
  res.download(fp);
};

/**
 * GET /api/image/preview/:filename
 */
exports.previewImage = (req, res) => {
  const fp = path.join(DIRS.enhanced, req.params.filename);
  if (!fs.existsSync(fp)) return res.status(404).json({ success: false, message: "File not found." });
  res.sendFile(fp);
};

/**
 * GET /api/image/info
 */
exports.getInfo = (req, res) => {
  res.json({
    success: true,
    version: "2.0.0",
    supportedFormats: SUPPORTED_FORMATS.map(f => f.toUpperCase()),
    features: {
      upscale:   "Image Upscaling — Chhoti photo badi karna (Lanczos3)",
      sharpen:   "Blur Remove — Blurry photo clear karna (Unsharp Mask)",
      denoise:   "Noise Removal — Grainy/dark photo clean karna",
      restore:   "Old Photo Restore — Faded/scratched photo repair + optional colorize",
      bgremove:  "Background Remove — Transparent PNG banana",
      face:      "Face Enhancement — Skin smooth + eye clarity",
      color:     "Color Correction — Auto white balance + vibrance",
      objremove: "Object Remove — Unwanted object hatana (Content-Aware Fill)",
    },
    presets: {
      auto:      "Denoise → Upscale → Sharpen → Color (general use)",
      portrait:  "Denoise → Face → Color → Upscale (selfies/portraits)",
      landscape: "Upscale → Sharpen → Color → Denoise (scenery)",
      product:   "Upscale → Sharpen → Color → BG Remove (ecommerce)",
      restore:   "Denoise → Restore → Upscale → Color (old photos)",
      full:      "All features combined (slowest, best quality)",
    },
  });
};








