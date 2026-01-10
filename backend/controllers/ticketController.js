const asyncHandler = require('express-async-handler');
const User = require('../models/userModel');
const Ticket = require('../models/ticketModel');

// @desc    Preia tichetele (Toate pentru Agent/Admin, Doar proprii pentru Angajat)
// @route   GET /api/tickets
// @access  Private
const getTickets = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);

  if (!user) {
    res.status(401);
    throw new Error('Utilizatorul nu a fost gasit');
  }

  let tickets;

  // Daca e Staff (Agent/Admin), returnam TOATE tichetele
  if (user.role === 'agent' || user.role === 'admin') {
    tickets = await Ticket.find({}).sort({ createdAt: -1 }); 
  } else {
    // Daca e Angajat, returnam doar tichetele LUI
    tickets = await Ticket.find({ user: req.user.id }).sort({ createdAt: -1 });
  }

  res.status(200).json(tickets);
});

// @desc    Creeaza un tichet nou
// @route   POST /api/tickets
// @access  Private
const createTicket = asyncHandler(async (req, res) => {
  const { product, description, priority } = req.body;

  if (!product || !description) {
    res.status(400);
    throw new Error('Te rog adauga produsul si descrierea');
  }

  const user = await User.findById(req.user.id);

  if (!user) {
    res.status(401);
    throw new Error('Utilizatorul nu a fost gasit');
  }

  const ticket = await Ticket.create({
    product,
    description,
    priority: priority || 'Mica',
    user: req.user.id,
    status: 'new',
  });

  res.status(201).json(ticket);
});

// @desc    Preia un singur tichet
// @route   GET /api/tickets/:id
// @access  Private
const getTicket = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);

  if (!user) {
    res.status(401);
    throw new Error('Utilizatorul nu a fost găsit');
  }

  const ticket = await Ticket.findById(req.params.id).populate('assignedTo', 'name email');

  if (!ticket) {
    res.status(404);
    throw new Error('Tichetul nu a fost găsit');
  }

  // Verificăm permisiunile (User propriu, Agent sau Admin)
  if (ticket.user.toString() !== req.user.id && user.role !== 'agent' && user.role !== 'admin') {
    res.status(401);
    throw new Error('Neautorizat');
  }

  res.status(200).json(ticket);
});

// @desc    Șterge un tichet
// @route   DELETE /api/tickets/:id
// @access  Private
const deleteTicket = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);

  if (!user) {
    res.status(401);
    throw new Error('Utilizatorul nu a fost găsit');
  }

  const ticket = await Ticket.findById(req.params.id);

  if (!ticket) {
    res.status(404);
    throw new Error('Tichetul nu a fost găsit');
  }

  // Doar proprietarul sau Adminul poate sterge (Agentul de obicei nu sterge, doar inchide)
  if (ticket.user.toString() !== req.user.id && user.role !== 'admin') {
    res.status(401);
    throw new Error('Neautorizat');
  }

  await ticket.deleteOne();

  res.status(200).json({ success: true });
});

// @desc    Actualizează un tichet (ex: închidere)
// @route   PUT /api/tickets/:id
// @access  Private
const updateTicket = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);

  if (!user) {
    res.status(401);
    throw new Error('Utilizatorul nu a fost găsit');
  }

  const ticket = await Ticket.findById(req.params.id);

  if (!ticket) {
    res.status(404);
    throw new Error('Tichetul nu a fost găsit');
  }

  if (ticket.user.toString() !== req.user.id && user.role !== 'agent' && user.role !== 'admin') {
    res.status(401);
    throw new Error('Neautorizat');
  }

  const updatedTicket = await Ticket.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true }
  );

  res.status(200).json(updatedTicket);
});

// @desc    Asigneaza tichetul agentului curent
// @route   PUT /api/tickets/:id/assign
// @access  Private (Doar Agent/Admin)
const assignTicket = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);
  const ticket = await Ticket.findById(req.params.id);

  if (!ticket) {
    res.status(404);
    throw new Error('Tichetul nu a fost gasit');
  }

  // Doar agentii/admin pot prelua tichete
  if (user.role !== 'agent' && user.role !== 'admin') {
     res.status(401);
     throw new Error('Doar staff-ul poate prelua tichete');
  }

  const updatedTicket = await Ticket.findByIdAndUpdate(
    req.params.id,
    { 
      status: 'open',
      assignedTo: user.id 
    },
    { new: true }
  );

  res.status(200).json(updatedTicket);
});

// AICI ERA PROBLEMA: Exportam functii care nu erau definite mai sus
module.exports = {
  getTickets,
  createTicket,
  getTicket,
  deleteTicket,
  updateTicket,
  assignTicket
};