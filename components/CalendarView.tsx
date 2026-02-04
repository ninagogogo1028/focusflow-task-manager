import React, { useState } from 'react';
import { Task } from '../types';

interface CalendarViewProps {
  tasks: Task[];
  onSelectTask: (id: string) => void;
}

const CalendarView: React.FC<CalendarViewProps> = ({ tasks }) => {
  const [current, setCurrent] = useState(new Date());
  const daysInMonth = new Date(current.getFullYear(), current.getMonth() + 1, 0).getDate();
  const startDay = new Date(current.getFullYear(), current.getMonth(), 1).getDay();

  const calendarDays = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const blanks = Array.from({ length: startDay }, (_, i) => i);

  return (
    <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm">
      <div className="flex justify-between items-center mb-10">
        <h2 className="text-2xl font-bold text-slate-800">
          {`${current.getFullYear()}/${(current.getMonth() + 1).toString().padStart(2, '0')}`}
        </h2>
        <div className="flex items-center gap-2">
            <button 
              onClick={() => setCurrent(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1))}
              className="px-3 py-1.5 text-sm bg-slate-50 border border-slate-200 rounded-xl hover:bg-slate-100"
            >
              ←
            </button>
            <span className="px-3 py-1.5 text-sm font-semibold text-slate-700 bg-slate-50 border border-slate-200 rounded-xl min-w-[120px] text-center">
              {`${current.getFullYear()}/${(current.getMonth() + 1).toString().padStart(2, '0')}`}
            </span>
            <button 
              onClick={() => setCurrent(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1))}
              className="px-3 py-1.5 text-sm bg-slate-50 border border-slate-200 rounded-xl hover:bg-slate-100"
            >
              →
            </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-px bg-slate-100 border border-slate-100 rounded-2xl overflow-hidden">
        {['SUN.', 'MON.', 'TUE.', 'WED.', 'THU.', 'FRI.', 'SAT.'].map(d => (
          <div key={d} className="bg-slate-50 p-2 md:p-4 text-center text-[10px] md:text-xs font-bold text-slate-400 uppercase">
            {d}
          </div>
        ))}

        {blanks.map(b => (
          <div key={`blank-${b}`} className="bg-white h-24 md:h-32 p-1 md:p-2" />
        ))}

        {calendarDays.map(day => {
          const dateStr = `${current.getFullYear()}-${(current.getMonth() + 1).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
          const dayTasks = tasks.filter(t => t.dueDate === dateStr && !t.isArchived);

          return (
            <div key={day} className={`bg-white h-24 md:h-32 p-1 md:p-3 border-t border-slate-100 hover:bg-slate-50 transition-colors ${day === new Date().getDate() && current.getMonth() === new Date().getMonth() && current.getFullYear() === new Date().getFullYear() ? 'bg-indigo-50/30 ring-1 ring-inset ring-indigo-200' : ''}`}>
              <span className={`text-xs md:text-sm font-semibold mb-1 md:mb-2 block ${day === new Date().getDate() && current.getMonth() === new Date().getMonth() && current.getFullYear() === new Date().getFullYear() ? 'text-indigo-600' : 'text-slate-600'}`}>
                {day}
              </span>
              <div className="space-y-1">
                {dayTasks.map(task => (
                  <div key={task.id} className="text-[9px] md:text-[10px] bg-indigo-100 text-indigo-700 px-1 md:px-1.5 py-0.5 rounded truncate font-medium flex gap-1">
                    {task.reminderTime && <span className="opacity-75 hidden md:inline">{task.reminderTime}</span>}
                    <span className="truncate">{task.title}</span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CalendarView;
