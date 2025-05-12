const express = require('express');
const router = express.Router();
const ArtikelController = require('../controllers/artikelController');

router.post('/', ArtikelController.createArtikel);

module.exports = router;
