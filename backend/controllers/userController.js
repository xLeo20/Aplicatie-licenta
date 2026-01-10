const asyncHandler = require('express-async-handler');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const User = require('../models/userModel');

// @desc    Inregistreaza un utilizator nou
// @route   /api/users
// @access  Public
const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password, department } = req.body;

  // Validare: verificam daca exista toate campurile
  if (!name || !email || !password) {
    res.status(400);
    throw new Error('Te rog include toate campurile');
  }

  // Verificam daca utilizatorul exista deja
  const userExists = await User.findOne({ email });

  if (userExists) {
    res.status(400);
    throw new Error('Utilizatorul exista deja');
  }

  // Criptarea parolei (Hash)
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  // Crearea utilizatorului
  const user = await User.create({
    name,
    email,
    password: hashedPassword,
    department: department || 'General' 
  });

  if (user) {
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      department: user.department,
      token: generateToken(user._id),
    });
  } else {
    res.status(400);
    throw new Error('Datele utilizatorului sunt invalide');
  }
});

// @desc    Logare utilizator
// @route   /api/users/login
// @access  Public
const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });

  // Verificam userul si parola
  if (user && (await bcrypt.compare(password, user.password))) {
    res.status(200).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      department: user.department,
      token: generateToken(user._id),
    });
  } else {
    res.status(401);
    throw new Error('Date de autentificare invalide');
  }
});

// @desc    Preia datele utilizatorului curent
// @route   /api/users/me
// @access  Private
const getMe = asyncHandler(async (req, res) => {
  const user = {
    id: req.user._id,
    email: req.user.email,
    name: req.user.name,
  };
  res.status(200).json(user);
});

// Functie pentru generarea Token-ului (JWT)
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d', // Expira in 30 de zile
  });
};
// @desc    Preia toți utilizatorii (Doar Admin)
// @route   GET /api/users/all
// @access  Private/Admin
const getAllUsers = asyncHandler(async (req, res) => {
  const users = await User.find({});
  res.status(200).json(users);
});

// Nu uita să o adaugi la module.exports jos!
// module.exports = { ..., getAllUsers }

module.exports = {
  registerUser,
  loginUser,
  getMe,
  getAllUsers
};