const Counter = require('../models/counterModel');
const asyncHandler = require('express-async-handler');
const User = require('../models/userModel');
const Ticket = require('../models/ticketModel');
const Note = require('../models/noteModel');
const sendEmail = require('../utils/sendEmail'); 


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
  // MODIFICARE: Preluam noile campuri in loc de product
  const { issueType, category, description, priority, attachment } = req.body;

  if (!issueType || !category || !description) {
    res.status(400);
    throw new Error('Te rugam sa completezi toate campurile obligatorii');
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
    issueType, // Salvam campul nou
    category,  // Salvam campul nou
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
    // Emitem și ticketUpdated pentru a forța refresh-ul listelor pe dashboard
    io.emit('ticketUpdated'); 
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
            <p><strong>Tip Solicitare:</strong> ${ticket.issueType}</p>
            <p><strong>Categorie:</strong> ${ticket.category}</p>
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

  // --- NOU: SOCKET IO PENTRU STERGERE ---
  const io = req.app.get('io');
  if (io) {
    io.emit('ticketUpdated'); // Transmitem semnal pentru a dispărea din liste instant
  }
  // --------------------------------------

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

  // --- NOU: SOCKET IO PENTRU ACTUALIZARE (Editare din modal de ex) ---
  const io = req.app.get('io');
  if (io) {
    io.emit('ticketUpdated', updatedTicket);
  }
  // -------------------------------------------------------------------

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
  ).populate('assignedTo', 'name email'); // IMPORTANT: populam la fel cum faci manual daca e cazul pe front

  // --- NOU: LOG DE SISTEM PENTRU PRELUARE ---
  const note = await Note.create({
    text: `A preluat acest tichet. Statusul a devenit "În Lucru".`,
    isStaff: true,
    staffId: user.id,
    ticket: req.params.id,
    user: user.id,
    isSystem: true // Marchează nota ca fiind acțiune de sistem
  });
  // ------------------------------------------

  // --- NOU: SOCKET IO PENTRU PRELUARE ---
  const io = req.app.get('io');
  if (io) {
    io.emit('ticketUpdated', updatedTicket); // Tabelele se dau pe 'open' si isi iau agentul
    io.emit('noteAdded', note);              // Se adauga nota sistem in chat instantaneu
  }
  // --------------------------------------

  // --- LOGICA EMAIL PRELUARE ---
  try {
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

    // --- NOU: LOG DE SISTEM PENTRU SUSPENDARE ---
    const note = await Note.create({
        text: `A schimbat statusul tichetului în "Suspendat".`,
        isStaff: user.role === 'agent' || user.role === 'admin',
        staffId: user.id,
        ticket: req.params.id,
        user: user.id,
        isSystem: true 
    });
    // --------------------------------------------

    // --- NOU: SOCKET IO PENTRU SUSPENDARE ---
    const io = req.app.get('io');
    if (io) {
      io.emit('ticketUpdated', updatedTicket); 
      io.emit('noteAdded', note); 
    }
    // ----------------------------------------

    res.status(200).json(updatedTicket);
});

