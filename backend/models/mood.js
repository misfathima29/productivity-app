const mongoose = require('mongoose');

const MoodSchema = new mongoose.Schema({
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
  
  mood: {
    type: String,
    enum: ['excited', 'happy', 'neutral', 'sad', 'stressed', 'angry'],
    required: true
  },
  
  energyLevel: {
    type: Number,
    min: 1,
    max: 5,
    default: 3
  },
  
  notes: {
    type: String,
    maxlength: [500, 'Notes cannot exceed 500 characters']
  },
  
  factors: [{
    type: String,
    trim: true
  }]
});

module.exports = mongoose.model('Mood', MoodSchema);