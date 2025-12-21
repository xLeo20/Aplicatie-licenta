const express = require('express');
const dotenv = require('dotenv').config();
const colors = require('colors');
const connectDB = require('./config/db');
const PORT = process.env.PORT || 5000;

// Conectare DB
connectDB();

const app = express();

// Middleware pentru a putea citi datele trimise (JSON)
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.get('/', (req, res) => {
    res.status(200).json({ message: 'Bine ai venit pe API-ul de Ticketing' });
});

// Rute Utilizatori
app.use('/api/users', require('./routes/userRoutes'));

app.listen(PORT, () => console.log(`Serverul a pornit pe portul ${PORT}`));