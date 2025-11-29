const express = require('express');
const router = express.Router();
const insuranceController = require('../controllers/insuranceController');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/providers', authMiddleware, insuranceController.getProvidersByState);

router.post('/', authMiddleware, insuranceController.addInsurance);
router.get('/', authMiddleware, insuranceController.getInsurance);

module.exports = router;