const mongoose = require('mongoose');

const faqSchema = mongoose.Schema({
    question: {
        type: String,
        required: [true, 'Te rog adaugă o întrebare']
    },
    answer: {
        type: String,
        required: [true, 'Te rog adaugă un răspuns']
    },
    category: {
        type: String,
        required: [true, 'Te rog adaugă o categorie (ex: IT, HR, Financiar)'],
        default: 'General'
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Faq', faqSchema);