// Middleware custom pentru a suprascrie formatul default de erori in Express
// Transforma erorile HTML by default intr-un raspuns formatat JSON, ideal pentru REST APIs.
const errorHandler = (err, req, res, next) => {
  // Express seteaza implicit statusCode 200. Daca un controller arunca o eroare fara sa fi
  // setat un cod (ex: un crash neasteptat), tratam cazul ca eroare interna de server (500),
  // altfel am raspunde 200 OK cu un mesaj de eroare in body.
  const statusCode = res.statusCode && res.statusCode !== 200 ? res.statusCode : 500;

  res.status(statusCode);

  res.json({
    message: err.message,
    // Ascundem call stack-ul in mediul de productie (Render/Vercel) pentru a nu oferi detalii tehnice atacatorilor
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
};

module.exports = { errorHandler };