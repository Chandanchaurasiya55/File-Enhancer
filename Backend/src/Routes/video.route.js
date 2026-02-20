const express = require('express');
const {
    upload,
    compressVideo,
    enhanceVideo,
    downloadVideo,
    getVideoInfo
} = require('../Controller/video.controller');

const router = express.Router();

// Video processing routes
router.post('/compress', upload.single('video'), compressVideo);
router.post('/enhance', upload.single('video'), enhanceVideo);
router.post('/info', upload.single('video'), getVideoInfo);
router.get('/download/:filename', downloadVideo);

module.exports = router;
