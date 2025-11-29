const express = require('express');
const router = express.Router();
const aiController = require('../controllers/aiController');
const authMiddleware = require('../middleware/authMiddleware');
const multer = require('multer');

const upload = multer({ storage: multer.memoryStorage() });

router.post('/chat', authMiddleware, aiController.chatWithBot);
router.post('/analyze', authMiddleware, aiController.analyzeSymptoms);
router.post('/transcribe', authMiddleware, upload.single('audio'), aiController.transcribeAudio);

module.exports = router;