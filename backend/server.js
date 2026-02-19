const express = require('express');
const colors = require('colors');
const dotenv = require('dotenv').config();
const { errorHandler } = require('./middleware/errorMiddleware');
const connectDB = require('./config/db');
const path = require('path');

// --- ACESTEA SUNT LINIILE CARE LIPSEAU ---
const http = require('http'); 
const { Server } = require('socket.io');
// -----------------------------------------

const PORT = process.env.PORT || 5000;

// Conectarea la baza de date
connectDB();

const app = express();

// Creăm serverul HTTP folosind aplicația Express
const server = http.createServer(app);

// Inițializăm Socket.io și permitem conexiuni de pe Frontend-ul tău
const io = new Server(server, {
  cors: {
    origin: ['http://localhost:3000', 'http://localhost:5173'], // Porturile tale de React/Vite
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
  },
});

// Facem "io" accesibil peste tot în aplicație (în controllere)
app.set('io', io);

// Ascultăm când un utilizator se conectează la WebSockets
io.on('connection', (socket) => {
  console.log(`Un utilizator s-a conectat la Socket.io: ${socket.id}`.cyan);

  socket.on('disconnect', () => {
    console.log(`Utilizator deconectat: ${socket.id}`.gray);
  });
});

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Permite accesul public la pozele încărcate (Pentru atașamente)
// Folosim path.resolve() ca să găsească folderul 'uploads' exact unde rulează serverul
const _dirname = path.resolve();
// În server.js
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Rutele
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/tickets', require('./routes/ticketRoutes'));
app.use('/api/faqs', require('./routes/faqRoutes'));

// Middleware pentru erori
app.use(errorHandler);

// Pornim SERVERUL (HTTP + Socket.io) pe portul 5000
server.listen(PORT, () => console.log(`Server started on port ${PORT}`.yellow.bold));


//constan