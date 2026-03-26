const express = require('express');
const router = express.Router();
const {
  getBooks, getCreateBook, postCreateBook,
  getBook, getEditBook, putEditBook, deleteBook, postReview
} = require('../controllers/bookController');
const { isAuthenticated } = require('../middleware/auth');
const { uploadCover } = require('../middleware/multer');

router.get('/', isAuthenticated, getBooks);
router.get('/create', isAuthenticated, getCreateBook);
router.post('/create', isAuthenticated, uploadCover.single('coverImage'), postCreateBook);
router.get('/:id', isAuthenticated, getBook);
router.get('/:id/edit', isAuthenticated, getEditBook);
router.put('/:id', isAuthenticated, uploadCover.single('coverImage'), putEditBook);
router.delete('/:id', isAuthenticated, deleteBook);
router.post('/:id/review', isAuthenticated, postReview);

module.exports = router;
