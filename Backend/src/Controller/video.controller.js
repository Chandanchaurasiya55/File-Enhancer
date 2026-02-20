const express = require('express');
const ffmpeg = require('fluent-ffmpeg');
const ffmpegStatic = require('ffmpeg-static');
const ffprobeStatic = require('ffprobe-static');
const fs = require('fs');
const path = require('path');
const multer = require('multer');

// Set FFmpeg and FFprobe paths from the installed packages
ffmpeg.setFfmpegPath(ffmpegStatic);
ffmpeg.setFfprobePath(ffprobeStatic.path);

console.log('✅ FFmpeg path configured:', ffmpegStatic ? 'SUCCESS' : 'FAILED');
console.log('✅ FFprobe path configured:', ffprobeStatic.path ? 'SUCCESS' : 'FAILED');

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadsDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

// File filter to only allow video files
const fileFilter = (req, file, cb) => {
    const allowedMimes = [
        'video/mp4', 'video/mpeg', 'video/quicktime', 'video/x-msvideo',
        'video/x-matroska', 'video/webm', 'video/x-flv', 'video/3gpp'
    ];
    
    if (allowedMimes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error(`Invalid file type. Allowed types: MP4, MOV, AVI, MKV, WEBM, FLV, 3GP`), false);
    }
};

// Create multer instance with 2GB limit
const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: { fileSize: 2 * 1024 * 1024 * 1024 } // 2GB
});

/**
 * Get format settings based on input file extension
 * Maps input video formats to appropriate codec settings for Windows Media Player compatibility
 */
function getFormatSettings(inputPath) {
    const ext = path.extname(inputPath).toLowerCase();
    
    const formatMap = {
        '.mp4': {
            ext: '.mp4',
            videoCodec: 'libx264',
            audioCodec: 'aac',
            options: [
                '-preset medium',
                '-crf 28',
                '-pix_fmt yuv420p',           // YUV 4:2:0 pixel format for universal compatibility
                '-profile:v main',             // H.264 Main profile (Windows compatible)
                '-level 3.1',                  // H.264 level (will be overridden per function)
                '-movflags +faststart'         // MP4 atoms at beginning for fast streaming
            ]
        },
        '.mov': {
            ext: '.mp4',                       // Convert MOV to MP4 for better compatibility
            videoCodec: 'libx264',
            audioCodec: 'aac',
            options: [
                '-preset medium',
                '-crf 28',
                '-pix_fmt yuv420p',
                '-profile:v main',
                '-level 3.1',
                '-movflags +faststart'
            ]
        },
        '.avi': {
            ext: '.mp4',                       // Convert AVI to MP4
            videoCodec: 'libx264',
            audioCodec: 'aac',
            options: [
                '-preset medium',
                '-crf 28',
                '-pix_fmt yuv420p',
                '-profile:v main',
                '-level 3.1',
                '-movflags +faststart'
            ]
        },
        '.mkv': {
            ext: '.mp4',                       // Convert MKV to MP4
            videoCodec: 'libx264',
            audioCodec: 'aac',
            options: [
                '-preset medium',
                '-crf 28',
                '-pix_fmt yuv420p',
                '-profile:v main',
                '-level 3.1',
                '-movflags +faststart'
            ]
        },
        '.webm': {
            ext: '.mp4',                       // Convert WebM to MP4
            videoCodec: 'libx264',
            audioCodec: 'aac',
            options: [
                '-preset medium',
                '-crf 28',
                '-pix_fmt yuv420p',
                '-profile:v main',
                '-level 3.1',
                '-movflags +faststart'
            ]
        },
        '.flv': {
            ext: '.mp4',                       // Convert FLV to MP4
            videoCodec: 'libx264',
            audioCodec: 'aac',
            options: [
                '-preset medium',
                '-crf 28',
                '-pix_fmt yuv420p',
                '-profile:v main',
                '-level 3.1',
                '-movflags +faststart'
            ]
        },
        '.3gp': {
            ext: '.mp4',                       // Convert 3GP to MP4
            videoCodec: 'libx264',
            audioCodec: 'aac',
            options: [
                '-preset medium',
                '-crf 28',
                '-pix_fmt yuv420p',
                '-profile:v main',
                '-level 3.1',
                '-movflags +faststart'
            ]
        }
    };
    
    return formatMap[ext] || formatMap['.mp4']; // Default to MP4 settings
}

