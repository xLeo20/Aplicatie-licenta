const asyncHandler = require('express-async-handler');
const User = require('../models/userModel');
const Ticket = require('../models/ticketModel');
const Note = require('../models/noteModel');
const sendEmail = require('../utils/sendEmail'); 

// @desc    Extrage istoricul conversatiei (notele) pentru un tichet specific
// @route   GET /api/tickets/:ticketId/notes
// @access  Privat
const getNotes = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);

  if (!user) {
    res.status(401);
    throw new Error('Sesiune invalida.');
  }

  const ticket = await Ticket.findById(req.params.ticketId);

  // Verificam permisiunile: doar creatorul tichetului sau echipa IT au voie sa citeasca mesajele
  if (ticket.user.toString() !== req.user.id && user.role !== 'agent' && user.role !== 'admin') {
    res.status(401);
    throw new Error('Nu ai dreptul de a citi acest tichet.');
  }

  // Populam referinta 'user' pentru a putea afisa numele si rolul autorului mesajului in UI
  const notes = await Note.find({ ticket: req.params.ticketId })
                          .populate('user', 'name role');

  res.status(200).json(notes);
});

// @desc    Adauga un mesaj (nota) la un tichet existent
// @route   POST /api/tickets/:ticketId/notes
// @access  Privat
const addNote = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);

  if (!user) {
    res.status(401);
    throw new Error('Sesiune invalida.');
  }

  const ticket = await Ticket.findById(req.params.ticketId);

  // Protectie de acces inainte de a salva nota
  if (ticket.user.toString() !== req.user.id && user.role !== 'agent' && user.role !== 'admin') {
    res.status(401);
    throw new Error('Nu ai dreptul de a scrie in acest tichet.');
  }

  // Marcam vizual in baza de date daca cel care a scris e staff, pentru diferentierea in UI (ex: culoare diferita)
  const isStaffMember = user.role === 'agent' || user.role === 'admin';

  const { text, attachment } = req.body;

  const note = await Note.create({
    text: text,
    isStaff: isStaffMember, 
    staffId: isStaffMember ? user.id : null,
    ticket: req.params.ticketId,
    user: req.user.id,
    attachment: attachment || null 
  });

  // Reincarcam structura notei cu datele user-ului inainte de a o trimite pe frontend
  const populatedNote = await Note.findById(note._id).populate('user', 'name role');

  // Transmitem mesajul prin socket ca sa apara in chatul celuilalt utilizator fara sa dea F5
  const io = req.app.get('io');
  if (io) {
    io.emit('notificare_noua', {
      ticketId: req.params.ticketId,
      message: `Mesaj nou adaugat de ${user.name} la tichetul #${ticket.ticketId || ticket._id.toString().slice(-4)}`,
      type: 'note'
    });
  }

  // Daca cel care a raspuns face parte din echipa tehnica, trimitem un email de notificare clientului
  if (isStaffMember) {
    try {
        const ticketOwner = await User.findById(ticket.user)
        
        const message = `
          <div style="font-family: Arial, sans-serif; padding: 20px;">
            <h3>Ai primit un raspuns nou referitor la tichetul tau #${ticket.ticketId || ticket._id}</h3>
            <p><strong>Din partea: ${user.name}</strong></p>
            <blockquote style="background: #f9f9f9; border-left: 5px solid #ccc; padding: 10px; margin: 10px 0;">
              ${text}
            </blockquote>
            <br/>
            <a href="http://localhost:5173/ticket/${ticket._id}" style="color: blue;">Apasa aici pentru a deschide tichetul in aplicatie</a>
          </div>
        `

        await sendEmail({
          to: ticketOwner.email,
          subject: `Actualizare Tichet #${ticket.ticketId || ticket._id}`,
          html: message,
        })

    } catch (error) {
        console.log("Eroare trimitere notificare email:", error);
    }
  }

  res.status(200).json(populatedNote);
});

module.exports = {
  getNotes,
  addNote
};