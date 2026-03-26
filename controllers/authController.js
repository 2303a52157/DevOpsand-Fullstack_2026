const User = require('../models/User');

exports.getLogin = (req, res) => {
  res.render('auth/login', { title: 'Login', error: req.flash('error'), success: req.flash('success') });
};

exports.postLogin = async (req, res) => {
  const { email, password } = req.body;
  try {
    if (!email || !password) {
      req.flash('error', 'Please fill in all fields.');
      return res.redirect('/auth/login');
    }
    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      req.flash('error', 'Invalid email or password.');
      return res.redirect('/auth/login');
    }
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      req.flash('error', 'Invalid email or password.');
      return res.redirect('/auth/login');
    }
    user.lastLogin = new Date();
    await user.save({ validateBeforeSave: false });

    req.session.userId = user._id.toString();
    req.session.userName = user.name;
    req.session.userEmail = user.email;
    req.session.role = user.role;
    req.session.avatar = user.avatar;

    req.flash('success', `Welcome back, ${user.name}!`);
    res.redirect('/dashboard');
  } catch (err) {
    console.error(err);
    req.flash('error', 'Server error. Please try again.');
    res.redirect('/auth/login');
  }
};

exports.getRegister = (req, res) => {
  res.render('auth/register', { title: 'Register', error: req.flash('error'), success: req.flash('success') });
};

exports.postRegister = async (req, res) => {
  const { name, email, password, confirmPassword, role } = req.body;
  try {
    if (!name || !email || !password || !confirmPassword) {
      req.flash('error', 'Please fill in all fields.');
      return res.redirect('/auth/register');
    }
    if (password !== confirmPassword) {
      req.flash('error', 'Passwords do not match.');
      return res.redirect('/auth/register');
    }
    if (password.length < 6) {
      req.flash('error', 'Password must be at least 6 characters.');
      return res.redirect('/auth/register');
    }
    const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
    if (existingUser) {
      req.flash('error', 'Email is already registered.');
      return res.redirect('/auth/register');
    }
    const allowedRoles = ['admin', 'member'];
    const userRole = allowedRoles.includes(role) ? role : 'member';

    const user = await User.create({ name: name.trim(), email: email.toLowerCase().trim(), password, role: userRole });
    req.flash('success', 'Account created! Please log in.');
    res.redirect('/auth/login');
  } catch (err) {
    console.error(err);
    req.flash('error', err.message || 'Registration failed.');
    res.redirect('/auth/register');
  }
};

exports.logout = (req, res) => {
  req.session.destroy((err) => {
    if (err) console.error('Session destroy error:', err);
    res.redirect('/auth/login');
  });
};