/**
 * Validate video file using FFprobe
 * Returns Promise that resolves if valid, rejects with error message if invalid
 */
function validateVideoFile(inputPath) {
    return new Promise((resolve, reject) => {
        ffmpeg.ffprobe(inputPath, (err, metadata) => {
            if (err) {
                reject(new Error('Invalid or corrupted video file'));
                return;
            }
            
            // Check if file has video stream
            const hasVideo = metadata.streams.some(s => s.codec_type === 'video');
            if (!hasVideo) {
                reject(new Error('No video stream found in file'));
                return;
            }
            
            resolve();
        });
    });
}

/**
 * Upload video file
 * Returns the uploaded file info for further processing
 */
function uploadFile(req, res) {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'No file uploaded'
            });
        }

        res.status(200).json({
            success: true,
            file: {
                filename: req.file.filename,
                path: req.file.path,
                mimeType: req.file.mimetype,
                size: req.file.size
            }
        });
    } catch (err) {
        console.error('Error uploading file:', err);
        res.status(500).json({
            success: false,
            message: 'Server error during file upload: ' + err.message
        });
    }
}

/**
 * Compress video file
 * Reduces file size while maintaining acceptable quality (720p, 1500k bitrate)
 */
async function compressVideo(req, res) {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'No video file uploaded'
            });
        }

        const inputPath = req.file.path;
        const filename = req.file.filename;
        
        // Get format settings based on input file extension
        const formatSettings = getFormatSettings(inputPath);
        const outputFilename = `compressed-${Date.now()}${formatSettings.ext}`;
        const outputPath = path.join(uploadsDir, outputFilename);

        console.log(`📁 Input format: ${path.extname(inputPath).toUpperCase()} → Output format: ${formatSettings.ext.toUpperCase()}`);

        // First, validate the input video
        try {
            await validateVideoFile(inputPath);
        } catch (err) {
            if (fs.existsSync(inputPath)) fs.unlinkSync(inputPath);
            return res.status(400).json({
                success: false,
                message: '❌ ' + err.message
            });
        }

        return new Promise((resolve, reject) => {
            let command = ffmpeg(inputPath)
                .videoCodec(formatSettings.videoCodec)
                .audioCodec(formatSettings.audioCodec)
                .videoBitrate('1500k')
                .audioBitrate('128k')  // Increased from 96k to preserve audio quality
                .size('?x720');  // Scale to 720p height, maintain aspect ratio

            // Apply format-specific options
            if (formatSettings.options && formatSettings.options.length > 0) {
                command = command.outputOptions(formatSettings.options);
            }

            // Add audio normalization filter to prevent distortion and audio loss
            command = command.audioFilter('anull')
                .outputOptions([
                    '-shortest',  // Ensure proper duration handling
                    '-metadata:s:v:0',
                    'rotate=0'
                ]);

            command
                .on('start', (cmd) => {
                    console.log('🎬 Compression started - processing video...');
                    console.log(`   Codec: ${formatSettings.videoCodec} + ${formatSettings.audioCodec}`);
                    console.log(`   Format: ${formatSettings.ext}`);
                })
                .on('progress', (progress) => {
                    const percent = Math.round(progress.percent || 0);
                    if (percent % 10 === 0) {
                        console.log(`⏱️  Progress: ${percent}%`);
                    }
                })
                .on('end', function() {
                    Promise.resolve().then(async () => {
                        console.log('✅ Compression finished - verifying output...');
                        
                        try {
                            // Verify output file was created
                            if (!fs.existsSync(outputPath)) {
                                throw new Error('Output video file was not created');
                            }

                        // Get file sizes
                        const outputStats = fs.statSync(outputPath);
                        const outputSize = outputStats.size;

                        // Check if file is too small (likely corrupted)
                        if (outputSize < 500000) { // Less than 500KB - minimum viable size
                            throw new Error(`Output file is too small (${(outputSize/1024).toFixed(2)}KB) - likely corrupted or processing failed. Try a different video.`);
                        }
                        
                        // Validate output file is actually playable
                        try {
                            await validateVideoFile(outputPath);
                        } catch (err) {
                            throw new Error('Output video validation failed: ' + err.message + '. Output may be corrupted.');
                        }

                        const inputStats = fs.statSync(inputPath);
                        const originalSize = inputStats.size / (1024 * 1024); // in MB
                        const compressedSize = outputSize / (1024 * 1024); // in MB
                        const reduction = ((1 - compressedSize / originalSize) * 100).toFixed(2);

                        // Verify compressed file is smaller than original
                        if (compressedSize > originalSize) {
                            console.warn('⚠️  Compressed size is larger than original (encoding inefficient)');
                        }

                        console.log(`📊 Original: ${originalSize.toFixed(2)}MB → Compressed: ${compressedSize.toFixed(2)}MB (${reduction}% reduction)`);
                        console.log(`✅ Format: ${formatSettings.ext.toUpperCase()} - Windows Media Player compatible`);

                        // Delete original file
                        try { fs.unlinkSync(inputPath); } catch(e) {}

                        res.status(200).json({
                            success: true,
                            message: 'Video compressed successfully! 🎉 (Windows Media Player compatible)',
                            file: {
                                filename: outputFilename,
                                originalSize: originalSize.toFixed(2),
                                compressedSize: compressedSize.toFixed(2),
                                sizeReduction: reduction,
                                downloadUrl: `/api/video/download/${outputFilename}`
                            }
                        });
                        resolve();
                    } catch (err) {
                        console.error('❌ Error verifying compressed file:', err.message);
                        if (fs.existsSync(inputPath)) {
                            try { fs.unlinkSync(inputPath); } catch(e) {}
                        }
                        if (fs.existsSync(outputPath)) {
                            try { fs.unlinkSync(outputPath); } catch(e) {}
                        }
                        res.status(500).json({
                            success: false,
                            message: 'Error processing compressed video: ' + err.message
                        });
                        reject(err);
                    }
                    });  // End of Promise.resolve().then(async)
                })
                .on('error', (err) => {
                    console.error('❌ FFmpeg compression error:', err.message);
                    
                    // Clean up files
                    if (fs.existsSync(inputPath)) {
                        try { fs.unlinkSync(inputPath); } catch(e) {}
                    }
                    if (fs.existsSync(outputPath)) {
                        try { fs.unlinkSync(outputPath); } catch(e) {}
                    }
                    
                    // Friendly error message
                    let errorMsg = err.message;
                    if (err.message.includes('Cannot find ffmpeg')) {
                        errorMsg = '❌ FFmpeg is not installed. Please restart the server.';
                    } else if (err.message.includes('Invalid data found') || err.message.includes('codec')) {
                        errorMsg = '❌ The uploaded video file is corrupted or has an unsupported codec. Try another video.';
                    } else if (err.message.includes('ENOSPC')) {
                        errorMsg = '❌ Not enough disk space for compression. Free up space and try again.';
                    } else if (err.message.includes('Unknown encoder')) {
                        errorMsg = '❌ Codec not supported for this format. Please try a different video format.';
                    }
                    
                    res.status(500).json({
                        success: false,
                        message: errorMsg
                    });
                    reject(err);
                })
                .save(outputPath);
        });
    } catch (err) {
        console.error('❌ compressVideo error:', err);
        return res.status(500).json({
            success: false,
            message: 'Server error while compressing video: ' + err.message
        });
    }
}

