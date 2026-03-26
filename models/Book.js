const mongoose = require('mongoose');

const ReviewSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  rating: {
    type: Number,
    min: 1,
    max: 5,
    required: true
  },
  comment: {
    type: String,
    maxlength: [1000, 'Review cannot exceed 1000 characters']
  }
}, { timestamps: true });

const BookSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  author: {
    type: String,
    required: [true, 'Author is required'],
    trim: true
  },
  isbn: {
    type: String,
    trim: true,
    default: ''
  },
  genre: {
    type: String,
    required: [true, 'Genre is required'],
    enum: ['Fiction', 'Non-Fiction', 'Mystery', 'Science Fiction', 'Fantasy', 'Romance', 'Thriller', 'Biography', 'History', 'Self-Help', 'Science', 'Poetry', 'Other']
  },
  description: {
    type: String,
    maxlength: [2000, 'Description cannot exceed 2000 characters'],
    default: ''
  },
  publishedYear: {
    type: Number,
    min: [1000, 'Invalid year'],
    max: [new Date().getFullYear() + 1, 'Year cannot be in the future']
  },
  pages: {
    type: Number,
    min: [1, 'Pages must be at least 1'],
    default: 0
  },
  coverImage: {
    type: String,
    default: null
  },
  addedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['want-to-read', 'currently-reading', 'completed', 'dropped'],
    default: 'want-to-read'
  },
  startDate: {
    type: Date,
    default: null
  },
  finishDate: {
    type: Date,
    default: null
  },
  reviews: [ReviewSchema],
  tags: [{
    type: String,
    trim: true
  }],
  club: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Club',
    default: null
  }
}, { timestamps: true });

BookSchema.virtual('averageRating').get(function () {
  if (this.reviews.length === 0) return 0;
  const sum = this.reviews.reduce((acc, r) => acc + r.rating, 0);
  return (sum / this.reviews.length).toFixed(1);
});

BookSchema.set('toJSON', { virtuals: true });
BookSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Book', BookSchema);
