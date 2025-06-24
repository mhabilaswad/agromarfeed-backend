const express = require('express');
const router = express.Router();
const konsultanController = require('../controllers/konsultanController');

// Rute untuk CRUD Konsultan
router.post('/', konsultanController.createKonsultan);
router.get('/', konsultanController.getAllKonsultan);
router.get('/:id', konsultanController.getKonsultanById);
router.put('/:id', konsultanController.updateKonsultan);
router.delete('/:id', konsultanController.deleteKonsultan);

module.exports = router;