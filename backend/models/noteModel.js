const mongoose = require('mongoose');

// Model pentru sistemul intern de mesagerie / timeline al fiecarui tichet
const noteSchema = mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User' // Legatura catre entitatea care a redactat mesajul (poate fi agent sau client)
  },
  ticket: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'Ticket' // Legatura logica catre tichetul parinte
  },
  text: {
    type: String,
    required: [true, 'Continutul mesajului nu poate fi gol.'],
  },
  // Flag folosit pe frontend pentru a stabili directia bulei de chat (stanga pentru staff, dreapta pt client etc)
  isStaff: {
    type: Boolean,
    default: false 
  },
  staffId: {
    type: String // Se completeaza doar daca isStaff este true
  },
  attachment: { 
    type: String, 
    default: null 
  },
  // Daca e true, nota nu a fost scrisa de om, ci de server (ex: "Agentul a schimbat statusul tichetului")
  isSystem: {
      type: Boolean,
      default: false
    }
}, {
  timestamps: true
});

module.exports = mongoose.model('Note', noteSchema);