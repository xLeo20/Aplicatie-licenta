// Middleware custom pentru a suprascrie formatul default de erori in Express
// Transforma erorile HTML by default intr-un raspuns formatat JSON, ideal pentru REST APIs.
const errorHandler = (err, req, res, next) => {
  // Daca statusul e deja setat (ex: 400, 401, 404), il pastram. Daca nu, consideram ca e eroare interna de server (500).
  const statusCode = res.statusCode ? res.statusCode : 500;

  res.status(statusCode);

  res.json({
    message: err.message,
    // Ascundem call stack-ul in mediul de productie (Render/Vercel) pentru a nu oferi detalii tehnice atacatorilor
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
};

module.exports = { errorHandler };