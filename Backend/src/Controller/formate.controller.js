const path = require("path");
const fs = require("fs");
const { execSync } = require("child_process");
const os = require("os");

// ─── Output Directory 
const outputDir = path.join(__dirname, "converted");
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// ─── Detect LibreOffice Path (Windows / Mac / Linux)
const getLibreOfficePath = () => {
  const platform = os.platform();

  if (platform === "win32") {
    // Common Windows install paths
    const winPaths = [
      "C:\\Program Files\\LibreOffice\\program\\soffice.exe",
      "C:\\Program Files (x86)\\LibreOffice\\program\\soffice.exe",
    ];
    for (const p of winPaths) {
      if (fs.existsSync(p)) return `"${p}"`;
    }
    // Fallback: assume it's in PATH
    return "soffice";
  }

  if (platform === "darwin") {
    return "/Applications/LibreOffice.app/Contents/MacOS/soffice";
  }

  // Linux
  return "soffice";
};

// ─── Detect Pandoc Path ─
const getPandocPath = () => {
  const platform = os.platform();
  if (platform === "win32") {
    // Pandoc installer usually adds to PATH on Windows
    return "pandoc";
  }
  return "pandoc";
};

// ─── Conversion Matrix (Defines which formats can be converted to which, and by which tool)
// Defines which tool handles which conversion
const conversionMatrix = {
  pdf:  { targets: ["docx", "html", "txt", "png", "jpg"],  tool: "libreoffice" },
  docx: { targets: ["pdf", "html", "txt", "xml"],           tool: "both" },
  doc:  { targets: ["pdf", "docx", "html", "txt"],          tool: "libreoffice" },
  pptx: { targets: ["pdf", "html", "txt", "png"],           tool: "libreoffice" },
  ppt:  { targets: ["pdf", "pptx", "html", "txt"],          tool: "libreoffice" },
  xlsx: { targets: ["pdf", "html", "csv", "txt"],           tool: "libreoffice" },
  xls:  { targets: ["pdf", "xlsx", "html", "csv"],          tool: "libreoffice" },
  html: { targets: ["pdf", "docx", "txt", "xml"],           tool: "both" },
  htm:  { targets: ["pdf", "docx", "txt", "xml"],           tool: "both" },
  xml:  { targets: ["html", "txt", "docx"],                 tool: "pandoc" },
};

// ─── Build Conversion Command Based on Source/Target and Available Tools 
const getConversionCommand = (inputPath, sourceExt, targetFormat, outputPath) => {
  const libreOffice = getLibreOfficePath();
  const pandoc = getPandocPath();
  const outDir = path.dirname(outputPath);

  const pandocTargets = ["docx", "html", "txt", "xml", "md"];
  const pandocSources = ["docx", "html", "htm", "xml", "txt", "md"];

  // Use Pandoc if both source and target are pandoc-compatible
  if (pandocSources.includes(sourceExt) && pandocTargets.includes(targetFormat)) {
    return {
      tool: "pandoc",
      cmd: `${pandoc} "${inputPath}" -o "${outputPath}"`,
    };
  }

  // Use LibreOffice for everything else
  return {
    tool: "libreoffice",
    // Windows-safe: wrap paths in quotes
    cmd: `${libreOffice} --headless --convert-to ${targetFormat} "${inputPath}" --outdir "${outDir}"`,
  };
};

// ─── Find Actual Output File (LibreOffice renames files automatically) 
const findOutputFile = (outDir, inputFilename, targetFormat) => {
  const baseName = path.parse(inputFilename).name;

  // LibreOffice output: <original-name>.<targetFormat>
  const expected = path.join(outDir, `${baseName}.${targetFormat}`);
  if (fs.existsSync(expected)) return expected;

  // Search directory for any newly created file with correct extension
  const files = fs.readdirSync(outDir);
  const match = files.find(
    (f) =>
      f.endsWith(`.${targetFormat}`) &&
      f.startsWith(baseName.substring(0, 5))
  );
  if (match) return path.join(outDir, match);

  return null;
};

