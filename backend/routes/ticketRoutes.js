const express = require('express');
const router = express.Router();
const { 
  getTickets, 
  createTicket, 
  getTicket, 
  deleteTicket, 
  updateTicket,
  assignTicket,
  suspendTicket // <--- Importam functia noua
} = require('../controllers/ticketController');

// --- 1. Importam router-ul de note
const noteRouter = require('./noteRoutes');

const { protect } = require('../middleware/authMiddleware');

// --- 2. Redirecționăm orice cerere care se termina in /notes catre noteRouter
router.use('/:ticketId/notes', noteRouter);

// Rutele
router.route('/')
  .get(protect, getTickets)
  .post(protect, createTicket);

router.route('/:id')
  .get(protect, getTicket)
  .delete(protect, deleteTicket)
  .put(protect, updateTicket);

// Rute speciale (Assign, Suspend)
router.put('/:id/assign', protect, assignTicket);
router.put('/:id/suspend', protect, suspendTicket); // <--- Ruta noua

module.exports = router;