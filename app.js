require('dotenv').config();
const express = require('express');
const path = require('path');
const methodOverride = require('method-override');
const flash = require('connect-flash');
const session = require('express-session');
const connectDB = require('./config/db');
const sessionConfig = require('./config/session');

const app = express();

// Connect to MongoDB
connectDB();

// View engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Static files
app.use(express.static(path.join(__dirname, 'public')));

// Body parsers
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Method override for PUT/DELETE
app.use(methodOverride('_method'));

// Session
app.use(session(sessionConfig));

// Flash messages
app.use(flash());

// Global locals for all views
app.use((req, res, next) => {
  res.locals.sessionUser = {
    id: req.session.userId || null,
    name: req.session.userName || null,
    email: req.session.userEmail || null,
    role: req.session.role || null,
    avatar: req.session.avatar || null
  };
  res.locals.isAdmin = req.session.role === 'admin';
  next();
});

// Routes
app.use('/auth', require('./routes/auth'));
app.use('/dashboard', require('./routes/dashboard'));
app.use('/books', require('./routes/books'));
app.use('/clubs', require('./routes/clubs'));
app.use('/users', require('./routes/users'));
app.use('/profile', require('./routes/profile'));

// Root redirect
app.get('/', (req, res) => {
  if (req.session.userId) return res.redirect('/dashboard');
  res.redirect('/auth/login');
});

// 404 handler
app.use((req, res) => {
  res.status(404).render('404', { title: '404 - Page Not Found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).render('500', { title: '500 - Server Error', message: err.message });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 BookClub Tracker running at http://localhost:${PORT}`);
});
