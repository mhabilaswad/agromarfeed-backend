const express = require("express");
const router = express.Router();
const { handleChat, handleReview } = require("../controllers/chatController");

router.post('/', handleChat);
router.post('/review', handleReview);

module.exports = router;