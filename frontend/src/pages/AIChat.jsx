import { useState, useRef, useEffect } from 'react';
import { Send, Brain, Sparkles, Bot, User, Copy, ThumbsUp, ThumbsDown, RotateCcw, Zap } from 'lucide-react';

const AIChat = () => {
  const [messages, setMessages] = useState([
    { id: 1, text: "Hello! I'm your AI productivity assistant. How can I help you today?", sender: 'ai', time: '10:00 AM' },
    { id: 2, text: "Can you help me prioritize my tasks for today?", sender: 'user', time: '10:02 AM' },
    { id: 3, text: "Sure! Looking at your tasks, I suggest:\n1. Review project proposal (high priority, due today)\n2. Team meeting at 3 PM\n3. Update documentation\nWant me to create a schedule?", sender: 'ai', time: '10:02 AM' },
  ]);
  
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = () => {
    if (!input.trim()) return;
    
    const newMessage = {
      id: messages.length + 1,
      text: input,
      sender: 'user',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    
    setMessages([...messages, newMessage]);
    setInput('');
    setIsTyping(true);
    
    // Simulate AI response
    setTimeout(() => {
      const aiResponses = [
        "I'll help you with that! Based on your patterns, I recommend focusing on creative work in the morning.",
        "Great question! Let me analyze your productivity data and suggest some optimizations.",
        "I can help break that down into smaller, manageable tasks. Want me to create a step-by-step plan?",
        "Based on your energy levels, now would be a good time for focused work. Want me to start a timer?",
        "I've analyzed your notes and found some patterns. Would you like me to summarize the key insights?"
      ];
      
      const aiMessage = {
        id: messages.length + 2,
        text: aiResponses[Math.floor(Math.random() * aiResponses.length)],
        sender: 'ai',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      
      setMessages(prev => [...prev, aiMessage]);
      setIsTyping(false);
    }, 1500);
  };

  const quickPrompts = [
    "Prioritize my tasks",
    "Analyze my productivity",
    "Suggest focus techniques",
    "Summarize my notes",
    "Create a schedule",
    "Brainstorm ideas"
  ];

  const aiCapabilities = [
    { icon: <Zap />, title: "Task Planning", desc: "Break down complex tasks" },
    { icon: <Brain />, title: "Insights", desc: "Analyze productivity patterns" },
    { icon: <Sparkles />, title: "Optimization", desc: "Suggest improvements" },
    { icon: <Bot />, title: "Automation", desc: "Create workflows" }
  ];

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    // You could add a toast notification here
  };

  return (
    <div className="min-h-screen bg-gradient-dark p-4 lg:p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-electric-red to-vibrant-yellow flex items-center justify-center">
                <Brain size={24} className="text-white" />
              </div>
              <div>
                <h1 className="text-2xl lg:text-3xl font-bold text-white">AI Assistant</h1>
                <p className="text-gray-400">Your intelligent productivity partner</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-emerald-green animate-pulse"></div>
              <span className="text-emerald-green text-sm">AI Online</span>
            </div>
          </div>

          {/* AI Capabilities */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {aiCapabilities.map((cap, idx) => (
              <div key={idx} className="glass-card rounded-xl p-4 text-center">
                <div className="inline-flex p-3 rounded-lg bg-bright-blue/20 text-bright-blue mb-3">
                  {cap.icon}
                </div>
                <h3 className="text-white font-medium mb-1">{cap.title}</h3>
                <p className="text-gray-400 text-sm">{cap.desc}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Chat Container - 2/3 width */}
          <div className="lg:col-span-2">
            <div className="glass-card rounded-2xl p-6 h-[calc(100vh-200px)] flex flex-col">
              {/* Messages Container */}
              <div className="flex-1 overflow-y-auto mb-6 space-y-6 pr-2">
                {messages.map((msg) => (
                  <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[80%] ${msg.sender === 'user' ? 'order-2' : 'order-1'}`}>
                      <div className="flex items-center gap-2 mb-1">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          msg.sender === 'user' 
                            ? 'bg-gradient-to-br from-bright-blue to-emerald-green' 
                            : 'bg-gradient-to-br from-electric-red to-vibrant-yellow'
                        }`}>
                          {msg.sender === 'user' ? <User size={16} /> : <Bot size={16} />}
                        </div>
                        <span className="text-gray-400 text-xs">{msg.time}</span>
                      </div>
                      <div
                        className={`rounded-2xl p-4 ${
                          msg.sender === 'user'
                            ? 'bg-gradient-to-r from-bright-blue to-emerald-green text-white'
                            : 'bg-dark-card/70 text-gray-300'
                        }`}
                      >
                        <div className="whitespace-pre-line">{msg.text}</div>
                        {msg.sender === 'ai' && (
                          <div className="flex justify-end gap-2 mt-3">
                            <button 
                              onClick={() => copyToClipboard(msg.text)}
                              className="text-gray-500 hover:text-white p-1"
                              title="Copy"
                            >
                              <Copy size={16} />
                            </button>
                            <button className="text-gray-500 hover:text-emerald-green p-1" title="Helpful">
                              <ThumbsUp size={16} />
                            </button>
                            <button className="text-gray-500 hover:text-electric-red p-1" title="Not helpful">
                              <ThumbsDown size={16} />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                
                {/* Typing Indicator */}
                {isTyping && (
                  <div className="flex justify-start">
                    <div className="max-w-[80%]">
                      <div className="flex items-center gap-2 mb-1">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-electric-red to-vibrant-yellow flex items-center justify-center">
                          <Bot size={16} />
                        </div>
                        <span className="text-gray-400 text-xs">AI is typing...</span>
                      </div>
                      <div className="bg-dark-card/70 rounded-2xl p-4">
                        <div className="flex gap-1">
                          <div className="w-2 h-2 rounded-full bg-gray-500 animate-bounce"></div>
                          <div className="w-2 h-2 rounded-full bg-gray-500 animate-bounce" style={{animationDelay: '0.2s'}}></div>
                          <div className="w-2 h-2 rounded-full bg-gray-500 animate-bounce" style={{animationDelay: '0.4s'}}></div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                <div ref={messagesEndRef} />
              </div>

              {/* Quick Prompts */}
              <div className="mb-6">
                <div className="flex flex-wrap gap-2">
                  {quickPrompts.map((prompt, idx) => (
                    <button
                      key={idx}
                      onClick={() => setInput(prompt)}
                      className="px-4 py-2 rounded-full bg-dark-card text-gray-300 hover:text-white hover:bg-dark-card/80 transition text-sm"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              </div>

              {/* Input Area */}
              <div className="flex gap-3">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                  placeholder="Ask me anything about productivity, tasks, or goals..."
                  className="flex-1 bg-dark-card text-white px-6 py-4 rounded-xl border border-gray-700 focus:outline-none focus:ring-2 focus:ring-bright-blue"
                />
                <button
                  onClick={sendMessage}
                  className="bg-gradient-to-r from-electric-red to-vibrant-yellow text-white px-6 py-4 rounded-xl hover:opacity-90 transition flex items-center gap-2"
                  disabled={isTyping}
                >
                  <Send size={20} />
                  Send
                </button>
              </div>
            </div>
          </div>

          {/* Side Panel - 1/3 width */}
          <div className="lg:col-span-1 space-y-6">
            {/* Conversation History */}
            <div className="glass-card rounded-2xl p-6">
              <h3 className="text-white font-bold mb-4 flex items-center gap-2">
                <RotateCcw size={20} />
                Recent Chats
              </h3>
              <div className="space-y-3">
                {[
                  { title: "Task Prioritization", time: "Today, 10:02 AM", count: 3 },
                  { title: "Productivity Analysis", time: "Yesterday", count: 5 },
                  { title: "Goal Setting", time: "Nov 20", count: 8 },
                  { title: "Time Management", time: "Nov 18", count: 4 },
                ].map((chat, idx) => (
                  <button
                    key={idx}
                    className="w-full text-left p-3 rounded-lg hover:bg-dark-card transition"
                  >
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-white font-medium">{chat.title}</span>
                      <span className="text-gray-400 text-xs">{chat.time}</span>
                    </div>
                    <div className="text-gray-400 text-sm">{chat.count} messages</div>
                  </button>
                ))}
              </div>
            </div>

            {/* AI Suggestions */}
            <div className="glass-card rounded-2xl p-6">
              <h3 className="text-white font-bold mb-4 flex items-center gap-2">
                <Sparkles size={20} />
                AI Suggestions
              </h3>
              <div className="space-y-4">
                <div className="p-3 rounded-lg bg-emerald-green/10 border border-emerald-green/30">
                  <h4 className="text-white font-medium mb-1">📊 Weekly Review</h4>
                  <p className="text-gray-300 text-sm">Your productivity increased by 15% this week!</p>
                </div>
                <div className="p-3 rounded-lg bg-bright-blue/10 border border-bright-blue/30">
                  <h4 className="text-white font-medium mb-1">⏱️ Focus Session</h4>
                  <p className="text-gray-300 text-sm">Try 50-minute focus blocks with 10-minute breaks</p>
                </div>
                <div className="p-3 rounded-lg bg-vibrant-yellow/10 border border-vibrant-yellow/30">
                  <h4 className="text-white font-medium mb-1">🎯 Goal Update</h4>
                  <p className="text-gray-300 text-sm">You're 80% complete on your monthly goals</p>
                </div>
              </div>
            </div>

            {/* Conversation Stats */}
            <div className="glass-card rounded-2xl p-6">
              <h3 className="text-white font-bold mb-4">Conversation Stats</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-400">Total Messages</span>
                    <span className="text-white font-medium">127</span>
                  </div>
                  <div className="w-full bg-gray-800 rounded-full h-2">
                    <div className="bg-emerald-green h-2 rounded-full" style={{ width: '85%' }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-400">AI Accuracy</span>
                    <span className="text-white font-medium">92%</span>
                  </div>
                  <div className="w-full bg-gray-800 rounded-full h-2">
                    <div className="bg-bright-blue h-2 rounded-full" style={{ width: '92%' }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-400">Response Time</span>
                    <span className="text-white font-medium">1.2s avg</span>
                  </div>
                  <div className="w-full bg-gray-800 rounded-full h-2">
                    <div className="bg-vibrant-yellow h-2 rounded-full" style={{ width: '78%' }}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIChat;