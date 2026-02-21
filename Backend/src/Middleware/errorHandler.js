// ============================================================
//  middlewares/errorHandler.js
//  Global error handler — koi bhi unhandled error yahan aayega aur JSON response ke saath client ko bheja jayega.
//  Multer ke errors bhi yahan handle honge jaise file size limit aur wrong file type.
// ============================================================

const errorHandler = (err, req, res, next) => {
  console.error(`[ERROR] ${err.message}`);

  // Multer ka file size error
  if (err.code === "LIMIT_FILE_SIZE") {
    return res.status(413).json({
      success: false,
      error: "File bahut badi hai! Maximum 500 MB allowed hai.",
    });
  }

  // Multer ka wrong file type error
  if (err.message && err.message.includes("Sirf MP4")) {
    return res.status(415).json({
      success: false,
      error: err.message,
    });
  }

  // Generic error
  return res.status(err.status || 500).json({
    success: false,
    error: err.message || "Server mein kuch gadbad ho gayi.",
  });
};

module.exports = errorHandler;
