const mongoose = require('mongoose');

// Schema centrala a aplicatiei (Inima sistemului de IT Service Management - ITSM)
const ticketSchema = mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User' // Initiatorul incidentului (End User)
    },
    ticketId: {
        type: Number,
        unique: true, 
        sparse: true // Permitem sa fie unic, dar sa functioneze corect si cu tichete vechi care nu il aveau setat
    },
    
    // Am sters "enum"-ul de aici ca sa nu ne mai blocheze Mongoose la denumirile noi
    issueType: {
        type: String,
        required: [true, 'Selectarea tipului de solicitare (Incident/Cerere) este obligatorie.']
    },
    
    // Am sters "enum"-ul de aici pentru a suporta absolut orice categorie pe care o pui in Frontend
    category: {
        type: String,
        required: [true, 'Selectarea ariei / categoriei este obligatorie pentru rutarea corecta a tichetului.']
    },


    description: {
        type: String,
        required: [true, 'Detalierea problemei este necesara pentru suport.']
    },
    status: {
        type: String, 
        required: true,
        // new = neatins, open = in lucru, suspended = pe pauza asteptand piese/info, closed = rezolvat definitiv
        enum: ['new', 'open', 'closed', 'suspended'],
        default: 'new'
    },
    // Modul de Customer Satisfaction (CSAT) disponibil doar dupa rezolvare
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
    // SLA Resolution - Timpul total permis pentru inchiderea incidentului
    deadline: {
        type: Date,
        required: false
    },
    // SLA Response (First Contact) - Timpul in care tichetul trebuie preluat de un agent
    pickupDeadline: {
        type: Date,
        required: false
    },
    // Utilizatorul tehnician care si-a insusit sarcina rezolvarii
    assignedTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: false
    },
    attachment: {
      type: String, // Referinta catre locatia fisierului in serverul de upload (ex: /uploads/img.png)
      default: null
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Ticket', ticketSchema);