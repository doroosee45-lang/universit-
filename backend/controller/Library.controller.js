const LibraryBook = require('../models/LibraryBook.model');
const LibraryLoan = require('../models/LibraryLoan.model');
const { successResponse, errorResponse, paginatedResponse } = require('../utils/apiResponse');


// BOOKS
exports.getAllBooks = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, category, available } = req.query;
    const filter = {};
    if (search) filter.$or = [{ title: new RegExp(search, 'i') }, { author: new RegExp(search, 'i') }, { isbn: new RegExp(search, 'i') }];
    if (category) filter.category = category;
    if (available === 'true') filter.availableCopies = { $gt: 0 };

    const total = await LibraryBook.countDocuments(filter);
    const books = await LibraryBook.find(filter)
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .sort({ title: 1 });

    return paginatedResponse(res, books, total, page, limit);
  } catch (err) {
    return errorResponse(res, err.message);
  }
};

exports.getBookById = async (req, res) => {
  try {
    const book = await LibraryBook.findById(req.params.id);
    if (!book) return errorResponse(res, 'Livre introuvable', 404);
    return successResponse(res, book);
  } catch (err) {
    return errorResponse(res, err.message);
  }
};

exports.createBook = async (req, res) => {
  try {
    const book = await LibraryBook.create(req.body);
    return successResponse(res, book, 'Livre ajoutÃ©', 201);
  } catch (err) {
    return errorResponse(res, err.message);
  }
};

exports.updateBook = async (req, res) => {
  try {
    const book = await LibraryBook.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!book) return errorResponse(res, 'Livre introuvable', 404);
    return successResponse(res, book, 'Livre mis Ã  jour');
  } catch (err) {
    return errorResponse(res, err.message);
  }
};

exports.deleteBook = async (req, res) => {
  try {
    await LibraryBook.findByIdAndDelete(req.params.id);
    return successResponse(res, null, 'Livre supprimÃ©');
  } catch (err) {
    return errorResponse(res, err.message);
  }
};

// LOANS
exports.borrowBook = async (req, res) => {
  try {
    const book = await LibraryBook.findById(req.body.book);
    if (!book || book.availableCopies < 1) return errorResponse(res, 'Livre non disponible', 400);

    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 14); // 2 semaines

    const loan = await LibraryLoan.create({
      book: req.body.book,
      borrower: req.body.borrower,
      borrowerType: req.body.borrowerType || 'student',
      dueDate
    });

    book.availableCopies -= 1;
    await book.save();

    return successResponse(res, loan, 'Emprunt enregistrÃ©', 201);
  } catch (err) {
    return errorResponse(res, err.message);
  }
};

exports.returnBook = async (req, res) => {
  try {
    const loan = await LibraryLoan.findById(req.params.loanId);
    if (!loan) return errorResponse(res, 'Emprunt introuvable', 404);
    if (loan.returnDate) return errorResponse(res, 'DÃ©jÃ  retournÃ©', 400);

    loan.returnDate = new Date();
    loan.status = 'returned';
    await loan.save();

    await LibraryBook.findByIdAndUpdate(loan.book, { $inc: { availableCopies: 1 } });

    return successResponse(res, loan, 'Retour enregistrÃ©');
  } catch (err) {
    return errorResponse(res, err.message);
  }
};

exports.getActiveLoans = async (req, res) => {
  try {
    const loans = await LibraryLoan.find({ status: 'active' })
      .populate('book', 'title author isbn')
      .populate('borrower', 'firstName lastName matricule')
      .sort({ dueDate: 1 });
    return successResponse(res, loans);
  } catch (err) {
    return errorResponse(res, err.message);
  }
};

exports.getOverdueLoans = async (req, res) => {
  try {
    const loans = await LibraryLoan.find({ status: 'active', dueDate: { $lt: new Date() } })
      .populate('book', 'title author')
      .populate('borrower', 'firstName lastName email');
    return successResponse(res, loans);
  } catch (err) {
    return errorResponse(res, err.message);
  }
};