// ─── CONTROLLER: Convert File 
const convertFile = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: "No file uploaded." });
  }

  const inputPath  = req.file.path;
  const targetFormat = req.targetFormat;
  const sourceExt  = path.extname(req.file.originalname).toLowerCase().replace(".", "");
  const originalName = path.parse(req.file.originalname).name.replace(/\s+/g, "_");
  const outputFileName = `${originalName}_converted.${targetFormat}`;
  const outputPath = path.join(outputDir, outputFileName);

  // ── Check if conversion is supported ──
  const srcMatrix = conversionMatrix[sourceExt];
  if (!srcMatrix || !srcMatrix.targets.includes(targetFormat)) {
    if (fs.existsSync(inputPath)) fs.unlinkSync(inputPath);
    return res.status(422).json({
      success: false,
      message: `Conversion from .${sourceExt} → .${targetFormat} is not supported.`,
      supportedTargets: srcMatrix ? srcMatrix.targets : [],
    });
  }

  try {
    const conversion = getConversionCommand(inputPath, sourceExt, targetFormat, outputPath);

    console.log(`[Converter] Running: ${conversion.cmd}`);

    // Execute conversion
    execSync(conversion.cmd, { stdio: "pipe" });

    // Locate the output file
    let finalOutputPath = outputPath;

    if (conversion.tool === "libreoffice") {
      // LibreOffice names the output after the INPUT filename
      const libreOutput = findOutputFile(outputDir, req.file.filename, targetFormat);
      if (libreOutput) {
        finalOutputPath = libreOutput;
      }
    }

    if (!fs.existsSync(finalOutputPath)) {
      throw new Error("Conversion ran but output file was not found.");
    }

    // ── Send file as download ──
    res.download(finalOutputPath, outputFileName, (err) => {
      // Cleanup temp files after download
      try {
        if (fs.existsSync(inputPath)) fs.unlinkSync(inputPath);
        if (fs.existsSync(finalOutputPath)) fs.unlinkSync(finalOutputPath);
      } catch (cleanupErr) {
        console.error("[Cleanup Error]", cleanupErr.message);
      }
      if (err) console.error("[Download Error]", err.message);
    });

  } catch (error) {
    // Cleanup on failure
    try {
      if (fs.existsSync(inputPath)) fs.unlinkSync(inputPath);
    } catch (_) {}

    console.error("[Conversion Error]", error.message);

    return res.status(500).json({
      success: false,
      message: "File conversion failed.",
      error: error.message,
      tip: "Make sure LibreOffice and Pandoc are installed and accessible in PATH.",
    });
  }
};

// ─── CONTROLLER: Get Supported Formats 
const getSupportedFormats = (req, res) => {
  const matrix = {};
  for (const [src, val] of Object.entries(conversionMatrix)) {
    matrix[`.${src}`] = val.targets.map((t) => `.${t}`);
  }

  res.json({
    success: true,
    message: "Supported format conversion list",
    platform: os.platform(),
    libreOfficePath: getLibreOfficePath(),
    pandocPath: getPandocPath(),
    supportedInputFormats:  Object.keys(conversionMatrix).map((k) => `.${k}`),
    supportedOutputFormats: ["pdf","docx","pptx","xlsx","html","txt","xml","csv","png","jpg"],
    conversionMatrix: matrix,
  });
};

// ─── UTILITY: Cleanup Old Converted Files ───────────────────────────────────
// Deletes converted files older than 1 hour to free up space
const cleanupConvertedFiles = () => {
  const ONE_HOUR = 60 * 60 * 1000;
  const now = Date.now();

  fs.readdir(outputDir, (err, files) => {
    if (err) return console.warn("[CLEANUP] converted folder read failed:", err.message);

    files.forEach((file) => {
      const filePath = path.join(outputDir, file);
      fs.stat(filePath, (err, stat) => {
        if (!err && now - stat.mtimeMs > ONE_HOUR) {
          fs.unlinkSync(filePath);
          console.log(`[CLEANUP] Deleted old converted file: ${file}`);
        }
      });
    });
  });
};

module.exports = { convertFile, getSupportedFormats, cleanupConvertedFiles };