const express = require('express');
const router = express.Router();
const appointmentController = require('../controllers/appointmentController');

router.post('/', appointmentController.createAppointment);
router.get('/', appointmentController.getAllAppointments);

// Place specific routes before parameterized routes to avoid conflicts
router.get('/by-order-id', appointmentController.getAppointmentByOrderId);
router.get('/by-user-id', appointmentController.getAppointmentsByUserId);

// Parameterized routes should come last
router.get('/:id', appointmentController.getAppointmentById);
router.put('/:id', appointmentController.updateAppointment);
router.delete('/:id', appointmentController.deleteAppointment);

module.exports = router; 
