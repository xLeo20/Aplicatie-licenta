const express = require('express')
const router = express.Router()
const { getFaqs, createFaq, deleteFaq } = require('../controllers/faqController')

// Importăm middleware-ul care ne asigură că userul este logat
const { protect } = require('../middleware/authMiddleware')

// Rutele
router.route('/').get(protect, getFaqs).post(protect, createFaq)
router.route('/:id').delete(protect, deleteFaq)

module.exports = router