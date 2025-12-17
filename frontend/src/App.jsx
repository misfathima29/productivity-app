import './index.css';
import Sidebar from './components/Sidebar';
import TaskManager from './components/TaskManager';
import NotesGrid from './components/NotesGrid';
import Calendar from './components/Calendar';
import Analytics from './components/Analytics';
import AIAssistant from './components/AIAssistant';
import GoalTracker from './components/GoalTracker';
import ProductivityTimer from './components/ProductivityTimer';
import MoodTracker from './components/MoodTracker';
import { isAuthenticated } from './utils/auth';
import { Navigate } from 'react-router-dom';

function App() {
  // Check if user is authenticated
  if (!isAuthenticated()) {
    console.log('🔐 User not authenticated, redirecting to login');
    return <Navigate to="/login" replace />;
  }

  console.log('✅ User authenticated, showing dashboard');

  // Function to scroll to a section
  const scrollToSection = (sectionId) => {
    console.log('🎯 scrollToSection called with:', sectionId);
    const element = document.getElementById(sectionId);
    
    if (element) {
      console.log('🔍 Element found, scrolling...');
      
      // More aggressive scroll with offset
      const yOffset = -80; // Adjust for any fixed headers
      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
      
      window.scrollTo({
        top: y,
        behavior: 'smooth'
      });
      
      // Add highlight effect for visual feedback
      const originalBoxShadow = element.style.boxShadow;
      const originalTransition = element.style.transition;
      
      element.style.transition = 'box-shadow 0.3s ease';
      element.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.5)';
      
      setTimeout(() => {
        element.style.boxShadow = originalBoxShadow;
        element.style.transition = originalTransition;
      }, 1000);
    } else {
      console.log('❌ Element NOT found with id:', sectionId);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-dark">
      <div className="flex">
        <Sidebar onNavigate={(section) => section && scrollToSection(section)} />
        
        <main className="flex-1 p-6 lg:p-8 overflow-auto">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-3xl lg:text-4xl font-bold text-white mb-2">
              🚀 AI Productivity Hub
            </h1>
            <p className="text-gray-400 mb-8">Your intelligent workspace</p>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              {/* Task Manager */}
              <div id="tasks-section">
                <TaskManager />
              </div>
              
              {/* Notes Grid */}
              <div id="notes-section">
                <NotesGrid />
              </div>
              
              {/* Calendar */}
              <div id="calendar-section">
                <Calendar />
              </div>
              
              {/* Analytics */}
              <div id="analytics-section">
                <Analytics />
              </div>
            </div>
            
            {/* Second Row: Goals, Timer, Mood */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
              {/* Goal Tracker */}
              <div id="goals-section">
                <GoalTracker />
              </div>
              
              {/* Productivity Timer */}
              <div id="timer-section">
                <ProductivityTimer />
              </div>
              
              {/* Mood Tracker */}
              <div id="mood-section">
                <MoodTracker />
              </div>
            </div>
            
            {/* AI Assistant (full width at bottom) */}
            <AIAssistant />
          </div>
        </main>
      </div>
    </div>
  );
}

export default App;