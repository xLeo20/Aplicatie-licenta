const Counter = require('../models/counterModel');
const asyncHandler = require('express-async-handler');
const User = require('../models/userModel');
const Ticket = require('../models/ticketModel');
const Note = require('../models/noteModel');
const sendEmail = require('../utils/sendEmail'); 
const Notification = require('../models/notificationModel');

// @desc    Preia lista de tichete (filtrata pe rol si departament)
// @route   GET /api/tickets
const getTickets = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);
  if (!user) {
    res.status(401);
    throw new Error('Autentificare invalida');
  }

  let tickets;
  
  if (user.role === 'admin') {
    // 1. Administratorul vede absolut toate tichetele din sistem
    tickets = await Ticket.find({}).sort({ createdAt: -1 }); 
    
  } else if (user.role === 'agent') {
    // 2. Agentul vede doar tichetele din aria lui de competenta
    let allowedCategories = [];
    
    // Facem maparea intre departamentul agentului si categoriile din formularul de tichete
    if (user.department === 'IT Tech') {
        allowedCategories = [
            'Hardware & Echipamente', 
            'Software & Licente', 
            'Retea & Comunicatii', 
            'Conturi & Permisiuni'
        ];
    } else if (user.department === 'General' || user.department === 'Infrastructura') {
        allowedCategories = ['Infrastructura Administrativa'];
    } else if (user.department === 'Resurse Umane') {
        allowedCategories = ['Cerinte HR', 'Salarizare']; 
    }
    
    // Cautam tichetele care fac parte din categoriile permise SAU care i-au fost asignate direct agentului
    tickets = await Ticket.find({
        $or: [
            { category: { $in: allowedCategories } },
            { assignedTo: user._id }
        ]
    }).sort({ createdAt: -1 });

  } else {
    // 3. Utilizatorul simplu extrage doar solicitarile lui
    tickets = await Ticket.find({ user: req.user.id }).sort({ createdAt: -1 });
  }
  
  res.status(200).json(tickets);
});

