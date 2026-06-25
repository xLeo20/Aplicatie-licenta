const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');
const User = require('../models/userModel');

// Middleware pentru securizarea rutelor private. Verifica token-ul JWT la fiecare request.
const protect = asyncHandler(async (req, res, next) => {
  let token;

  // Cautam header-ul de autorizare in formatul standard 'Bearer <token>'
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // Extragem doar token-ul efectiv
      token = req.headers.authorization.split(' ')[1];

      // Decodam token-ul folosind cheia secreta din environment variables
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Atasam informatiile userului la request (excluzand parola pentru securitate)
      // Astfel, in controllere putem folosi direct req.user
      req.user = await User.findById(decoded.id).select('-password');

      next();
    } catch (error) {
      console.log('Eroare validare token JWT:', error);
      res.status(401);
      throw new Error('Sesiune invalida sau expirata.');
    }
  }

  // Daca nu s-a trimis niciun token in request
  if (!token) {
    res.status(401);
    throw new Error('Acces interzis. Lipseste token-ul de autorizare.');
  }
});

// Middleware de autorizare: permite accesul exclusiv conturilor cu rol de administrator.
// Se monteaza DUPA 'protect', deoarece se bazeaza pe req.user populat de acesta.
const admin = asyncHandler(async (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403);
    throw new Error('Acces interzis. Sunt necesare privilegii de administrator.');
  }
});

// Middleware de autorizare pentru personalul operational (agenti + admini).
const staff = asyncHandler(async (req, res, next) => {
  if (req.user && (req.user.role === 'agent' || req.user.role === 'admin')) {
    next();
  } else {
    res.status(403);
    throw new Error('Acces interzis. Sunt necesare privilegii de personal IT.');
  }
});

module.exports = { protect, admin, staff };