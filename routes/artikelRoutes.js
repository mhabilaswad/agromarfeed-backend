const express = require('express');
const router = express.Router();
const ArtikelController = require('../controllers/artikelController');

router.post('/', ArtikelController.createArtikel);

// GET semua artikel: /api/artikels
router.get('/', ArtikelController.getAllArtikel);

// GET artikel berdasarkan ID: /api/artikels/:id
router.get('/:id', ArtikelController.getArtikelById);

module.exports = router;
