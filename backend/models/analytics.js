const mongoose = require('mongoose');

const AnalyticsSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  date: {
    type: Date,
    required: true,
    default: Date.now
  },
  
  productivityScore: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  
  tasksCompleted: {
    type: Number,
    default: 0
  },
  
  focusTime: {
    type: Number, // in minutes
    default: 0
  },
  
  breaksTaken: {
    type: Number,
    default: 0
  },
  
  moodScore: {
    type: Number,
    min: 1,
    max: 5
  },
  
  notes: {
    type: String,
    maxlength: [500, 'Notes cannot exceed 500 characters']
  }
});

module.exports = mongoose.model('Analytics', AnalyticsSchema);