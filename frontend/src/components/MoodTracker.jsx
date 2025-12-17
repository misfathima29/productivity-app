import { useState, useEffect } from 'react';
import { Smile, Meh, Frown, Battery, BatteryCharging, Activity, Zap, Coffee, 
         Trash2, Edit, X, Save, Clock, Calendar, Tag, Loader2, AlertTriangle, Heart } from 'lucide-react';
import { moodAPI } from '../utils/api';
import { useToast } from '../context/ToastContext';

const MoodTracker = () => {
  // State
  const [moodEntries, setMoodEntries] = useState([]);
  const [todayMoods, setTodayMoods] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedMood, setSelectedMood] = useState(null);
  const [energyLevel, setEnergyLevel] = useState(70);
  const [note, setNote] = useState('');
  const [tags, setTags] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [editingEntry, setEditingEntry] = useState(null);
  const [customTag, setCustomTag] = useState('');
  
  const toast = useToast();

  // Mood types
  const moodTypes = [
    { id: 'energetic', label: 'Energetic', icon: <Zap size={24} />, color: 'electric-red', emoji: '⚡' },
    { id: 'productive', label: 'Productive', icon: <BatteryCharging size={24} />, color: 'emerald-green', emoji: '🔋' },
    { id: 'focused', label: 'Focused', icon: <Activity size={24} />, color: 'bright-blue', emoji: '🎯' },
    { id: 'tired', label: 'Tired', icon: <Coffee size={24} />, color: 'vibrant-yellow', emoji: '😴' },
    { id: 'stressed', label: 'Stressed', icon: <AlertTriangle size={24} />, color: 'electric-red', emoji: '😫' },
    { id: 'calm', label: 'Calm', icon: <Heart size={24} />, color: 'bright-blue', emoji: '😌' },
    { id: 'happy', label: 'Happy', icon: <Smile size={24} />, color: 'emerald-green', emoji: '😊' },
    { id: 'sad', label: 'Sad', icon: <Frown size={24} />, color: 'vibrant-yellow', emoji: '😔' }
  ];

  // Available tags
  const availableTags = ['morning', 'work', 'exercise', 'break', 'meeting', 'coding', 'creative', 'social', 'family', 'alone'];

  // Date info
  const today = new Date().toLocaleDateString('en-US', { 
    weekday: 'long', 
    month: 'short', 
    day: 'numeric' 
  });
  const currentTime = new Date().toLocaleTimeString('en-US', { 
    hour: '2-digit', 
    minute: '2-digit',
    hour12: false 
  });

  // Fetch data on component mount
  useEffect(() => {
    fetchMoodData();
  }, []);

  const fetchMoodData = async () => {
    try {
      setLoading(true);
      
      // Fetch today's moods
      const todayResponse = await moodAPI.getTodayMood();
      if (todayResponse.success) {
        setTodayMoods(todayResponse.data || []);
        // Calculate average energy from today's moods
        if (todayResponse.data && todayResponse.data.length > 0) {
          const avgEnergy = todayResponse.averageEnergy || 
            Math.round(todayResponse.data.reduce((sum, entry) => sum + entry.energyLevel, 0) / todayResponse.data.length);
          setEnergyLevel(avgEnergy);
          
          // Set last mood as selected
          const lastMood = todayResponse.data[0];
          setSelectedMood(lastMood.moodType);
        }
      }

      // Fetch mood statistics
      const statsResponse = await moodAPI.getMoodStats('week');
      if (statsResponse.success) {
        setStats(statsResponse.data);
      }

      // Fetch recent mood entries
      const entriesResponse = await moodAPI.getMoods();
      if (entriesResponse.success) {
        setMoodEntries(entriesResponse.data || []);
      }

    } catch (err) {
      console.error('Error fetching mood data:', err);
      toast.showToast('Failed to load mood data', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Handle mood selection
  const handleMoodSelect = (mood) => {
    setSelectedMood(mood.id);
    setEnergyLevel(mood.defaultEnergy || 70);
    setEditingEntry(null);
  };

  // Handle energy level change
  const handleEnergyChange = (e) => {
    setEnergyLevel(parseInt(e.target.value));
  };

  // Handle tag selection
  const handleTagSelect = (tag) => {
    if (tags.includes(tag)) {
      setTags(tags.filter(t => t !== tag));
    } else {
      setTags([...tags, tag]);
    }
  };

  // Add custom tag
  const handleAddCustomTag = () => {
    if (customTag.trim() && !tags.includes(customTag.trim())) {
      setTags([...tags, customTag.trim()]);
      setCustomTag('');
    }
  };

  // Submit mood entry
  const handleSubmitMood = async () => {
    if (!selectedMood) {
      toast.showToast('Please select a mood', 'error');
      return;
    }

    try {
      const moodData = {
        moodType: selectedMood,
        energyLevel: energyLevel,
        note: note.trim(),
        tags: tags
      };

      let response;
      if (editingEntry) {
        response = await moodAPI.updateMood(editingEntry.id, moodData);
      } else {
        response = await moodAPI.addMood(moodData);
      }

      if (response.success) {
        toast.showToast(
          editingEntry ? 'Mood updated successfully!' : 'Mood recorded successfully!', 
          'success'
        );
        
        // Refresh data
        await fetchMoodData();
        
        // Reset form
        setNote('');
        setTags([]);
        setEditingEntry(null);
      } else {
        throw new Error(response.error || 'Failed to save mood');
      }
    } catch (err) {
      console.error('Error saving mood:', err);
      toast.showToast(err.message || 'Failed to save mood', 'error');
    }
  };

  // Edit mood entry
  const handleEditMood = (entry) => {
    setEditingEntry(entry);
    setSelectedMood(entry.moodType);
    setEnergyLevel(entry.energyLevel);
    setNote(entry.note || '');
    setTags(entry.tags || []);
    setShowHistory(false);
  };

  // Delete mood entry
  const handleDeleteMood = async (id) => {
    if (!window.confirm('Are you sure you want to delete this mood entry?')) return;

    try {
      const response = await moodAPI.deleteMood(id);
      if (response.success) {
        toast.showToast('Mood entry deleted', 'success');
        await fetchMoodData();
      } else {
        throw new Error(response.error || 'Failed to delete mood');
      }
    } catch (err) {
      console.error('Error deleting mood:', err);
      toast.showToast(err.message || 'Failed to delete mood', 'error');
    }
  };

  // Cancel edit
  const handleCancelEdit = () => {
    setEditingEntry(null);
    setNote('');
    setTags([]);
    setSelectedMood(null);
  };

  // Get mood color
  const getMoodColor = (moodType) => {
    const mood = moodTypes.find(m => m.id === moodType);
    return mood ? mood.color : 'gray';
  };

  // Get mood icon
  const getMoodIcon = (level) => {
    if (level >= 80) return <Smile size={20} className="text-emerald-green" />;
    if (level >= 60) return <Smile size={20} className="text-bright-blue" />;
    if (level >= 40) return <Meh size={20} className="text-vibrant-yellow" />;
    return <Frown size={20} className="text-electric-red" />;
  };

  // Get energy color
  const getEnergyColor = (level) => {
    if (level >= 80) return 'bg-emerald-green';
    if (level >= 60) return 'bg-bright-blue';
    if (level >= 40) return 'bg-vibrant-yellow';
    return 'bg-electric-red';
  };

  if (loading) {
    return (
      <div className="glass-card rounded-2xl p-6">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 text-bright-blue animate-spin" />
          <span className="ml-3 text-gray-400">Loading mood data...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="glass-card rounded-2xl p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <Activity size={22} className="text-emerald-green" />
            Mood & Energy Tracker
          </h3>
          <p className="text-gray-400 text-sm">{today}</p>
        </div>
        <div className="flex items-center gap-2">
          {getMoodIcon(energyLevel)}
          <span className="text-white font-medium">
            {energyLevel >= 80 ? 'Energetic' : 
             energyLevel >= 60 ? 'Good' : 
             energyLevel >= 40 ? 'Okay' : 'Tired'}
          </span>
        </div>
      </div>

      {/* Mood Selector */}
      <div className="mb-6">
        <h4 className="text-white font-medium mb-4">
          {editingEntry ? 'Edit Mood Entry' : 'How are you feeling?'}
        </h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {moodTypes.map((mood) => (
            <button
              key={mood.id}
              onClick={() => handleMoodSelect(mood)}
              className={`p-4 rounded-xl flex flex-col items-center gap-2 transition-all ${
                selectedMood === mood.id
                  ? `bg-${mood.color}/20 border-2 border-${mood.color}`
                  : 'bg-dark-card/50 border border-gray-700 hover:bg-dark-card'
              }`}
            >
              <div className={`text-${mood.color}`}>
                {mood.icon}
              </div>
              <span className="text-white text-sm">{mood.label}</span>
              <span className="text-xs text-gray-400">{mood.emoji}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Energy Level Slider */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <div className="text-gray-400">Energy Level</div>
          <div className="text-white font-bold">{energyLevel}%</div>
        </div>
        <input
          type="range"
          min="0"
          max="100"
          value={energyLevel}
          onChange={handleEnergyChange}
          className="w-full h-4 bg-gray-800 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-6 [&::-webkit-slider-thumb]:w-6 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white"
          style={{
            background: `linear-gradient(to right, var(--color-electric-red) 0%, var(--color-vibrant-yellow) 40%, var(--color-bright-blue) 60%, var(--color-emerald-green) 100%)`
          }}
        />
        <div className="flex justify-between text-xs text-gray-400 mt-1">
          <span>Exhausted</span>
          <span>Tired</span>
          <span>Okay</span>
          <span>Good</span>
          <span>Energetic</span>
        </div>
      </div>

      {/* Note Input */}
      <div className="mb-6">
        <label className="block text-gray-400 text-sm mb-2">
          <span className="flex items-center gap-1">
            <Edit size={16} />
            Note (optional)
          </span>
        </label>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Add a note about your mood..."
          rows="2"
          className="w-full bg-dark-card/70 text-white px-4 py-3 rounded-lg border border-gray-700 focus:outline-none focus:border-bright-blue"
        />
      </div>

      {/* Tags */}
      <div className="mb-6">
        <label className="block text-gray-400 text-sm mb-2">
          <span className="flex items-center gap-1">
            <Tag size={16} />
            Tags
          </span>
        </label>
        <div className="flex flex-wrap gap-2 mb-3">
          {availableTags.map((tag) => (
            <button
              key={tag}
              onClick={() => handleTagSelect(tag)}
              className={`px-3 py-1 rounded-full text-sm ${
                tags.includes(tag)
                  ? 'bg-bright-blue text-white'
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            value={customTag}
            onChange={(e) => setCustomTag(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleAddCustomTag()}
            placeholder="Add custom tag..."
            className="flex-1 bg-dark-card/70 text-white px-4 py-2 rounded-lg border border-gray-700"
          />
          <button
            onClick={handleAddCustomTag}
            className="px-4 bg-gray-700 text-white rounded-lg hover:bg-gray-600"
          >
            Add
          </button>
        </div>
        {tags.length > 0 && (
          <div className="mt-3">
            <span className="text-gray-400 text-sm">Selected: </span>
            {tags.map(tag => (
              <span key={tag} className="inline-block bg-emerald-green/20 text-emerald-green text-xs px-2 py-1 rounded mx-1">
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 mb-6">
        <button
          onClick={handleSubmitMood}
          disabled={!selectedMood}
          className={`flex-1 py-3 rounded-lg font-medium ${
            selectedMood
              ? 'bg-gradient-to-r from-emerald-green to-bright-blue text-white hover:opacity-90'
              : 'bg-gray-700 text-gray-400 cursor-not-allowed'
          }`}
        >
          {editingEntry ? 'Update Mood' : 'Record Mood'}
        </button>
        
        {editingEntry && (
          <button
            onClick={handleCancelEdit}
            className="px-6 bg-gray-700 text-white rounded-lg hover:bg-gray-600"
          >
            Cancel
          </button>
        )}
        
        <button
          onClick={() => setShowHistory(!showHistory)}
          className="px-6 bg-dark-card text-white rounded-lg hover:bg-dark-card/80 flex items-center gap-2"
        >
          <Clock size={18} />
          {showHistory ? 'Hide' : 'History'}
        </button>
      </div>

      {/* Mood History */}
      {showHistory && (
        <div className="mb-6 p-4 rounded-xl bg-dark-card/50 border border-gray-700">
          <h4 className="text-white font-medium mb-4 flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Calendar size={18} />
              Recent Mood Entries
            </span>
            <span className="text-sm text-gray-400">{moodEntries.length} entries</span>
          </h4>
          
          {moodEntries.length === 0 ? (
            <div className="text-center py-4 text-gray-500">
              No mood entries yet. Record your first mood above!
            </div>
          ) : (
            <div className="space-y-3 max-h-60 overflow-y-auto">
              {moodEntries.map((entry) => (
                <div 
                  key={entry.id}
                  className="p-3 rounded-lg bg-dark-card/30 hover:bg-dark-card/50 group"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-10 h-10 rounded-lg flex items-center justify-center"
                        style={{ backgroundColor: `var(--color-${getMoodColor(entry.moodType)})20` }}
                      >
                        <span className="text-lg">
                          {moodTypes.find(m => m.id === entry.moodType)?.emoji || '😊'}
                        </span>
                      </div>
                      <div>
                        <div className="text-white font-medium">
                          {moodTypes.find(m => m.id === entry.moodType)?.label || entry.moodType}
                        </div>
                        <div className="text-gray-400 text-sm flex items-center gap-2">
                          <span>{entry.time}</span>
                          <span>•</span>
                          <span className={`px-2 py-0.5 rounded-full text-xs ${getEnergyColor(entry.energyLevel)}`}>
                            {entry.energyLevel}% energy
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => handleEditMood(entry)}
                        className="p-1 hover:bg-gray-700 rounded"
                        title="Edit entry"
                      >
                        <Edit size={14} className="text-white" />
                      </button>
                      <button
                        onClick={() => handleDeleteMood(entry.id)}
                        className="p-1 hover:bg-gray-700 rounded"
                        title="Delete entry"
                      >
                        <Trash2 size={14} className="text-white" />
                      </button>
                    </div>
                  </div>
                  
                  {entry.note && (
                    <div className="mt-2 text-gray-300 text-sm">{entry.note}</div>
                  )}
                  
                  {entry.tags && entry.tags.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {entry.tags.map(tag => (
                        <span key={tag} className="text-xs bg-gray-800 text-gray-300 px-2 py-0.5 rounded">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Stats Summary */}
      {stats && (
        <div className="mb-6">
          <h4 className="text-white font-medium mb-4">Weekly Overview</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="p-4 rounded-xl bg-dark-card/30">
              <div className="text-gray-400 text-sm">Avg Energy</div>
              <div className="text-2xl font-bold text-white">{stats.averageEnergy}%</div>
            </div>
            <div className="p-4 rounded-xl bg-dark-card/30">
              <div className="text-gray-400 text-sm">Common Mood</div>
              <div className="text-2xl font-bold text-white capitalize">{stats.mostCommonMood}</div>
            </div>
            <div className="p-4 rounded-xl bg-dark-card/30">
              <div className="text-gray-400 text-sm">Energy Trend</div>
              <div className="text-2xl font-bold text-emerald-green">{stats.energyTrend}</div>
            </div>
            <div className="p-4 rounded-xl bg-dark-card/30">
              <div className="text-gray-400 text-sm">Today's Entries</div>
              <div className="text-2xl font-bold text-white">{todayMoods.length}</div>
            </div>
          </div>
        </div>
      )}

      {/* Today's Moods Summary */}
      {todayMoods.length > 0 && (
        <div className="mb-6">
          <h4 className="text-white font-medium mb-4">Today's Mood Journey</h4>
          <div className="space-y-3">
            {todayMoods.map((entry, index) => (
              <div key={index} className="flex items-center gap-3">
                <div className="text-gray-400 text-sm w-16">{entry.time}</div>
                <div className={`h-2 flex-1 rounded-full ${getEnergyColor(entry.energyLevel)}`}></div>
                <div className="text-white text-sm w-20 truncate">
                  {moodTypes.find(m => m.id === entry.moodType)?.label}
                </div>
                <div className="text-gray-400 text-sm">{entry.energyLevel}%</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tips */}
      <div className="p-4 rounded-xl bg-gradient-to-r from-vibrant-yellow/10 to-electric-red/10 border border-vibrant-yellow/20">
        <div className="flex items-center gap-2 mb-2">
          <Battery size={18} className="text-vibrant-yellow" />
          <h4 className="font-medium text-white">Energy Tip</h4>
        </div>
        <p className="text-gray-300 text-sm">
          {energyLevel >= 80 
            ? "Great energy! Perfect time for complex tasks." 
            : energyLevel >= 60
            ? "Good energy level. Focus on medium-priority work."
            : "Energy is low. Consider a short break or lighter tasks."
          }
        </p>
        <button
          onClick={fetchMoodData}
          className="mt-3 text-xs text-bright-blue hover:underline"
        >
          ↻ Refresh Data
        </button>
      </div>
    </div>
  );
};

export default MoodTracker;