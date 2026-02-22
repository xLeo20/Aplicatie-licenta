const express = require('express');
const router = express.Router();
const { getFaqs, createFaq, deleteFaq } = require('../controllers/faqController');

const { protect } = require('../middleware/authMiddleware');

router.route('/')
    .get(protect, getFaqs)       // Citește FAQ-urile
    .post(protect, createFaq);   // Adaugă FAQ nou

router.route('/:id')
    .delete(protect, deleteFaq); // Șterge FAQ

module.exports = router;