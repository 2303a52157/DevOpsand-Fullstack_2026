const mongoose = require('mongoose');

const ClubSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Club name is required'],
    trim: true,
    maxlength: [100, 'Club name cannot exceed 100 characters']
  },
  description: {
    type: String,
    maxlength: [500, 'Description cannot exceed 500 characters'],
    default: ''
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  members: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  currentBook: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Book',
    default: null
  },
  isPrivate: {
    type: Boolean,
    default: false
  },
  genre: {
    type: String,
    default: 'Mixed'
  }
}, { timestamps: true });

module.exports = mongoose.model('Club', ClubSchema);
