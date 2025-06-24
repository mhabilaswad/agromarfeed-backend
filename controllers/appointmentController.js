const Appointment = require('../models/appointment/appointment');

// Create appointment
exports.createAppointment = async (req, res) => {
  try {
    const appointment = new Appointment(req.body);
    await appointment.save();
    res.status(201).json(appointment);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Get all appointments
exports.getAllAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find();
    res.status(200).json(appointments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get appointment by ID
exports.getAppointmentById = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) return res.status(404).json({ message: 'Appointment tidak ditemukan' });
    res.status(200).json(appointment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update appointment by ID
exports.updateAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!appointment) return res.status(404).json({ message: 'Appointment tidak ditemukan' });
    res.status(200).json(appointment);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete appointment by ID
exports.deleteAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findByIdAndDelete(req.params.id);
    if (!appointment) return res.status(404).json({ message: 'Appointment tidak ditemukan' });
    res.status(200).json({ message: 'Appointment berhasil dihapus' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}; 