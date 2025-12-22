const express = require('express');
const router = express.Router();
const { getTickets, createTicket } = require('../controllers/ticketController');
const { protect } = require('../middleware/authMiddleware');

// Aici folosim "protect" pentru a securiza ruta
// O singura linie pentru ambele: GET (afisare) si POST (creare)
router.route('/').get(protect, getTickets).post(protect, createTicket);

module.exports = router;