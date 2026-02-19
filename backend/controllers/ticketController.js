const Counter = require('../models/counterModel');
const asyncHandler = require('express-async-handler');
const User = require('../models/userModel');
const Ticket = require('../models/ticketModel');

// @desc    Preia tichetele
// @route   GET /api/tickets
const getTickets = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);
  if (!user) {
    res.status(401);
    throw new Error('Utilizatorul nu a fost gasit');
  }

  let tickets;
  if (user.role === 'agent' || user.role === 'admin') {
    tickets = await Ticket.find({}).sort({ createdAt: -1 }); 
  } else {
    tickets = await Ticket.find({ user: req.user.id }).sort({ createdAt: -1 });
  }
  res.status(200).json(tickets);
});

// @desc    Create new ticket (AUTO-INCREMENT)
// @route   POST /api/tickets
// @desc    Create new ticket
// @route   POST /api/tickets
// @access  Private
// @desc    Create new ticket
// @route   POST /api/tickets
// @access  Private
const createTicket = asyncHandler(async (req, res) => {
  const { product, description, priority, attachment } = req.body;

  if (!product || !description) {
    res.status(400);
    throw new Error('Please add a product and description');
  }

  const user = await User.findById(req.user.id);
  if (!user) {
    res.status(401);
    throw new Error('User not found');
  }

  // --- LOGICA PENTRU ID SECVENȚIAL (1, 2, 3...) REPARATĂ ---
  // Căutăm în baza de date tichetul cu cel mai mare număr
  const lastTicket = await Ticket.findOne().sort({ ticketId: -1 });
  
  // Dacă există un tichet vechi, adunăm +1 la ID-ul lui. Dacă nu, începem de la 1.
  const newTicketId = lastTicket && lastTicket.ticketId ? lastTicket.ticketId + 1 : 1;
  // -----------------------------------------------------------

  // Setare Deadline standard (ex: 24h)
  const deadline = new Date(Date.now() + 24 * 60 * 60 * 1000);

  const ticket = await Ticket.create({
    ticketId: newTicketId,  // <--- Salvăm numărul frumos aici!
    product,
    description,
    priority,
    user: req.user.id,
    status: 'new',
    deadline: deadline,
    attachment: attachment || null, 
  });

  res.status(201).json(ticket);
});

// @desc    Preia un singur tichet
// @route   GET /api/tickets/:id
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

  if (ticket.user.toString() !== req.user.id && user.role !== 'agent' && user.role !== 'admin') {
    res.status(401);
    throw new Error('Neautorizat');
  }
  res.status(200).json(ticket);
});

// @desc    Delete Ticket
// @route   DELETE /api/tickets/:id
const deleteTicket = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);
  const ticket = await Ticket.findById(req.params.id);

  if (!ticket) {
    res.status(404);
    throw new Error('Tichetul nu a fost găsit');
  }

  if (ticket.user.toString() !== req.user.id && user.role !== 'admin') {
    res.status(401);
    throw new Error('Neautorizat');
  }

  await ticket.deleteOne();
  res.status(200).json({ success: true });
});

// @desc    Update Ticket
// @route   PUT /api/tickets/:id
const updateTicket = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);
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

// @desc    Assign Ticket
const assignTicket = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);
  const ticket = await Ticket.findById(req.params.id);

  if (!ticket) {
    res.status(404);
    throw new Error('Tichetul nu a fost gasit');
  }

  if (user.role !== 'agent' && user.role !== 'admin') {
      res.status(401);
      throw new Error('Doar staff-ul poate prelua tichete');
  }

  const updatedTicket = await Ticket.findByIdAndUpdate(
    req.params.id,
    { status: 'open', assignedTo: user.id },
    { new: true }
  );
  res.status(200).json(updatedTicket);
});

// @desc    Suspend Ticket
const suspendTicket = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user.id);
    const ticket = await Ticket.findById(req.params.id);

    if (!ticket) {
        res.status(404);
        throw new Error('Tichetul nu a fost găsit');
    }

    if (ticket.user.toString() !== req.user.id && user.role !== 'admin' && user.role !== 'agent') {
        res.status(401);
        throw new Error('Nu ești autorizat');
    }

    const updatedTicket = await Ticket.findByIdAndUpdate(
        req.params.id, 
        { status: 'suspended' }, 
        { new: true }
    );
    res.status(200).json(updatedTicket);
});

// @desc    Close Ticket
const closeTicket = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user.id);
    const ticket = await Ticket.findById(req.params.id);

    if (!ticket) {
        res.status(404);
        throw new Error('Tichetul nu a fost găsit');
    }

    if (ticket.user.toString() !== req.user.id && user.role !== 'agent' && user.role !== 'admin') {
        res.status(401);
        throw new Error('Nu ești autorizat');
    }

    const updatedTicket = await Ticket.findByIdAndUpdate(
        req.params.id, 
        { status: 'closed' }, 
        { new: true }
    );
    res.status(200).json(updatedTicket);
});

module.exports = {
  getTickets,
  createTicket,
  getTicket,
  deleteTicket,
  updateTicket,
  assignTicket,
  suspendTicket,
  closeTicket 
};