/**
 * Enhance video file
 * Improves video quality with better bitrate and resolution (1080p, 6000k bitrate)
 */
async function enhanceVideo(req, res) {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'No video file uploaded'
            });
        }

        const inputPath = req.file.path;
        const filename = req.file.filename;
        
        // Get format settings based on input file extension
        const formatSettings = getFormatSettings(inputPath);
        const outputFilename = `enhanced-${Date.now()}${formatSettings.ext}`;
        const outputPath = path.join(uploadsDir, outputFilename);

        console.log(`📁 Input format: ${path.extname(inputPath).toUpperCase()} → Output format: ${formatSettings.ext.toUpperCase()}`);

        // First, validate the input video
        try {
            await validateVideoFile(inputPath);
        } catch (err) {
            if (fs.existsSync(inputPath)) fs.unlinkSync(inputPath);
            return res.status(400).json({
                success: false,
                message: '❌ ' + err.message
            });
        }

        return new Promise((resolve, reject) => {
            let command = ffmpeg(inputPath)
                .videoCodec(formatSettings.videoCodec)
                .audioCodec(formatSettings.audioCodec)
                .videoBitrate('6000k')
                .audioBitrate('192k')  // Increased from 160k for better audio quality
                .size('?x1080');  // Scale to 1080p height, maintain aspect ratio

            // Apply format-specific options with higher quality for enhancement
            const enhanceOptions = [
                '-preset medium',
                '-crf 20',                     // Lower CRF = better quality (20 vs 28)
                '-pix_fmt yuv420p',            // YUV 4:2:0 pixel format for universal compatibility
                '-profile:v main',             // H.264 Main profile (Windows compatible)
                '-level 4.1',                  // H.264 level 4.1 for better quality support
                '-movflags +faststart',        // MP4 atoms at beginning for fast streaming
                '-shortest'                    // Ensure proper duration handling
            ];

            if (enhanceOptions && enhanceOptions.length > 0) {
                command = command.outputOptions(enhanceOptions);
            }

            // Add audio normalization filter to prevent distortion and audio loss
            command = command.audioFilter('anull')
                .outputOptions([
                    '-metadata:s:v:0',
                    'rotate=0'
                ]);

            command
                .on('start', (cmd) => {
                    console.log('🎬 Enhancement started - improving video quality...');
                    console.log(`   Codec: ${formatSettings.videoCodec} + ${formatSettings.audioCodec}`);
                    console.log(`   Format: ${formatSettings.ext}`);
                })
                .on('progress', (progress) => {
                    const percent = Math.round(progress.percent || 0);
                    if (percent % 10 === 0) {
                        console.log(`⏱️  Progress: ${percent}%`);
                    }
                })
                .on('end', function() {
                    Promise.resolve().then(async () => {
                        console.log('✅ Enhancement finished - verifying output...');
                        
                        try {
                            // Verify output file was created
                            if (!fs.existsSync(outputPath)) {
                                throw new Error('Output video file was not created');
                            }

                        // Get file sizes
                        const outputStats = fs.statSync(outputPath);
                        const outputSize = outputStats.size;

                        // Check if file is too small (likely corrupted)
                        if (outputSize < 500000) { // Less than 500KB - minimum viable size
                            throw new Error(`Output file is too small (${(outputSize/1024).toFixed(2)}KB) - likely corrupted or processing failed. Try a different video.`);
                        }
                        
                        // Validate output file is actually playable
                        try {
                            await validateVideoFile(outputPath);
                        } catch (err) {
                            throw new Error('Output video validation failed: ' + err.message + '. Output may be corrupted.');
                        }

                        const inputStats = fs.statSync(inputPath);
                        const originalSize = inputStats.size / (1024 * 1024); // in MB
                        const enhancedSize = outputSize / (1024 * 1024); // in MB
                        const sizeIncrease = ((enhancedSize / originalSize - 1) * 100).toFixed(2);

                        console.log(`📊 Original: ${originalSize.toFixed(2)}MB → Enhanced: ${enhancedSize.toFixed(2)}MB (+${sizeIncrease}% quality)`);
                        console.log(`✅ Format: ${formatSettings.ext.toUpperCase()} - Windows Media Player compatible`);

                        // Delete original file
                        try { fs.unlinkSync(inputPath); } catch(e) {}

                        res.status(200).json({
                            success: true,
                            message: 'Video enhanced successfully! 🎉 (Windows Media Player compatible)',
                            file: {
                                filename: outputFilename,
                                originalSize: originalSize.toFixed(2),
                                enhancedSize: enhancedSize.toFixed(2),
                                sizeIncrease: sizeIncrease,
                                downloadUrl: `/api/video/download/${outputFilename}`
                            }
                        });
                        resolve();
                    } catch (err) {
                        console.error('❌ Error verifying enhanced file:', err.message);
                        if (fs.existsSync(inputPath)) {
                            try { fs.unlinkSync(inputPath); } catch(e) {}
                        }
                        if (fs.existsSync(outputPath)) {
                            try { fs.unlinkSync(outputPath); } catch(e) {}
                        }
                        res.status(500).json({
                            success: false,
                            message: 'Error processing enhanced video: ' + err.message
                        });
                        reject(err);
                    }
                    });  // End of Promise.resolve().then(async)
                })
                .on('error', (err) => {
                    console.error('❌ FFmpeg enhancement error:', err.message);
                    
                    // Clean up files
                    if (fs.existsSync(inputPath)) {
                        try { fs.unlinkSync(inputPath); } catch(e) {}
                    }
                    if (fs.existsSync(outputPath)) {
                        try { fs.unlinkSync(outputPath); } catch(e) {}
                    }
                    
                    // Friendly error message
                    let errorMsg = err.message;
                    if (err.message.includes('Cannot find ffmpeg')) {
                        errorMsg = '❌ FFmpeg is not installed. Please restart the server.';
                    } else if (err.message.includes('Invalid data found') || err.message.includes('codec')) {
                        errorMsg = '❌ The uploaded video file is corrupted or has an unsupported codec. Try another video.';
                    } else if (err.message.includes('ENOSPC')) {
                        errorMsg = '❌ Not enough disk space for enhancement. Free up space and try again.';
                    } else if (err.message.includes('Unknown encoder')) {
                        errorMsg = '❌ Codec not supported for this format. Please try a different video format.';
                    }
                    
                    res.status(500).json({
                        success: false,
                        message: errorMsg
                    });
                    reject(err);
                })
                .save(outputPath);
        });
    } catch (err) {
        console.error('❌ enhanceVideo error:', err);
        return res.status(500).json({
            success: false,
            message: 'Server error while enhancing video: ' + err.message
        });
    }
}

