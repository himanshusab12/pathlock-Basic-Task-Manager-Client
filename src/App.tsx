import React, { useState, useEffect } from 'react';
import { Trash2, Plus, Check, Edit2, Save, X, Cloud, HardDrive } from 'lucide-react';

const API_BASE = 'https://pathlock-basic-task-manager-server.onrender.com/api/tasks';


interface Task {
  id: string;
  description: string;
  isCompleted: boolean;
}

type FilterType = 'all' | 'active' | 'completed';
type StorageMode = 'backend' | 'local';

export default function TaskManager() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [input, setInput] = useState('');
  const [filter, setFilter] = useState<FilterType>('all');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [backendConnected, setBackendConnected] = useState(false);
  const [storageMode, setStorageMode] = useState<StorageMode>('backend');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');

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
    if (!input.trim()) return;

    setLoading(true);
    setError('');

    if (storageMode === 'backend' && backendConnected) {
      try {
        const response = await fetch(API_BASE, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ description: input }),
        });

        if (response.ok) {
          const newTask = await response.json();
          setTasks(prev => [...prev, newTask]);
          setInput('');
        } else {
          setError('Failed to add task to backend');
        }
      } catch (err) {
        setError('Network error');
      }
    } else {
      const localTask: Task = {
        id: crypto.randomUUID(),
        description: input,
        isCompleted: false
      };
      setTasks(prev => [...prev, localTask]);
      setInput('');
    }
    
    setLoading(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAddTask();
    }
  };

  const startEditing = (task: Task) => {
    setEditingId(task.id);
    setEditText(task.description);
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditText('');
  };

  const saveEdit = async (taskId: string) => {
    if (!editText.trim()) {
      cancelEditing();
      return;
    }

    if (storageMode === 'backend' && backendConnected) {
      try {
        const response = await fetch(`${API_BASE}/${taskId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ description: editText }),
        });

        if (response.ok) {
          setTasks(prev =>
            prev.map(t => t.id === taskId ? { ...t, description: editText } : t)
          );
        }
      } catch (err) {
        setError('Failed to update task');
      }
    } else {
      setTasks(prev =>
        prev.map(t => t.id === taskId ? { ...t, description: editText } : t)
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

  return (
    <div className="min-h-screen bg-gray-900 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-gray-800 rounded-lg shadow-2xl p-6 border border-gray-700">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-white">Task Manager</h1>
            
            <div className="flex flex-col items-end gap-3">
              <span className={`text-xs px-2 py-1 rounded ${
                backendConnected ? 'bg-green-900 text-green-300' : 'bg-red-900 text-red-300'
              }`}>
                {backendConnected ? 'Connected' : 'Offline'}
              </span>
              
              {backendConnected && (
                <div className="flex items-center gap-2">
                  <span className="text-gray-400 text-sm flex items-center gap-1">
                    <HardDrive size={14} />
                    Local
                  </span>
                  <button
                    onClick={toggleStorageMode}
                    disabled={!backendConnected}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-800 ${
                      storageMode === 'backend' ? 'bg-blue-600' : 'bg-gray-600'
                    } ${!backendConnected ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        storageMode === 'backend' ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                  <span className="text-gray-400 text-sm flex items-center gap-1">
                    <Cloud size={14} />
                    Backend
                  </span>
                </div>
              )}
            </div>
          </div>
          
          <div className="mb-6">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="What needs to be done?"
                className="flex-1 px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white placeholder-gray-400"
                disabled={loading}
              />
              <button
                onClick={handleAddTask}
                disabled={loading || !input.trim()}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed flex items-center gap-2 transition-colors"
              >
                <Plus size={20} />
                Add
              </button>
            </div>
            {error && <p className="text-red-400 text-sm mt-2">{error}</p>}
          </div>

          <div className="flex gap-2 mb-4 border-b border-gray-700 pb-4">
            {(['all', 'active', 'completed'] as FilterType[]).map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2 rounded-lg capitalize transition-colors ${
                  filter === f
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                {f} {f === 'all' && `(${stats.total})`}
                {f === 'active' && `(${stats.active})`}
                {f === 'completed' && `(${stats.completed})`}
              </button>
            ))}
          </div>

          <div className="space-y-2">
            {filteredTasks.length === 0 ? (
              <p className="text-center text-gray-500 py-8">
                {filter === 'all' ? 'No tasks yet. Add one above!' : `No ${filter} tasks.`}
              </p>
            ) : (
              filteredTasks.map(task => (
                <div
                  key={task.id}
                  className="flex items-center gap-3 p-3 bg-gray-700 rounded-lg hover:bg-gray-650 transition-colors group"
                >
                  <button
                    onClick={() => toggleTask(task)}
                    className={`flex-shrink-0 w-6 h-6 rounded border-2 flex items-center justify-center transition-colors ${
                      task.isCompleted
                        ? 'bg-green-600 border-green-600'
                        : 'border-gray-500 hover:border-blue-500'
                    }`}
                  >
                    {task.isCompleted && <Check size={16} className="text-white" />}
                  </button>
                  
                  {editingId === task.id ? (
                    <div className="flex-1 flex gap-2">
                      <input
                        type="text"
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && saveEdit(task.id)}
                        className="flex-1 px-2 py-1 bg-gray-800 border border-gray-600 rounded text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        autoFocus
                      />
                      <button
                        onClick={() => saveEdit(task.id)}
                        className="text-green-400 hover:bg-green-900 p-1 rounded transition-all"
                      >
                        <Save size={18} />
                      </button>
                      <button
                        onClick={cancelEditing}
                        className="text-gray-400 hover:bg-gray-600 p-1 rounded transition-all"
                      >
                        <X size={18} />
                      </button>
                    </div>
                  ) : (
                    <>
                      <span
                        className={`flex-1 ${
                          task.isCompleted ? 'line-through text-gray-500' : 'text-gray-200'
                        }`}
                      >
                        {task.description}
                      </span>
                      
                      <button
                        onClick={() => startEditing(task)}
                        className="flex-shrink-0 text-blue-400 opacity-0 group-hover:opacity-100 hover:bg-blue-900 p-1 rounded transition-all"
                      >
                        <Edit2 size={18} />
                      </button>
                      
                      <button
                        onClick={() => deleteTask(task.id)}
                        className="flex-shrink-0 text-red-400 opacity-0 group-hover:opacity-100 hover:bg-red-900 p-1 rounded transition-all"
                      >
                        <Trash2 size={18} />
                      </button>
                    </>
                  )}
                </div>
              ))
            )}
          </div>

          {tasks.length > 0 && (
            <div className="mt-6 pt-4 border-t border-gray-700 text-sm text-gray-400 text-center">
              {stats.active} {stats.active === 1 ? 'task' : 'tasks'} remaining
            </div>
          )}
        </div>
      </div>
    </div>
  );
}