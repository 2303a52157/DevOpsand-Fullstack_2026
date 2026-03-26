const User = require('../models/User');
const Book = require('../models/Book');
const fs = require('fs');
const path = require('path');

exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.session.userId).lean();
    const books = await Book.find({ addedBy: req.session.userId }).lean();
    const completed = books.filter(b => b.status === 'completed').length;
    const reading = books.filter(b => b.status === 'currently-reading').length;
    const wantToRead = books.filter(b => b.status === 'want-to-read').length;

    res.render('profile/index', {
      title: 'My Profile',
      user,
      stats: { total: books.length, completed, reading, wantToRead },
      error: req.flash('error'),
      success: req.flash('success')
    });
  } catch (err) {
    console.error(err);
    req.flash('error', 'Failed to load profile.');
    res.redirect('/dashboard');
  }
};

exports.putProfile = async (req, res) => {
  try {
    const user = await User.findById(req.session.userId);
    const { name, email, bio, readingGoal, favoriteGenres } = req.body;

    if (email !== user.email) {
      const existing = await User.findOne({ email: email.toLowerCase().trim(), _id: { $ne: user._id } });
      if (existing) {
        req.flash('error', 'Email is already in use.');
        return res.redirect('/profile');
      }
    }

    if (req.file) {
      if (user.avatar) {
        const oldPath = path.join('public', user.avatar);
        if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      }
      user.avatar = '/uploads/avatars/' + req.file.filename;
      req.session.avatar = user.avatar;
    }

    user.name = name.trim();
    user.email = email.toLowerCase().trim();
    user.bio = bio ? bio.trim() : '';
    user.readingGoal = readingGoal ? parseInt(readingGoal) : 12;
    user.favoriteGenres = favoriteGenres ? (Array.isArray(favoriteGenres) ? favoriteGenres : [favoriteGenres]) : [];

    await user.save({ validateBeforeSave: false });
    req.session.userName = user.name;
    req.session.userEmail = user.email;

    req.flash('success', 'Profile updated!');
    res.redirect('/profile');
  } catch (err) {
    console.error(err);
    req.flash('error', 'Failed to update profile.');
    res.redirect('/profile');
  }
};

exports.putPassword = async (req, res) => {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body;
    const user = await User.findById(req.session.userId);

    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) {
      req.flash('error', 'Current password is incorrect.');
      return res.redirect('/profile');
    }
    if (newPassword !== confirmPassword) {
      req.flash('error', 'New passwords do not match.');
      return res.redirect('/profile');
    }
    if (newPassword.length < 6) {
      req.flash('error', 'New password must be at least 6 characters.');
      return res.redirect('/profile');
    }

    user.password = newPassword;
    await user.save();
    req.flash('success', 'Password changed successfully!');
    res.redirect('/profile');
  } catch (err) {
    console.error(err);
    req.flash('error', 'Failed to change password.');
    res.redirect('/profile');
  }
};
