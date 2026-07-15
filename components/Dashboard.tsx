import React, { useState, useCallback } from 'react';
import { Task, TaskStatus } from '../types';
import { parseAutoTask } from '../services/geminiService';
import DailyReportModal from './DailyReportModal';
import CustomDatePicker from './CustomDatePicker';
import ConfirmationModal from './ConfirmationModal';

interface DashboardProps {
  tasks: Task[];
  onAddTask: (task: Task) => void;
  onUpdateTask: (id: string, updates: Partial<Task>) => void;
  onDeleteTask: (id: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ tasks, onAddTask, onUpdateTask, onDeleteTask }) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [quickTitle, setQuickTitle] = useState('');
  const [quickCategory, setQuickCategory] = useState<'work' | 'personal'>('work');
  const [quickDate, setQuickDate] = useState(new Date().toISOString().split('T')[0]);
  const [isDragging, setIsDragging] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showReport, setShowReport] = useState(false);

  // Confirmation Modal State
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
  });

  // Filter tasks to show only those due on or before today
  const activeTasks = tasks.filter(t => !t.isArchived && t.dueDate <= new Date().toISOString().split('T')[0]);
  const completedToday = tasks.filter(t => t.status === TaskStatus.COMPLETED && new Date(t.createdAt).toDateString() === new Date().toDateString()).length;

  const startEditing = (task: Task) => {
    setEditingId(task.id);
    setEditTitle(task.title);
  };

  const saveEdit = (id: string) => {
    if (editTitle.trim()) {
      onUpdateTask(id, { title: editTitle });
    }
    setEditingId(null);
  };

  const cancelEdit = () => {
    setEditingId(null);
  };

  const handleQuickAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickTitle.trim()) return;

    const newTask: Task = {
      id: Date.now().toString(),
      title: quickTitle,
      description: '',
      status: TaskStatus.TODO,
      createdAt: Date.now(),
      dueDate: quickDate,
      isArchived: false,
      source: 'manual',
      category: quickCategory,
      nextSteps: []
    };
    onAddTask(newTask);
    setQuickTitle('');
    setQuickDate(new Date().toISOString().split('T')[0]);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    setIsAnalyzing(true);

    const files: File[] = Array.from(e.dataTransfer.files as FileList);
    if (files.length > 0) {
      const file = files[0];
      const description = `User dropped a file: ${file.name} (Type: ${file.type}, Size: ${Math.round(file.size / 1024)}KB)`;
      
      const aiSuggestion = await parseAutoTask(description);
      
      const newTask: Task = {
        id: Date.now().toString(),
        title: aiSuggestion.title || `Process ${file.name}`,
        description: aiSuggestion.description || description,
        status: TaskStatus.TODO,
        createdAt: Date.now(),
        dueDate: new Date().toISOString().split('T')[0],
        nextSteps: aiSuggestion.nextSteps || [],
        source: 'auto',
        category: 'work', // Default dropped files to work
        isArchived: false,
      };
      onAddTask(newTask);
    }
    setIsAnalyzing(false);
  };

  return (
    <div 
      className="max-w-6xl mx-auto space-y-8"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <section className="bg-gradient-to-br from-slate-950 via-indigo-950 to-indigo-700 text-white rounded-[2rem] p-7 md:p-10 shadow-xl shadow-indigo-100 overflow-hidden relative">
        <div className="relative z-10 max-w-2xl">
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-indigo-200 mb-3">Start every day with a clear plan</p>
          <h2 className="text-3xl md:text-4xl font-black tracking-tight">每天打开，直接知道今天该做什么。</h2>
          <p className="mt-4 text-indigo-100 leading-relaxed">FocusFlow 汇总昨天未完成的事项、今天的任务与提醒，把忙乱变成一份可以马上开始的计划。</p>
        </div>
        <div className="absolute -right-12 -bottom-20 w-64 h-64 rounded-full bg-white/10 blur-2xl" />
      </section>

      {/* AI Dropzone Overlay */}
      {isDragging && (
        <div className="fixed inset-0 z-50 bg-indigo-600/20 backdrop-blur-md flex items-center justify-center border-4 border-dashed border-indigo-500 m-4 rounded-[3rem] animate-pulse">
          <div className="bg-white p-10 rounded-full shadow-2xl flex flex-col items-center">
            <span className="text-6xl mb-4">✨</span>
            <p className="text-xl font-bold text-indigo-700">Drop to capture task...</p>
          </div>
        </div>
      )}

      {/* Stats Header */}
      <div className="flex items-stretch justify-between">
         <div className="grid grid-cols-1 md:grid-cols-3 gap-6 flex-1">
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm transition-transform hover:scale-[1.02]">
            <p className="text-slate-500 text-sm font-medium">今日待处理</p>
            <h3 className="text-3xl font-bold mt-1">{activeTasks.filter(t => t.status !== TaskStatus.COMPLETED).length}</h3>
          </div>
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm transition-transform hover:scale-[1.02]">
            <p className="text-slate-500 text-sm font-medium">今日已完成</p>
            <h3 className="text-3xl font-bold mt-1 text-emerald-600">{completedToday}</h3>
          </div>
          <div className="bg-indigo-600 p-6 rounded-3xl shadow-lg shadow-indigo-100 text-white transition-transform hover:scale-[1.02]">
            <p className="text-indigo-100 text-sm font-medium">今日状态</p>
            <h3 className="text-3xl font-bold mt-1">清晰可行</h3>
          </div>
        </div>
        <button 
          onClick={() => setShowReport(true)}
          className="ml-6 bg-slate-900 text-white p-6 rounded-3xl font-semibold hover:bg-slate-800 transition-colors shadow-lg active:scale-95 flex items-center justify-center"
          title="Generate Daily Report"
        >
          <span className="text-base">今日总结</span>
        </button>
      </div>

      {/* Smart Dropzone Indicator */}
      <div className="bg-indigo-50 border-2 border-dashed border-indigo-200 p-6 rounded-3xl flex items-center justify-center gap-4 text-indigo-700 group transition-all hover:border-indigo-400">
        <span className="text-2xl group-hover:scale-125 transition-transform">{isAnalyzing ? '⌛' : '📥'}</span>
        <div className="text-sm font-medium">
          {isAnalyzing ? 'AI 正在整理任务...' : '拖入文件，让 AI 帮你提取下一步行动'}
        </div>
      </div>

      {/* Quick Add */}
      <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
        <h2 className="text-lg font-bold mb-4">记下要做的事</h2>
        <form onSubmit={handleQuickAdd} className="flex flex-col md:flex-row gap-4">
          <div className="flex w-full md:w-auto bg-slate-50 rounded-2xl p-1 border border-slate-200">
            <button
              type="button"
              onClick={() => setQuickCategory('work')}
              className={`flex-1 md:flex-none px-4 py-2 rounded-xl text-sm font-medium transition-all ${quickCategory === 'work' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}
            >
              工作
            </button>
            <button
              type="button"
              onClick={() => setQuickCategory('personal')}
              className={`flex-1 md:flex-none px-4 py-2 rounded-xl text-sm font-medium transition-all ${quickCategory === 'personal' ? 'bg-white shadow-sm text-emerald-600' : 'text-slate-400 hover:text-slate-600'}`}
            >
              个人
            </button>
          </div>
          <input
            type="text"
            value={quickTitle}
            onChange={(e) => setQuickTitle(e.target.value)}
            placeholder="今天有什么需要推进？"
            className="flex-1 bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
          />
          <CustomDatePicker 
            value={quickDate}
            onChange={setQuickDate}
          />
          <button className="w-full md:w-auto bg-slate-900 text-white px-8 py-4 md:py-0 rounded-2xl font-semibold hover:bg-slate-800 transition-colors shadow-lg active:scale-95">
            添加任务
          </button>
        </form>
      </div>

      {/* Task List Preview */}
      <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
        <h2 className="text-lg font-bold mb-6 flex items-center justify-between">
          今天先做这些
          <span className="text-xs text-slate-400 font-normal uppercase tracking-widest">优先 5 项</span>
        </h2>
        <div className="space-y-4">
          {activeTasks.slice(0, 5).map(task => (
            <div key={task.id} className="group flex flex-col md:flex-row md:items-center justify-between p-4 bg-slate-50 rounded-2xl hover:bg-slate-100 transition-all border border-transparent hover:border-slate-200 gap-4">
              <div className="flex items-center gap-4 flex-1">
                <div className={`w-3 h-3 rounded-full ${task.status === TaskStatus.IN_PROGRESS ? 'bg-amber-400 animate-pulse' : 'bg-slate-300'}`} />
                <div className="flex-1">
                  {editingId === task.id ? (
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        className="flex-1 text-sm font-semibold text-slate-800 bg-white border border-indigo-200 rounded px-2 py-1 focus:ring-2 focus:ring-indigo-500 outline-none"
                        autoFocus
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') saveEdit(task.id);
                          if (e.key === 'Escape') cancelEdit();
                        }}
                      />
                      <button onClick={() => saveEdit(task.id)} className="text-xs bg-indigo-600 text-white px-2 py-1 rounded">Save</button>
                      <button onClick={cancelEdit} className="text-xs bg-slate-200 text-slate-600 px-2 py-1 rounded">Cancel</button>
                    </div>
                  ) : (
                    <h4 className="font-semibold text-slate-800 flex items-center gap-2 group/title cursor-pointer" onClick={() => startEditing(task)}>
                      {task.title}
                      {task.category && (
                        <span className={`text-[9px] px-1.5 py-0.5 rounded uppercase font-bold tracking-wide ${task.category === 'work' ? 'bg-indigo-100 text-indigo-600' : 'bg-emerald-100 text-emerald-600'}`}>
                          {task.category}
                        </span>
                      )}
                      <span className="opacity-0 group-hover/title:opacity-100 text-slate-400 text-xs ml-2">✎</span>
                    </h4>
                  )}
                  <div className="flex items-center gap-3 mt-0.5">
                    <p className="text-xs text-slate-500 flex items-center gap-1">
                      {task.source === 'auto' ? <><span className="text-indigo-500">✨</span> Auto-captured</> : '✍️ Manual'}
                    </p>
                    {task.reminderTime && (
                      <div className="flex items-center gap-1 text-[10px] bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded font-bold">
                        ⏰ {task.reminderTime}
                      </div>
                    )}
                    {task.dueDate < new Date().toISOString().split('T')[0] && (
                       <div className="flex items-center gap-1 text-[10px] bg-rose-100 text-rose-700 px-1.5 py-0.5 rounded font-bold">
                        📅 Overdue: {task.dueDate}
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center justify-between md:justify-end gap-6 border-t md:border-t-0 pt-3 md:pt-0">
                 <div className="flex flex-col md:flex-row items-start md:items-center gap-2">
                   <input 
                    type="date"
                    value={task.dueDate}
                    onChange={(e) => onUpdateTask(task.id, { dueDate: e.target.value })}
                    className="text-[10px] bg-white border border-slate-200 rounded px-2 py-1 outline-none focus:ring-1 focus:ring-indigo-500 w-24"
                   />
                   <input 
                    type="time" 
                    value={task.reminderTime || ''}
                    onChange={(e) => onUpdateTask(task.id, { reminderTime: e.target.value })}
                    className="text-[10px] bg-white border border-slate-200 rounded px-2 py-1 outline-none focus:ring-1 focus:ring-indigo-500"
                   />
                   {task.nextSteps && task.nextSteps.length > 0 && (
                     <div className="flex flex-col items-start md:items-end">
                       <span className="text-[10px] text-slate-400 font-bold uppercase">Current Step</span>
                       <span className="text-xs bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full font-medium truncate max-w-[150px]">
                         {task.nextSteps[task.nextSteps.length - 1]}
                       </span>
                     </div>
                   )}
                 </div>
                 <div className="flex items-center gap-2">
                  <button 
                    onClick={() => onUpdateTask(task.id, { status: TaskStatus.COMPLETED, isArchived: true })}
                    className="w-10 h-10 flex items-center justify-center rounded-full border border-slate-200 bg-white group-hover:bg-emerald-500 group-hover:border-emerald-500 group-hover:text-white transition-all shadow-sm"
                  >
                    ✓
                  </button>
                  <button
                    onClick={() => {
                      setConfirmModal({
                        isOpen: true,
                        title: 'Delete Task',
                        message: 'Are you sure you want to delete this task?',
                        onConfirm: () => onDeleteTask(task.id)
                      });
                    }}
                    className="opacity-0 group-hover:opacity-100 text-slate-300 hover:text-red-500 transition-all p-2"
                    title="Delete task"
                  >
                    ✕
                  </button>
                 </div>
              </div>
            </div>
          ))}
          {activeTasks.length === 0 && (
            <div className="text-center py-10">
              <div className="text-4xl mb-2">🏖️</div>
              <p className="text-slate-400">今天没有待处理任务，放心安排自己的时间吧。</p>
            </div>
          )}
        </div>
      </div>

      {showReport && <DailyReportModal tasks={tasks} onClose={() => setShowReport(false)} />}
      
      <ConfirmationModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
        onConfirm={confirmModal.onConfirm}
        title={confirmModal.title}
        message={confirmModal.message}
        confirmText="Confirm"
        cancelText="Cancel"
      />
    </div>
  );
};

export default Dashboard;