// @desc    Crearea unui incident/tichet nou
// @route   POST /api/tickets
// @desc    Crearea unui incident/tichet nou
// @route   POST /api/tickets
const createTicket = asyncHandler(async (req, res) => {
  const { issueType, category, description, priority, attachment } = req.body;

  if (!issueType || !category || !description) {
    res.status(400);
    throw new Error('Validare esuata. Nu poti crea un tichet gol.');
  }

  const user = await User.findById(req.user.id);
  if (!user) {
    res.status(401);
    throw new Error('Sesiune expirata');
  }

  const lastTicket = await Ticket.findOne().sort({ ticketId: -1 });
  const newTicketId = lastTicket && lastTicket.ticketId ? lastTicket.ticketId + 1 : 1;

  const deadline = new Date(Date.now() + 24 * 60 * 60 * 1000);
  const pickupDeadline = new Date(Date.now() + 10 * 60 * 1000);

  const ticket = await Ticket.create({
    ticketId: newTicketId,  
    issueType, 
    category,  
    description,
    priority,
    user: req.user.id,
    status: 'new',
    deadline: deadline,
    pickupDeadline: pickupDeadline,
    attachment: attachment || null, 
  });

  const io = req.app.get('io');
  if (io) {
    io.emit('tichet_nou_creat', ticket);
    io.emit('ticketUpdated'); 
  }

  try {
    const userMessage = `
      <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f4f4f4;">
        <div style="max-width: 600px; margin: auto; background: white; padding: 20px; border-radius: 10px;">
          <h2 style="color: #333;">Salut ${user.name},</h2>
          <p>Tichetul tau a fost inregistrat in sistem cu succes!</p>
          <div style="background-color: #e8f0fe; padding: 15px; border-left: 5px solid #0056b3; margin: 20px 0;">
            <p><strong>Numar Tichet:</strong> #${ticket.ticketId}</p>
            <p><strong>Tipul Problemei:</strong> ${ticket.issueType}</p>
            <p><strong>Arie/Categorie:</strong> ${ticket.category}</p>
            <p><strong>Prioritate Setata:</strong> ${ticket.priority}</p>
          </div>
          <p>Un reprezentant al echipei tehnice va investiga situatia in curand.</p>
          <br/>
          <a href="http://localhost:3000/ticket/${ticket._id}" style="background-color: #0056b3; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Vezi Tichetul Aici</a>
          <p style="font-size: 12px; color: #888; margin-top: 20px;">Serviciul de Suport Intern</p>
        </div>
      </div>
    `
    await sendEmail({
      to: user.email,
      subject: `Confirmare Deschidere Tichet #${ticket.ticketId}`,
      html: userMessage,
    })
  } catch (error) {
    console.log('Eroare mail utilizator:', error)
  }

  // LOGICA PENTRU NOTIFICARI SI MAILURI BAZATE PE DEPARTAMENT
  try {
    const allStaff = await User.find({ role: { $in: ['agent', 'admin'] } });
    
    // Filtram agenții: Păstrăm administratorii (văd tot) și agenții care au voie pe categoria asta
    const targetStaff = allStaff.filter(staff => {
        if (staff.role === 'admin') return true;
        
        if (staff.department === 'IT Tech') {
            return ['Hardware & Echipamente', 'Software & Licente', 'Retea & Comunicatii', 'Conturi & Permisiuni'].includes(category);
        } else if (staff.department === 'General' || staff.department === 'Infrastructura') {
            return ['Infrastructura Administrativa'].includes(category);
        } else if (staff.department === 'Resurse Umane') {
            return ['Cerinte HR', 'Salarizare'].includes(category); 
        }
        return false;
    });

    if (targetStaff.length > 0) {
        const staffMessage = `
          <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #fff3cd;">
            <div style="max-width: 600px; margin: auto; background: white; padding: 20px; border-radius: 10px; border: 1px solid #ffc107;">
              <h2 style="color: #d39e00;">🚨 Notificare Tichet Nou</h2>
              <p>Un nou tichet a fost deschis in platforma de catre <strong>${user.name}</strong>.</p>
              
              <div style="background-color: #f8f9fa; padding: 15px; border-left: 5px solid #17a2b8; margin: 20px 0;">
                <p><strong>Numar Tichet:</strong> #${ticket.ticketId}</p>
                <p><strong>Categorie:</strong> ${ticket.category} (${ticket.issueType})</p>
                <p><strong>Prioritate:</strong> <span style="color: red; font-weight: bold;">${ticket.priority}</span></p>
                <p><strong>Descriere:</strong></p>
                <p style="white-space: pre-wrap; font-style: italic;">"${ticket.description}"</p>
              </div>

              <p>SLA-ul pentru preluare a inceput. Va rugam sa investigati si sa preluati tichetul daca face parte din aria voastra.</p>
              <br/>
              <div style="text-align: center; margin-top: 20px;">
                  <a href="http://localhost:3000/ticket/${ticket._id}" style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: bold;">Vezi Tichetul Aici</a>
              </div>
            </div>
          </div>
        `;

        for (const staff of targetStaff) {
            // 1. Salvăm notificarea în baza de date pentru clopoțel (IN-APP)
            await Notification.create({
                user: staff._id,
                message: `Tichet NOU #${ticket.ticketId} în departamentul tău (${ticket.category}).`,
                ticketId: ticket._id
            });

            // 2. Emitem semnalul WebSockets PENTRU UN SINGUR USER SPECIFIC
            if (io) {
                io.emit(`notificare_noua_${staff._id}`, {
                    message: `Tichet NOU #${ticket.ticketId} creat (${ticket.category})`,
                    ticketId: ticket._id
                });
            }

            // 3. Trimitem mail-ul
            if (staff.email) {
                try {
                    await sendEmail({
                        to: staff.email,
                        subject: `🚨 Tichet NOU #${ticket.ticketId} - ${ticket.priority}`,
                        html: staffMessage,
                    });
                } catch (mailError) {
                    console.log(`Nu am putut trimite mail catre agentul ${staff.email}:`, mailError);
                }
            }
        }
    }
  } catch (error) {
    console.log('Eroare notificare / mail catre agenti:', error)
  }

  res.status(201).json(ticket);
});

