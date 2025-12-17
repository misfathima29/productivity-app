const mongoose = require('mongoose');

const GoalSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  title: {
    type: String,
    required: [true, 'Please add a goal title'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  
  description: {
    type: String,
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  
  progress: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  
  target: {
    type: Number,
    required: true,
    min: 1
  },
  
  deadline: {
    type: String,
    default: 'No deadline'
  },
  
  deadlineType: {
    type: String,
    enum: ['date', 'recurring', 'completed', 'none'],
    default: 'none'
  },
  
  completed: {
    type: Boolean,
    default: false
  },
  
  color: {
    type: String,
    default: 'electric-red'
  },
  
  category: {
    type: String,
    enum: ['learning', 'health', 'work', 'personal', 'financial', 'creative'],
    default: 'personal'
  },
  
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
GoalSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Goal', GoalSchema);