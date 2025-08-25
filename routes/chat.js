const express = require("express");
const router = express.Router();
const { handleChat, handleReview, handleValidation, handleEnhanceImage } = require("../controllers/chatController");
const multer = require('multer');
// Use memory storage for serverless compatibility
const upload = multer({ storage: multer.memoryStorage() });

router.post('/', handleChat);
router.post('/review', handleReview);
router.post('/validate', handleValidation);
router.post('/enhance-image', upload.single('file'), handleEnhanceImage);

module.exports = router;