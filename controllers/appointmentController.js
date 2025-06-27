const Appointment = require('../models/appointment/appointment');

// Create appointment
exports.createAppointment = async (req, res) => {
  try {
    // Generate unique orderId
    const orderId = `KONSULTASI-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    // Tambahkan orderId ke data appointment
    const appointmentData = { ...req.body, orderId };
    const appointment = new Appointment(appointmentData);
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

// Get appointment by orderId
exports.getAppointmentByOrderId = async (req, res) => {
  try {
    const { orderId } = req.query;
    if (!orderId) return res.status(400).json({ message: 'orderId diperlukan' });
    const appointment = await Appointment.findOne({ orderId });
    if (!appointment) return res.status(404).json({ message: 'Appointment tidak ditemukan' });
    res.status(200).json(appointment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get appointments by user_id
exports.getAppointmentsByUserId = async (req, res) => {
  try {
    const { user_id } = req.query;
    if (!user_id) return res.status(400).json({ message: 'user_id diperlukan' });
    
    console.log('Fetching appointments for user_id:', user_id);
    
    const appointments = await Appointment.find({ user_id })
      .populate('konsultan_id', 'nama profesi')
      .sort({ createdAt: -1 });
    
    console.log('Found appointments:', appointments.length);
    console.log('First appointment:', JSON.stringify(appointments[0], null, 2));
    
    res.status(200).json(appointments);
  } catch (error) {
    console.error('Error in getAppointmentsByUserId:', error);
    res.status(500).json({ message: error.message });
  }
}; 