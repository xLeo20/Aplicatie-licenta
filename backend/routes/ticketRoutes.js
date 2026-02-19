const express = require('express');
const router = express.Router();
const multer = require('multer'); // <--- ADAUGAT PENTRU UPLOAD
const path = require('path');     // <--- ADAUGAT PENTRU UPLOAD

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

// --- CONFIGURARE MULTER (Pentru salvarea atașamentelor) ---
const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, 'uploads/'); // Aici se vor salva fișierele
  },
  filename(req, file, cb) {
    cb(null, `ticket-${Date.now()}${path.extname(file.originalname)}`);
  },
});
const upload = multer({ storage });

// --- 2. Redirecționăm orice cerere care se termina in /notes catre noteRouter
router.use('/:ticketId/notes', noteRouter);

// --- RUTA PENTRU UPLOAD FIȘIER ---
// ATENȚIE: Trebuie să stea deasupra rutei router.route('/:id')
router.post('/upload', protect, upload.single('attachment'), (req, res) => {
  if (!req.file) {
    return res.status(400).send('Niciun fișier încărcat.');
  }
  // Returnăm calea relativă către fișier pentru a o salva în baza de date
  res.send(`/${req.file.path.replace(/\\/g, '/')}`);
});

// Rutele standard
router.route('/')
  .get(protect, getTickets)
  .post(protect, createTicket);

router.route('/:id')
  .get(protect, getTicket)
  .delete(protect, deleteTicket)
  .put(protect, updateTicket);

// Rute speciale (Assign, Suspend)
router.put('/:id/assign', protect, assignTicket);
router.put('/:id/suspend', protect, suspendTicket);

module.exports = router;