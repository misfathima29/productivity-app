const mongoose = require('mongoose');

const AIAssistantSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  timestamp: {
    type: Date,
    required: true,
    default: Date.now
  },
  
  userMessage: {
    type: String,
    required: true
  },
  
  aiResponse: {
    type: String,
    required: true
  },
  
  context: {
    type: String,
    enum: ['productivity', 'task', 'goal', 'general', 'motivation'],
    default: 'general'
  },
  
  helpful: {
    type: Boolean
  }
});

module.exports = mongoose.model('AIAssistant', AIAssistantSchema);