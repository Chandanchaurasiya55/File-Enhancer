// ============================================================
//  Controller/video.controller.js
//  Sirf controller logic — compressVideo, getJobStatus, downloadVideo, cleanupOldFiles
// ============================================================

const ffmpeg = require("fluent-ffmpeg");
const ffmpegStatic = require("ffmpeg-static");
const ffprobeStatic = require("ffprobe-static");
const path = require("path");
const fs = require("fs");
const { v4: uuidv4 } = require("uuid");
const { execFileSync } = require("child_process");
const upload = require("../config/multer.config");

// ---------------------------------------------------------------------------
//  Helper to pick a working ffmpeg executable.  On Windows the static binary
//  shipped with "ffmpeg-static" sometimes crashes if the VC++ redistributable
//  is missing or the CPU architecture doesn't match.  We try the static
//  build first and fall back to whatever "ffmpeg" is on the PATH.  If neither
//  works we log an explicit warning so developers know why conversions fail.
// ---------------------------------------------------------------------------
function chooseFfmpegPath() {
  let candidate = ffmpegStatic;

  const test = (exe) => {
    try {
      execFileSync(exe, ["-version"], { stdio: "ignore" });
      return true;
    } catch (err) {
      return false;
    }
  };

  if (candidate && test(candidate)) {
    console.log(`[FFMPEG] using static binary: ${candidate}`);
    return candidate;
  }

  console.warn(
    `[FFMPEG] static binary failed to execute, falling back to system ffmpeg`
  );

  // try system ffmpeg
  candidate = "ffmpeg";
  if (test(candidate)) {
    console.log(`[FFMPEG] using system ffmpeg from PATH`);
    return candidate;
  }

  console.error(
    "[FFMPEG] no working ffmpeg found – please install ffmpeg or VC++ redistributable"
  );
  // we still set something so fluent-ffmpeg attempts to spawn it and will
  // produce a clear error later.
  return candidate;
}

// Configure ffmpeg and ffprobe paths
ffmpeg.setFfmpegPath(chooseFfmpegPath());
ffmpeg.setFfprobePath(ffprobeStatic.path);

// ─── Directory paths ─────────────────────────────────────────────────────────
const UPLOADS_DIR = path.join(__dirname, "..", "uploads");
const OUTPUTS_DIR = path.join(__dirname, "..", "outputs");

