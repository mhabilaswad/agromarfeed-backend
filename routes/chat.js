const express = require("express");
const router = express.Router();
const { handleChat, handleReview, handleEnhanceImage } = require("../controllers/chatController");
const multer = require('multer');
const upload = multer({ dest: 'public/uploads/' });

router.post('/', handleChat);
router.post('/review', handleReview);
router.post('/enhance-image', upload.single('file'), handleEnhanceImage);

module.exports = router;