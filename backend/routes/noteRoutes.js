const express = require('express');
// flag-ul mergeParams este necesar pentru ca acest router sa preia parametrii din ruta parinte (ex: ticketId)
const router = express.Router({ mergeParams: true }); 

const { getNotes, addNote } = require('../controllers/noteController');
const { protect } = require('../middleware/authMiddleware');

router.route('/')
  .get(protect, getNotes)
  .post(protect, addNote);

module.exports = router;