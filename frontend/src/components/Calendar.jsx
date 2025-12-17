import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Plus, Trash2, Edit, X, Loader2 } from 'lucide-react';
import { calendarAPI } from '../utils/api';
import { useToast } from '../context/ToastContext';

const Calendar = () => {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  
  // Current date info
  const today = new Date();
  const currentMonth = today.getMonth() + 1;
  const currentYear = today.getFullYear();
  const currentDay = today.getDate();
  
  // State
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showEventForm, setShowEventForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [currentDate, setCurrentDate] = useState({
    month: currentMonth,
    year: currentYear
  });
  const [formData, setFormData] = useState({
    title: '',
    day: currentDay,
    month: currentMonth,
    year: currentYear,
    color: 'bright-blue',
    description: ''
  });
  
  const toast = useToast();

  // Available colors
  const colors = [
    { name: 'bright-blue', label: 'Blue' },
    { name: 'electric-red', label: 'Red' },
    { name: 'emerald-green', label: 'Green' },
    { name: 'vibrant-yellow', label: 'Yellow' },
  ];

  // Get days in current month
  const getDaysInMonth = () => {
    return new Date(currentDate.year, currentDate.month, 0).getDate();
  };

  // Generate dates array for current month
  const dates = Array.from({ length: getDaysInMonth() }, (_, i) => i + 1);

  // Fetch events from backend
  useEffect(() => {
    fetchEvents();
  }, [currentDate.month, currentDate.year]);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      console.log('📅 Fetching events for:', currentDate.month, currentDate.year);
      
      // Get events for current month/year
      const response = await calendarAPI.getEvents();
      console.log('📦 Events response:', response);
      
      if (response.success && response.data) {
        // Filter events for current month/year (backend should handle this, but filter client-side too)
        const filteredEvents = response.data.filter(event => 
          event.month === currentDate.month && 
          event.year === currentDate.year
        );
        setEvents(filteredEvents);
        
        if (filteredEvents.length === 0) {
          toast.showToast('No events for this month', 'info');
        } else {
          toast.showToast(`${filteredEvents.length} events loaded`, 'success');
        }
      } else {
        throw new Error(response.error || 'Failed to load events');
      }
    } catch (err) {
      console.error('❌ Error fetching events:', err);
      toast.showToast(err.message || 'Failed to load events', 'error');
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  // Get events for a specific day
  const getEventsForDay = (day) => {
    return events.filter(event => 
      event.day === day && 
      event.month === currentDate.month && 
      event.year === currentDate.year
    );
  };

  // Handle add event
  const handleAddEvent = async (e) => {
    e?.preventDefault();
    
    if (!formData.title.trim()) {
      toast.showToast('Please enter event title', 'error');
      return;
    }

    try {
      const response = await calendarAPI.addEvent({
        ...formData,
        month: currentDate.month,
        year: currentDate.year
      });
      
      if (response.success && response.data) {
        setEvents([...events, response.data]);
        resetForm();
        toast.showToast('Event added successfully!', 'success');
      } else {
        throw new Error(response.error || 'Failed to add event');
      }
    } catch (err) {
      console.error('Error adding event:', err);
      toast.showToast(err.message || 'Failed to add event', 'error');
    }
  };

  // Handle update event
  const handleUpdateEvent = async () => {
    if (!editingEvent || !formData.title.trim()) return;

    try {
      const response = await calendarAPI.updateEvent(editingEvent.id, {
        ...formData,
        month: currentDate.month,
        year: currentDate.year
      });
      
      if (response.success && response.data) {
        setEvents(events.map(event => 
          event.id === editingEvent.id ? response.data : event
        ));
        setEditingEvent(null);
        resetForm();
        toast.showToast('Event updated successfully!', 'success');
      } else {
        throw new Error(response.error || 'Failed to update event');
      }
    } catch (err) {
      console.error('Error updating event:', err);
      toast.showToast(err.message || 'Failed to update event', 'error');
    }
  };

  // Handle delete event
  const handleDeleteEvent = async (id) => {
    if (!window.confirm('Are you sure you want to delete this event?')) return;

    try {
      const response = await calendarAPI.deleteEvent(id);
      
      if (response.success) {
        setEvents(events.filter(event => event.id !== id));
        toast.showToast('Event deleted successfully!', 'success');
      } else {
        throw new Error(response.error || 'Failed to delete event');
      }
    } catch (err) {
      console.error('Error deleting event:', err);
      toast.showToast(err.message || 'Failed to delete event', 'error');
    }
  };

  // Start editing an event
  const startEditEvent = (event) => {
    setEditingEvent(event);
    setFormData({
      title: event.title,
      day: event.day,
      month: event.month,
      year: event.year,
      color: event.color || 'bright-blue',
      description: event.description || ''
    });
    setShowEventForm(true);
  };

  // Reset form to default
  const resetForm = () => {
    setFormData({
      title: '',
      day: currentDay,
      month: currentDate.month,
      year: currentDate.year,
      color: 'bright-blue',
      description: ''
    });
    setShowEventForm(false);
  };

  // Cancel edit
  const cancelEdit = () => {
    setEditingEvent(null);
    resetForm();
  };

  // Handle date click
  const handleDateClick = (date) => {
    const existingEvents = getEventsForDay(date);
    
    if (existingEvents.length > 0) {
      startEditEvent(existingEvents[0]);
    } else {
      setFormData(prev => ({ 
        ...prev, 
        day: date,
        month: currentDate.month,
        year: currentDate.year
      }));
      setShowEventForm(true);
      setEditingEvent(null);
    }
  };

  // Handle month navigation
  const navigateMonth = (direction) => {
    setCurrentDate(prev => {
      let newMonth = prev.month + direction;
      let newYear = prev.year;
      
      if (newMonth > 12) {
        newMonth = 1;
        newYear++;
      } else if (newMonth < 1) {
        newMonth = 12;
        newYear--;
      }
      
      return { month: newMonth, year: newYear };
    });
  };

  // Get month name
  const getMonthName = () => {
    return new Date(currentDate.year, currentDate.month - 1).toLocaleString('default', { month: 'long' });
  };

  if (loading) {
    return (
      <div className="glass-card rounded-2xl p-6">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 text-bright-blue animate-spin" />
          <span className="ml-3 text-gray-400">Loading calendar...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="glass-card rounded-2xl p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-white">🗓️ Calendar</h2>
          <p className="text-gray-400 text-sm">{events.length} events in {getMonthName()}</p>
        </div>
        
        <div className="flex items-center gap-2">
          <button 
            onClick={() => navigateMonth(-1)}
            className="p-2 hover:bg-dark-card rounded-lg"
          >
            <ChevronLeft size={20} className="text-gray-400" />
          </button>
          
          <span className="text-white font-medium min-w-[120px] text-center">
            {getMonthName()} {currentDate.year}
          </span>
          
          <button 
            onClick={() => navigateMonth(1)}
            className="p-2 hover:bg-dark-card rounded-lg"
          >
            <ChevronRight size={20} className="text-gray-400" />
          </button>
          
          <button 
            onClick={() => {
              setShowEventForm(!showEventForm);
              if (!showEventForm) {
                setEditingEvent(null);
                resetForm();
              }
            }}
            className="ml-4 bg-bright-blue text-white p-2 rounded-lg hover:bg-bright-blue/90"
          >
            {showEventForm ? <X size={20} /> : <Plus size={20} />}
          </button>
        </div>
      </div>

      {/* Add/Edit Event Form */}
      {showEventForm && (
        <div className="mb-6 p-4 rounded-xl bg-dark-card/50 border border-gray-700">
          <h3 className="text-white font-medium mb-3">
            {editingEvent ? 'Edit Event' : 'Add New Event'}
          </h3>
          
          <div className="space-y-3">
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              placeholder="Event title"
              className="w-full bg-dark-card/70 text-white px-4 py-2 rounded-lg border border-gray-700"
              required
            />
            
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-gray-400 text-sm mb-1 block">Day</label>
                <select
                  value={formData.day}
                  onChange={(e) => setFormData({...formData, day: parseInt(e.target.value)})}
                  className="w-full bg-dark-card/70 text-white px-4 py-2 rounded-lg border border-gray-700"
                >
                  {dates.map(date => (
                    <option key={date} value={date}>{date}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="text-gray-400 text-sm mb-1 block">Color</label>
                <div className="flex gap-2">
                  {colors.map((color) => (
                    <button
                      key={color.name}
                      type="button"
                      onClick={() => setFormData({...formData, color: color.name})}
                      className={`w-8 h-8 rounded-full ${
                        formData.color === color.name 
                          ? 'ring-2 ring-white ring-offset-2 ring-offset-dark-card' 
                          : ''
                      }`}
                      style={{ backgroundColor: `var(--color-${color.name})` }}
                      title={color.label}
                    />
                  ))}
                </div>
              </div>
            </div>
            
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              placeholder="Event description (optional)"
              rows="2"
              className="w-full bg-dark-card/70 text-white px-4 py-2 rounded-lg border border-gray-700"
            />
            
            <div className="flex gap-2">
              <button
                onClick={editingEvent ? handleUpdateEvent : handleAddEvent}
                className="flex-1 bg-bright-blue text-white py-2 rounded-lg hover:bg-bright-blue/90"
              >
                {editingEvent ? 'Update Event' : 'Add Event'}
              </button>
              
              <button
                onClick={cancelEdit}
                className="px-4 bg-gray-700 text-white py-2 rounded-lg hover:bg-gray-600"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Days Header */}
      <div className="grid grid-cols-7 gap-1 mb-4">
        {days.map((day) => (
          <div key={day} className="text-center text-gray-400 text-sm py-2">
            {day}
          </div>
        ))}
      </div>

      {/* Dates Grid */}
      <div className="grid grid-cols-7 gap-1">
        {dates.map((date) => {
          const dayEvents = getEventsForDay(date);
          const hasEvent = dayEvents.length > 0;
          const mainEvent = hasEvent ? dayEvents[0] : null;
          const isToday = date === currentDay && 
                         currentDate.month === currentMonth && 
                         currentDate.year === currentYear;
          
          return (
            <div
              key={date}
              onClick={() => handleDateClick(date)}
              className={`
                aspect-square flex flex-col items-center justify-center rounded-lg
                cursor-pointer transition-all hover:scale-105
                ${isToday 
                  ? 'bg-gradient-to-br from-bright-blue to-emerald-green text-white' 
                  : 'hover:bg-dark-card'
                }
                ${hasEvent ? 'border-2 border-opacity-50' : ''}
              `}
              style={hasEvent ? { 
                borderColor: `var(--color-${mainEvent.color})`,
                backgroundColor: `var(--color-${mainEvent.color})20` 
              } : {}}
            >
              <span className={`text-sm font-medium ${isToday ? 'text-white' : 'text-gray-300'}`}>
                {date}
              </span>
              {hasEvent && (
                <div className="flex mt-1">
                  {dayEvents.slice(0, 3).map((event, idx) => (
                    <div 
                      key={idx}
                      className="w-2 h-2 rounded-full mx-0.5"
                      style={{ backgroundColor: `var(--color-${event.color})` }}
                      title={event.title}
                    ></div>
                  ))}
                  {dayEvents.length > 3 && (
                    <div className="text-xs text-gray-500">+{dayEvents.length - 3}</div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Events List */}
      <div className="mt-6 pt-4 border-t border-gray-800">
        <div className="flex justify-between items-center mb-3">
          <h4 className="text-white font-medium">Events in {getMonthName()}</h4>
          <button 
            onClick={fetchEvents}
            className="text-xs text-gray-500 hover:text-white"
          >
            ↻ Refresh
          </button>
        </div>
        
        {events.length === 0 ? (
          <div className="text-center py-4 text-gray-500">
            No events scheduled for {getMonthName()}. Add your first event!
          </div>
        ) : (
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {events.sort((a, b) => a.day - b.day).map((event) => (
              <div 
                key={event.id} 
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-dark-card/50 group"
              >
                <div 
                  className="w-3 h-3 rounded-full flex-shrink-0"
                  style={{ backgroundColor: `var(--color-${event.color})` }}
                ></div>
                
                <div className="flex-1 min-w-0">
                  <div className="text-white truncate">{event.title}</div>
                  <div className="text-gray-400 text-sm truncate">
                    {event.description || 'No description'}
                  </div>
                </div>
                
                <span className="text-gray-400 text-sm flex-shrink-0">
                  {event.day} {getMonthName().substring(0, 3)}
                </span>
                
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => startEditEvent(event)}
                    className="p-1 hover:bg-gray-700 rounded"
                    title="Edit event"
                  >
                    <Edit size={14} className="text-white" />
                  </button>
                  <button
                    onClick={() => handleDeleteEvent(event.id)}
                    className="p-1 hover:bg-gray-700 rounded"
                    title="Delete event"
                  >
                    <Trash2 size={14} className="text-white" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Status & Navigation */}
      <div className="mt-4 pt-4 border-t border-gray-800">
        <div className="flex justify-between items-center">
          <div className="text-xs text-gray-500">
            Showing: {getMonthName()} {currentDate.year}
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => {
                setCurrentDate({ month: currentMonth, year: currentYear });
              }}
              className="text-xs text-bright-blue hover:underline"
            >
              Jump to Today
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Calendar;