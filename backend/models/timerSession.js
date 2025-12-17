const mongoose = require('mongoose');

const TimerSessionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  startTime: {
    type: Date,
    required: true
  },
  
  endTime: {
    type: Date
  },
  
  duration: {
    type: Number, // in minutes
    required: true
  },
  
  timerType: {
    type: String,
    enum: ['pomodoro', 'break', 'deep-work', 'custom'],
    default: 'pomodoro'
  },
  
  completed: {
    type: Boolean,
    default: true
  },
  
  notes: {
    type: String,
    maxlength: [500, 'Notes cannot exceed 500 characters']
  }
});

module.exports = mongoose.model('TimerSession', TimerSessionSchema);