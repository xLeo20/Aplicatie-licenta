const mongoose = require('mongoose');

const notificationSchema = mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User'
  },
  message: {
    type: String,
    required: [true, 'Adauga un mesaj pentru notificare']
  },
  ticketId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Ticket'
  },
  isRead: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Notification', notificationSchema);