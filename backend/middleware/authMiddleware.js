const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');
const User = require('../models/userModel');

const protect = asyncHandler(async (req, res, next) => {
  let token;

  // Verificam daca exista header-ul de autorizare si daca incepe cu Bearer
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // Obtinem token-ul din header (eliminam cuvantul Bearer)
      token = req.headers.authorization.split(' ')[1];

      // Verificam token-ul
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Gasim utilizatorul pe baza ID-ului din token (fara parola)
      req.user = await User.findById(decoded.id).select('-password');

      next();
    } catch (error) {
      console.log(error);
      res.status(401);
      throw new Error('Nu esti autorizat');
    }
  }

  if (!token) {
    res.status(401);
    throw new Error('Nu esti autorizat, lipseste token-ul');
  }
});

module.exports = { protect };