// @desc    Preia informatiile complete ale unui singur tichet
// @route   GET /api/tickets/:id
const getTicket = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);
  if (!user) {
    res.status(401);
    throw new Error('Utilizator inexistent');
  }

  const ticket = await Ticket.findById(req.params.id).populate('assignedTo', 'name email');

  if (!ticket) {
    res.status(404);
    throw new Error('Tichetul nu exista in baza de date.');
  }

  if (ticket.user.toString() !== req.user.id && user.role !== 'agent' && user.role !== 'admin') {
    res.status(401);
    throw new Error('Incercare de acces interzisa pe acest document.');
  }
  res.status(200).json(ticket);
});

// @desc    Sterge tichet
// @route   DELETE /api/tickets/:id
const deleteTicket = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);
  const ticket = await Ticket.findById(req.params.id);

  if (!ticket) {
    res.status(404);
    throw new Error('Nu s-a gasit tichetul.');
  }

  if (ticket.user.toString() !== req.user.id && user.role !== 'admin') {
    res.status(401);
    throw new Error('Ai nevoie de rol de admin pentru a sterge date logate.');
  }

  await ticket.deleteOne();

  const io = req.app.get('io');
  if (io) {
    io.emit('ticketUpdated'); 
  }

  res.status(200).json({ success: true });
});

// @desc    Modificarea directa a unui tichet (Update)
// @route   PUT /api/tickets/:id
const updateTicket = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);
  const ticket = await Ticket.findById(req.params.id);

  if (!ticket) {
    res.status(404);
    throw new Error('Nu a fost gasit id-ul acestui tichet.');
  }

  if (ticket.user.toString() !== req.user.id && user.role !== 'agent' && user.role !== 'admin') {
    res.status(401);
    throw new Error('Actiune permisa doar echipei operationale.');
  }

  const updatedTicket = await Ticket.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true }
  );

  const io = req.app.get('io');
  if (io) {
    io.emit('ticketUpdated', updatedTicket);
  }

  res.status(200).json(updatedTicket);
});

// @desc    Asignare tichet catre agentul logat
// @route   PUT /api/tickets/:id/assign
const assignTicket = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id); 
  const ticket = await Ticket.findById(req.params.id);

  if (!ticket) {
    res.status(404);
    throw new Error('Tichet eronat');
  }

  if (user.role !== 'agent' && user.role !== 'admin') {
      res.status(401);
      throw new Error('End-userii nu pot prelua task-uri.');
  }

  const updatedTicket = await Ticket.findByIdAndUpdate(
    req.params.id,
    { status: 'open', assignedTo: user.id },
    { new: true }
  ).populate('assignedTo', 'name email'); 

  const note = await Note.create({
    text: `A preluat in mod oficial acest tichet. Status setat: In Lucru.`,
    isStaff: true,
    staffId: user.id,
    ticket: req.params.id,
    user: user.id,
    isSystem: true 
  });

  const io = req.app.get('io');
  if (io) {
    io.emit('ticketUpdated', updatedTicket); 
    io.emit('noteAdded', note);              
  }

  try {
    const clientUser = await User.findById(ticket.user);

    if (clientUser) {
      const message = `
        <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
          <h2 style="color: #0056b3;">Buna ${clientUser.name},</h2>
          <p>Solicitarea ta cu ID-ul <strong>#${ticket.ticketId || ticket._id}</strong> a fost preluata.</p>
          
          <div style="background-color: #e6fffa; padding: 15px; border-left: 5px solid #00b39f; margin: 20px 0;">
            <p><strong>Agent desemnat:</strong> ${user.name}</p>
            <p><strong>Stadiu curent:</strong> In investigare (In Lucru)</p>
          </div>

          <p>Vei fi notificat de indata ce avem un raspuns sau o rezolutie.</p>
          <br/>
          <a href="http://localhost:3000/ticket/${ticket._id}" style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Status Live Aplicatie</a>
        </div>
      `;

      await sendEmail({
        to: clientUser.email,
        subject: `Notificare Preluare Tichet #${ticket.ticketId || ticket._id}`,
        html: message,
      });
    }
  } catch (error) {
    console.log('Eroare mail notificare de asignare:', error);
  }

  res.status(200).json(updatedTicket);
});

