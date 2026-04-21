// const mongoose = require('mongoose');

// const LibraryBookSchema = new mongoose.Schema({
//   isbn: { type: String, unique: true, sparse: true },
//   title: { type: String, required: true, trim: true },
//   author: { type: String, required: true },
//   publisher: String,
//   publicationYear: Number,
//   edition: String,
//   category: {
//     type: String,
//     enum: ['manuel', 'these', 'memoire', 'periodique', 'ebook', 'reference', 'autre'],
//     default: 'manuel'
//   },
//   domain: String, // Domaine (Informatique, Droit, Médecine...)
//   language: { type: String, default: 'Français' },
//   totalQuantity: { type: Number, required: true, min: 1 },
//   availableQuantity: { type: Number, required: true, min: 0 },
//   location: String, // Rayon / Étagère
//   coverUrl: String,
//   description: String,
//   // Ressource numérique
//   isDigital: { type: Boolean, default: false },
//   digitalUrl: String,
//   isActive: { type: Boolean, default: true }
// }, { timestamps: true });

// LibraryBookSchema.index({ title: 'text', author: 'text' });
// LibraryBookSchema.index({ isbn: 1 });
// LibraryBookSchema.index({ domain: 1 });

// module.exports = mongoose.model('LibraryBook', LibraryBookSchema);



const mongoose = require('mongoose');

const LibraryBookSchema = new mongoose.Schema({
  isbn: { type: String, unique: true, sparse: true },
  title: { type: String, required: true, trim: true },
  author: { type: String, required: true },
  publisher: String,
  publicationYear: Number,
  edition: String,
  category: {
    type: String,
    enum: ['manuel', 'these', 'memoire', 'periodique', 'ebook', 'reference', 'autre'],
    default: 'manuel'
  },
  domain: String,
  // language: { type: String, default: 'Français' }, // COMMENTEZ CETTE LIGNE
  totalQuantity: { type: Number, required: true, min: 1 },
  availableQuantity: { type: Number, required: true, min: 0 },
  location: String,
  coverUrl: String,
  description: String,
  isDigital: { type: Boolean, default: false },
  digitalUrl: String,
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

// Commentez temporairement ces index
// LibraryBookSchema.index({ title: 'text', author: 'text' });
LibraryBookSchema.index({ isbn: 1 });
LibraryBookSchema.index({ domain: 1 });

module.exports = mongoose.model('LibraryBook', LibraryBookSchema);