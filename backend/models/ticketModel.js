const mongoose = require('mongoose')

const ticketSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    product: {
      type: String,
      required: [true, 'Please select a product'],
      enum: ['iPhone', 'Macbook', 'iMac', 'iPad', 'IT', 'HR', 'Financiar'], // Asigura-te ca ai si departamentele noi aici
    },
    description: {
      type: String,
      required: [true, 'Please enter a description of the issue'],
    },
    priority: {
      type: String,
      enum: ['Mica', 'Medie', 'Mare'],
      default: 'Mica',
    },
    status: {
      type: String,
      required: true,
      enum: ['new', 'open', 'closed'],
      default: 'new',
    },
    // --- CAMP NOU PENTRU ASIGNARE ---
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User', // Face legatura cu colectia de Useri
      required: false // Nu e obligatoriu la creare (cand e 'new')
    }
  },
  {
    timestamps: true,
  }
)

module.exports = mongoose.model('Ticket', ticketSchema)