// @desc    Pauzarea SLA-ului si trecerea in stare de asteptare
const suspendTicket = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user.id);
    const ticket = await Ticket.findById(req.params.id);

    if (!ticket) {
        res.status(404);
        throw new Error('Lipsa date tichet');
    }

    if (ticket.user.toString() !== req.user.id && user.role !== 'admin' && user.role !== 'agent') {
        res.status(401);
        throw new Error('Operatiune interzisa');
    }

    const updatedTicket = await Ticket.findByIdAndUpdate(
        req.params.id, 
        { status: 'suspended' }, 
        { new: true }
    );

    const note = await Note.create({
        text: `Acest tichet a fost blocat temporar (Status: Suspendat). Motiv: asteptare feedback tert sau piese de schimb.`,
        isStaff: user.role === 'agent' || user.role === 'admin',
        staffId: user.id,
        ticket: req.params.id,
        user: user.id,
        isSystem: true 
    });

    const io = req.app.get('io');
    if (io) {
      io.emit('ticketUpdated', updatedTicket); 
      io.emit('noteAdded', note); 
    }

    res.status(200).json(updatedTicket);
});

// @desc    Marcarea procedurii ca fiind finalizata (Closed)
// @route   PUT /api/tickets/:id/close
const closeTicket = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user.id);
    const ticket = await Ticket.findById(req.params.id);

    const { resolutionText } = req.body;

    if (!ticket) {
        res.status(404);
        throw new Error('Document invalid');
    }

    if (ticket.user.toString() !== req.user.id && user.role !== 'agent' && user.role !== 'admin') {
        res.status(401);
        throw new Error('Incalcare permisiuni');
    }

    const updatedTicket = await Ticket.findByIdAndUpdate(
        req.params.id, 
        { status: 'closed' }, 
        { new: true }
    );

    const note = await Note.create({
        text: resolutionText ? `Rezolutie furnizata: ${resolutionText}` : `Interventie tehnica incheiata.`,
        isStaff: user.role === 'agent' || user.role === 'admin',
        staffId: user.id,
        ticket: req.params.id,
        user: user.id,
        isSystem: true 
    });

    const io = req.app.get('io');
    if (io) {
      io.emit('ticketUpdated', updatedTicket); 
      io.emit('noteAdded', note); 
    }

    try {
      const ticketOwner = await User.findById(ticket.user);

      if (ticketOwner) {
        const solutionHtml = resolutionText 
          ? `<div style="background-color: #d4edda; border-left: 5px solid #28a745; padding: 15px; margin: 20px 0; color: #155724;">
               <h3 style="margin-top:0;">Solutie oferita de tehnician:</h3>
               <p style="font-size: 16px; white-space: pre-wrap;">${resolutionText}</p>
             </div>` 
          : '';

        const message = `
          <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
            <h2 style="color: #333;">Buna ziua ${ticketOwner.name},</h2>
            <p>Conform bazei noastre de date, incidentul <strong>#${ticket.ticketId || ticket._id}</strong> a primit statusul de <strong>FINALIZAT</strong>.</p>
            
            ${solutionHtml}
            
            <p>Parerea ta ne ajuta sa optimizam procedurile de suport. Ofera-ne un mic feedback!</p>
            
            <br/>
            <div style="text-align: center; margin: 30px 0;">
              <a href="http://localhost:3000/ticket/${ticket._id}" style="background-color: #28a745; color: white; padding: 15px 30px; text-decoration: none; border-radius: 50px; font-weight: bold; font-size: 16px;">Acorda o nota ⭐</a>
            </div>
            
            <p style="font-size: 12px; color: #888;">Acest mesaj a fost generat automat.</p>
          </div>
        `;

        await sendEmail({
          to: ticketOwner.email,
          subject: `Notificare Inchidere: Tichet #${ticket.ticketId || ticket._id}`,
          html: message,
        });
      }
    } catch (error) {
      console.log('Notificarea post-rezolvare nu s-a trimis:', error)
    }

    res.status(200).json(updatedTicket);
});

