const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Te rog adauga un nume']
  },
  email: {
    type: String,
    required: [true, 'Te rog adauga un email'],
    unique: true
  },
  password: {
    type: String,
    required: [true, 'Te rog adauga o parolă']
  },
  isAdmin: {
    type: Boolean,
    required: true,
    default: false
  },
  role: {
    type: String,
    enum: ['angajat', 'agent', 'admin'],
    default: 'angajat'
  },
  department: {
    type: String,
    enum: ['IT', 'HR', 'Financiar', 'General'],
    default: 'General'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('User', userSchema);