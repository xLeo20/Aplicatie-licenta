const mongoose = require('mongoose');

const ticketSchema = mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    // --- ID SCURT ---
    ticketId: {
        type: Number,
        unique: true, 
        sparse: true
    },
    // ----------------
    product: {
        type: String,
        required: [true, 'Selecteaza un produs sau departament'],
        // AM SCOS ENUM-UL CA SA POTI PUNE ORICE (IT, Financiar, etc.)
    },
    description: {
        type: String,
        required: [true, 'Adauga o descriere a problemei']
    },
    status: {
        type: String, 
        required: true,
        enum: ['new', 'open', 'closed', 'suspended'],
        default: 'new'
    },
    priority: {
        type: String,
        enum: ['Mica', 'Medie', 'Mare'],
        default: 'Mica'
    },
    deadline: {
        type: Date,
        required: false
    },
    assignedTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: false
    },
    attachment: {
      type: String, // Aici vom salva calea către fișier (ex: /uploads/screenshot.png)
      default: null
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Ticket', ticketSchema);