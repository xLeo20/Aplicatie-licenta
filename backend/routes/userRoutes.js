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
  upload,             // <--- Import Multer
  uploadProfilePhoto  // <--- Import Controller Upload
} = require('../controllers/userController');

const { protect } = require('../middleware/authMiddleware'); 

// Rute publice
router.post('/', registerUser);
router.post('/login', loginUser);

// Rute private (User Logat)
router.get('/me', protect, getMe);
router.post('/upload', protect, upload.single('image'), uploadProfilePhoto); // <--- Ruta Upload Poza

// Rute de Admin
router.get('/all', protect, getAllUsers); 
router.post('/add', protect, createUser);   
router.put('/:id', protect, updateUser);    
router.delete('/:id', protect, deleteUser); 

module.exports = router;