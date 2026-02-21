const asyncHandler = require('express-async-handler');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer'); // <--- Import Multer
const path = require('path');     // <--- Import Path
const User = require('../models/userModel');

// --- CONFIGURARE MULTER (Upload Poze) ---
const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, 'uploads/');
  },
  filename(req, file, cb) {
    cb(null, `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`);
  },
});

function checkFileType(file, cb) {
  const filetypes = /jpg|jpeg|png/;
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = filetypes.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb('Doar imagini (jpg, jpeg, png)!');
  }
}

const upload = multer({
  storage,
  fileFilter: function (req, file, cb) {
    checkFileType(file, cb);
  },
});

const changePassword = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword } = req.body;

  // Verificăm dacă a trimis ambele câmpuri
  if (!oldPassword || !newPassword) {
    res.status(400);
    throw new Error('Te rog completează parola veche și parola nouă');
  }

  // Căutăm userul curent în baza de date
  const user = await User.findById(req.user.id);

  if (!user) {
    res.status(401);
    throw new Error('Utilizator negăsit');
  }

  // Verificăm dacă parola veche introdusă se potrivește cu cea din baza de date
  const isMatch = await bcrypt.compare(oldPassword, user.password);

  if (!isMatch) {
    res.status(400);
    throw new Error('Parola veche este incorectă');
  }

  // Hash-uim (criptăm) noua parolă
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(newPassword, salt);

  // Salvăm noua parolă
  user.password = hashedPassword;
  await user.save();

  res.status(200).json({ message: 'Parola a fost actualizată cu succes!' });
});

// --- CONTROLLERE ---

// @desc    Inregistrare utilizator (Public - Self Register)
const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password, role, department } = req.body;

  if (!name || !email || !password) {
    res.status(400);
    throw new Error('Te rog completeaza toate campurile');
  }

  const userExists = await User.findOne({ email });
  if (userExists) {
    res.status(400);
    throw new Error('Utilizatorul exista deja');
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  const user = await User.create({
    name,
    email,
    password: hashedPassword,
    role: role || 'angajat', 
    department: department || 'General'
  });

  if (user) {
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      department: user.department,
      profileImage: user.profileImage, // <--- Returnam si poza
      token: generateToken(user._id),
    });
  } else {
    res.status(400);
    throw new Error('Datele utilizatorului sunt invalide');
  }
});

// @desc    Login
const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });

  if (user && (await bcrypt.compare(password, user.password))) {
    res.status(200).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      department: user.department,
      profileImage: user.profileImage, // <--- Returnam si poza
      token: generateToken(user._id),
    });
  } else {
    res.status(401);
    throw new Error('Credențiale invalide');
  }
});

// @desc    Get Current User
const getMe = asyncHandler(async (req, res) => {
  const user = {
    id: req.user._id,
    email: req.user.email,
    name: req.user.name,
    role: req.user.role,
    department: req.user.department,
    profileImage: req.user.profileImage // <--- Returnam si poza
  };
  res.status(200).json(user);
});

// @desc    Incarca poza profil
// @route   POST /api/users/upload
const uploadProfilePhoto = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);

    if (user) {
        // Salvam calea catre fisier (normalizam slash-urile pentru Windows)
        user.profileImage = `/${req.file.path.replace(/\\/g, "/")}`;
        const updatedUser = await user.save();

        res.json({
            _id: updatedUser._id,
            name: updatedUser.name,
            email: updatedUser.email,
            role: updatedUser.role,
            department: updatedUser.department,
            profileImage: updatedUser.profileImage,
            token: generateToken(updatedUser._id),
        });
    } else {
        res.status(404);
        throw new Error('Utilizatorul nu a fost gasit');
    }
});

// @desc    Get All Users (Admin)
const getAllUsers = asyncHandler(async (req, res) => {
    const users = await User.find({});
    res.status(200).json(users);
});

// @desc    Delete User (Admin)
const deleteUser = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id);
    if (!user) {
        res.status(404);
        throw new Error('Utilizatorul nu a fost gasit');
    }
    await user.deleteOne();
    res.status(200).json({ id: req.params.id });
});

// @desc    Create User (Admin Action)
const createUser = asyncHandler(async (req, res) => {
  const { name, email, password, role, department } = req.body;

  if (!name || !email || !password) {
    res.status(400);
    throw new Error('Toate câmpurile sunt obligatorii');
  }

  const userExists = await User.findOne({ email });
  if (userExists) {
    res.status(400);
    throw new Error('Utilizatorul există deja');
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  const user = await User.create({
    name,
    email,
    password: hashedPassword,
    role,
    department
  });

  if (user) {
    res.status(201).json(user);
  } else {
    res.status(400);
    throw new Error('Date invalide');
  }
});

// @desc    Update User (Admin Action)
const updateUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    res.status(404);
    throw new Error('Utilizatorul nu a fost găsit');
  }

  user.name = req.body.name || user.name;
  user.email = req.body.email || user.email;
  user.role = req.body.role || user.role;
  user.department = req.body.department || user.department;

  if (req.body.password) {
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(req.body.password, salt);
  }

  const updatedUser = await user.save();

  res.status(200).json({
    _id: updatedUser._id,
    name: updatedUser.name,
    email: updatedUser.email,
    role: updatedUser.role,
    department: updatedUser.department
  });
});

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

module.exports = {
  registerUser,
  loginUser,
  getMe,
  getAllUsers,  
  deleteUser,
  createUser,
  updateUser,
  upload,             // <--- Exportam Middleware Multer
  uploadProfilePhoto,  // <--- Exportam Functia Upload
  changePassword      // <--- Exportam Functia de Schimbare Parola
};