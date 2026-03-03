const express = require('express');
const router = express.Router();
const { getFaqs, createFaq, deleteFaq } = require('../controllers/faqController');
const { protect } = require('../middleware/authMiddleware');

router.route('/')
    .get(protect, getFaqs)
    .post(protect, createFaq);

router.route('/:id')
    .delete(protect, deleteFaq);

module.exports = router;