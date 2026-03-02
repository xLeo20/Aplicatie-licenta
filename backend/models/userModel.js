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
    default: 'General'
    // Am șters enum-ul de aici ca să poți salva și vechile 'HR' și noile 'Comercial' fără erori
  },
  profileImage: { type: String, required: false, default: '' },
}, {
  timestamps: true
});

module.exports = mongoose.model('User', userSchema);