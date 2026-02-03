
import React, { useState } from 'react';
import { parseAutoTask } from '../services/geminiService';
import { Task, TaskStatus } from '../types';

interface ActivityMonitorProps {
  onAddTask: (task: Task) => void;
}

const ActivityMonitor: React.FC<ActivityMonitorProps> = ({ onAddTask }) => {
  const [isCapturing, setIsCapturing] = useState(false);

  const simulateActivity = async (type: 'file' | 'web') => {
    setIsCapturing(true);
    const mockActivities = {
      file: "Created a new file 'Marketing_Strategy_2025.pdf' in the /Projects/Drafts folder.",
      web: "Visited 'github.com/react-finance-app' and spent 45 minutes reading the README."
    };

    const description = mockActivities[type];
    const aiSuggestion = await parseAutoTask(description);

    const newTask: Task = {
      id: Date.now().toString(),
      title: aiSuggestion.title || "New Activity",
      description: aiSuggestion.description || description,
      status: TaskStatus.TODO,
      createdAt: Date.now(),
      dueDate: new Date().toISOString().split('T')[0],
      nextSteps: aiSuggestion.nextSteps || [],
      source: 'auto',
      isArchived: false,
    };

    onAddTask(newTask);
    setIsCapturing(false);
  };

  return (
    <div className="flex gap-2">
      <div className="relative group">
        <button
          disabled={isCapturing}
          className="flex items-center gap-2 bg-indigo-600 text-white px-3 md:px-4 py-2 rounded-lg text-xs md:text-sm font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50"
        >
          {isCapturing ? '🤖...' : <><span className="md:hidden">✨</span><span className="hidden md:inline">✨ Magic Capture</span></>}
        </button>
        <div className="absolute right-0 mt-2 w-48 bg-white border border-slate-200 rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 p-2">
          <p className="text-[10px] text-slate-400 font-bold uppercase px-3 py-1">Simulate OS Activity</p>
          <button 
            onClick={() => simulateActivity('file')}
            className="w-full text-left px-3 py-2 text-sm hover:bg-slate-50 rounded-lg"
          >
            📄 New File Detected
          </button>
          <button 
            onClick={() => simulateActivity('web')}
            className="w-full text-left px-3 py-2 text-sm hover:bg-slate-50 rounded-lg"
          >
            🌐 Web Session Ended
          </button>
        </div>
      </div>
    </div>
  );
};

export default ActivityMonitor;
