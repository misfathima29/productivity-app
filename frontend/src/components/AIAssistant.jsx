import { useState, useEffect, useRef } from 'react';
import { Send, Brain, Sparkles, X, Trash2, Download, Zap, Loader2 } from 'lucide-react';
import { aiAssistantAPI } from '../utils/api';
import { useToast } from '../context/ToastContext';

const AIAssistant = () => {
  // State
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [showCapabilities, setShowCapabilities] = useState(false);
  const [capabilities, setCapabilities] = useState([]);
  const [initialLoadComplete, setInitialLoadComplete] = useState(false); // ADD THIS
  
  const toast = useToast();
  const messagesEndRef = useRef(null);

  // Scroll to bottom when messages change - BUT ONLY AFTER INITIAL LOAD
  useEffect(() => {
    if (initialLoadComplete && messages.length > 0) {
      scrollToBottom();
    }
  }, [messages, initialLoadComplete]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Load chat history and suggestions on mount
  useEffect(() => {
    fetchChatHistory();
    fetchSuggestions();
    fetchCapabilities();
  }, []);

  // Update fetchChatHistory function - ADD setInitialLoadComplete
  const fetchChatHistory = async () => {
    try {
      setLoading(true);
      const response = await aiAssistantAPI.getChatHistory();
      if (response.success) {
        setMessages(response.data || []);
      } else {
        throw new Error(response.error || 'Failed to load chat history');
      }
    } catch (err) {
      console.error('Error fetching chat history:', err);
      toast.showToast('Failed to load chat history', 'error');
      setMessages(getSampleMessages());
    } finally {
      setLoading(false);
      setInitialLoadComplete(true); // ADD THIS LINE
    }
  };

  const fetchSuggestions = async () => {
    try {
      const response = await aiAssistantAPI.getSuggestions();
      if (response.success) {
        setSuggestions(response.data || []);
      }
    } catch (err) {
      console.error('Error fetching suggestions:', err);
      // Fallback to sample suggestions
      setSuggestions(getSampleSuggestions());
    }
  };

  const fetchCapabilities = async () => {
    try {
      const response = await aiAssistantAPI.getCapabilities?.();
      if (response?.success) {
        setCapabilities(response.data || []);
      }
    } catch (err) {
      console.error('Error fetching capabilities:', err);
      // Capabilities endpoint might not exist yet
    }
  };

  // Sample data for fallback
  const getSampleMessages = () => [
    { id: '1', message: 'Hello! How can I help you today?', sender: 'ai', timestamp: new Date().toISOString() },
    { id: '2', message: 'What should I prioritize today?', sender: 'user', timestamp: new Date().toISOString() },
    { id: '3', message: 'Based on your tasks, focus on the project proposal first. It has the closest deadline!', sender: 'ai', timestamp: new Date().toISOString() },
  ];

  const getSampleSuggestions = () => [
    { id: '1', text: 'Prioritize my tasks' },
    { id: '2', text: 'Summarize my notes' },
    { id: '3', text: 'Schedule my meetings' },
    { id: '4', text: 'Analyze my productivity' },
  ];

  // Send message to AI
  const sendMessage = async () => {
    if (!input.trim() || sending) return;

    const userMessage = input.trim();
    setInput('');
    setSending(true);

    try {
      // Add user message immediately
      const tempUserMessage = {
        id: Date.now().toString(),
        message: userMessage,
        sender: 'user',
        timestamp: new Date().toISOString(),
        isTemp: true
      };
      setMessages(prev => [...prev, tempUserMessage]);

      // Send to backend
      const response = await aiAssistantAPI.sendMessage(userMessage);
      
      if (response.success) {
        // Replace temp message with real one and add AI response
        const newMessages = messages.filter(m => !m.isTemp);
        setMessages([
          ...newMessages,
          response.data.userMessage,
          response.data.aiResponse
        ]);
        
        toast.showToast('AI response received!', 'success');
      } else {
        throw new Error(response.error || 'Failed to get AI response');
      }
    } catch (err) {
      console.error('Error sending message:', err);
      toast.showToast('Failed to get AI response', 'error');
      
      // Remove temp message and add error state
      const newMessages = messages.filter(m => !m.isTemp);
      setMessages([
        ...newMessages,
        {
          id: Date.now().toString(),
          message: userMessage,
          sender: 'user',
          timestamp: new Date().toISOString()
        },
        {
          id: (Date.now() + 1).toString(),
          message: "I'm having trouble connecting right now. Please try again in a moment.",
          sender: 'ai',
          timestamp: new Date().toISOString(),
          isError: true
        }
      ]);
    } finally {
      setSending(false);
    }
  };

  // Clear chat history
  const clearChat = async () => {
    if (!window.confirm('Are you sure you want to clear the chat history?')) return;

    try {
      const response = await aiAssistantAPI.clearChatHistory();
      if (response.success) {
        setMessages([]);
        toast.showToast('Chat history cleared', 'success');
      }
    } catch (err) {
      console.error('Error clearing chat:', err);
      toast.showToast('Failed to clear chat history', 'error');
    }
  };

  // Use suggestion
  const useSuggestion = (text) => {
    setInput(text);
  };

  // Get AI analysis
  const getAnalysis = async (type) => {
    try {
      setSending(true);
      const response = await aiAssistantAPI.getAnalysis(type);
      if (response.success) {
        // Add analysis as AI message
        const analysisMessage = {
          id: Date.now().toString(),
          message: `${response.data.summary}\n\nInsights:\n${response.data.insights.map(i => `• ${i}`).join('\n')}\n\nRecommendations:\n${response.data.recommendations.map(r => `• ${r}`).join('\n')}`,
          sender: 'ai',
          timestamp: new Date().toISOString(),
          type: 'analysis'
        };
        setMessages(prev => [...prev, analysisMessage]);
        toast.showToast(`${type} analysis completed`, 'success');
      }
    } catch (err) {
      console.error('Error getting analysis:', err);
      toast.showToast('Failed to get analysis', 'error');
    } finally {
      setSending(false);
    }
  };

  // Handle key press
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Format timestamp
  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (loading) {
    return (
      <div className="glass-card rounded-2xl p-6 mt-6">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 text-bright-blue animate-spin" />
          <span className="ml-3 text-gray-400">Loading AI Assistant...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="glass-card rounded-2xl p-6 mt-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-electric-red to-vibrant-yellow flex items-center justify-center">
            <Brain size={22} className="text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">🤖 AI Assistant</h2>
            <p className="text-gray-400 text-sm">Your intelligent productivity partner</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Sparkles className="text-vibrant-yellow" size={20} />
            <span className="text-vibrant-yellow text-sm font-medium">Active</span>
          </div>
          <button
            onClick={clearChat}
            className="p-2 hover:bg-dark-card rounded-lg text-gray-400 hover:text-electric-red"
            title="Clear chat history"
          >
            <Trash2 size={18} />
          </button>
          <button
            onClick={() => setShowCapabilities(!showCapabilities)}
            className="p-2 hover:bg-dark-card rounded-lg text-gray-400 hover:text-white"
            title="Show capabilities"
          >
            <Zap size={18} />
          </button>
        </div>
      </div>

      {/* Capabilities Panel */}
      {showCapabilities && (
        <div className="mb-6 p-4 rounded-xl bg-dark-card/50 border border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-white font-medium">What I Can Help With</h4>
            <button
              onClick={() => setShowCapabilities(false)}
              className="p-1 hover:bg-gray-700 rounded"
            >
              <X size={16} className="text-gray-400" />
            </button>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            {capabilities.length > 0 ? (
              capabilities.map((capability) => (
                <div
                  key={capability.id}
                  className="p-3 rounded-lg bg-dark-card/30 hover:bg-dark-card/50 cursor-pointer"
                  onClick={() => useSuggestion(`Help me with ${capability.name.toLowerCase()}`)}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-lg">{capability.icon}</span>
                    <div className="text-white font-medium text-sm">{capability.name}</div>
                  </div>
                  <div className="text-gray-400 text-xs">{capability.description}</div>
                </div>
              ))
            ) : (
              <div className="col-span-2 space-y-2">
                <div className="p-3 rounded-lg bg-dark-card/30">
                  <div className="text-white font-medium text-sm">Task Management</div>
                  <div className="text-gray-400 text-xs">Help prioritize and organize tasks</div>
                </div>
                <div className="p-3 rounded-lg bg-dark-card/30">
                  <div className="text-white font-medium text-sm">Productivity Analysis</div>
                  <div className="text-gray-400 text-xs">Analyze your work patterns and suggest improvements</div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Quick Suggestions & Analysis */}
      <div className="mb-6">
        <div className="flex flex-wrap gap-2 mb-3">
          {suggestions.map((suggestion) => (
            <button
              key={suggestion.id}
              onClick={() => useSuggestion(suggestion.text)}
              className="px-3 py-2 rounded-lg bg-dark-card text-sm text-gray-300 hover:text-white hover:bg-dark-card/80 transition-colors"
            >
              {suggestion.text}
            </button>
          ))}
        </div>
        
        {/* Quick Analysis Buttons */}
        <div className="flex gap-2">
          <button
            onClick={() => getAnalysis('productivity')}
            disabled={sending}
            className="px-3 py-2 rounded-lg bg-gradient-to-r from-electric-red/20 to-vibrant-yellow/20 text-sm text-white hover:opacity-90 disabled:opacity-50"
          >
            📊 Productivity
          </button>
          <button
            onClick={() => getAnalysis('tasks')}
            disabled={sending}
            className="px-3 py-2 rounded-lg bg-gradient-to-r from-bright-blue/20 to-emerald-green/20 text-sm text-white hover:opacity-90 disabled:opacity-50"
          >
            📋 Task Analysis
          </button>
          <button
            onClick={() => getAnalysis('goals')}
            disabled={sending}
            className="px-3 py-2 rounded-lg bg-gradient-to-r from-emerald-green/20 to-bright-blue/20 text-sm text-white hover:opacity-90 disabled:opacity-50"
          >
            🎯 Goals Review
          </button>
        </div>
      </div>

      {/* Chat Messages */}
      <div className="h-64 overflow-y-auto mb-6 space-y-4 pr-2">
        {messages.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <Brain size={48} className="mx-auto mb-4 text-gray-600" />
            <div className="text-lg font-medium text-gray-400">Start a conversation</div>
            <div className="text-sm text-gray-500 mt-1">Ask me anything about your productivity!</div>
          </div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-2xl p-4 ${
                  msg.sender === 'user'
                    ? 'bg-gradient-to-r from-bright-blue to-emerald-green text-white'
                    : msg.isError
                    ? 'bg-gradient-to-r from-electric-red/20 to-vibrant-yellow/20 text-gray-300 border border-electric-red/30'
                    : 'bg-dark-card/50 text-gray-300'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="text-xs opacity-70">
                    {msg.sender === 'user' ? 'You' : 'AI Assistant'}
                  </div>
                  <div className="text-xs opacity-50">
                    {formatTime(msg.timestamp)}
                  </div>
                </div>
                <div className="whitespace-pre-wrap">{msg.message}</div>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
        {sending && (
          <div className="flex justify-start">
            <div className="bg-dark-card/50 text-gray-300 rounded-2xl p-4">
              <div className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Thinking...</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Type your question or request..."
          className="flex-1 bg-dark-card text-white px-4 py-3 rounded-lg border border-gray-700 focus:outline-none focus:border-bright-blue"
          disabled={sending}
        />
        <button
          onClick={sendMessage}
          disabled={!input.trim() || sending}
          className={`bg-gradient-to-r from-electric-red to-vibrant-yellow text-white px-6 py-3 rounded-lg flex items-center justify-center ${
            (!input.trim() || sending) ? 'opacity-50 cursor-not-allowed' : 'hover:opacity-90'
          }`}
        >
          {sending ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Send size={20} />
          )}
        </button>
      </div>

      {/* Status */}
      <div className="mt-4 pt-4 border-t border-gray-800 flex justify-between items-center">
        <div className="text-xs text-gray-500">
          {messages.length} messages • AI Assistant v1.0
        </div>
        <button
          onClick={fetchChatHistory}
          className="text-xs text-bright-blue hover:text-white hover:underline flex items-center gap-1"
        >
          ↻ Refresh Chat
        </button>
      </div>
    </div>
  );
};

export default AIAssistant;