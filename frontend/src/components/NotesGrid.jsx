import { useState, useEffect } from 'react';
import { FileText, Plus, Search, Trash2, Edit, X, Save, Loader2 } from 'lucide-react';
import { notesAPI } from '../utils/api';
import { useToast } from '../context/ToastContext';
import EmptyState from './EmptyState';

const NotesGrid = () => {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingNote, setEditingNote] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    color: 'bright-blue'
  });
  
  const toast = useToast();

  // Available colors
  const colors = [
    { name: 'bright-blue', label: 'Blue' },
    { name: 'electric-red', label: 'Red' },
    { name: 'emerald-green', label: 'Green' },
    { name: 'vibrant-yellow', label: 'Yellow' },
  ];

  // Fetch notes from backend
  useEffect(() => {
    fetchNotes();
  }, []);

  const fetchNotes = async () => {
    try {
      setLoading(true);
      const response = await notesAPI.getNotes();
      
      // Handle different response formats
      const notesData = response.data || response.notes || response;
      
      if (Array.isArray(notesData)) {
        setNotes(notesData);
      } else {
        // Fallback to sample data if backend fails
        setNotes(getSampleNotes());
        toast.showToast('Using sample notes data', 'warning');
      }
    } catch (err) {
      console.error('Error fetching notes:', err);
      setNotes(getSampleNotes());
      toast.showToast('Failed to load notes. Using sample data.', 'warning');
    } finally {
      setLoading(false);
    }
  };

  // Sample notes for fallback
  const getSampleNotes = () => {
    return [
      { id: 1, title: 'Meeting Notes', content: 'Discussed project timeline...', color: 'electric-red', date: 'Today' },
      { id: 2, title: 'Ideas', content: 'New feature concepts...', color: 'bright-blue', date: 'Yesterday' },
      { id: 3, title: 'Research', content: 'AI productivity tools...', color: 'emerald-green', date: 'Nov 12' },
      { id: 4, title: 'To Learn', content: 'React advanced patterns...', color: 'vibrant-yellow', date: 'Nov 10' },
    ];
  };

  // Handle add note
  const handleAddNote = async (e) => {
    e?.preventDefault();
    
    if (!formData.title.trim() || !formData.content.trim()) {
      toast.showToast('Please fill in title and content', 'error');
      return;
    }

    try {
      const noteData = {
        ...formData,
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      };

      const response = await notesAPI.addNote(noteData);
      const newNote = response.data || response.note || response;
      
      setNotes([...notes, newNote]);
      setFormData({ title: '', content: '', color: 'bright-blue' });
      setShowAddForm(false);
      toast.showToast('Note added successfully!', 'success');
    } catch (err) {
      console.error('Error adding note:', err);
      toast.showToast('Failed to add note', 'error');
    }
  };

  // Handle update note
  const handleUpdateNote = async () => {
    if (!editingNote || !formData.title.trim() || !formData.content.trim()) return;

    try {
      const response = await notesAPI.updateNote(editingNote.id, {
        ...editingNote,
        ...formData
      });
      
      const updatedNote = response.data || response.note || response;
      
      setNotes(notes.map(note => 
        note.id === editingNote.id ? updatedNote : note
      ));
      setEditingNote(null);
      setFormData({ title: '', content: '', color: 'bright-blue' });
      toast.showToast('Note updated successfully!', 'success');
    } catch (err) {
      console.error('Error updating note:', err);
      toast.showNotes('Failed to update note', 'error');
    }
  };

  // Handle delete note
  const handleDeleteNote = async (id) => {
    if (!window.confirm('Are you sure you want to delete this note?')) return;

    try {
      await notesAPI.deleteNote(id);
      setNotes(notes.filter(note => note.id !== id));
      toast.showToast('Note deleted successfully!', 'success');
    } catch (err) {
      console.error('Error deleting note:', err);
      toast.showToast('Failed to delete note', 'error');
    }
  };

  // Start editing a note
  const startEditNote = (note) => {
    setEditingNote(note);
    setFormData({
      title: note.title,
      content: note.content,
      color: note.color
    });
    setShowAddForm(false);
  };

  // Cancel edit
  const cancelEdit = () => {
    setEditingNote(null);
    setFormData({ title: '', content: '', color: 'bright-blue' });
  };

  // Filter notes based on search
  const filteredNotes = notes.filter(note =>
    note.title.toLowerCase().includes(search.toLowerCase()) ||
    note.content.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="glass-card rounded-2xl p-6">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 text-bright-blue animate-spin" />
          <span className="ml-3 text-gray-400">Loading notes...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="glass-card rounded-2xl p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-white">📝 Smart Notes</h2>
          <p className="text-gray-400 text-sm">{notes.length} notes • AI-organized</p>
        </div>
        <button 
          onClick={() => {
            setShowAddForm(!showAddForm);
            setEditingNote(null);
            setFormData({ title: '', content: '', color: 'bright-blue' });
          }}
          className="bg-bright-blue text-white p-2 rounded-lg hover:bg-bright-blue/90"
        >
          {showAddForm ? <X size={20} /> : <Plus size={20} />}
        </button>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" size={18} />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search notes..."
          className="w-full bg-dark-card text-white pl-10 pr-4 py-3 rounded-lg border border-gray-700 focus:outline-none focus:border-bright-blue"
        />
      </div>

      {/* Add/Edit Form */}
      {(showAddForm || editingNote) && (
        <div className="mb-6 p-4 rounded-xl bg-dark-card/50 border border-gray-700">
          <h3 className="text-white font-medium mb-3">
            {editingNote ? 'Edit Note' : 'Add New Note'}
          </h3>
          
          <div className="space-y-3">
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              placeholder="Note title"
              className="w-full bg-dark-card/70 text-white px-4 py-2 rounded-lg border border-gray-700"
            />
            
            <textarea
              value={formData.content}
              onChange={(e) => setFormData({...formData, content: e.target.value})}
              placeholder="Note content"
              rows="3"
              className="w-full bg-dark-card/70 text-white px-4 py-2 rounded-lg border border-gray-700"
            />
            
            <div>
              <p className="text-gray-400 text-sm mb-2">Color:</p>
              <div className="flex gap-2">
                {colors.map((color) => (
                  <button
                    key={color.name}
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
            
            <div className="flex gap-2">
              <button
                onClick={editingNote ? handleUpdateNote : handleAddNote}
                className="flex-1 bg-bright-blue text-white py-2 rounded-lg hover:bg-bright-blue/90"
              >
                {editingNote ? 'Update Note' : 'Add Note'}
              </button>
              
              <button
                onClick={editingNote ? cancelEdit : () => setShowAddForm(false)}
                className="px-4 bg-gray-700 text-white py-2 rounded-lg hover:bg-gray-600"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Notes Grid with EmptyState */}
      {filteredNotes.length === 0 ? (
        search ? (
          <div className="text-center py-8">
            <EmptyState 
              icon="🔍"
              title="No notes found"
              message={`No notes matching "${search}"`}
              actionText="Clear Search"
              onAction={() => setSearch('')}
            />
          </div>
        ) : (
          <EmptyState 
            icon="📝"
            title="No notes yet"
            message="Create your first note to capture ideas, tasks, or important information!"
            actionText="Create Note"
            onAction={() => setShowAddForm(true)}
          />
        )
      ) : (
        <div className="grid grid-cols-2 gap-4">
          {filteredNotes.map((note) => (
            <div
              key={note.id}
              className="p-4 rounded-xl cursor-pointer hover:scale-[1.02] transition-transform group relative"
              style={{ backgroundColor: `var(--color-${note.color})20` }}
            >
              {/* Action Buttons (show on hover) */}
              <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    startEditNote(note);
                  }}
                  className="p-1 bg-black/50 rounded hover:bg-black/70"
                  title="Edit note"
                >
                  <Edit size={14} className="text-white" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteNote(note.id);
                  }}
                  className="p-1 bg-black/50 rounded hover:bg-black/70"
                  title="Delete note"
                >
                  <Trash2 size={14} className="text-white" />
                </button>
              </div>

              <div className="flex items-start justify-between mb-2">
                <FileText size={20} className="text-gray-300" />
                <span className="text-xs text-gray-400">{note.date}</span>
              </div>
              <h3 className="font-bold text-white mb-1 truncate">{note.title}</h3>
              <p className="text-gray-300 text-sm line-clamp-2">{note.content}</p>
              
              {/* Color indicator */}
              <div className="mt-3 flex items-center">
                <div 
                  className="w-3 h-3 rounded-full mr-2"
                  style={{ backgroundColor: `var(--color-${note.color})` }}
                />
                <span className="text-xs text-gray-400">
                  {colors.find(c => c.name === note.color)?.label || 'Note'}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Debug/Refresh Button */}
      <div className="mt-6 pt-4 border-t border-gray-800">
        <button
          onClick={fetchNotes}
          className="text-xs text-gray-500 hover:text-white"
        >
          ↻ Refresh Notes
        </button>
        <div className="text-xs text-gray-500 mt-1">
          Backend: {notes === getSampleNotes() ? 'Using sample data' : 'Connected'}
        </div>
      </div>
    </div>
  );
};

export default NotesGrid;