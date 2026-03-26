const Book = require('../models/Book');
const User = require('../models/User');
const Club = require('../models/Club');

exports.getDashboard = async (req, res) => {
  try {
    const userId = req.session.userId;

    const totalBooks = await Book.countDocuments({ addedBy: userId });
    const completedBooks = await Book.countDocuments({ addedBy: userId, status: 'completed' });
    const currentlyReading = await Book.countDocuments({ addedBy: userId, status: 'currently-reading' });
    const wantToRead = await Book.countDocuments({ addedBy: userId, status: 'want-to-read' });
    const totalUsers = await User.countDocuments();
    const totalClubs = await Club.countDocuments();

    const recentBooks = await Book.find({ addedBy: userId })
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();

    // Books completed per month (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
    sixMonthsAgo.setDate(1);

    const monthlyData = await Book.aggregate([
      {
        $match: {
          addedBy: require('mongoose').Types.ObjectId.createFromHexString(userId),
          status: 'completed',
          finishDate: { $gte: sixMonthsAgo }
        }
      },
      {
        $group: {
          _id: { year: { $year: '$finishDate' }, month: { $month: '$finishDate' } },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthlyLabels = [];
    const monthlyCounts = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      monthlyLabels.push(monthNames[d.getMonth()]);
      const found = monthlyData.find(m => m._id.year === d.getFullYear() && m._id.month === d.getMonth() + 1);
      monthlyCounts.push(found ? found.count : 0);
    }

    // Genre breakdown
    const genreData = await Book.aggregate([
      { $match: { addedBy: require('mongoose').Types.ObjectId.createFromHexString(userId) } },
      { $group: { _id: '$genre', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    const user = await User.findById(userId).lean();
    const readingProgress = user.readingGoal > 0 ? Math.min(100, Math.round((completedBooks / user.readingGoal) * 100)) : 0;

    res.render('dashboard/index', {
      title: 'Dashboard',
      totalBooks,
      completedBooks,
      currentlyReading,
      wantToRead,
      totalUsers,
      totalClubs,
      recentBooks,
      monthlyLabels: JSON.stringify(monthlyLabels),
      monthlyCounts: JSON.stringify(monthlyCounts),
      genreLabels: JSON.stringify(genreData.map(g => g._id || 'Unknown')),
      genreCounts: JSON.stringify(genreData.map(g => g.count)),
      readingGoal: user.readingGoal,
      readingProgress,
      error: req.flash('error'),
      success: req.flash('success')
    });
  } catch (err) {
    console.error(err);
    req.flash('error', 'Failed to load dashboard.');
    res.redirect('/auth/login');
  }
};
