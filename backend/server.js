const express = require('express');
const colors = require('colors');
const dotenv = require('dotenv').config();
const { errorHandler } = require('./middleware/errorMiddleware');
const connectDB = require('./config/db');
const path = require('path');
const cors = require('cors'); // <--- 1. IMPORTĂM CORS

// --- PENTRU SOCKET.IO ---
const http = require('http'); 
const { Server } = require('socket.io');
// ------------------------

const PORT = process.env.PORT || 5000;

// Conectarea la baza de date
connectDB();

const app = express();

// <--- 2. ACTIVĂM CORS PENTRU TOATE RUTELE EXPRESS ---
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:5173'], // Porturile tale de React
  credentials: true
}));
// -----------------------------------------------------

// Creăm serverul HTTP folosind aplicația Express
const server = http.createServer(app);

// Inițializăm Socket.io și permitem conexiuni de pe Frontend-ul tău
const io = new Server(server, {
  cors: {
    origin: ['http://localhost:3000', 'http://localhost:5173'],
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
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Rutele
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/tickets', require('./routes/ticketRoutes'));
app.use('/api/faqs', require('./routes/faqRoutes'));

// Middleware pentru erori
app.use(errorHandler);

// Pornim SERVERUL (HTTP + Socket.io) pe portul 5000
server.listen(PORT, () => console.log(`Server started on port ${PORT}`.yellow.bold));