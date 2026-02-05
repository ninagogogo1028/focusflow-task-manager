import React, { useState, useEffect, useCallback } from 'react';
import { Task, TaskStatus } from './types';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import KanbanView from './components/KanbanView';
import CalendarView from './components/CalendarView';
import ArchiveView from './components/ArchiveView';
import ActivityMonitor from './components/ActivityMonitor';
import NotificationCenter, { NotificationItem } from './components/NotificationCenter';
import RecapModal from './components/RecapModal';
import { getDailyRecap } from './services/geminiService';

const App: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>(() => {
    const saved = localStorage.getItem('focusflow_tasks');
    return saved ? JSON.parse(saved) : [];
  });
  const [activeTab, setActiveTab] = useState<'dashboard' | 'kanban' | 'calendar' | 'archive'>('dashboard');
  const [showRecap, setShowRecap] = useState(false);
  const [recapContent, setRecapContent] = useState('');
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [firedReminders, setFiredReminders] = useState<Set<string>>(new Set());

  useEffect(() => {
    localStorage.setItem('focusflow_tasks', JSON.stringify(tasks));
  }, [tasks]);

  // Check for reminders
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const currentTimeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
      const todayStr = now.toISOString().split('T')[0];

      tasks.forEach(task => {
        const reminderId = `${task.id}-${todayStr}-${task.reminderTime}`;
        
        if (
          !task.isArchived && 
          task.status !== TaskStatus.COMPLETED &&
          task.dueDate === todayStr && 
          task.reminderTime === currentTimeStr &&
          !firedReminders.has(reminderId)
        ) {
          addNotification(`⏰ 任务提醒: ${task.title}`, 'reminder');
          setFiredReminders(prev => {
            const next = new Set(prev);
            next.add(reminderId);
            return next;
          });
        }
      });
    }, 10000); // Check every 10 seconds for better accuracy
    return () => clearInterval(interval);
  }, [tasks, firedReminders]);

  // Morning Recap Logic
  useEffect(() => {
    // Use a versioned key to force reset for users who missed it due to bugs
    const RECAP_STORAGE_KEY = 'last_recap_date_v2';
    const lastRecapDate = localStorage.getItem(RECAP_STORAGE_KEY);
    const now = new Date();
    const today = now.toDateString();
    
    // Get YYYY-MM-DD in local time
    const getLocalISODate = (date: Date) => {
      const offset = date.getTimezoneOffset();
      const localDate = new Date(date.getTime() - (offset * 60 * 1000));
      return localDate.toISOString().split('T')[0];
    };

    if (lastRecapDate !== today) {
      const yesterday = new Date(now);
      yesterday.setDate(yesterday.getDate() - 1);
      
      // Use strictly before today (local time) to catch all overdue/yesterday tasks
      const todayISO = getLocalISODate(now);

      const unfinished = tasks.filter(t => 
        !t.isArchived && 
        t.status !== TaskStatus.COMPLETED && 
        t.dueDate < todayISO // Tasks due before today
      );
      
      if (unfinished.length > 0) {
        getDailyRecap(unfinished).then(content => {
          setRecapContent(content);
          setShowRecap(true);
          localStorage.setItem(RECAP_STORAGE_KEY, today);
        }).catch(err => {
          console.error("Failed to generate recap:", err);
          // Optional: Show a fallback recap or notification?
          // For now, we just log it. If it fails, we don't set the flag so it might try again?
          // But to avoid infinite loops on error, we should probably set the flag or have a retry limit.
          // Let's set the flag to avoid annoying the user with errors.
          localStorage.setItem(RECAP_STORAGE_KEY, today);
        });
      } else {
         // Even if no unfinished tasks, we mark today as checked so we don't keep checking
         localStorage.setItem(RECAP_STORAGE_KEY, today);
      }
    }
  }, [tasks]);

  const addTask = (newTask: Task) => {
    setTasks(prev => [newTask, ...prev]);
    // Removed "Task added" notification as per user request
  };

  const updateTaskStatus = (id: string, status: TaskStatus) => {
    setTasks(prev => prev.map(t => {
      if (t.id !== id) return t;
      if (status === TaskStatus.COMPLETED) {
        return { ...t, status, isArchived: true, archivedAt: Date.now() };
      }
      return { ...t, status, isArchived: false, archivedAt: undefined };
    }));
  };

  const updateTask = (id: string, updates: Partial<Task>) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
  };

  const deleteTask = (id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id));
  };

  // Auto clean archives older than 7 days unless set to permanent
  useEffect(() => {
    const cleanup = () => {
      const sevenDays = 7 * 24 * 60 * 60 * 1000;
      setTasks(prev => prev.filter(t => {
        if (!t.isArchived) return true;
        if (t.isPermanent) return true;
        if (!t.archivedAt) return true;
        return (Date.now() - t.archivedAt) <= sevenDays;
      }));
    };
    cleanup();
    const interval = setInterval(cleanup, 60 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);
  const addNotification = (msg: string, type: 'info' | 'reminder' = 'info') => {
    const newNote: NotificationItem = {
      id: Date.now().toString() + Math.random(),
      message: msg,
      type
    };
    setNotifications(prev => [newNote, ...prev].slice(0, 5));
    
    if (Notification.permission === "granted") {
      new Notification("FocusFlow", { body: msg, icon: 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png' });
    }
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  useEffect(() => {
    if ("Notification" in window) {
      Notification.requestPermission();
    }
  }, []);

  return (
    <div className="flex flex-col md:flex-row h-screen bg-slate-50 overflow-hidden text-slate-900">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <main className="flex-1 overflow-y-auto relative flex flex-col">
        <header className="h-16 border-b border-slate-200 bg-white flex items-center justify-between px-4 md:px-8 sticky top-0 z-10">
          <h1 className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent capitalize">
            {activeTab}
          </h1>
          <ActivityMonitor onAddTask={addTask} />
        </header>

        <div className="p-4 md:p-8 flex-1 pb-24 md:pb-8">
          {activeTab === 'dashboard' && <Dashboard tasks={tasks} onUpdateTask={updateTask} onAddTask={addTask} onDeleteTask={deleteTask} />}
          {activeTab === 'kanban' && <KanbanView tasks={tasks} onUpdateTask={updateTask} onUpdateStatus={updateTaskStatus} onDeleteTask={deleteTask} />}
          {activeTab === 'calendar' && <CalendarView tasks={tasks} onSelectTask={(id) => { /* Focus task */ }} />}
          {activeTab === 'archive' && (
            <ArchiveView 
              tasks={tasks.filter(t => t.isArchived)} 
              onRestore={(id) => updateTask(id, { isArchived: false, status: TaskStatus.TODO, archivedAt: undefined })}
              onTogglePermanent={(id, value) => updateTask(id, { isPermanent: value })}
              onDeleteTask={deleteTask}
            />
          )}
        </div>
      </main>

      <NotificationCenter notifications={notifications} onClose={removeNotification} />
      {showRecap && <RecapModal content={recapContent} onClose={() => setShowRecap(false)} />}
    </div>
  );
};

export default App;
