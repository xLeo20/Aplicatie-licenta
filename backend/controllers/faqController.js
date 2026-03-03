const asyncHandler = require('express-async-handler');
const Faq = require('../models/faqModel');

// @desc    Extrage lista cu intrebari frecvente
// @route   GET /api/faqs
// @access  Privat (orice utilizator logat poate citi baza de cunostinte)
const getFaqs = asyncHandler(async (req, res) => {
    const faqs = await Faq.find({});
    res.status(200).json(faqs);
});

// @desc    Adauga un articol nou in sectiunea FAQ
// @route   POST /api/faqs
// @access  Privat (doar agentii si adminii pot popula sectiunea)
const createFaq = asyncHandler(async (req, res) => {
    const { question, answer, category } = req.body;

    // Validare simpla pentru campurile necesare
    if (!question || !answer) {
        res.status(400);
        throw new Error('Validare esuata: Intrebarea si raspunsul sunt obligatorii.');
    }

    // Restrictionam accesul angajatilor normali pentru a mentine baza curata
    if (req.user.role === 'angajat') {
        res.status(401);
        throw new Error('Acces restrictionat. Doar personalul IT poate adauga articole.');
    }

    const faq = await Faq.create({
        question,
        answer,
        category: category || 'General' // Setam o categorie default daca nu e aleasa una
    });

    // Anuntam prin Socket.io ca a aparut un articol nou, pentru ca frontend-ul sa dea refresh instant
    const io = req.app.get('io');
    if (io) {
        io.emit('faqChanged');
    }

    res.status(201).json(faq);
});

// @desc    Sterge o intrebare din sistem
// @route   DELETE /api/faqs/:id
// @access  Privat (restrictie pe rol)
const deleteFaq = asyncHandler(async (req, res) => {
    if (req.user.role === 'angajat') {
        res.status(401);
        throw new Error('Acces restrictionat.');
    }

    const faq = await Faq.findById(req.params.id);

    if (!faq) {
        res.status(404);
        throw new Error('Articolul nu a putut fi localizat in baza de date.');
    }

    await faq.deleteOne();

    // Trigger de refresh pentru frontend
    const io = req.app.get('io');
    if (io) {
        io.emit('faqChanged'); 
    }

    res.status(200).json({ success: true, id: req.params.id });
});

module.exports = {
    getFaqs,
    createFaq,
    deleteFaq
};