const mongoose = require('mongoose');

const noteSchema = mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User' // Cine a scris nota
  },
  ticket: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'Ticket' // De care tichet apartine
  },
  text: {
    type: String,
    required: [true, 'Te rog adauga un text'],
  },
  isStaff: {
    type: Boolean,
    default: false // Ajuta frontend-ul sa stie daca e mesaj de la agent sau angajat
  },
  staffId: {
    type: String // Optional, ID-ul agentului
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Note', noteSchema);