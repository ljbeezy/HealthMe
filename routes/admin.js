const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const authMiddleware = require('../middleware/authMiddleware');
const { checkRole } = require('../middleware/roleMiddleware');

// Middleware stack: 1. Verify Token, 2. Verify 'admin' Role
const isAdmin = [authMiddleware, checkRole('admin')];

router.get('/stats', isAdmin, adminController.getSystemStats);
router.get('/users', isAdmin, adminController.getAllUsers);
router.delete('/users/:id', isAdmin, adminController.deleteUser);

module.exports = router;