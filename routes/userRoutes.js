const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

router.get('/', userController.getAllUsers);
router.post('/', userController.createUser);
router.patch('/:id', userController.updateUserProfile);

// Alamat endpoints
router.post('/:id/alamat', userController.addAlamat);
router.put('/:id/alamat/:alamatId', userController.editAlamat);
router.delete('/:id/alamat/:alamatId', userController.deleteAlamat);
router.patch('/:id/alamat/:alamatId/utama', userController.setAlamatUtama);

module.exports = router;