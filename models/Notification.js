const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  recipient: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  message: { 
    type: String, 
    required: true 
  },
  type: { 
    type: String, 
    enum: ['message', 'appointment', 'system', 'video_call'], 
    default: 'system' 
  },
  threadParticipant: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User'
  },
  roomId: {
    type: String
  },
  isRead: { 
    type: Boolean, 
    default: false 
  }
}, { timestamps: true });

module.exports = mongoose.model('Notification', notificationSchema);