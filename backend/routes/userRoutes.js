const express = require('express');
const router = express.Router();
const { 
  registerUser, 
  loginUser, 
  getMe, 
  getAllUsers,
  deleteUser // <--- Importam functia noua
} = require('../controllers/userController');

const { protect } = require('../middleware/authMiddleware'); 

// Rute publice
router.post('/', registerUser);
router.post('/login', loginUser);

// Rute private
router.get('/me', protect, getMe);

// Rute de Admin
// Atentie: Aici verificam doar 'protect' (token valid).
// Verificarea de rol (admin) se face, ideal, in controller sau un middleware separat.
// Dar pentru simplitate, controller-ul curent returneaza toti userii.
router.get('/all', protect, getAllUsers); 

// --- RUTA NOUA DE STERGERE ---
router.delete('/:id', protect, deleteUser);

module.exports = router;