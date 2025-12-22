const asyncHandler = require('express-async-handler');
const User = require('../models/userModel');
const Ticket = require('../models/ticketModel');

// @desc    Preia tichetele utilizatorului curent
// @route   GET /api/tickets
// @access  Private
const getTickets = asyncHandler(async (req, res) => {
  // Gasim userul folosind ID-ul din JWT
  const user = await User.findById(req.user.id);

  if (!user) {
    res.status(401);
    throw new Error('Utilizatorul nu a fost gasit');
  }

  // Gasim tichetele unde user-ul este cel logat
  const tickets = await Ticket.find({ user: req.user.id });

  res.status(200).json(tickets);
});

// @desc    Creeaza un tichet nou
// @route   POST /api/tickets
// @access  Private
const createTicket = asyncHandler(async (req, res) => {
  const { product, description } = req.body;

  if (!product || !description) {
    res.status(400);
    throw new Error('Te rog adauga produsul si descrierea');
  }

  // Gasim userul
  const user = await User.findById(req.user.id);

  if (!user) {
    res.status(401);
    throw new Error('Utilizatorul nu a fost gasit');
  }

  const ticket = await Ticket.create({
    product,
    description,
    user: req.user.id,
    status: 'new',
  });

  res.status(201).json(ticket);
});

module.exports = {
  getTickets,
  createTicket,
};