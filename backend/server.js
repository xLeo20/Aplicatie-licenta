const express = require('express');
const colors = require('colors');
const dotenv = require('dotenv').config();
const { errorHandler } = require('./middleware/errorMiddleware');
const connectDB = require('./config/db');
const path = require('path');
const cors = require('cors'); 

const http = require('http'); 
const { Server } = require('socket.io');

const PORT = process.env.PORT || 5000;

// Initiem conexiunea la Mongoose
connectDB();

const app = express();

// Setari CORS pentru a permite clientilor React sa faca request-uri catre acest API
// credentials: true e necesar daca vom folosi cookies sau headere de autorizare complexe
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:5173'], 
  credentials: true
}));

// Montam un server HTTP nativ peste Express pentru a putea atasa ulterior Socket.io
const server = http.createServer(app);

// Initializare instanta WebSockets cu bypass CORS catre porturile de front
const io = new Server(server, {
  cors: {
    origin: ['http://localhost:3000', 'http://localhost:5173'],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
  },
});

// Injectam instanta "io" in obiectul global "app" pentru a o putea apela din controllere (ex: la crearea unui tichet)
app.set('io', io);

// Event listener general pentru conexiunile noi de WebSockets
io.on('connection', (socket) => {
  console.log(`Node conectat via Socket.io: ${socket.id}`.cyan);

  socket.on('disconnect', () => {
    console.log(`Conexiune inchisa: ${socket.id}`.gray);
  });
});

// Parsere pentru payload-uri JSON si URL Encoded
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Expunem directorul de upload-uri pentru a servi imaginile statice in frontend
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Inregistrarea routerelor principale
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/tickets', require('./routes/ticketRoutes'));
app.use('/api/faqs', require('./routes/faqRoutes'));

// Fallback pe middleware-ul custom de erori in locul celui HTML default de la Express
app.use(errorHandler);

// Atentie: Folosim server.listen in loc de app.listen pentru a lega atat HTTP cat si WSS
server.listen(PORT, () => console.log(`Backend operativ pe portul ${PORT}`.yellow.bold));