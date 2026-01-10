const asyncHandler = require('express-async-handler');
const User = require('../models/userModel');
const Ticket = require('../models/ticketModel');
const Note = require('../models/noteModel');

// @desc    Preia notele pentru un tichet
// @route   GET /api/tickets/:ticketId/notes
// @access  Private
const getNotes = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);

  if (!user) {
    res.status(401);
    throw new Error('Utilizatorul nu a fost gasit');
  }

  const ticket = await Ticket.findById(req.params.ticketId);

  if (ticket.user.toString() !== req.user.id && user.role !== 'agent' && user.role !== 'admin') {
    res.status(401);
    throw new Error('User neautorizat');
  }

  // --- MODIFICARE: Folosim populate pentru a lua rolul autorului ---
  const notes = await Note.find({ ticket: req.params.ticketId })
                          .populate('user', 'name role');

  res.status(200).json(notes);
});

// @desc    Creeaza o nota pentru un tichet
// @route   POST /api/tickets/:ticketId/notes
// @access  Private
const addNote = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);

  if (!user) {
    res.status(401);
    throw new Error('Utilizatorul nu a fost gasit');
  }

  const ticket = await Ticket.findById(req.params.ticketId);

  if (ticket.user.toString() !== req.user.id && user.role !== 'agent' && user.role !== 'admin') {
    res.status(401);
    throw new Error('User neautorizat');
  }

  const isStaffMember = user.role === 'agent' || user.role === 'admin';

  const note = await Note.create({
    text: req.body.text,
    isStaff: isStaffMember, 
    staffId: isStaffMember ? user.id : null,
    ticket: req.params.ticketId,
    user: req.user.id
  });

  // --- MODIFICARE: Populam nota nou creata inainte sa o trimitem inapoi ---
  const populatedNote = await Note.findById(note._id).populate('user', 'name role');

  res.status(200).json(populatedNote);
});

module.exports = {
  getNotes,
  addNote
};