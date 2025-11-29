const express = require('express');
const router = express.Router();
const doctorController = require('../controllers/doctorController');
const authMiddleware = require('../middleware/authMiddleware');
const { checkRole } = require('../middleware/roleMiddleware');

router.get('/patients', [authMiddleware, checkRole('doctor')], doctorController.getAllPatients);
router.get('/patients/:patientId/symptoms', [authMiddleware, checkRole('doctor')], doctorController.getPatientSymptomHistory);
router.get('/appointments', [authMiddleware, checkRole('doctor')], doctorController.getDoctorAppointments);
router.get('/messages', [authMiddleware, checkRole('doctor')], doctorController.getDoctorMessages);
router.post('/messages', [authMiddleware, checkRole('doctor')], doctorController.replyToMessage);
router.delete('/messages/:id', [authMiddleware, checkRole('doctor')], doctorController.deleteMessage);
router.get('/patients/:patientId/insurance', authMiddleware, doctorController.getPatientInsurance);

module.exports = router;