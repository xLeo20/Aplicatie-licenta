const Counter = require('../models/counterModel');
const asyncHandler = require('express-async-handler');
const User = require('../models/userModel');
const Ticket = require('../models/ticketModel');
const Note = require('../models/noteModel');
const sendEmail = require('../utils/sendEmail'); // <--- IMPORT NOU


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

  const lastTicket = await Ticket.findOne().sort({ ticketId: -1 });
  const newTicketId = lastTicket && lastTicket.ticketId ? lastTicket.ticketId + 1 : 1;

  const deadline = new Date(Date.now() + 24 * 60 * 60 * 1000);
  
  // Setare Deadline Preluare (10 minute)
  const pickupDeadline = new Date(Date.now() + 10 * 60 * 1000);

  const ticket = await Ticket.create({
    ticketId: newTicketId,  
    product,
    description,
    priority,
    user: req.user.id,
    status: 'new',
    deadline: deadline,
    pickupDeadline: pickupDeadline,
    attachment: attachment || null, 
  });

  // --- SOCKET.IO - Anunțăm toți clienții conectați că a apărut un tichet nou ---
  const io = req.app.get('io');
  if (io) {
    io.emit('tichet_nou_creat', ticket); 
  }
  // ---------------------------------------------------------------------------------

  // --- EMAIL CONFIRMARE CREARE ---
  try {
    const message = `
      <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f4f4f4;">
        <div style="max-width: 600px; margin: auto; background: white; padding: 20px; border-radius: 10px;">
          <h2 style="color: #333;">Salut ${user.name},</h2>
          <p>Tichetul tău a fost înregistrat cu succes!</p>
          <div style="background-color: #e8f0fe; padding: 15px; border-left: 5px solid #0056b3; margin: 20px 0;">
            <p><strong>ID Tichet:</strong> #${ticket.ticketId}</p>
            <p><strong>Produs:</strong> ${ticket.product}</p>
            <p><strong>Prioritate:</strong> ${ticket.priority}</p>
          </div>
          <p>Un agent va prelua solicitarea ta în cel mai scurt timp.</p>
          <p style="font-size: 12px; color: #888;">Mulțumim, Echipa Support</p>
        </div>
      </div>
    `
    await sendEmail({
      to: user.email,
      subject: `Confirmare Tichet #${ticket.ticketId}`,
      html: message,
    })
  } catch (error) {
    console.log('Eroare trimitere email confirmare:', error)
  }
  // -------------------------------

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
// @route   PUT /api/tickets/:id/assign
const assignTicket = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id); // Agentul care preia
  const ticket = await Ticket.findById(req.params.id);

  if (!ticket) {
    res.status(404);
    throw new Error('Tichetul nu a fost gasit');
  }

  if (user.role !== 'agent' && user.role !== 'admin') {
      res.status(401);
      throw new Error('Doar staff-ul poate prelua tichete');
  }

  // Actualizăm tichetul
  const updatedTicket = await Ticket.findByIdAndUpdate(
    req.params.id,
    { status: 'open', assignedTo: user.id },
    { new: true }
  );

  // --- LOGICA EMAIL PRELUARE ---
  try {
    // Căutăm clientul care a deschis tichetul pentru a-i lua adresa de email
    const clientUser = await User.findById(ticket.user);

    if (clientUser) {
      const message = `
        <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
          <h2 style="color: #0056b3;">Salut ${clientUser.name},</h2>
          <p>Vești bune! Tichetul tău <strong>#${ticket.ticketId || ticket._id}</strong> a fost preluat.</p>
          
          <div style="background-color: #e6fffa; padding: 15px; border-left: 5px solid #00b39f; margin: 20px 0;">
            <p><strong>Agent Responsabil:</strong> ${user.name}</p>
            <p><strong>Status Nou:</strong> În Lucru (Open)</p>
          </div>

          <p>Agentul analizează solicitarea și va reveni cu un răspuns în curând.</p>
          <br/>
          <a href="http://localhost:5173/ticket/${ticket._id}" style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Vezi Tichetul</a>
        </div>
      `;

      await sendEmail({
        to: clientUser.email,
        subject: `Tichet Preluat: #${ticket.ticketId || ticket._id}`,
        html: message,
      });
    }
  } catch (error) {
    console.log('Eroare trimitere email preluare:', error);
  }
  // -----------------------------

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
// @route   PUT /api/tickets/:id/close
const closeTicket = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user.id);
    const ticket = await Ticket.findById(req.params.id);

    if (!ticket) {
        res.status(404);
        throw new Error('Tichetul nu a fost găsit');
    }

    // Permitem închiderea doar proprietarului SAU agentului/adminului
    if (ticket.user.toString() !== req.user.id && user.role !== 'agent' && user.role !== 'admin') {
        res.status(401);
        throw new Error('Nu ești autorizat');
    }

    const updatedTicket = await Ticket.findByIdAndUpdate(
        req.params.id, 
        { status: 'closed' }, 
        { new: true }
    );

    // --- LOGICA EMAIL ÎNCHIDERE & FEEDBACK ---
    try {
      // Identificăm clientul (poate fi userul curent sau altcineva dacă închide un admin)
      const ticketOwner = await User.findById(ticket.user);

      if (ticketOwner) {
        const message = `
          <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
            <h2 style="color: #333;">Salut ${ticketOwner.name},</h2>
            <p>Tichetul tău <strong>#${ticket.ticketId || ticket._id}</strong> a fost marcat ca <strong>REZOLVAT</strong>.</p>
            
            <p>Sperăm că am reușit să te ajutăm! Te rugăm să ne acorzi 30 de secunde pentru a evalua interacțiunea.</p>
            
            <br/>
            <div style="text-align: center; margin: 30px 0;">
              <a href="http://localhost:5173/ticket/${ticket._id}" style="background-color: #28a745; color: white; padding: 15px 30px; text-decoration: none; border-radius: 50px; font-weight: bold; font-size: 16px;">Lasă un Feedback ⭐</a>
            </div>
            
            <p style="font-size: 12px; color: #888;">Dacă problema persistă, te rugăm să deschizi un tichet nou.</p>
          </div>
        `;

        await sendEmail({
          to: ticketOwner.email,
          subject: `Tichet Rezolvat: #${ticket.ticketId || ticket._id}`,
          html: message,
        });
      }
    } catch (error) {
      console.log('Email closed notification failed:', error)
    }
    // ---------------------------------------------

    res.status(200).json(updatedTicket);
});

// @desc    Add feedback to ticket
// @route   POST /api/tickets/:id/feedback
// @access  Private
const addFeedback = asyncHandler(async (req, res) => {
  const { rating, comment } = req.body

  const ticket = await Ticket.findById(req.params.id)

  if (!ticket) {
    res.status(404)
    throw new Error('Ticket not found')
  }

  if (ticket.user.toString() !== req.user.id) {
    res.status(401)
    throw new Error('Not Authorized')
  }

  // Opțional: Permite feedback doar dacă tichetul e închis
  if (ticket.status !== 'closed') {
      res.status(400)
      throw new Error('Puteți oferi feedback doar tichetelor închise.')
  }

  ticket.feedback = {
    rating: Number(rating),
    comment,
    isSubmitted: true
  }

  await ticket.save()

  res.status(200).json(ticket)
});

module.exports = {
  getTickets,
  createTicket,
  getTicket,
  deleteTicket,
  updateTicket,
  assignTicket,
  suspendTicket,
  closeTicket,
  addFeedback
};