const mongoose = require('mongoose');

const ticketSchema = mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User' 
  },
  product: {
    type: String,
    required: [true, 'Selectează departamentul/produsul'],
    enum: ['IT', 'HR', 'Financiar', 'iPhone', 'Macbook', 'Mac', 'iPad'], 
  },
  description: {
    type: String,
    required: [true, 'Descrie problema întampinata'],
  },
  status: {
    type: String,
    enum: ['new', 'open', 'closed'],
    default: 'new'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Ticket', ticketSchema);