/**
 * Download processed video file
 */
function downloadVideo(req, res) {
    try {
        const { filename } = req.params;
        
        // Validate filename to prevent directory traversal attacks
        if (filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
            return res.status(400).json({
                success: false,
                message: 'Invalid filename'
            });
        }

        const filePath = path.join(uploadsDir, filename);

        if (!fs.existsSync(filePath)) {
            return res.status(404).json({
                success: false,
                message: 'File not found'
            });
        }

        res.download(filePath, filename, (err) => {
            if (err) {
                console.error('Download error:', err);
                if (!res.headersSent) {
                    res.status(500).json({
                        success: false,
                        message: 'Error downloading file'
                    });
                }
            }
        });
    } catch (err) {
        console.error('downloadVideo error:', err);
        return res.status(500).json({
            success: false,
            message: 'Server error while downloading video'
        });
    }
}

/**
 * Get video info
 */
function getVideoInfo(req, res) {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'No video file uploaded'
            });
        }

        const inputPath = req.file.path;

        ffmpeg.ffprobe(inputPath, (err, metadata) => {
            if (err) {
                console.error('Probe error:', err);
                return res.status(500).json({
                    success: false,
                    message: 'Error reading video information'
                });
            }

            const videoStream = metadata.streams.find(s => s.codec_type === 'video');
            const audioStream = metadata.streams.find(s => s.codec_type === 'audio');

            res.json({
                success: true,
                info: {
                    duration: metadata.format.duration,
                    size: (metadata.format.size / (1024 * 1024)).toFixed(2),
                    bitrate: (metadata.format.bit_rate / 1000).toFixed(0),
                    video: {
                        codec: videoStream?.codec_name,
                        width: videoStream?.width,
                        height: videoStream?.height,
                        fps: eval(videoStream?.r_frame_rate)
                    },
                    audio: {
                        codec: audioStream?.codec_name,
                        sampleRate: audioStream?.sample_rate,
                        channels: audioStream?.channels
                    }
                }
            });

            // Delete temporary file
            if (fs.existsSync(inputPath)) {
                fs.unlinkSync(inputPath);
            }
        });
    } catch (err) {
        console.error('getVideoInfo error:', err);
        return res.status(500).json({
            success: false,
            message: 'Server error while getting video info'
        });
    }
}

module.exports = {
    upload,
    uploadFile,
    compressVideo,
    enhanceVideo,
    downloadVideo,
    getVideoInfo
};
