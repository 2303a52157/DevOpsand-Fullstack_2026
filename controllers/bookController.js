const Book = require('../models/Book');
const fs = require('fs');
const path = require('path');

const GENRES = ['Fiction', 'Non-Fiction', 'Mystery', 'Science Fiction', 'Fantasy', 'Romance', 'Thriller', 'Biography', 'History', 'Self-Help', 'Science', 'Poetry', 'Other'];
const STATUSES = ['want-to-read', 'currently-reading', 'completed', 'dropped'];

exports.getBooks = async (req, res) => {
  try {
    const { search, genre, status, sort } = req.query;
    const query = { addedBy: req.session.userId };

    if (search) query.title = { $regex: search, $options: 'i' };
    if (genre) query.genre = genre;
    if (status) query.status = status;

    const sortOptions = {
      'newest': { createdAt: -1 },
      'oldest': { createdAt: 1 },
      'title': { title: 1 },
      'author': { author: 1 },
      'rating': { averageRating: -1 }
    };
    const sortBy = sortOptions[sort] || sortOptions['newest'];

    const books = await Book.find(query).sort(sortBy).lean();

    res.render('books/index', {
      title: 'My Books',
      books,
      genres: GENRES,
      statuses: STATUSES,
      filters: { search, genre, status, sort },
      error: req.flash('error'),
      success: req.flash('success')
    });
  } catch (err) {
    console.error(err);
    req.flash('error', 'Failed to load books.');
    res.redirect('/dashboard');
  }
};

exports.getCreateBook = (req, res) => {
  res.render('books/create', {
    title: 'Add Book',
    genres: GENRES,
    statuses: STATUSES,
    error: req.flash('error')
  });
};

exports.postCreateBook = async (req, res) => {
  try {
    const { title, author, isbn, genre, description, publishedYear, pages, status, startDate, finishDate, tags } = req.body;
    const coverImage = req.file ? '/uploads/covers/' + req.file.filename : null;

    const book = await Book.create({
      title: title.trim(),
      author: author.trim(),
      isbn: isbn ? isbn.trim() : '',
      genre,
      description: description ? description.trim() : '',
      publishedYear: publishedYear ? parseInt(publishedYear) : undefined,
      pages: pages ? parseInt(pages) : 0,
      coverImage,
      status,
      startDate: startDate ? new Date(startDate) : null,
      finishDate: finishDate ? new Date(finishDate) : null,
      tags: tags ? tags.split(',').map(t => t.trim()).filter(Boolean) : [],
      addedBy: req.session.userId
    });

    req.flash('success', `"${book.title}" added to your library!`);
    res.redirect('/books');
  } catch (err) {
    console.error(err);
    if (req.file) fs.unlinkSync(req.file.path);
    req.flash('error', err.message || 'Failed to add book.');
    res.redirect('/books/create');
  }
};

exports.getBook = async (req, res) => {
  try {
    const book = await Book.findOne({ _id: req.params.id, addedBy: req.session.userId })
      .populate('reviews.user', 'name avatar')
      .lean();

    if (!book) {
      req.flash('error', 'Book not found.');
      return res.redirect('/books');
    }

    // Calculate average rating
    let avgRating = 0;
    if (book.reviews && book.reviews.length > 0) {
      avgRating = (book.reviews.reduce((acc, r) => acc + r.rating, 0) / book.reviews.length).toFixed(1);
    }

    res.render('books/show', {
      title: book.title,
      book,
      avgRating,
      error: req.flash('error'),
      success: req.flash('success')
    });
  } catch (err) {
    console.error(err);
    req.flash('error', 'Book not found.');
    res.redirect('/books');
  }
};

exports.getEditBook = async (req, res) => {
  try {
    const book = await Book.findOne({ _id: req.params.id, addedBy: req.session.userId }).lean();
    if (!book) {
      req.flash('error', 'Book not found.');
      return res.redirect('/books');
    }
    res.render('books/edit', {
      title: 'Edit Book',
      book,
      genres: GENRES,
      statuses: STATUSES,
      error: req.flash('error')
    });
  } catch (err) {
    req.flash('error', 'Book not found.');
    res.redirect('/books');
  }
};

exports.putEditBook = async (req, res) => {
  try {
    const book = await Book.findOne({ _id: req.params.id, addedBy: req.session.userId });
    if (!book) {
      req.flash('error', 'Book not found.');
      return res.redirect('/books');
    }

    const { title, author, isbn, genre, description, publishedYear, pages, status, startDate, finishDate, tags } = req.body;

    if (req.file) {
      if (book.coverImage) {
        const oldPath = path.join('public', book.coverImage);
        if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      }
      book.coverImage = '/uploads/covers/' + req.file.filename;
    }

    book.title = title.trim();
    book.author = author.trim();
    book.isbn = isbn ? isbn.trim() : '';
    book.genre = genre;
    book.description = description ? description.trim() : '';
    book.publishedYear = publishedYear ? parseInt(publishedYear) : undefined;
    book.pages = pages ? parseInt(pages) : 0;
    book.status = status;
    book.startDate = startDate ? new Date(startDate) : null;
    book.finishDate = finishDate ? new Date(finishDate) : null;
    book.tags = tags ? tags.split(',').map(t => t.trim()).filter(Boolean) : [];

    await book.save();
    req.flash('success', 'Book updated successfully!');
    res.redirect('/books/' + book._id);
  } catch (err) {
    console.error(err);
    req.flash('error', err.message || 'Failed to update book.');
    res.redirect('/books/' + req.params.id + '/edit');
  }
};

exports.deleteBook = async (req, res) => {
  try {
    const book = await Book.findOne({ _id: req.params.id, addedBy: req.session.userId });
    if (!book) {
      req.flash('error', 'Book not found.');
      return res.redirect('/books');
    }
    if (book.coverImage) {
      const imgPath = path.join('public', book.coverImage);
      if (fs.existsSync(imgPath)) fs.unlinkSync(imgPath);
    }
    await Book.deleteOne({ _id: book._id });
    req.flash('success', `"${book.title}" removed from your library.`);
    res.redirect('/books');
  } catch (err) {
    console.error(err);
    req.flash('error', 'Failed to delete book.');
    res.redirect('/books');
  }
};

exports.postReview = async (req, res) => {
  try {
    const book = await Book.findOne({ _id: req.params.id, addedBy: req.session.userId });
    if (!book) {
      req.flash('error', 'Book not found.');
      return res.redirect('/books');
    }
    const { rating, comment } = req.body;
    const existingReview = book.reviews.find(r => r.user.toString() === req.session.userId);
    if (existingReview) {
      existingReview.rating = parseInt(rating);
      existingReview.comment = comment;
    } else {
      book.reviews.push({ user: req.session.userId, rating: parseInt(rating), comment });
    }
    await book.save();
    req.flash('success', 'Review saved!');
    res.redirect('/books/' + book._id);
  } catch (err) {
    console.error(err);
    req.flash('error', 'Failed to save review.');
    res.redirect('/books/' + req.params.id);
  }
};
