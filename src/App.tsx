import React, { useState, useEffect } from 'react';
import { Trash2, Plus, Edit2, Save, X, Cloud, HardDrive, Sun, Moon, Circle, CheckCircle2 } from 'lucide-react';

const API_BASE = 'http://localhost:8080/api/tasks';

interface Task {
  id: string;
  title: string;
  description: string;
  isCompleted: boolean;
}

type FilterType = 'all' | 'active' | 'completed';
type StorageMode = 'backend' | 'local';
type Theme = 'light' | 'dark';

export default function TaskManager() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [titleInput, setTitleInput] = useState('');
  const [descInput, setDescInput] = useState('');
  const [filter, setFilter] = useState<FilterType>('all');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [backendConnected, setBackendConnected] = useState(false);
  const [storageMode, setStorageMode] = useState<StorageMode>('backend');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [theme, setTheme] = useState<Theme>('dark');

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as Theme;
    if (savedTheme) {
      setTheme(savedTheme);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => {
    checkBackendConnection();
  }, []);

  useEffect(() => {
    if (storageMode === 'backend' && backendConnected) {
      loadTasksFromBackend();
    } else {
      loadTasksFromLocal();
    }
  }, [storageMode]);

  useEffect(() => {
    if (storageMode === 'local') {
      localStorage.setItem('tasks', JSON.stringify(tasks));
    }
  }, [tasks, storageMode]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  const checkBackendConnection = async () => {
    try {
      const response = await fetch(API_BASE);
      if (response.ok) {
        setBackendConnected(true);
        setStorageMode('backend');
        loadTasksFromBackend();
      } else {
        setBackendConnected(false);
        setStorageMode('local');
        loadTasksFromLocal();
      }
    } catch (err) {
      setBackendConnected(false);
      setStorageMode('local');
      loadTasksFromLocal();
    }
  };

  const loadTasksFromBackend = async () => {
    try {
      const response = await fetch(API_BASE);
      if (response.ok) {
        const data = await response.json();
        setTasks(data);
      }
    } catch (err) {
      console.error('Error loading tasks from backend:', err);
    }
  };

  const loadTasksFromLocal = () => {
    const stored = localStorage.getItem('tasks');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setTasks(parsed);
      } catch (e) {
        console.error('Failed to load from localStorage', e);
        setTasks([]);
      }
    } else {
      setTasks([]);
    }
  };

  const toggleStorageMode = () => {
    const newMode = storageMode === 'backend' ? 'local' : 'backend';
    setStorageMode(newMode);
    setError('');
  };

  const handleAddTask = async () => {
    if (!titleInput.trim()) {
      setError('Title is required');
      return;
    }

    setLoading(true);
    setError('');

    if (storageMode === 'backend' && backendConnected) {
      try {
        const response = await fetch(API_BASE, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            title: titleInput,
            description: descInput 
          }),
        });

        if (response.ok) {
          const newTask = await response.json();
          setTasks(prev => [...prev, newTask]);
          setTitleInput('');
          setDescInput('');
        } else {
          setError('Failed to add task to backend');
        }
      } catch (err) {
        setError('Network error');
      }
    } else {
      const localTask: Task = {
        id: crypto.randomUUID(),
        title: titleInput,
        description: descInput,
        isCompleted: false
      };
      setTasks(prev => [...prev, localTask]);
      setTitleInput('');
      setDescInput('');
    }
    
    setLoading(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && e.ctrlKey) {
      handleAddTask();
    }
  };

  const startEditing = (task: Task) => {
    setEditingId(task.id);
    setEditTitle(task.title);
    setEditDesc(task.description);
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditTitle('');
    setEditDesc('');
  };

  const saveEdit = async (taskId: string) => {
    if (!editTitle.trim()) {
      setError('Title cannot be empty');
      return;
    }

    if (storageMode === 'backend' && backendConnected) {
      try {
        const response = await fetch(`${API_BASE}/${taskId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            title: editTitle,
            description: editDesc 
          }),
        });

        if (response.ok) {
          setTasks(prev =>
            prev.map(t => t.id === taskId ? { ...t, title: editTitle, description: editDesc } : t)
          );
        }
      } catch (err) {
        setError('Failed to update task');
      }
    } else {
      setTasks(prev =>
        prev.map(t => t.id === taskId ? { ...t, title: editTitle, description: editDesc } : t)
      );
    }
    
    cancelEditing();
  };

  const toggleTask = async (task: Task) => {
    if (storageMode === 'backend' && backendConnected) {
      try {
        const response = await fetch(`${API_BASE}/${task.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ isCompleted: !task.isCompleted }),
        });

        if (response.ok) {
          setTasks(prev =>
            prev.map(t => t.id === task.id ? { ...t, isCompleted: !t.isCompleted } : t)
          );
        }
      } catch (err) {
        setError('Failed to update task');
      }
    } else {
      setTasks(prev =>
        prev.map(t => t.id === task.id ? { ...t, isCompleted: !t.isCompleted } : t)
      );
    }
  };

  const deleteTask = async (id: string) => {
    if (storageMode === 'backend' && backendConnected) {
      try {
        await fetch(`${API_BASE}/${id}`, { method: 'DELETE' });
        setTasks(prev => prev.filter(t => t.id !== id));
      } catch (err) {
        setError('Failed to delete task');
      }
    } else {
      setTasks(prev => prev.filter(t => t.id !== id));
    }
  };

  const filteredTasks = tasks.filter(task => {
    if (filter === 'active') return !task.isCompleted;
    if (filter === 'completed') return task.isCompleted;
    return true;
  });

  const stats = {
    total: tasks.length,
    active: tasks.filter(t => !t.isCompleted).length,
    completed: tasks.filter(t => t.isCompleted).length
  };

  const isDark = theme === 'dark';

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900' : 'bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100'} transition-colors duration-200`}>
      {/* Modern Navbar */}
      <nav className={`${isDark ? 'bg-gray-900/95 border-gray-800' : 'bg-white/95 border-gray-200'} backdrop-blur-md border-b sticky top-0 z-50 transition-colors duration-200`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo and Brand */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-lg">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="9 11 12 14 22 4"></polyline>
                  <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path>
                </svg>
              </div>
              <div>
                <h1 className={`text-xl font-bold ${isDark ? 'text-white' : 'bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent'}`}>
                  TaskFlow
                </h1>
                <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  Stay organized, stay productive
                </p>
              </div>
            </div>

            {/* Right Side Actions */}
            <div className="flex items-center gap-6">
              {/* Theme Toggle - Moved to left with label */}
              <div className="flex items-center gap-2">
                <span className={`hidden sm:inline text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  Theme
                </span>
                <button
                  onClick={toggleTheme}
                  className={`p-2.5 rounded-lg transition-all border ${
                    isDark 
                      ? 'bg-gray-800 text-yellow-400 hover:bg-gray-700 border-gray-700 hover:border-gray-600' 
                      : 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100 border-indigo-200 hover:border-indigo-300'
                  }`}
                  title={`Switch to ${isDark ? 'light' : 'dark'} mode`}
                >
                  {isDark ? <Sun size={20} /> : <Moon size={20} />}
                </button>
              </div>

              {/* Vertical Divider */}
              <div className={`hidden md:block h-8 w-px ${isDark ? 'bg-gray-700' : 'bg-gray-300'}`}></div>

              {/* Storage Status */}
              <div className="hidden md:flex items-center gap-3">
                <span className={`text-xs px-3 py-1.5 rounded-full font-medium ${
                  storageMode === 'backend' && backendConnected
                    ? isDark ? 'bg-emerald-900/30 text-emerald-400 border border-emerald-700' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : isDark ? 'bg-amber-900/30 text-amber-400 border border-amber-700' : 'bg-amber-50 text-amber-700 border border-amber-200'
                }`}>
                  {storageMode === 'backend' && backendConnected ? (
                    <span className="flex items-center gap-1.5">
                      <Cloud size={12} />
                      Backend Connected
                    </span>
                  ) : (
                    <span className="flex items-center gap-1.5">
                      <HardDrive size={12} />
                      Local Storage
                    </span>
                  )}
                </span>
                
                {backendConnected && (
                  <button
                    onClick={toggleStorageMode}
                    disabled={!backendConnected}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      storageMode === 'backend' 
                        ? 'bg-indigo-600' 
                        : isDark ? 'bg-gray-700' : 'bg-gray-300'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow-sm ${
                        storageMode === 'backend' ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-3xl mx-auto py-8 px-4">
        <div className={`${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white/80 backdrop-blur-sm border-purple-200'} rounded-lg shadow-2xl p-6 border transition-colors duration-200`}>
          <div className="flex justify-between items-start mb-6">
            <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent'}`}>
              Task Manager
            </h2>
            
            <div className="flex items-start gap-4">
              {/* Mobile Storage Status */}
              <div className="md:hidden flex flex-col items-end gap-3">
                <span className={`text-xs px-3 py-1 rounded font-medium ${
                  storageMode === 'backend' && backendConnected
                    ? isDark ? 'bg-green-900 text-green-300' : 'bg-gradient-to-r from-emerald-400 to-green-500 text-white shadow-sm'
                    : isDark ? 'bg-yellow-900 text-yellow-300' : 'bg-gradient-to-r from-amber-400 to-orange-500 text-white shadow-sm'
                }`}>
                  {storageMode === 'backend' && backendConnected ? '☁️ Backend' : '💾 Local'}
                </span>
                
                {backendConnected && (
                  <div className="flex items-center gap-2">
                    <span className={`${isDark ? 'text-gray-400' : 'text-gray-600'} text-sm flex items-center gap-1`}>
                      <HardDrive size={14} />
                      Local
                    </span>
                    <button
                      onClick={toggleStorageMode}
                      disabled={!backendConnected}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                        isDark ? 'focus:ring-offset-gray-800' : 'focus:ring-offset-white'
                      } ${
                        storageMode === 'backend' ? 'bg-blue-600' : 'bg-gray-400'
                      } ${!backendConnected ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          storageMode === 'backend' ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                    <span className={`${isDark ? 'text-gray-400' : 'text-gray-600'} text-sm flex items-center gap-1`}>
                      <Cloud size={14} />
                      Backend
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <div className="mb-6">
            <div className="space-y-3">
              <input
                type="text"
                value={titleInput}
                onChange={(e) => setTitleInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Task Title *"
                className={`w-full px-4 py-2 ${
                  isDark 
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                    : 'bg-purple-50 border-purple-300 text-gray-900 placeholder-purple-400'
                } border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors`}
                disabled={loading}
              />
              <textarea
                value={descInput}
                onChange={(e) => setDescInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Description (optional)"
                rows={3}
                className={`w-full px-4 py-2 ${
                  isDark 
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                    : 'bg-purple-50 border-purple-300 text-gray-900 placeholder-purple-400'
                } border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none transition-colors`}
                disabled={loading}
              />
              <div className="flex justify-between items-center">
                <span className={`text-xs ${isDark ? 'text-gray-500' : 'text-purple-500'}`}>
                  Press Ctrl+Enter to add
                </span>
                <button
                  onClick={handleAddTask}
                  disabled={loading || !titleInput.trim()}
                  className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-6 py-2 rounded-lg disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2 transition-all shadow-md"
                >
                  <Plus size={20} />
                  Add Task
                </button>
              </div>
            </div>
            {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
          </div>

          <div className={`flex gap-2 mb-4 ${isDark ? 'border-gray-700' : 'border-purple-200'} border-b pb-4`}>
            {(['all', 'active', 'completed'] as FilterType[]).map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2 rounded-lg capitalize transition-all ${
                  filter === f
                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md hover:from-indigo-700 hover:to-purple-700'
                    : isDark
                      ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      : 'bg-purple-100 text-purple-700 hover:bg-purple-200'
                }`}
              >
                {f} {f === 'all' && `(${stats.total})`}
                {f === 'active' && `(${stats.active})`}
                {f === 'completed' && `(${stats.completed})`}
              </button>
            ))}
          </div>

          <div className="space-y-3">
            {filteredTasks.length === 0 ? (
              <p className={`text-center ${isDark ? 'text-gray-500' : 'text-purple-400'} py-8`}>
                {filter === 'all' ? 'No tasks yet. Add one above!' : `No ${filter} tasks.`}
              </p>
            ) : (
              filteredTasks.map(task => (
                <div
                  key={task.id}
                  className={`rounded-xl transition-all group ${
                    task.isCompleted
                      ? isDark 
                        ? 'bg-gradient-to-r from-emerald-900/20 to-teal-900/20 border-2 border-emerald-700/30' 
                        : 'bg-gradient-to-r from-emerald-50 to-teal-50 border-2 border-emerald-300'
                      : isDark
                        ? 'bg-gray-700 hover:bg-gray-650 border-2 border-gray-600'
                        : 'bg-gradient-to-r from-purple-50 to-pink-50 hover:from-purple-100 hover:to-pink-100 border-2 border-purple-200'
                  } shadow-sm hover:shadow-md`}
                >
                  {editingId === task.id ? (
                    <div className="p-4 space-y-3">
                      <input
                        type="text"
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        placeholder="Task Title *"
                        className={`w-full px-3 py-2 ${
                          isDark 
                            ? 'bg-gray-800 border-gray-600 text-white' 
                            : 'bg-white border-purple-300 text-gray-900'
                        } border rounded focus:outline-none focus:ring-2 focus:ring-purple-500`}
                        autoFocus
                      />
                      <textarea
                        value={editDesc}
                        onChange={(e) => setEditDesc(e.target.value)}
                        placeholder="Description (optional)"
                        rows={3}
                        className={`w-full px-3 py-2 ${
                          isDark 
                            ? 'bg-gray-800 border-gray-600 text-white' 
                            : 'bg-white border-purple-300 text-gray-900'
                        } border rounded focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none`}
                      />
                      <div className="flex gap-2 justify-end">
                        <button
                          onClick={() => saveEdit(task.id)}
                          className={`${
                            isDark 
                              ? 'text-green-400 hover:bg-green-900' 
                              : 'text-green-600 hover:bg-green-100'
                          } px-3 py-1 rounded transition-all flex items-center gap-1`}
                        >
                          <Save size={16} />
                          Save
                        </button>
                        <button
                          onClick={cancelEditing}
                          className={`${
                            isDark 
                              ? 'text-gray-400 hover:bg-gray-600' 
                              : 'text-gray-600 hover:bg-gray-200'
                          } px-3 py-1 rounded transition-all flex items-center gap-1`}
                        >
                          <X size={16} />
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-start gap-4 p-4">
                      <button
                        onClick={() => toggleTask(task)}
                        className={`flex-shrink-0 mt-0.5 transition-all transform hover:scale-110 ${
                          task.isCompleted
                            ? 'text-emerald-500'
                            : isDark
                              ? 'text-gray-500 hover:text-indigo-400'
                              : 'text-purple-300 hover:text-purple-500'
                        }`}
                        title={task.isCompleted ? 'Mark as incomplete' : 'Mark as complete'}
                      >
                        {task.isCompleted ? (
                          <CheckCircle2 size={24} className="fill-current" />
                        ) : (
                          <Circle size={24} />
                        )}
                      </button>
                      
                      <div className="flex-1 min-w-0">
                        <h3
                          className={`font-medium text-lg transition-all ${
                            task.isCompleted
                              ? isDark ? 'text-emerald-300' : 'text-emerald-700'
                              : isDark ? 'text-gray-100' : 'text-gray-900'
                          }`}
                        >
                          {task.title}
                        </h3>
                        {task.description && (
                          <p
                            className={`mt-1 text-sm transition-all ${
                              task.isCompleted
                                ? isDark ? 'text-emerald-400/70' : 'text-emerald-600'
                                : isDark ? 'text-gray-400' : 'text-gray-600'
                            }`}
                          >
                            {task.description}
                          </p>
                        )}
                        {task.isCompleted && (
                          <span className={`inline-flex items-center gap-1 mt-2 text-xs px-2 py-1 rounded-full ${
                            isDark 
                              ? 'bg-emerald-900/40 text-emerald-300' 
                              : 'bg-emerald-100 text-emerald-700'
                          }`}>
                            <CheckCircle2 size={12} />
                            Completed
                          </span>
                        )}
                      </div>
                      
                      <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => startEditing(task)}
                          className={`flex-shrink-0 ${
                            isDark 
                              ? 'text-blue-400 hover:bg-blue-900/50' 
                              : 'text-indigo-600 hover:bg-indigo-100'
                          } p-2 rounded-lg transition-all`}
                        >
                          <Edit2 size={18} />
                        </button>
                        
                        <button
                          onClick={() => deleteTask(task.id)}
                          className={`flex-shrink-0 ${
                            isDark 
                              ? 'text-red-400 hover:bg-red-900/50' 
                              : 'text-red-600 hover:bg-red-100'
                          } p-2 rounded-lg transition-all`}
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>

          {tasks.length > 0 && (
            <div className={`mt-6 pt-4 ${isDark ? 'border-gray-700' : 'border-purple-200'} border-t text-sm ${isDark ? 'text-gray-400' : 'text-purple-600'} text-center`}>
              {stats.active} {stats.active === 1 ? 'task' : 'tasks'} remaining
            </div>
          )}
        </div>
      </div>
    </div>
  );
}