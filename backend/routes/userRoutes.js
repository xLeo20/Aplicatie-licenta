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
  changePassword      
} = require('../controllers/userController');

const { protect, admin } = require('../middleware/authMiddleware');

// Rute publice (auth bypass)
router.post('/', registerUser);
router.post('/login', loginUser);

// Rute private (necesita token valid)
router.get('/me', protect, getMe);
router.post('/upload', protect, upload.single('image'), uploadProfilePhoto);

// Trebuie declarata deasupra rutei PUT /:id pentru a preveni matching-ul gresit
router.put('/change-password', protect, changePassword);

// Rute destinate exclusiv administrarii platformei
router.get('/all', protect, admin, getAllUsers);
router.post('/add', protect, admin, createUser);
router.put('/:id', protect, admin, updateUser);
router.delete('/:id', protect, admin, deleteUser);

module.exports = router;