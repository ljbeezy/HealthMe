require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI;

app.use(express.json());
app.use(cors());

const authRoutes = require('./routes/auth');
const patientRoutes = require('./routes/patient');
const doctorRoutes = require('./routes/doctor');
const aiRoutes = require('./routes/ai');
const videoRoutes = require('./routes/video');
const insuranceRoutes = require('./routes/insurance');
const notificationRoutes = require('./routes/notification');
const adminRoutes = require('./routes/admin');

app.use('/api/auth', authRoutes);
app.use('/api/patient', patientRoutes);
app.use('/api/doctor', doctorRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/video', videoRoutes);
app.use('/api/insurance', insuranceRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/admin', adminRoutes);

const __dirnameResolved = path.resolve();

app.use(express.static(path.join(__dirname, 'public'), { index: false }));

app.get('/', (req, res) => {
    res.redirect('/pages/login/index.html');
});

// FIX: Use regex /.*/ instead of string '*' to avoid PathError
app.get(/.*/, (req, res) => {
    // If request is not for API, send them to login
    if (!req.path.startsWith('/api')) {
        res.redirect('/pages/login/index.html');
    }
});

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB connected successfully.');
    app.listen(PORT, () => {
      console.log(`🚀 Server running at http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.error('❌ MongoDB connection error:', error);
  });