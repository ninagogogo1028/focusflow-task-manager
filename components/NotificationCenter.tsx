import React from 'react';

export interface NotificationItem {
  id: string;
  message: string;
  type?: 'info' | 'reminder';
}

interface NotificationCenterProps {
  notifications: NotificationItem[];
  onClose: (id: string) => void;
}

const NotificationCenter: React.FC<NotificationCenterProps> = ({ notifications, onClose }) => {
  return (
    <div className="fixed top-8 left-1/2 -translate-x-1/2 z-[100] space-y-3 w-[90vw] max-w-sm pointer-events-none">
      {notifications.map((note) => (
        <div 
          key={note.id} 
          className="bg-slate-900 text-white p-4 rounded-2xl shadow-2xl border border-white/10 animate-slide-in pointer-events-auto backdrop-blur-md flex items-start justify-between gap-3"
        >
          <div className="flex items-start gap-3">
            <span className="text-indigo-400 text-xl">
              {note.type === 'reminder' ? '⏰' : '🔔'}
            </span>
            <p className="text-sm font-medium leading-tight pt-1">{note.message}</p>
          </div>
          <button 
            onClick={() => onClose(note.id)}
            className="text-slate-400 hover:text-white transition-colors p-1"
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  );
};

export default NotificationCenter;
