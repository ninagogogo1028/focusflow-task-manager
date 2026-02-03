
import React, { useState } from 'react';
import { Task, TaskStatus } from '../types';

interface KanbanViewProps {
  tasks: Task[];
  onUpdateStatus: (id: string, status: TaskStatus) => void;
  onUpdateTask: (id: string, updates: Partial<Task>) => void;
  onDeleteTask: (id: string) => void;
}

const KanbanView: React.FC<KanbanViewProps> = ({ tasks, onUpdateStatus, onUpdateTask, onDeleteTask }) => {
  const [newStepInputs, setNewStepInputs] = useState<Record<string, string>>({});
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');

  const columns: { title: string; status: TaskStatus; color: string }[] = [
    { title: 'To Do', status: TaskStatus.TODO, color: 'bg-slate-100' },
    { title: 'In Progress', status: TaskStatus.IN_PROGRESS, color: 'bg-amber-50' },
    { title: 'Done', status: TaskStatus.COMPLETED, color: 'bg-emerald-50' },
  ];

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

  const getTasksByStatus = (status: TaskStatus) => {
    if (status === TaskStatus.COMPLETED) {
      return tasks.filter(t => t.status === status);
    }
    return tasks.filter(t => t.status === status && !t.isArchived);
  };

  const handleAddStep = (taskId: string, steps: string[] = []) => {
    const value = newStepInputs[taskId];
    if (!value || !value.trim()) return;
    
    onUpdateTask(taskId, { nextSteps: [...steps, value.trim()] });
    setNewStepInputs(prev => ({ ...prev, [taskId]: '' }));
  };

  const handleRemoveStep = (taskId: string, steps: string[], index: number) => {
    const updatedSteps = [...steps];
    updatedSteps.splice(index, 1);
    onUpdateTask(taskId, { nextSteps: updatedSteps });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-full">
      {columns.map(col => (
        <div key={col.status} className={`flex flex-col rounded-3xl p-6 ${col.color} border border-slate-200/50`}>
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-slate-700 flex items-center gap-2">
              {col.title}
              <span className="bg-white/50 text-slate-500 text-[10px] px-2 py-0.5 rounded-full border border-slate-200">
                {getTasksByStatus(col.status).length}
              </span>
            </h3>
          </div>

          <div className="flex-1 space-y-4 overflow-y-auto">
            {getTasksByStatus(col.status).map(task => (
              <div 
                key={task.id} 
                className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow cursor-grab active:cursor-grabbing"
              >
                <div className="flex justify-between items-start mb-2">
                  {editingId === task.id ? (
                    <div className="flex items-center gap-2 w-full">
                      <input
                        type="text"
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        className="flex-1 text-sm font-bold text-slate-800 bg-white border border-indigo-200 rounded px-2 py-1 focus:ring-2 focus:ring-indigo-500 outline-none"
                        autoFocus
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') saveEdit(task.id);
                          if (e.key === 'Escape') cancelEdit();
                        }}
                      />
                      <button onClick={() => saveEdit(task.id)} className="text-[10px] bg-indigo-600 text-white px-2 py-1 rounded">Save</button>
                      <button onClick={cancelEdit} className="text-[10px] bg-slate-200 text-slate-600 px-2 py-1 rounded">Cancel</button>
                    </div>
                  ) : (
                    <h4 
                      className="font-bold text-slate-800 leading-tight group/title cursor-pointer flex-1" 
                      onClick={() => startEditing(task)}
                    >
                      {task.title}
                      <span className="opacity-0 group-hover/title:opacity-100 text-slate-400 text-xs ml-2 font-normal">✎</span>
                    </h4>
                  )}
                  {editingId !== task.id && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (confirm('Are you sure you want to delete this task?')) {
                          onDeleteTask(task.id);
                        }
                      }}
                      className="text-slate-300 hover:text-red-500 transition-colors px-2"
                      title="Delete task"
                    >
                      ✕
                    </button>
                  )}
                </div>
                
                {task.description && (
                  <p className="text-xs text-slate-500 mb-4 line-clamp-2">{task.description}</p>
                )}

                <div className="mt-4 space-y-4">
                  {/* 提醒时间设置 */}
                  <div className="flex flex-col gap-1.5 p-3 bg-indigo-50/50 rounded-xl border border-indigo-100">
                    <label className="text-[10px] font-bold text-indigo-400 uppercase flex items-center gap-1">
                      ⏰ Reminder Time
                    </label>
                    <input 
                      type="time"
                      value={task.reminderTime || ''}
                      onChange={(e) => onUpdateTask(task.id, { reminderTime: e.target.value })}
                      className="text-xs bg-white border border-indigo-100 rounded-lg px-2 py-1.5 focus:ring-1 focus:ring-indigo-500 outline-none text-indigo-700"
                    />
                  </div>

                  {/* 工作流步骤 */}
                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Workflow Next Steps</label>
                    <div className="space-y-1.5">
                      {(task.nextSteps || []).map((step, idx) => (
                        <div key={idx} className="flex items-center justify-between gap-2 bg-slate-50 border border-slate-100 rounded-lg px-2.5 py-1.5 group/step">
                          <span className="text-xs text-slate-600 font-medium truncate">{step}</span>
                          <button 
                            onClick={() => handleRemoveStep(task.id, task.nextSteps || [], idx)}
                            className="text-slate-300 hover:text-red-500 transition-colors opacity-0 group-hover/step:opacity-100"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>

                    <div className="flex gap-1 mt-1">
                      <input 
                        type="text"
                        value={newStepInputs[task.id] || ''}
                        onChange={(e) => setNewStepInputs(prev => ({ ...prev, [task.id]: e.target.value }))}
                        onKeyDown={(e) => e.key === 'Enter' && handleAddStep(task.id, task.nextSteps)}
                        placeholder="Add next step..."
                        className="flex-1 text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 focus:ring-1 focus:ring-indigo-500 outline-none"
                      />
                      <button 
                        onClick={() => handleAddStep(task.id, task.nextSteps)}
                        className="bg-indigo-600 text-white w-8 h-8 rounded-lg flex items-center justify-center font-bold hover:bg-indigo-700 transition-colors"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                    {col.status !== TaskStatus.TODO && (
                      <button 
                        onClick={() => onUpdateStatus(task.id, col.status === TaskStatus.IN_PROGRESS ? TaskStatus.TODO : TaskStatus.IN_PROGRESS)}
                        className="text-[10px] font-bold text-indigo-600 hover:underline"
                      >
                        Move Back
                      </button>
                    )}
                    <div className="flex-1" />
                    {col.status !== TaskStatus.COMPLETED && (
                      <button 
                        onClick={() => onUpdateStatus(task.id, col.status === TaskStatus.TODO ? TaskStatus.IN_PROGRESS : TaskStatus.COMPLETED)}
                        className="text-[10px] font-bold text-indigo-600 hover:underline"
                      >
                        Next Stage
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default KanbanView;
