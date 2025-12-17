const mongoose = require('mongoose');

const NoteSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  title: {
    type: String,
    required: [true, 'Please add a note title'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  
  content: {
    type: String,
    required: true,
    maxlength: [5000, 'Content cannot exceed 5000 characters']
  },
  
  tags: [{
    type: String,
    trim: true
  }],
  
  createdAt: {
    type: Date,
    default: Date.now
  },
  
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt field before saving
NoteSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Note', NoteSchema);