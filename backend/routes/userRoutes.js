const express = require('express');
const router = express.Router();
const { 
  registerUser, 
  loginUser, 
  getMe, 
  getAllUsers,
  deleteUser,
  createUser, 
  updateUser,
  upload,             
  uploadProfilePhoto, 
  changePassword      // <--- Importul funcției de parolă
} = require('../controllers/userController');

const { protect } = require('../middleware/authMiddleware'); 

// Rute publice
router.post('/', registerUser);
router.post('/login', loginUser);

// Rute private (User Logat)
router.get('/me', protect, getMe);
router.post('/upload', protect, upload.single('image'), uploadProfilePhoto);

// --- RUTA PENTRU PAROLĂ TREBUIE SĂ FIE AICI (Deasupra celei cu :id) ---
router.put('/change-password', protect, changePassword); 
// ---------------------------------------------------------------------

// Rute de Admin
router.get('/all', protect, getAllUsers); 
router.post('/add', protect, createUser);   
router.put('/:id', protect, updateUser);    // <--- Express se bloca aici înainte!
router.delete('/:id', protect, deleteUser); 

module.exports = router;