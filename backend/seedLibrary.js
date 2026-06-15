require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/university_db';

// ─── Schémas minimaux (User + Program) ─────────────────────────
const UserSchema = new mongoose.Schema({
  firstName: String,
  lastName: String,
  email: { type: String, unique: true, lowercase: true },
  password: String,
  role: { type: String, enum: ['super_admin','admin','staff','department_head','teacher','student'] },
  phone: String,
  isActive: { type: Boolean, default: true },
  studentId: { type: String, unique: true, sparse: true },
  program: { type: mongoose.Schema.Types.ObjectId, ref: 'Program' },
  level: String,
});
const User = mongoose.model('User', UserSchema);

const ProgramSchema = new mongoose.Schema({
  name: String,
  code: String,
  academicYear: String,
});
const Program = mongoose.model('Program', ProgramSchema);

// ─── Modèles Bibliothèque (copie exacte de vos fichiers) ───────
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
  totalQuantity: { type: Number, required: true, min: 1 },
  availableQuantity: { type: Number, required: true, min: 0 },
  location: String,
  coverUrl: String,
  description: String,
  isDigital: { type: Boolean, default: false },
  digitalUrl: String,
  isActive: { type: Boolean, default: true }
}, { timestamps: true });
LibraryBookSchema.index({ isbn: 1 });
LibraryBookSchema.index({ domain: 1 });
const LibraryBook = mongoose.model('LibraryBook', LibraryBookSchema);

const LibraryLoanSchema = new mongoose.Schema({
  book: { type: mongoose.Schema.Types.ObjectId, ref: 'LibraryBook', required: true },
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  loanDate: { type: Date, default: Date.now },
  dueDate: { type: Date, required: true },
  returnDate: Date,
  finePerDay: { type: Number, default: 50 },
  fineAmount: { type: Number, default: 0 },
  isFinesPaid: { type: Boolean, default: false },
  status: {
    type: String,
    enum: ['active', 'returned', 'overdue', 'lost'],
    default: 'active'
  },
  renewalCount: { type: Number, default: 0 },
  maxRenewals: { type: Number, default: 1 },
  notes: String,
  processedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });
LibraryLoanSchema.methods.calculateFine = function () {
  if (!this.returnDate && this.dueDate < new Date()) {
    const daysLate = Math.ceil((new Date() - this.dueDate) / (1000 * 60 * 60 * 24));
    this.fineAmount = daysLate * this.finePerDay;
  }
  return this.fineAmount;
};
LibraryLoanSchema.index({ student: 1, status: 1 });
LibraryLoanSchema.index({ book: 1 });
LibraryLoanSchema.index({ dueDate: 1, status: 1 });
const LibraryLoan = mongoose.model('LibraryLoan', LibraryLoanSchema);

// ─── Helpers ──────────────────────────────────────────────────
const today = new Date();
const daysAgo = (n) => new Date(today - n * 86400000);
const daysFromNow = (n) => new Date(today.getTime() + n * 86400000);

