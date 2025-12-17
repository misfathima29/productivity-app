import { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, Target, Clock, Save } from 'lucide-react';
import { timerAPI } from '../utils/api';
import { useToast } from '../context/ToastContext';

const ProductivityTimer = () => {
  // Simple timer state
  const [time, setTime] = useState(25 * 60); // 25 minutes in seconds
  const [isActive, setIsActive] = useState(false);
  const [mode, setMode] = useState('focus'); // 'focus' or 'break'
  
  // Simple UI state
  const [customMinutes, setCustomMinutes] = useState(25);
  const [showCustomTime, setShowCustomTime] = useState(false);
  const [note, setNote] = useState('');
  
  const toast = useToast();

  // Timer logic
  useEffect(() => {
    let interval = null;
    
    if (isActive && time > 0) {
      interval = setInterval(() => {
        setTime(time => time - 1);
      }, 1000);
    } else if (time === 0 && isActive) {
      // Timer finished
      handleTimerComplete();
    }
    
    return () => clearInterval(interval);
  }, [isActive, time]);

  const handleTimerComplete = async () => {
    setIsActive(false);
    await saveSession();
    
    // Switch mode
    if (mode === 'focus') {
      setMode('break');
      setTime(5 * 60); // 5 minute break
    } else {
      setMode('focus');
      setTime(25 * 60); // Back to focus
    }
  };

  const saveSession = async () => {
    try {
      const sessionData = {
        type: mode,
        duration: mode === 'focus' ? 25 * 60 : 5 * 60,
        note: note.trim(),
        completedAt: new Date().toISOString()
      };

      const response = await timerAPI.saveTimerSession(sessionData);
      if (response.success) {
        toast.showToast(`${mode === 'focus' ? 'Focus' : 'Break'} session saved!`, 'success');
        setNote(''); // Clear note after saving
      }
    } catch (err) {
      console.error('Error saving session:', err);
      toast.showToast('Failed to save session', 'error');
    }
  };

  const toggleTimer = () => {
    setIsActive(!isActive);
  };

  const resetTimer = () => {
    setIsActive(false);
    setTime(mode === 'focus' ? 25 * 60 : 5 * 60);
  };

  const stopAndSave = () => {
    setIsActive(false);
    saveSession();
    resetTimer();
  };

  const setCustomTimer = () => {
    const totalSeconds = customMinutes * 60;
    if (totalSeconds > 0) {
      setTime(totalSeconds);
      setShowCustomTime(false);
      toast.showToast(`Timer set to ${customMinutes} minutes`, 'success');
    }
  };

  const switchMode = () => {
    const newMode = mode === 'focus' ? 'break' : 'focus';
    setMode(newMode);
    setTime(newMode === 'focus' ? 25 * 60 : 5 * 60);
    setIsActive(false);
    toast.showToast(`Switched to ${newMode} mode`, 'info');
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="glass-card rounded-2xl p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <Target size={22} className="text-electric-red" />
            Productivity Timer
          </h3>
          <p className="text-gray-400 text-sm">
            {mode === 'focus' ? 'Focus Time' : 'Break Time'}
          </p>
        </div>
        
        <button
          onClick={switchMode}
          className={`px-4 py-2 rounded-lg font-medium ${
            mode === 'focus' 
              ? 'bg-emerald-green text-white hover:bg-emerald-green/90' 
              : 'bg-bright-blue text-white hover:bg-bright-blue/90'
          }`}
        >
          {mode === 'focus' ? 'Switch to Break' : 'Switch to Focus'}
        </button>
      </div>

      {/* Timer Display */}
      <div className="text-center mb-8">
        <div className="text-6xl font-bold text-white mb-2">
          {formatTime(time)}
        </div>
        <div className={`text-sm font-medium ${
          mode === 'focus' ? 'text-vibrant-yellow' : 'text-emerald-green'
        }`}>
          {mode === 'focus' ? 'Stay Focused!' : 'Take a Break!'}
        </div>
      </div>

      {/* Custom Time Setter */}
      {showCustomTime ? (
        <div className="mb-6 p-4 rounded-xl bg-dark-card/50">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-white font-medium">Set Custom Time</h4>
            <button
              onClick={() => setShowCustomTime(false)}
              className="text-gray-400 hover:text-white"
            >
              ×
            </button>
          </div>
          <div className="flex items-center gap-3">
            <input
              type="number"
              value={customMinutes}
              onChange={(e) => setCustomMinutes(parseInt(e.target.value) || 1)}
              className="flex-1 bg-dark-card text-white px-4 py-3 rounded-lg border border-gray-700"
              min="1"
              max="120"
              placeholder="Minutes"
            />
            <button
              onClick={setCustomTimer}
              className="bg-bright-blue text-white px-6 py-3 rounded-lg hover:bg-bright-blue/90"
            >
              Set
            </button>
          </div>
          <div className="flex gap-2 mt-3">
            <button
              onClick={() => setCustomMinutes(25)}
              className="flex-1 py-2 rounded bg-gray-800 text-gray-300 hover:text-white"
            >
              25 min
            </button>
            <button
              onClick={() => setCustomMinutes(50)}
              className="flex-1 py-2 rounded bg-gray-800 text-gray-300 hover:text-white"
            >
              50 min
            </button>
            <button
              onClick={() => setCustomMinutes(15)}
              className="flex-1 py-2 rounded bg-gray-800 text-gray-300 hover:text-white"
            >
              15 min
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setShowCustomTime(true)}
          className="w-full mb-6 p-3 rounded-xl bg-dark-card/50 border border-gray-700 hover:bg-dark-card/80 text-white flex items-center justify-center gap-2"
        >
          <Clock size={18} />
          Set Custom Time
        </button>
      )}

      {/* Note Input */}
      <div className="mb-6">
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="What are you working on? (optional)"
          rows="2"
          className="w-full bg-dark-card/50 text-white px-4 py-3 rounded-lg border border-gray-700 focus:outline-none focus:border-bright-blue"
        />
      </div>

      {/* Controls */}
      <div className="flex flex-wrap gap-3 mb-6">
        <button
          onClick={toggleTimer}
          className={`flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl ${
            isActive 
              ? 'bg-electric-red text-white hover:bg-red-600' 
              : 'bg-emerald-green text-white hover:bg-green-600'
          } transition-all`}
        >
          {isActive ? (
            <>
              <Pause size={18} />
              Pause
            </>
          ) : (
            <>
              <Play size={18} />
              Start
            </>
          )}
        </button>
        
        <button
          onClick={stopAndSave}
          className="flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-bright-blue text-white hover:bg-blue-600"
        >
          <Save size={18} />
          Save & Reset
        </button>
        
        <button
          onClick={resetTimer}
          className="flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-dark-card text-gray-300 hover:text-white hover:bg-dark-card/80"
        >
          <RotateCcw size={18} />
          Reset
        </button>
      </div>

      {/* Quick Tips */}
      <div className="p-4 rounded-xl bg-gradient-to-r from-bright-blue/10 to-emerald-green/10 border border-bright-blue/20">
        <div className="text-sm">
          <div className="text-white font-medium mb-1">Quick Tips:</div>
          <div className="text-gray-300">
            {mode === 'focus' 
              ? 'Focus for 25 minutes, then take a 5-minute break.'
              : 'Relax for 5 minutes, then start another focus session.'
            }
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductivityTimer;