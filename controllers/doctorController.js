const User = require('../models/User');
const Symptom = require('../models/Symptom');
const Appointment = require('../models/Appointment');
const Message = require('../models/Message');
const Insurance = require('../models/Insurance');
const Notification = require('../models/Notification');

exports.getAllPatients = async (req, res) => {
  try {
    const patients = await User.find({ role: 'patient' }).select('-password');
    res.json(patients);
  } catch (err) {
    res.status(500).send('Server Error');
  }
};

exports.getPatientSymptomHistory = async (req, res) => {
    try {
        const history = await Symptom.find({ patient: req.params.patientId }).sort({ date: -1 });
        res.json(history);
    } catch (err) {
        res.status(500).send('Server Error');
    }
};

exports.getDoctorAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find({ doctor: req.user.id })
      .populate('patient', 'email role')
      .sort({ date: 'asc' });
    res.json(appointments);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

exports.getDoctorMessages = async (req, res) => {
  try {
    const messages = await Message.find({
      $or: [{ from: req.user.id }, { to: req.user.id }]
    })
    .populate('from', 'email role')
    .populate('to', 'email role')
    .sort({ createdAt: 'asc' });

    res.json(messages);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

exports.replyToMessage = async (req, res) => {
  const { patientId, content } = req.body;

  if (!patientId || !content) {
    return res.status(400).json({ message: 'Patient ID and message content are required.' });
  }

  try {
    const patient = await User.findOne({ _id: patientId, role: 'patient' });
    if (!patient) {
      return res.status(404).json({ message: 'Recipient is not a valid patient.' });
    }

    const newMessage = new Message({
      from: req.user.id,
      to: patientId,
      content
    });

    await newMessage.save();
    await new Notification({
      recipient: patientId,
      message: `New message from Dr. ${req.user.email}`,
      type: 'message',
      threadParticipant: req.user.id
    }).save();
    res.status(201).json({ message: 'Reply sent successfully.' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

exports.getAllDoctors = async (req, res) => {
  try {
    const doctors = await User.find({ role: 'doctor' }).select('-password');
    res.json(doctors);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

exports.getPatientInsurance = async (req, res) => {
    try {
        console.log("🔎 Doctor looking for insurance...");
        console.log("   Target Patient ID:", req.params.patientId);

        const insurance = await Insurance.find({ patient: req.params.patientId }).sort({ createdAt: -1 });
        console.log("   Found:", insurance.length, "policies");
        res.json(insurance);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

exports.deleteMessage = async (req, res) => {
  try {
    const messageId = req.params.id;
    const doctorId = req.user.id;

    const message = await Message.findById(messageId);

    if (!message) {
      return res.status(404).json({ message: 'Message not found.' });
    }

    if (message.from.toString() !== doctorId) {
      return res.status(403).json({ message: 'Unauthorized.' });
    }

    await Message.findByIdAndDelete(messageId);
    res.json({ message: 'Message deleted.' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};