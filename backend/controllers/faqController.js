const asyncHandler = require('express-async-handler');
const Faq = require('../models/faqModel');

// @desc    Preia toate FAQ-urile
// @route   GET /api/faqs
// @access  Private (Toți angajații au voie să le vadă)
const getFaqs = asyncHandler(async (req, res) => {
    const faqs = await Faq.find({});
    res.status(200).json(faqs);
});

// @desc    Crează un FAQ nou
// @route   POST /api/faqs
// @access  Private (Doar Agent / Admin)
const createFaq = asyncHandler(async (req, res) => {
    const { question, answer, category } = req.body;

    if (!question || !answer) {
        res.status(400);
        throw new Error('Te rog completează întrebarea și răspunsul');
    }

    // Verificăm dacă user-ul este simplu angajat (nu are voie să adauge)
    if (req.user.role === 'angajat') {
        res.status(401);
        throw new Error('Nu ești autorizat să adaugi articole în baza de cunoștințe');
    }

    const faq = await Faq.create({
        question,
        answer,
        category: category || 'General'
    });

    res.status(201).json(faq);
});

// @desc    Șterge un FAQ
// @route   DELETE /api/faqs/:id
// @access  Private (Doar Agent / Admin)
const deleteFaq = asyncHandler(async (req, res) => {
    if (req.user.role === 'angajat') {
        res.status(401);
        throw new Error('Nu ești autorizat să ștergi articole');
    }

    const faq = await Faq.findById(req.params.id);

    if (!faq) {
        res.status(404);
        throw new Error('Articolul nu a fost găsit');
    }

    await faq.deleteOne();
    res.status(200).json({ success: true, id: req.params.id });
});

module.exports = {
    getFaqs,
    createFaq,
    deleteFaq
};