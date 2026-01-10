const express = require('express');
const router = express.Router();
const { 
  registerUser, 
  loginUser, 
  getMe, 
  getAllUsers 
} = require('../controllers/userController');

// --- LINIA LIPSA: Importam middleware-ul de protectie ---
const { protect } = require('../middleware/authMiddleware'); 

// Rute publice
router.post('/', registerUser);
router.post('/login', loginUser);

// Rute private (protejate)
router.get('/me', protect, getMe); // Si ruta de profil trebuie protejata
router.get('/all', protect, getAllUsers); // Ruta de admin

module.exports = router;