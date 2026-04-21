const express = require('express');
const router = express.Router();
const ctrl = require('../controller/Library.controller');
const { protect } = require('../middleware/Auth.middleware');
const { authorize } = require('../middleware/Role.middleware');

router.use(protect);

// Books
router.get('/books', ctrl.getAllBooks);
router.get('/books/:id', ctrl.getBookById);
router.post('/books', authorize('admin', 'staff'), ctrl.createBook);
router.put('/books/:id', authorize('admin', 'staff'), ctrl.updateBook);
router.delete('/books/:id', authorize('admin'), ctrl.deleteBook);

// Loans
router.get('/loans', authorize('admin', 'staff'), ctrl.getActiveLoans);
router.get('/loans/overdue', authorize('admin', 'staff'), ctrl.getOverdueLoans);
router.post('/loans/borrow', authorize('admin', 'staff'), ctrl.borrowBook);
router.put('/loans/:loanId/return', authorize('admin', 'staff'), ctrl.returnBook);

module.exports = router;