// @desc    Close Ticket
// @route   PUT /api/tickets/:id/close
const closeTicket = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user.id);
    const ticket = await Ticket.findById(req.params.id);

    // Preluăm textul soluției dacă a fost trimis de pe frontend
    const { resolutionText } = req.body;

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

    // --- NOU: LOG DE SISTEM PENTRU ÎNCHIDERE ---
    const note = await Note.create({
        text: resolutionText ? `Soluție / Rezolvare: ${resolutionText}` : `A închis acest tichet.`,
        isStaff: user.role === 'agent' || user.role === 'admin',
        staffId: user.id,
        ticket: req.params.id,
        user: user.id,
        isSystem: true 
    });
    // -------------------------------------------

    // --- NOU: SOCKET IO PENTRU ÎNCHIDERE ---
    const io = req.app.get('io');
    if (io) {
      io.emit('ticketUpdated', updatedTicket); 
      io.emit('noteAdded', note); 
    }
    // ---------------------------------------

    // --- LOGICA EMAIL ÎNCHIDERE & FEEDBACK ---
    try {
      const ticketOwner = await User.findById(ticket.user);

      if (ticketOwner) {
        // Construim partea de HTML pentru soluție doar dacă există text
        const solutionHtml = resolutionText 
          ? `<div style="background-color: #d4edda; border-left: 5px solid #28a745; padding: 15px; margin: 20px 0; color: #155724;">
               <h3 style="margin-top:0;">Soluție / Rezolvare:</h3>
               <p style="font-size: 16px; white-space: pre-wrap;">${resolutionText}</p>
             </div>` 
          : '';

        const message = `
          <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
            <h2 style="color: #333;">Salut ${ticketOwner.name},</h2>
            <p>Tichetul tău <strong>#${ticket.ticketId || ticket._id}</strong> a fost marcat ca <strong>REZOLVAT</strong>.</p>
            
            ${solutionHtml}
            
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

  // --- NOU: SOCKET IO PENTRU RATING (Sa apara ratingul instant in lista de tickete a adminului) ---
  const io = req.app.get('io');
  if (io) {
    io.emit('ticketUpdated', ticket);
  }
  // ------------------------------------------------------------------------------------------------

  res.status(200).json(ticket)
});

// @desc    Preia toți agenții pentru escaladare
// @route   GET /api/tickets/agents
// @access  Private
const getAgents = asyncHandler(async (req, res) => {
    // Căutăm toți userii care au rolul de agent sau admin
    const users = await User.find({ role: { $in: ['agent', 'admin'] } }).select('-password');
    res.status(200).json(users);
});

// @desc    Escaladează tichetul către alt agent
// @route   PUT /api/tickets/:id/escalate
// @access  Private
const escalateTicket = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user.id);
    const ticket = await Ticket.findById(req.params.id);
    const { targetAgentId, reason } = req.body;

    if (!ticket) {
        res.status(404);
        throw new Error('Tichetul nu a fost găsit');
    }

    if (user.role !== 'agent' && user.role !== 'admin') {
        res.status(401);
        throw new Error('Doar staff-ul poate escalada tichete');
    }

    const targetAgent = await User.findById(targetAgentId);
    if (!targetAgent) {
        res.status(404);
        throw new Error('Agentul selectat nu există');
    }

    // Actualizăm tichetul cu noul agent
    const updatedTicket = await Ticket.findByIdAndUpdate(
        req.params.id,
        { assignedTo: targetAgentId, status: 'open' },
        { new: true }
    ).populate('assignedTo', 'name email');

    // Salvăm acțiunea în Istoric (Audit Log)
    const note = await Note.create({
        text: `A escaladat tichetul către ${targetAgent.name}. Motiv: ${reason || 'Nespecificat'}`,
        isStaff: true,
        staffId: user.id,
        ticket: req.params.id,
        user: user.id,
        isSystem: true 
    });

    // --- NOU: SOCKET IO PENTRU ESCALADARE ---
    const io = req.app.get('io');
    if (io) {
      io.emit('ticketUpdated', updatedTicket); 
      io.emit('noteAdded', note); 
    }
    // ----------------------------------------

    // Trimitem email noului agent pentru a-l notifica
    try {
        const message = `
            <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
                <h2 style="color: #0056b3;">Salut ${targetAgent.name},</h2>
                <p>Un tichet a fost escaladat către tine de către colegul tău, <strong>${user.name}</strong>.</p>
                <div style="background-color: #fff3cd; padding: 15px; border-left: 5px solid #ffc107; margin: 20px 0;">
                    <p><strong>Motiv escaladare:</strong> ${reason || 'Nespecificat'}</p>
                </div>
                <br/>
                <a href="http://localhost:5173/ticket/${ticket._id}" style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Preia Tichetul</a>
            </div>
        `;
        await sendEmail({
            to: targetAgent.email,
            subject: `⚠️ Tichet Escaladat: #${ticket.ticketId || ticket._id}`,
            html: message,
        });
    } catch (error) {
        console.log('Eroare trimitere email escaladare:', error);
    }

    res.status(200).json(updatedTicket);
});

// @desc    Upload Fisier Tichet
// @route   POST /api/tickets/upload
// @access  Private
const uploadTicketFile = asyncHandler(async (req, res) => {
    if (!req.file) {
        res.status(400);
        throw new Error('Niciun fișier încărcat');
    }
    // Returnăm calea fișierului pentru a fi salvată în tichet
    res.send(`/${req.file.path.replace(/\\/g, '/')}`);
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
  addFeedback,
  getAgents,
  escalateTicket,
  uploadTicketFile // Trebuie sa existe aici!
};