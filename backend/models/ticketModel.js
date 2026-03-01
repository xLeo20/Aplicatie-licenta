const mongoose = require('mongoose');

const ticketSchema = mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    ticketId: {
        type: Number,
        unique: true, 
        sparse: true
    },
    // --- NOU: JIRA STYLE STRUCTURE ---
    issueType: {
        type: String,
        required: [true, 'Selecteaza tipul solicitarii'],
        enum: ['Incident', 'Cerere de Serviciu', 'Cerere de Acces', 'Onboarding / Offboarding']
    },
    category: {
        type: String,
        required: [true, 'Selecteaza o categorie'],
        enum: ['Hardware & Echipamente', 'Software & Licențe', 'Rețea & Comunicații', 'Conturi & Permisiuni', 'Infrastructură Administrativă']
    },
    // ---------------------------------
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
    feedback: {
      rating: {
        type: Number,
        min: 1,
        max: 5,
      },
      comment: {
        type: String,
      },
      isSubmitted: {
        type: Boolean,
        default: false,
      }
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
    pickupDeadline: {
        type: Date,
        required: false
    },
    assignedTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: false
    },
    attachment: {
      type: String,
      default: null
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Ticket', ticketSchema);