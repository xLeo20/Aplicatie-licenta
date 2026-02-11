const path = require('path');
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv').config();
const colors = require('colors');
const connectDB = require('./config/db');
// --- LINIA NOUA AICI ---
const { errorHandler } = require('./middleware/errorMiddleware'); 

const PORT = process.env.PORT || 5000;

// Conectare DB
connectDB();

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.get('/', (req, res) => {
    res.status(200).json({ message: 'Bine ai venit pe API-ul de Ticketing' });
});

// Rute
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/tickets', require('./routes/ticketRoutes'));

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// --- UTILIZAREA ERROR HANDLER AICI ---
app.use(errorHandler); 

app.listen(PORT, () => console.log(`Serverul a pornit pe portul ${PORT}`));