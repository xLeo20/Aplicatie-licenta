const asyncHandler = require('express-async-handler');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer'); 
const path = require('path');     
const User = require('../models/userModel');

// --- STRATEGIE DE STOCARE MULTER PENTRU POZELE DE PROFIL ---
const storage = multer.diskStorage({
  destination(req, file, cb) {
    // Alocare in folderul static
    cb(null, 'uploads/');
  },
  filename(req, file, cb) {
    // Generam un naming unic folosind timestamp pentru a evita suprascrierea fisierelor vechi
    cb(null, `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`);
  },
});

// Filtru de securitate: Limitarea tipurilor de MIME admise pentru upload
function checkFileType(file, cb) {
  const filetypes = /jpg|jpeg|png/;
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = filetypes.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb('Format incompatibil. Sistemul proceseaza doar imagini (jpg, jpeg, png).');
  }
}

const upload = multer({
  storage,
  fileFilter: function (req, file, cb) {
    checkFileType(file, cb);
  },
});

// @desc    Procesul de reinnoire a parolei din setari
const changePassword = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword } = req.body;

  // Bariera de validare continut
  if (!oldPassword || !newPassword) {
    res.status(400);
    throw new Error('Eroare de input. Campurile de parola sunt obligatorii.');
  }

  // Interogare direct pe DB a credentialelor
  const user = await User.findById(req.user.id);

  if (!user) {
    res.status(401);
    throw new Error('Sesiunea a expirat.');
  }

  // Comparam amprenta hashuita existenta cu input-ul vechi furnizat
  const isMatch = await bcrypt.compare(oldPassword, user.password);

  if (!isMatch) {
    res.status(400);
    throw new Error('Lipsa potrivire cu hash-ul initial de securitate.');
  }

  // Generam noul SALT criptografic si suprascriem DB
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(newPassword, salt);

  user.password = hashedPassword;
  await user.save();

  res.status(200).json({ message: 'Procesare de securitate finalizata cu succes.' });
});

// --- OPERATIUNI PRINCIPALE CRUD PE USERI ---

// @desc    Înregistrarea in baza de date a persoanelor din exterior
const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password, role, department } = req.body;

  if (!name || !email || !password) {
    res.status(400);
    throw new Error('Toate cheile textului de intrare sunt necesare.');
  }

  // Protectie impotriva clonarii adreselor de email (index unic mongo)
  const userExists = await User.findOne({ email });
  if (userExists) {
    res.status(400);
    throw new Error('Adresa de mail introdusa a fost deja asignata in sistem.');
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
      profileImage: user.profileImage, 
      token: generateToken(user._id),
    });
  } else {
    res.status(400);
    throw new Error('Conflict cu parametrii de mongoose.');
  }
});

// @desc    Obtinerea token-ului JWT in urma autentificarii
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
      profileImage: user.profileImage, 
      token: generateToken(user._id),
    });
  } else {
    res.status(401);
    throw new Error('Permisiune respinsa. Date eronate.');
  }
});

// @desc    Rehidrateaza state-ul frontend-ului cu parametrii userului activ
const getMe = asyncHandler(async (req, res) => {
  const user = {
    id: req.user._id,
    email: req.user.email,
    name: req.user.name,
    role: req.user.role,
    department: req.user.department,
    profileImage: req.user.profileImage 
  };
  res.status(200).json(user);
});

// @desc    Injectarea noii surse url pentru avatar
// @route   POST /api/users/upload
const uploadProfilePhoto = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);

    if (user) {
        // Curatarea path-ului de delimitatoarele non-url specifice os-ului gazda
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
        throw new Error('Sincronizarea fotografiei a picat. Model inexistent.');
    }
});

// @desc    Vizualizare a intregului model al angajatilor pentru CMS
const getAllUsers = asyncHandler(async (req, res) => {
    const users = await User.find({});
    res.status(200).json(users);
});

// @desc    Indepartarea profilurilor din sistem
const deleteUser = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id);
    if (!user) {
        res.status(404);
        throw new Error('Entitatea tinta a fost probabil eliminata din exterior.');
    }
    await user.deleteOne();
    res.status(200).json({ id: req.params.id });
});

// @desc    Omiterea inregistrarii libere - cont creat intern de manager
const createUser = asyncHandler(async (req, res) => {
  const { name, email, password, role, department } = req.body;

  if (!name || !email || !password) {
    res.status(400);
    throw new Error('Validare formular de baza ratata');
  }

  const userExists = await User.findOne({ email });
  if (userExists) {
    res.status(400);
    throw new Error('Coliziune in baza de date - Mail rezervat.');
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
    throw new Error('Sarcina a esuat. Structura fisier nerecunoscuta.');
  }
});

// @desc    Interventie prin admin panel pe atributele oricarui angajat
const updateUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    res.status(404);
    throw new Error('ID-ul furnizat returneaza un set null');
  }

  // Permitem mutatiile dinamice (lasam vechile date daca lipseste payload-ul)
  user.name = req.body.name || user.name;
  user.email = req.body.email || user.email;
  user.role = req.body.role || user.role;
  user.department = req.body.department || user.department;

  // Executam hash bypass daca a fost resetata fortat parola utilizatorului
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

// @desc Generator nativ al semnaturilor JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d', // Un lifecycle extins aplicatiei interne
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
  upload,             
  uploadProfilePhoto,  
  changePassword      
};