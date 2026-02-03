
import React from 'react';
import { Task } from '../types';

interface ArchiveViewProps {
  tasks: Task[];
  onRestore: (id: string) => void;
  onTogglePermanent: (id: string, value: boolean) => void;
  onDeleteTask: (id: string) => void;
}

const ArchiveView: React.FC<ArchiveViewProps> = ({ tasks, onRestore, onTogglePermanent, onDeleteTask }) => {
  return (
    <div className="space-y-6">
      <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
        <h2 className="text-xl font-bold mb-6 text-slate-800">Completed Archives</h2>
        <div className="space-y-4">
          {tasks.map(task => (
            <div key={task.id} className="flex flex-col md:flex-row items-start md:items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-200 opacity-75 hover:opacity-100 transition-opacity gap-4 md:gap-0">
              <div className="flex items-center gap-4 w-full md:w-auto">
                <span className="text-emerald-500 font-bold shrink-0">✓</span>
                <div className="min-w-0 flex-1">
                  <h4 className="font-semibold text-slate-800 line-through decoration-slate-400 truncate">{task.title}</h4>
                  <p className="text-xs text-slate-500">Completed at {new Date(task.createdAt).toLocaleDateString()}</p>
                  {task.archivedAt && !task.isPermanent && (
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      Will auto-clear in {Math.max(0, 7 - Math.floor((Date.now() - task.archivedAt) / (24*60*60*1000)))} days
                    </p>
                  )}
                  {task.isPermanent && (
                    <p className="text-[10px] text-indigo-600 mt-0.5 font-bold">Kept Forever</p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-3 w-full md:w-auto justify-end">
                <button 
                  onClick={() => onTogglePermanent(task.id, !task.isPermanent)}
                  className={`text-xs font-bold px-3 py-1.5 rounded-lg transition-colors border ${task.isPermanent ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'}`}
                >
                  {task.isPermanent ? 'Unkeep' : 'Keep Forever'}
                </button>
                <button 
                  onClick={() => onRestore(task.id)}
                  className="text-xs font-bold text-indigo-600 hover:bg-indigo-50 px-3 py-1.5 rounded-lg transition-colors"
                >
                  Restore to Active
                </button>
                <button
                  onClick={() => {
                    if (confirm('Are you sure you want to permanently delete this task?')) {
                      onDeleteTask(task.id);
                    }
                  }}
                  className="text-xs font-bold text-red-400 hover:bg-red-50 hover:text-red-600 px-3 py-1.5 rounded-lg transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
          {tasks.length === 0 && (
            <div className="text-center py-20 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
              <p className="text-slate-400 font-medium italic">Your archive is empty. Get some work done!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ArchiveView;
