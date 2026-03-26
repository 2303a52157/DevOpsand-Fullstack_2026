const User = require('../models/User');
const Book = require('../models/Book');

exports.getUsers = async (req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1 }).lean();
    const usersWithStats = await Promise.all(users.map(async (u) => {
      const bookCount = await Book.countDocuments({ addedBy: u._id });
      return { ...u, bookCount };
    }));

    res.render('users/index', {
      title: 'Manage Users',
      users: usersWithStats,
      error: req.flash('error'),
      success: req.flash('success')
    });
  } catch (err) {
    console.error(err);
    req.flash('error', 'Failed to load users.');
    res.redirect('/dashboard');
  }
};

exports.changeRole = async (req, res) => {
  try {
    const { role } = req.body;
    if (!['admin', 'member'].includes(role)) {
      req.flash('error', 'Invalid role.');
      return res.redirect('/users');
    }
    await User.findByIdAndUpdate(req.params.id, { role });
    req.flash('success', 'User role updated.');
    res.redirect('/users');
  } catch (err) {
    console.error(err);
    req.flash('error', 'Failed to update role.');
    res.redirect('/users');
  }
};

exports.deleteUser = async (req, res) => {
  try {
    if (req.params.id === req.session.userId) {
      req.flash('error', 'You cannot delete your own account here.');
      return res.redirect('/users');
    }
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      req.flash('error', 'User not found.');
      return res.redirect('/users');
    }
    req.flash('success', `User "${user.name}" deleted.`);
    res.redirect('/users');
  } catch (err) {
    console.error(err);
    req.flash('error', 'Failed to delete user.');
    res.redirect('/users');
  }
};
