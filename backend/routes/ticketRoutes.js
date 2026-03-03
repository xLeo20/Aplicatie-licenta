const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');

const { 
  getTickets, 
  createTicket, 
  getTicket, 
  deleteTicket, 
  updateTicket,
  assignTicket,
  suspendTicket,
  addFeedback,
  getAgents,
  escalateTicket
} = require('../controllers/ticketController');

// Importam router-ul de note pentru a face chaining pe rute (nested routes)
const noteRouter = require('./noteRoutes');
const { protect } = require('../middleware/authMiddleware');

// Configurare layer de stocare pentru fisierele trimise in tichet
const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, 'uploads/'); 
  },
  filename(req, file, cb) {
    // Timestamp pentru prevenirea suprascrierii fisierelor cu acelasi nume
    cb(null, `ticket-${Date.now()}${path.extname(file.originalname)}`);
  },
});
const upload = multer({ storage });

// Delegam logica pentru endpoint-ul de note catre noteRouter
router.use('/:ticketId/notes', noteRouter);

// Atentie: Rutele statice (cum ar fi /upload sau /agents) trebuie mereu declarate 
// inaintea celor dinamice (/:id) pentru ca Express sa nu trateze string-ul 'upload' ca fiind un ID.
router.post('/upload', protect, upload.single('attachment'), (req, res) => {
  if (!req.file) {
    return res.status(400).send('Fisier lipsa.');
  }
  // Convertim slash-urile pentru compatibilitate cross-platform (ex: Windows to Linux)
  res.send(`/${req.file.path.replace(/\\/g, '/')}`);
});

router.route('/agents').get(protect, getAgents)

router.route('/')
  .get(protect, getTickets)
  .post(protect, createTicket);

// Rute dinamice pe ID-ul tichetului
router.route('/:id/escalate').put(protect, escalateTicket)

router.route('/:id')
  .get(protect, getTicket)
  .delete(protect, deleteTicket)
  .put(protect, updateTicket);

// Endpoint-uri pentru state management-ul tichetelor
router.put('/:id/assign', protect, assignTicket);
router.put('/:id/suspend', protect, suspendTicket);
router.route('/:id/feedback').post(protect, addFeedback)

module.exports = router;