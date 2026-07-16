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
import PricingModal from './components/PricingModal';
import ApiKeyModal from './components/ApiKeyModal';
import { hasUserApiKey } from './services/apiKeyStorage';
import { useI18n } from './i18n';
import WelcomeModal from './components/WelcomeModal';
import CaptureModal from './components/CaptureModal';
import ProductGuideModal from './components/ProductGuideModal';
import FeedbackModal from './components/FeedbackModal';
import DataSettingsModal from './components/DataSettingsModal';
import { track } from './services/analytics';

const App: React.FC = () => {
  const { locale, setLocale, t } = useI18n();
  const tabTitles = {
    dashboard: t('todayPlan'),
    kanban: t('taskBoard'),
    calendar: t('calendar'),
    archive: t('completed'),
  } as const;
  const [tasks, setTasks] = useState<Task[]>(() => {
    const saved = localStorage.getItem('focusflow_tasks');
    if (!saved) return [];
    try {
      const parsed = JSON.parse(saved);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  });
  const [activeTab, setActiveTab] = useState<'dashboard' | 'kanban' | 'calendar' | 'archive'>('dashboard');
  const [showRecap, setShowRecap] = useState(false);
  const [showPricing, setShowPricing] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);
  const [showCapture, setShowCapture] = useState(false);
  const [showWelcome, setShowWelcome] = useState(() => !localStorage.getItem('focusflow_onboarding_v1'));
  const [showProductGuide, setShowProductGuide] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [showDataSettings, setShowDataSettings] = useState(false);
  const [apiKeyConnected, setApiKeyConnected] = useState(hasUserApiKey());
  const [recapContent, setRecapContent] = useState('');
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [firedReminders, setFiredReminders] = useState<Set<string>>(new Set());

  useEffect(() => {
    localStorage.setItem('focusflow_tasks', JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => { track('app_opened', { locale, version: '0.2.0-beta' }); }, []);
  useEffect(() => { if (activeTab === 'dashboard') track('daily_plan_viewed', { locale, version: '0.2.0-beta' }); }, [activeTab]);

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
    if (showWelcome || tasks.length === 0) return;
    // Use a versioned key to force reset for users who missed it due to bugs
    const RECAP_STORAGE_KEY = 'last_recap_date_v5';
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
      // Use strictly before today (local time) to catch all overdue/yesterday tasks
      const todayISO = getLocalISODate(now);
      
      const overdue = tasks.filter(t => 
        !t.isArchived && 
        t.status !== TaskStatus.COMPLETED && 
        t.dueDate < todayISO // Tasks due before today
      );

      const todayTasks = tasks.filter(t => 
        !t.isArchived && 
        t.status !== TaskStatus.COMPLETED && 
        t.dueDate === todayISO // Tasks due today
      );
      
      // Always trigger recap to greet the user, even if no overdue tasks
      getDailyRecap(overdue, todayTasks).then(content => {
        setRecapContent(content);
        setShowRecap(true);
        localStorage.setItem(RECAP_STORAGE_KEY, today);
      }).catch(err => {
        console.error("Failed to generate recap:", err);
        // Fallback content if AI fails (e.g. network issue or API key restriction)
        const fallbackContent = locale === 'zh-CN' ? `今日计划\n\n逾期任务：${overdue.length}\n今日任务：${todayTasks.length}\n\n先选择一件最重要的事开始吧。` : `Daily plan\n\nOverdue: ${overdue.length}\nToday: ${todayTasks.length}\n\nChoose the single most important task and begin.`;
        setRecapContent(fallbackContent);
        setShowRecap(true);
        localStorage.setItem(RECAP_STORAGE_KEY, today);
      });
    }
  }, [tasks, locale, showWelcome]);

  const addTask = (newTask: Task) => {
    setTasks(prev => [newTask, ...prev]);
    track('task_created', { category: newTask.category || 'uncategorized', source: newTask.source || 'manual', version: '0.2.0-beta' });
    // Removed "Task added" notification as per user request
  };

  const updateTaskStatus = (id: string, status: TaskStatus) => {
    setTasks(prev => prev.map(t => {
      if (t.id !== id) return t;
      if (status === TaskStatus.COMPLETED) {
        track('task_completed', { category: t.category || 'uncategorized', source: t.source || 'manual', version: '0.2.0-beta' });
        return { ...t, status, isArchived: true, archivedAt: Date.now() };
      }
      return { ...t, status, isArchived: false, archivedAt: undefined };
    }));
  };

  const updateTask = (id: string, updates: Partial<Task>) => {
    if (updates.status === TaskStatus.COMPLETED) {
      const task = tasks.find((item) => item.id === id);
      if (task) track('task_completed', { category: task.category || 'uncategorized', source: task.source || 'manual', version: '0.2.0-beta' });
    }
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
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} onOpenGuide={() => setShowProductGuide(true)} />
      
      <main className="flex-1 overflow-y-auto relative flex flex-col">
        <header className="h-16 border-b border-slate-200 bg-white flex items-center justify-between px-4 md:px-8 sticky top-0 z-10">
          <h1 className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent capitalize">
            {tabTitles[activeTab]}
          </h1>
          <div className="flex items-center gap-3">
            <div className="flex bg-slate-100 rounded-xl p-1 text-xs font-bold">
              <button onClick={() => setLocale('zh-CN')} className={`px-2.5 py-1.5 rounded-lg ${locale === 'zh-CN' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400'}`}>中</button>
              <button onClick={() => setLocale('en')} className={`px-2.5 py-1.5 rounded-lg ${locale === 'en' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400'}`}>EN</button>
            </div>
            <button onClick={() => setShowWelcome(true)} className="hidden lg:inline-flex text-sm font-bold text-slate-500 hover:text-indigo-600">{t('help')}</button>
            <button onClick={() => setShowFeedback(true)} className="inline-flex text-sm font-bold text-slate-500 hover:text-indigo-600" title={locale === 'zh-CN' ? '反馈' : 'Feedback'}><span className="lg:hidden">💬</span><span className="hidden lg:inline">{locale === 'zh-CN' ? '反馈' : 'Feedback'}</span></button>
            <button onClick={() => setShowDataSettings(true)} className="inline-flex text-sm font-bold text-slate-500 hover:text-indigo-600" title={locale === 'zh-CN' ? '数据与隐私' : 'Data & Privacy'}><span className="lg:hidden">⚙</span><span className="hidden lg:inline">{locale === 'zh-CN' ? '数据' : 'Data'}</span></button>
            <span className="hidden xl:inline-flex text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1.5 rounded-full">{t('free')}</span>
            <button onClick={() => { setShowPricing(true); track('pro_viewed', { locale, version: '0.2.0-beta' }); }} className="text-sm font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 px-4 py-2 rounded-xl transition-colors">
              {t('pro')}
            </button>
            <button onClick={() => setShowApiKey(true)} className={`text-sm font-bold px-4 py-2 rounded-xl transition-colors ${apiKeyConnected ? 'text-emerald-700 bg-emerald-50 hover:bg-emerald-100' : 'text-slate-700 bg-slate-100 hover:bg-slate-200'}`}>
              {apiKeyConnected ? t('aiConnected') : t('connectAi')}
            </button>
            <ActivityMonitor onOpen={() => setShowCapture(true)} />
          </div>
        </header>

        <div className="p-4 md:p-8 flex-1 pb-24 md:pb-8">
          {activeTab === 'dashboard' && <Dashboard tasks={tasks} onUpdateTask={updateTask} onAddTask={addTask} onDeleteTask={deleteTask} onOpenCapture={() => setShowCapture(true)} />}
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
      {showPricing && <PricingModal onClose={() => setShowPricing(false)} />}
      {showApiKey && <ApiKeyModal onClose={() => setShowApiKey(false)} onChanged={() => setApiKeyConnected(hasUserApiKey())} />}
      {showCapture && <CaptureModal locale={locale} onClose={() => setShowCapture(false)} onAddTask={addTask} onConnectAi={() => setShowApiKey(true)} />}
      {showWelcome && <WelcomeModal locale={locale} onFinish={() => { localStorage.setItem('focusflow_onboarding_v1', 'done'); track('onboarding_completed', { locale, version: '0.2.0-beta' }); setShowWelcome(false); }} />}
      {showProductGuide && <ProductGuideModal onClose={() => setShowProductGuide(false)} onOpenAi={() => setShowApiKey(true)} />}
      {showFeedback && <FeedbackModal onClose={() => setShowFeedback(false)} onSubmitted={() => track('feedback_submitted', { locale, version: '0.2.0-beta' })} />}
      {showDataSettings && <DataSettingsModal tasks={tasks} onReplaceTasks={setTasks} onClose={() => setShowDataSettings(false)} />}
    </div>
  );
};

export default App;
