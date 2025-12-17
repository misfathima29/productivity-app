import { useState } from 'react';
import Sidebar from "../components/Sidebar";
import TaskManager from "../components/TaskManager";
import NotesGrid from "../components/NotesGrid";
import Calendar from "../components/Calendar";
import Analytics from "../components/Analytics";
import AIAssistant from "../components/AIAssistant";
import StatsBar from '../components/StatsBar';
import ProductivityTimer from '../components/ProductivityTimer';
import GoalTracker from '../components/GoalTracker';
import DailySummary from "../components/DailySummary";

const Layout = () => {
  const [activeView, setActiveView] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  return (
    <div className="min-h-screen flex bg-gradient-dark">
      {/* Sidebar */}
      <div className={`
        ${isSidebarOpen ? 'w-64' : 'w-0'} 
        fixed lg:relative z-40 h-screen
        transition-all duration-300 ease-in-out
        overflow-hidden
      `}>
        <div className={`${isSidebarOpen ? 'block' : 'hidden'} w-64 h-full`}>
          <Sidebar 
            activeView={activeView} 
            setActiveView={setActiveView}
            onNavigate={() => setIsSidebarOpen(false)}
          />
        </div>
      </div>

      {/* Mobile Sidebar Toggle */}
      <button
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-3 rounded-lg bg-dark-card/90 backdrop-blur-sm border border-gray-700 shadow-lg"
      >
        <div className="w-6 h-6 flex flex-col justify-center items-center space-y-1.5">
          <div className={`w-5 h-0.5 bg-white transition-all duration-300 ${isSidebarOpen ? 'rotate-45 translate-y-1.5' : ''}`}></div>
          <div className={`w-5 h-0.5 bg-white transition-all duration-300 ${isSidebarOpen ? 'opacity-0' : ''}`}></div>
          <div className={`w-5 h-0.5 bg-white transition-all duration-300 ${isSidebarOpen ? '-rotate-45 -translate-y-1.5' : ''}`}></div>
        </div>
      </button>

      {/* Overlay for mobile sidebar */}
      {isSidebarOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-30"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Main Content - Will expand when sidebar is closed */}
      <div className={`
        flex-1 flex flex-col min-h-screen
        transition-all duration-300 ease-in-out
        ${isSidebarOpen ? 'lg:ml-0' : 'ml-0'}
        w-full
      `}>
        <main className="flex-1 p-0">
          {/* Header - Centered and responsive to sidebar */}
          <div className="px-6 py-8 border-b border-gray-800/20 bg-dark-card/5">
            <div className="text-center max-w-4xl mx-auto">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-3">
                🚀 AI Productivity Dashboard
              </h1>
              <p className="text-gray-400 text-lg">Welcome back, Alex! Here's your productivity overview.</p>
            </div>
          </div>
          
          {/* StatsBar - Takes full width */}
          <div className="px-6 py-6">
            <StatsBar />
          </div>
          
          {/* Main Dashboard Grid - Clean 2-column layout */}
          <div className="px-6 pb-6 space-y-6">
            {/* Row 1: Task Manager & Daily AI Summary */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Task Manager - Left */}
              <div className="glass-card rounded-2xl p-6 h-full">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-white">📋 Task Manager</h2>
                  <span className="text-xs px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full">Live</span>
                </div>
                <TaskManager />
              </div>
              
              {/* Daily AI Summary - Right */}
              <div className="glass-card rounded-2xl p-6 h-full">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-white">🤖 Daily AI Summary</h2>
                  <span className="text-xs px-3 py-1 bg-purple-500/20 text-purple-400 rounded-full">AI</span>
                </div>
                <DailySummary />
              </div>
            </div>
            
            {/* Row 2: Goal Tracker & Performance Analyst */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Goal Tracker - Left */}
              <div className="glass-card rounded-2xl p-6 h-full">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-white">🎯 Goal Tracker</h2>
                  <span className="text-xs px-3 py-1 bg-emerald-500/20 text-emerald-400 rounded-full">Weekly</span>
                </div>
                <GoalTracker />
              </div>
              
              {/* Performance Analyst - Right */}
              <div className="glass-card rounded-2xl p-6 h-full">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-white">📊 Performance Analyst</h2>
                  <span className="text-xs px-3 py-1 bg-green-500/20 text-green-400 rounded-full">+12%</span>
                </div>
                <Analytics />
              </div>
            </div>
            
            {/* Row 3: Productivity Timer & AI Assistant */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Productivity Timer - Left */}
              <div className="glass-card rounded-2xl p-6 h-full">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-white">⏱️ Productivity Timer</h2>
                  <span className="text-xs px-3 py-1 bg-amber-500/20 text-amber-400 rounded-full">Active</span>
                </div>
                <ProductivityTimer />
              </div>
              
              {/* AI Assistant - Right */}
              <div className="glass-card rounded-2xl p-6 h-full">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-white">💬 AI Assistant</h2>
                  <span className="text-xs px-3 py-1 bg-cyan-500/20 text-cyan-400 rounded-full">Online</span>
                </div>
                <AIAssistant />
              </div>
            </div>
            
            {/* Row 4: Calendar & Smart Notes */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Calendar - Left */}
              <div className="glass-card rounded-2xl p-6 h-full">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-white">📅 Calendar</h2>
                  <span className="text-xs px-3 py-1 bg-rose-500/20 text-rose-400 rounded-full">Today</span>
                </div>
                <Calendar />
              </div>
              
              {/* Smart Notes - Right */}
              <div className="glass-card rounded-2xl p-6 h-full">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-white">📝 Smart Notes</h2>
                  <span className="text-xs px-3 py-1 bg-violet-500/20 text-violet-400 rounded-full">4 Notes</span>
                </div>
                <NotesGrid />
              </div>
            </div>
          </div>
        </main>

        {/* Footer - Full width */}
        <footer className="border-t border-gray-800/20 py-6 px-6 bg-dark-card/5 mt-auto">
          <div className="flex flex-col lg:flex-row justify-between items-center gap-4">
            <div className="text-gray-500 text-sm">
              © {new Date().getFullYear()} AI Productivity Hub. All rights reserved.
            </div>
            <div className="hidden lg:block text-gray-700">•</div>
            <div className="flex items-center gap-6">
              <a 
                href="https://www.linkedin.com/in/misbah-fathima-80474029b/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-blue-400 transition flex items-center gap-2 text-sm"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
                <span>Misbah Fathima</span>
              </a>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default Layout;