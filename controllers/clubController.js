const Club = require('../models/Club');
const User = require('../models/User');
const Book = require('../models/Book');

exports.getClubs = async (req, res) => {
  try {
    const myClubs = await Club.find({ members: req.session.userId })
      .populate('createdBy', 'name')
      .populate('currentBook', 'title author')
      .lean();

    const publicClubs = await Club.find({ isPrivate: false, members: { $ne: req.session.userId } })
      .populate('createdBy', 'name')
      .lean();

    res.render('clubs/index', {
      title: 'Book Clubs',
      myClubs,
      publicClubs,
      error: req.flash('error'),
      success: req.flash('success')
    });
  } catch (err) {
    console.error(err);
    req.flash('error', 'Failed to load clubs.');
    res.redirect('/dashboard');
  }
};

exports.getCreateClub = (req, res) => {
  res.render('clubs/create', { title: 'Create Club', error: req.flash('error') });
};

exports.postCreateClub = async (req, res) => {
  try {
    const { name, description, isPrivate, genre } = req.body;
    const club = await Club.create({
      name: name.trim(),
      description: description ? description.trim() : '',
      isPrivate: isPrivate === 'on',
      genre: genre || 'Mixed',
      createdBy: req.session.userId,
      members: [req.session.userId]
    });
    await User.findByIdAndUpdate(req.session.userId, { $addToSet: { joinedClubs: club._id } });
    req.flash('success', `Club "${club.name}" created!`);
    res.redirect('/clubs/' + club._id);
  } catch (err) {
    console.error(err);
    req.flash('error', 'Failed to create club.');
    res.redirect('/clubs/create');
  }
};

exports.getClub = async (req, res) => {
  try {
    const club = await Club.findById(req.params.id)
      .populate('createdBy', 'name avatar')
      .populate('members', 'name avatar')
      .populate('currentBook')
      .lean();

    if (!club) {
      req.flash('error', 'Club not found.');
      return res.redirect('/clubs');
    }

    const books = await Book.find({ club: club._id }).lean();
    const isMember = club.members.some(m => m._id.toString() === req.session.userId);
    const isCreator = club.createdBy._id.toString() === req.session.userId;

    res.render('clubs/show', {
      title: club.name,
      club,
      books,
      isMember,
      isCreator,
      error: req.flash('error'),
      success: req.flash('success')
    });
  } catch (err) {
    console.error(err);
    req.flash('error', 'Club not found.');
    res.redirect('/clubs');
  }
};

exports.joinClub = async (req, res) => {
  try {
    const club = await Club.findById(req.params.id);
    if (!club) {
      req.flash('error', 'Club not found.');
      return res.redirect('/clubs');
    }
    if (!club.members.includes(req.session.userId)) {
      club.members.push(req.session.userId);
      await club.save();
      await User.findByIdAndUpdate(req.session.userId, { $addToSet: { joinedClubs: club._id } });
      req.flash('success', `Joined "${club.name}"!`);
    }
    res.redirect('/clubs/' + club._id);
  } catch (err) {
    console.error(err);
    req.flash('error', 'Failed to join club.');
    res.redirect('/clubs');
  }
};

exports.leaveClub = async (req, res) => {
  try {
    const club = await Club.findById(req.params.id);
    if (!club) return res.redirect('/clubs');
    if (club.createdBy.toString() === req.session.userId) {
      req.flash('error', 'As creator you cannot leave. Delete the club instead.');
      return res.redirect('/clubs/' + club._id);
    }
    club.members = club.members.filter(m => m.toString() !== req.session.userId);
    await club.save();
    await User.findByIdAndUpdate(req.session.userId, { $pull: { joinedClubs: club._id } });
    req.flash('success', `Left "${club.name}".`);
    res.redirect('/clubs');
  } catch (err) {
    console.error(err);
    req.flash('error', 'Failed to leave club.');
    res.redirect('/clubs');
  }
};

exports.deleteClub = async (req, res) => {
  try {
    const club = await Club.findById(req.params.id);
    if (!club) return res.redirect('/clubs');
    if (club.createdBy.toString() !== req.session.userId && req.session.role !== 'admin') {
      req.flash('error', 'Not authorized.');
      return res.redirect('/clubs');
    }
    await Club.deleteOne({ _id: club._id });
    req.flash('success', `Club "${club.name}" deleted.`);
    res.redirect('/clubs');
  } catch (err) {
    console.error(err);
    req.flash('error', 'Failed to delete club.');
    res.redirect('/clubs');
  }
};
