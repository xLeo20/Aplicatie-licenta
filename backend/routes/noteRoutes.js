const express = require('express');
const router = express.Router({ mergeParams: true }); // <--- ESTE CRITIC SA FIE AICI

const { getNotes, addNote } = require('../controllers/noteController');
const { protect } = require('../middleware/authMiddleware');

router.route('/')
  .get(protect, getNotes)
  .post(protect, addNote);

module.exports = router;