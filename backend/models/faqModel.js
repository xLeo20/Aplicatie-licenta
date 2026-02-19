const mongoose = require('mongoose')

const faqSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User', // Știm ce admin/agent a creat articolul
    },
    title: {
      type: String,
      required: [true, 'Te rog adaugă un titlu pentru articol'],
    },
    content: {
      type: String,
      required: [true, 'Te rog adaugă conținutul articolului'],
    },
    category: {
      type: String,
      required: [true, 'Te rog selectează o categorie'],
      enum: ['IT', 'HR', 'Financiar', 'General'],
      default: 'General',
    },
  },
  {
    timestamps: true, // Adaugă automat createdAt și updatedAt
  }
)

module.exports = mongoose.model('Faq', faqSchema)