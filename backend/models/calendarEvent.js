const mongoose = require('mongoose');

const CalendarEventSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  title: {
    type: String,
    required: [true, 'Please add an event title'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  
  description: {
    type: String,
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  
  day: {
    type: Number,
    required: true,
    min: 1,
    max: 31
  },
  
  month: {
    type: Number,
    required: true,
    min: 1,
    max: 12
  },
  
  year: {
    type: Number,
    required: true,
    min: 2000,
    max: 2100
  },
  
  color: {
    type: String,
    default: 'bright-blue'
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
CalendarEventSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('CalendarEvent', CalendarEventSchema);