// @desc    Salvare Customer Satisfaction (CSAT Rating)
// @route   POST /api/tickets/:id/feedback
// @access  Private
const addFeedback = asyncHandler(async (req, res) => {
  const { rating, comment } = req.body

  const ticket = await Ticket.findById(req.params.id)

  if (!ticket) {
    res.status(404)
    throw new Error('Inregistrare lipsa')
  }

  if (ticket.user.toString() !== req.user.id) {
    res.status(401)
    throw new Error('Poti da feedback strict la propriile tichete')
  }

  if (ticket.status !== 'closed') {
      res.status(400)
      throw new Error('Sistemul accepta review-uri doar pentru sarcini finalizate (Status: Inchise)')
  }

  ticket.feedback = {
    rating: Number(rating),
    comment,
    isSubmitted: true
  }

  await ticket.save()

  const io = req.app.get('io');
  if (io) {
    io.emit('ticketUpdated', ticket);
  }

  res.status(200).json(ticket)
});

// @desc    Preia lista ingustata a agentilor tehnici din firma
// @route   GET /api/tickets/agents
// @access  Private
const getAgents = asyncHandler(async (req, res) => {
    const users = await User.find({ role: { $in: ['agent', 'admin'] } }).select('-password');
    res.status(200).json(users);
});

// @desc    Pasarea responsabilitatii catre un Tier superior
// @route   PUT /api/tickets/:id/escalate
// @access  Private
const escalateTicket = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user.id);
    const ticket = await Ticket.findById(req.params.id);
    const { targetAgentId, reason } = req.body;

    if (!ticket) {
        res.status(404);
        throw new Error('Referinta lipsa');
    }

    if (user.role !== 'agent' && user.role !== 'admin') {
        res.status(401);
        throw new Error('Functionalitate limitata angajatilor');
    }

    const targetAgent = await User.findById(targetAgentId);
    if (!targetAgent) {
        res.status(404);
        throw new Error('Contul colegului nu a putut fi extras');
    }

    const updatedTicket = await Ticket.findByIdAndUpdate(
        req.params.id,
        { assignedTo: targetAgentId, status: 'open' },
        { new: true }
    ).populate('assignedTo', 'name email');

    const note = await Note.create({
        text: `Nivelul de suport a fost transferat catre ${targetAgent.name}. Explicatie furnizata: ${reason || 'Standard transfer'}`,
        isStaff: true,
        staffId: user.id,
        ticket: req.params.id,
        user: user.id,
        isSystem: true 
    });

    const io = req.app.get('io');
    if (io) {
      io.emit('ticketUpdated', updatedTicket); 
      io.emit('noteAdded', note); 
    }

    try {
        const message = `
            <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
                <h2 style="color: #0056b3;">Salutari ${targetAgent.name},</h2>
                <p>O cerere de suport ti-a fost delegata in sistem de catre <strong>${user.name}</strong>.</p>
                <div style="background-color: #fff3cd; padding: 15px; border-left: 5px solid #ffc107; margin: 20px 0;">
                    <p><strong>Nota interna transfer:</strong> ${reason || 'Fară mesaj'}</p>
                </div>
                <br/>
                <a href="http://localhost:3000/ticket/${ticket._id}" style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Investigheaza Cazul</a>
            </div>
        `;
        await sendEmail({
            to: targetAgent.email,
            subject: `⚠️ Transfer Tichet #${ticket.ticketId || ticket._id}`,
            html: message,
        });
    } catch (error) {
        console.log('Transfer email eroare:', error);
    }

    res.status(200).json(updatedTicket);
});

// @desc    Management-ul documentelor anexate (Upload img)
// @route   POST /api/tickets/upload
// @access  Private
const uploadTicketFile = asyncHandler(async (req, res) => {
    if (!req.file) {
        res.status(400);
        throw new Error('Payload-ul nu contine fisiere binare');
    }
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
  uploadTicketFile
};