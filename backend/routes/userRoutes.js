const express = require('express');
const router = express.Router();
const { registerUser, loginUser, getMe } = require('../controllers/userController');

// Ruta pentru inregistrare
router.post('/', registerUser);

// Ruta pentru login
router.post('/login', loginUser);

// Ruta pentru profil (o vom proteja mai tarziu)
router.post('/me', getMe);

module.exports = router;