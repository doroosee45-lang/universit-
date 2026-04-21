const multer = require('multer');
const path = require('path');
const fs = require('fs');

// ✅ Création automatique des dossiers au démarrage
const ensureDir = (folder) => {
  const dir = path.join(__dirname, '..', 'uploads', folder);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
};

ensureDir('profiles');
ensureDir('documents');
ensureDir('assignments');
ensureDir('excel');

// Stockage disque local
const createDiskStorage = (folder) => multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, '..', 'uploads', folder);
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`);
  }
});

// Filtre : images uniquement
const imageFilter = (req, file, cb) => {
  const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  if (allowed.includes(file.mimetype)) cb(null, true);
  else cb(new Error('Seules les images JPG/PNG/WEBP sont acceptées.'), false);
};

// Filtre : documents (PDF, Word, images)
const documentFilter = (req, file, cb) => {
  const allowed = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'image/jpeg', 'image/png'
  ];
  if (allowed.includes(file.mimetype)) cb(null, true);
  else cb(new Error('Format non accepté. PDF, Word ou image uniquement.'), false);
};

// Filtre : Excel/CSV
const excelFilter = (req, file, cb) => {
  const allowed = [
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-excel',
    'text/csv'
  ];
  if (allowed.includes(file.mimetype)) cb(null, true);
  else cb(new Error('Format non accepté. Excel ou CSV uniquement.'), false);
};

// Upload photo de profil
const uploadProfile = multer({
  storage: createDiskStorage('profiles'),
  limits: { fileSize: 2 * 1024 * 1024 },
  fileFilter: imageFilter
}).single('photo');

// Upload document
const uploadDocument = multer({
  storage: createDiskStorage('documents'),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: documentFilter
}).single('document');

// Upload devoir (multiple fichiers)
const uploadAssignment = multer({
  storage: createDiskStorage('assignments'),
  limits: { fileSize: 20 * 1024 * 1024 },
  fileFilter: documentFilter
}).array('files', 5);

// Upload Excel
const uploadExcel = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: excelFilter
}).single('file');

// Wrapper pour gérer les erreurs multer
const handleUpload = (upload) => (req, res, next) => {
  upload(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') return res.status(400).json({ success: false, message: 'Fichier trop volumineux.' });
      return res.status(400).json({ success: false, message: err.message });
    }
    if (err) return res.status(400).json({ success: false, message: err.message });
    next();
  });
};

module.exports = {
  uploadProfile:    handleUpload(uploadProfile),
  uploadDocument:   handleUpload(uploadDocument),
  uploadAssignment: handleUpload(uploadAssignment),
  uploadExcel:      handleUpload(uploadExcel),
};