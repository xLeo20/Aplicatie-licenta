const asyncHandler = require('express-async-handler')
const Faq = require('../models/faqModel')

// @desc    Obține toate articolele
// @route   GET /api/faqs
// @access  Private
const getFaqs = asyncHandler(async (req, res) => {
  const faqs = await Faq.find().sort({ createdAt: -1 }) // Cele mai noi primele
  res.status(200).json(faqs)
})

// @desc    Creează un articol nou
// @route   POST /api/faqs
// @access  Private (Doar Admin/Agent)
const createFaq = asyncHandler(async (req, res) => {
  const { title, content, category } = req.body

  if (!title || !content || !category) {
    res.status(400)
    throw new Error('Te rog completează toate câmpurile')
  }

  // Verificăm dacă utilizatorul are permisiunea (nu e simplu angajat)
  if (req.user.role === 'angajat') {
    res.status(403)
    throw new Error('Acces interzis. Doar agenții și adminii pot adăuga articole.')
  }

  const faq = await Faq.create({
    title,
    content,
    category,
    user: req.user.id,
  })

  res.status(201).json(faq)
})

// @desc    Șterge un articol
// @route   DELETE /api/faqs/:id
// @access  Private (Doar Admin/Agent)
const deleteFaq = asyncHandler(async (req, res) => {
  const faq = await Faq.findById(req.params.id)

  if (!faq) {
    res.status(404)
    throw new Error('Articolul nu a fost găsit')
  }

  if (req.user.role === 'angajat') {
    res.status(403)
    throw new Error('Acces interzis. Nu poți șterge acest articol.')
  }

  await faq.deleteOne()
  res.status(200).json({ id: req.params.id })
})

module.exports = {
  getFaqs,
  createFaq,
  deleteFaq,
}