// ─── Seed ─────────────────────────────────────────────────────
async function seedLibrary() {
  await mongoose.connect(MONGO_URI);
  console.log('✅ Connecté à MongoDB :', MONGO_URI);

  // 1. Suppression
  console.log('\n🗑️  Suppression des collections librarybooks et libraryloans...');
  try { await mongoose.connection.collection('librarybooks').drop(); console.log('   ✓ librarybooks supprimée'); } catch(e) { console.log('   ~ librarybooks inexistante'); }
  try { await mongoose.connection.collection('libraryloans').drop(); console.log('   ✓ libraryloans supprimée'); } catch(e) { console.log('   ~ libraryloans inexistante'); }

  // 2. Récupération ou création d'étudiants
  let students = await User.find({ role: 'student' }).limit(10);
  if (students.length === 0) {
    console.log('\n⚠️  Aucun étudiant trouvé. Création d\'étudiants de test...');
    const pwd = await bcrypt.hash('password123', 10);
    let program = await Program.findOne();
    if (!program) program = await Program.create({ name: 'Informatique', code: 'INFO', academicYear: '2024-2025' });
    students = await User.insertMany([
      { firstName: 'Ali', lastName: 'BENALI', email: 'ali.benali@etu.univ.dz', password: pwd, role: 'student', program: program._id, level: 'L2', studentId: 'STU240001' },
      { firstName: 'Mona', lastName: 'SAIDI', email: 'mona.saidi@etu.univ.dz', password: pwd, role: 'student', program: program._id, level: 'L3', studentId: 'STU240002' },
      { firstName: 'Karim', lastName: 'OUAKLI', email: 'karim.ouakli@etu.univ.dz', password: pwd, role: 'student', program: program._id, level: 'M1', studentId: 'STU240003' },
    ]);
    console.log(`   ✓ ${students.length} étudiants créés`);
  } else {
    console.log(`\n👥 ${students.length} étudiants trouvés dans la base`);
  }

  // 3. Création des livres
  console.log('\n📚 Création des livres...');
  const books = await LibraryBook.insertMany([
    { isbn: '978-2-123456-01-0', title: 'Programmation Web avancée', author: 'Jean Dupont', publisher: 'Eyrolles', publicationYear: 2022, category: 'manuel', domain: 'Informatique', totalQuantity: 5, availableQuantity: 5, location: 'Informatique - Rayon 3', description: 'Un guide complet sur React et Node.js' },
    { isbn: '978-2-123456-02-7', title: 'Algorithmique et structures de données', author: 'Marie Curien', publisher: 'Dunod', publicationYear: 2021, category: 'manuel', domain: 'Informatique', totalQuantity: 3, availableQuantity: 3, location: 'Informatique - Rayon 1', description: 'Les fondamentaux' },
    { isbn: '978-2-123456-03-4', title: 'Intelligence artificielle : concepts clés', author: 'Yann LeCun', publisher: "O'Reilly", publicationYear: 2023, category: 'manuel', domain: 'IA', totalQuantity: 2, availableQuantity: 2, location: 'IA - Rayon 2', isDigital: true, digitalUrl: 'https://bibliotheque.univ-ust.dz/ebooks/ia-concepts.pdf' },
    { isbn: '978-2-123456-04-1', title: 'Thèse : Optimisation des réseaux mobiles', author: 'Ahmed Benali', publicationYear: 2020, category: 'these', domain: 'Réseaux', totalQuantity: 1, availableQuantity: 1, location: 'Thèses - Armoire C' },
    { isbn: '978-2-123456-05-8', title: 'Mémoire : Sécurité des systèmes d\'information', author: 'Sofia Hamdi', publicationYear: 2021, category: 'memoire', domain: 'Cybersécurité', totalQuantity: 2, availableQuantity: 2, location: 'Mémoires - Box 4' },
    { isbn: '978-2-123456-06-5', title: 'Revue : Informatique et Société', author: 'Collectif', publicationYear: 2024, category: 'periodique', domain: 'Informatique', totalQuantity: 10, availableQuantity: 10, location: 'Périodiques - Étagère B' },
    { isbn: '978-2-123456-07-2', title: 'Mathématiques pour l\'ingénieur', author: 'Pierre Lafont', publisher: 'Hachette', publicationYear: 2019, category: 'manuel', domain: 'Mathématiques', totalQuantity: 4, availableQuantity: 4, location: 'Maths - Rayon 1' },
  ]);
  console.log(`   ✓ ${books.length} livres créés`);

  // 4. Création des emprunts
  console.log('\n📖 Création des emprunts...');
  const loans = [];

  // Emprunt actif (dans les délais)
  loans.push({
    book: books[0]._id,
    student: students[0]._id,
    loanDate: daysAgo(5),
    dueDate: daysFromNow(9),
    status: 'active',
    fineAmount: 0,
  });
  // Emprunt actif (proche échéance)
  loans.push({
    book: books[1]._id,
    student: students[1]._id,
    loanDate: daysAgo(12),
    dueDate: daysFromNow(2),
    status: 'active',
    fineAmount: 0,
  });
  // Emprunt en retard (calcul de l'amende automatique)
  const overdueLoan = {
    book: books[2]._id,
    student: students[2]._id,
    loanDate: daysAgo(20),
    dueDate: daysAgo(5),
    status: 'overdue',
    finePerDay: 50,
    fineAmount: 0,
  };
  const daysLate = Math.ceil((today - overdueLoan.dueDate) / (1000 * 60 * 60 * 24));
  overdueLoan.fineAmount = daysLate * overdueLoan.finePerDay;
  loans.push(overdueLoan);
  // Emprunt retourné à l'heure
  loans.push({
    book: books[3]._id,
    student: students[0]._id,
    loanDate: daysAgo(15),
    dueDate: daysAgo(8),
    returnDate: daysAgo(7),
    status: 'returned',
    fineAmount: 0,
  });
  // Emprunt retourné avec retard
  const lateReturnLoan = {
    book: books[4]._id,
    student: students[1]._id,
    loanDate: daysAgo(25),
    dueDate: daysAgo(18),
    returnDate: daysAgo(14),
    status: 'returned',
    finePerDay: 50,
    fineAmount: 0,
  };
  const daysLateReturn = Math.ceil((lateReturnLoan.returnDate - lateReturnLoan.dueDate) / (1000 * 60 * 60 * 24));
  lateReturnLoan.fineAmount = daysLateReturn * lateReturnLoan.finePerDay;
  loans.push(lateReturnLoan);
  // Emprunt actif renouvelé
  loans.push({
    book: books[5]._id,
    student: students[2]._id,
    loanDate: daysAgo(14),
    dueDate: daysFromNow(7),
    status: 'active',
    renewalCount: 1,
    fineAmount: 0,
  });

  // Mise à jour des quantités disponibles pour les livres empruntés (non retournés)
  const activeOrOverdueLoans = loans.filter(l => l.status === 'active' || l.status === 'overdue');
  for (const loan of activeOrOverdueLoans) {
    const book = books.find(b => b._id.equals(loan.book));
    if (book && book.availableQuantity > 0) {
      book.availableQuantity -= 1;
      await book.save();
    }
  }

  const createdLoans = await LibraryLoan.insertMany(loans);
  console.log(`   ✓ ${createdLoans.length} emprunts créés`);

  // 5. Résumé
  console.log('\n' + '═'.repeat(60));
  console.log('✅  SEED BIBLIOTHÈQUE TERMINÉ');
  console.log('═'.repeat(60));
  console.log(`\n📊 Résumé :`);
  console.log(`   📚 Livres        : ${books.length}`);
  console.log(`   📖 Emprunts      : ${createdLoans.length}`);
  console.log(`      - Actifs      : ${createdLoans.filter(l => l.status === 'active').length}`);
  console.log(`      - En retard   : ${createdLoans.filter(l => l.status === 'overdue').length}`);
  console.log(`      - Retournés   : ${createdLoans.filter(l => l.status === 'returned').length}`);
  console.log(`   👥 Étudiants utilisés : ${new Set(loans.map(l => l.student.toString())).size}`);
  console.log(`\n💡 Exemples :`);
  console.log(`   • Livre "${books[0].title}" → dispo : ${books[0].availableQuantity}/${books[0].totalQuantity}`);
  console.log(`   • Emprunt en retard (${books[2].title}) : amende = ${overdueLoan.fineAmount} DA`);
  console.log(`   • Emprunt retourné avec retard : amende = ${lateReturnLoan.fineAmount} DA`);

  await mongoose.disconnect();
  console.log('\n🔌 Déconnecté\n');
  process.exit(0);
}

seedLibrary().catch(err => {
  console.error('❌ Erreur seed :', err);
  mongoose.disconnect();
  process.exit(1);
});