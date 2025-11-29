const User = require('../models/User');
const Appointment = require('../models/Appointment');
const Message = require('../models/Message');
const Symptom = require('../models/Symptom');

// Get system-wide statistics
exports.getSystemStats = async (req, res) => {
    try {
        const totalPatients = await User.countDocuments({ role: 'patient' });
        const totalDoctors = await User.countDocuments({ role: 'doctor' });
        const totalAppointments = await Appointment.countDocuments();
        const totalMessages = await Message.countDocuments();

        res.json({
            users: { patients: totalPatients, doctors: totalDoctors },
            activity: { appointments: totalAppointments, messages: totalMessages }
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// Get all users (with optional role filter)
exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.find().select('-password').sort({ createdAt: -1 });
        res.json(users);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// Delete a user and all their related data (Cleanup)
exports.deleteUser = async (req, res) => {
    try {
        const userId = req.params.id;
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // 1. Delete the user
        await User.findByIdAndDelete(userId);

        // 2. Cleanup: Delete related data (Optional but "Pro")
        if (user.role === 'patient') {
            await Appointment.deleteMany({ patient: userId });
            await Message.deleteMany({ $or: [{ from: userId }, { to: userId }] });
            await Symptom.deleteMany({ patient: userId });
        } else if (user.role === 'doctor') {
            await Appointment.deleteMany({ doctor: userId });
            await Message.deleteMany({ $or: [{ from: userId }, { to: userId }] });
        }

        res.json({ message: 'User and related data deleted successfully.' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};