// Agar folders exist nahi karte toh automatically bana do
[UPLOADS_DIR, OUTPUTS_DIR].forEach((dir) => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

// ─── In-Memory Job Store ──────────────────────────────────────────────────────
// Real app mein aap Redis ya MongoDB use kar sakte ho
// Abhi ke liye simple object kaafi hai
const jobs = {};
//  Structure of each job:
//  {
//    status       : "processing" | "done" | "error",
//    progress     : 0-100,
//    outputFile   : "compressed_xyz.mp4" | null,
//    originalName : "myvideo.mp4",
//    originalSize : "25.30",        ← MB mein
//    compressedSize: "11.20" | null, ← MB mein (done hone ke baad)
//    error        : null | "some error message"
//  }

// ─── Helper: File size MB mein ────────────────────────────────────────────────
const getFileSizeMB = (filePath) => {
  const bytes = fs.statSync(filePath).size;
  return (bytes / (1024 * 1024)).toFixed(2); // "25.30"
};

// ─── Helper: Purani file delete karo (try-catch safe) ────────────────────────
const safeDelete = (filePath) => {
  fs.unlink(filePath, (err) => {
    if (err) console.warn(`[WARN] File delete failed: ${filePath}`);
  });
};

// ══════════════════════════════════════════════════════════════════════════════
//  1. compressVideo
//  Route: POST /api/compress
//  Body : multipart/form-data → field name = "video"
//  Flow :
//    → File multer ke through upload hogi (config/multer.config.js se)
//    → Ek unique jobId banega
//    → Job register hoga in-memory store mein
//    → Client ko turant jobId milega (202 Accepted)
//    → Background mein FFmpeg se compression chalegi
// ══════════════════════════════════════════════════════════════════════════════
const compressVideo = (req, res) => {
  // Agar multer ne file nahi pakdi toh error do
  if (!req.file) {
    return res.status(400).json({
      success: false,
      error: "Koi file upload nahi hui. 'video' field mein MP4 bhejo.",
    });
  }

  // ── Job setup ──────────────────────────────────────────────────────────────
  const jobId          = uuidv4();
  const inputPath      = req.file.path;                          // uploaded file ka path
  const originalName   = path.parse(req.file.originalname).name; // extension hata ke naam
  const outputFilename = `compressed_${originalName}_${jobId}.mp4`;
  const outputPath     = path.join(OUTPUTS_DIR, outputFilename);

  // Job ko store karo
  jobs[jobId] = {
    status       : "processing",
    progress     : 0,
    outputFile   : null,
    originalName : req.file.originalname,
    originalSize : getFileSizeMB(inputPath),
    compressedSize: null,
    error        : null,
  };

  console.log(`[JOB START] ${jobId} → ${req.file.originalname} (${jobs[jobId].originalSize} MB)`);

  // ── Client ko turant respond karo ─────────────────────────────────────────
  // 202 = "Request accepted, processing chal raha hai"
  res.status(202).json({
    success : true,
    jobId,
    message : "Compression shuru ho gayi! Status check karte raho.",
    statusUrl  : `/api/status/${jobId}`,
    downloadUrl: `/api/download/${jobId}`,
  });

  // ── FFmpeg Compression (background mein chalti hai)
  //  Settings explain:
  //  libx264       → sabse popular video codec, sab jagah chalti hai
  //  aac           → audio codec
  //  audioBitrate  → 96k (original 128-192k hota hai → size kam hogi)
  //  -crf 28       → Constant Rate Factor: 18=best quality, 51=worst
  //                  28 pe ~40-55% size reduction hoti hai, quality acchi rehti hai
  //  -preset fast  → encoding speed vs compression balance
  //  -movflags +faststart → browser mein stream hone ke liye (download bhi fast)
  //  scale iw*0.9  → 90% resolution (subtly kam, lekin size mein zyada farak)
  //  yuv420p       → maximum device compatibility ke liye pixel format
  //
  ffmpeg(inputPath)
    .videoCodec("libx264")
    .audioCodec("aac")
    .audioBitrate("96k")
    .outputOptions([
      "-crf 28",
      "-preset fast",
      "-movflags +faststart",
      "-vf scale=iw*0.9:ih*0.9",
      "-pix_fmt yuv420p",
    ])
    .output(outputPath)

    // Progress update (percent 0-100)
    .on("progress", (progress) => {
      const pct = Math.round(progress.percent || 0);
      jobs[jobId].progress = pct;
      console.log(`[PROGRESS] ${jobId} → ${pct}%`);
    })

    // Compression complete!
    .on("end", () => {
      const compressedSize = getFileSizeMB(outputPath);
      const originalSize   = jobs[jobId].originalSize;
      const saved          = (((originalSize - compressedSize) / originalSize) * 100).toFixed(1);

      jobs[jobId].status        = "done";
      jobs[jobId].progress      = 100;
      jobs[jobId].outputFile    = outputFilename;
      jobs[jobId].compressedSize = compressedSize;

      console.log(`[JOB DONE] ${jobId} → ${originalSize}MB → ${compressedSize}MB (${saved}% saved)`);

      // Original uploaded file delete karo (disk space bachao)
      safeDelete(inputPath);
    })

    // Koi error aaya (corrupted file, unsupported format, crash, etc.)
    // fluent-ffmpeg passes stderr/stdout as additional arguments; log them
    .on("error", (err, stdout, stderr) => {
      console.error(`[JOB ERROR] ${jobId} → ${err.message}`);
      if (stderr) console.error(`[FFMPEG STDERR] ${stderr}`);
      if (stdout) console.debug(`[FFMPEG STDOUT] ${stdout}`);

      jobs[jobId].status = "error";
      jobs[jobId].error  = err.message;

      // Input file cleanup (avoid leaving corrupt uploads)
      safeDelete(inputPath);
    })

    .run(); // ← FFmpeg start!
};

// ══════════════════════════════════════════════════════════════════════════════
//  2. getJobStatus
//  Route: GET /api/status/:jobId
//  Use  : Frontend isko bar bar call karta hai (polling) progress jaanne ke liye
//  Response:
//    { status, progress, originalSize, compressedSize, ... }
// ══════════════════════════════════════════════════════════════════════════════
const getJobStatus = (req, res) => {
  const { jobId } = req.params;
  const job = jobs[jobId];

  if (!job) {
    return res.status(404).json({
      success: false,
      error: `Job ID '${jobId}' nahi mila. Shayad expire ho gaya ya galat ID hai.`,
    });
  }

  return res.status(200).json({
    success: true,
    jobId,
    ...job, // status, progress, originalSize, compressedSize, error, etc.
  });
};

// ══════════════════════════════════════════════════════════════════════════════
//  3. downloadVideo
//  Route: GET /api/download/:jobId
//  Use  : Job done hone ke baad user is URL se compressed video download kar sakta hai
//  Note : res.download() automatically "Content-Disposition: attachment" header set karta hai
//         jisse browser directly download shuru kar deta hai
// ══════════════════════════════════════════════════════════════════════════════
const downloadVideo = (req, res) => {
  const { jobId } = req.params;
  const job = jobs[jobId];

  // Job exist nahi karta?
  if (!job) {
    return res.status(404).json({
      success: false,
      error: "Job nahi mila. Galat ID ya expire ho gaya.",
    });
  }

  // Job abhi bhi chal raha hai?
  if (job.status === "processing") {
    return res.status(202).json({
      success: false,
      error: `Compression abhi chal rahi hai. Progress: ${job.progress}%`,
    });
  }

  // Job fail hua tha?
  if (job.status === "error") {
    return res.status(500).json({
      success: false,
      error: `Compression fail hui thi: ${job.error}`,
    });
  }

  // Output file disk pe hai?
  const filePath = path.join(OUTPUTS_DIR, job.outputFile);
  if (!fs.existsSync(filePath)) {
    return res.status(410).json({
      success: false,
      error: "File expire ho gayi ya delete ho gayi. Dobara compress karo.",
    });
  }

  // ✅ Sab theek hai → File download karo
  const downloadName = `compressed_${job.originalName}`;
  console.log(`[DOWNLOAD] ${jobId} → ${downloadName}`);

  res.download(filePath, downloadName, (err) => {
    if (err) {
      console.error(`[DOWNLOAD ERROR] ${jobId} → ${err.message}`);
      // Headers already send ho chuki hain toh res.json nahi kar sakte
    }
  });
};

// ══════════════════════════════════════════════════════════════════════════════
//  4. cleanupOldFiles  (utility function - cleanup.js ya yahan se call karo)
//  Yeh function 1 ghante se purani output files delete karta hai
//  server.js ya app.js mein setInterval ke saath call karo
// ══════════════════════════════════════════════════════════════════════════════
const cleanupOldFiles = () => {
  const ONE_HOUR = 60 * 60 * 1000;
  const now      = Date.now();

  fs.readdir(OUTPUTS_DIR, (err, files) => {
    if (err) return console.warn("[CLEANUP] outputs folder read nahi hua:", err.message);

    files.forEach((file) => {
      const filePath = path.join(OUTPUTS_DIR, file);
      fs.stat(filePath, (err, stat) => {
        if (!err && now - stat.mtimeMs > ONE_HOUR) {
          safeDelete(filePath);
          console.log(`[CLEANUP] Deleted old file: ${file}`);

          // Memory mein bhi job clean karo (optional)
          Object.keys(jobs).forEach((id) => {
            if (jobs[id].outputFile === file) delete jobs[id];
          });
        }
      });
    });
  });
};

// ── Export karo ──────────────────────────────────────────────────────────────
module.exports = {
  upload,
  compressVideo,
  getJobStatus,
  downloadVideo,
  cleanupOldFiles,
};