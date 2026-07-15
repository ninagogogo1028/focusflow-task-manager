
import React from 'react';

interface SidebarProps {
  activeTab: 'dashboard' | 'kanban' | 'calendar' | 'archive';
  setActiveTab: (tab: 'dashboard' | 'kanban' | 'calendar' | 'archive') => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
  const menuItems = [
    { id: 'dashboard', icon: '☀️', label: '今日' },
    { id: 'kanban', icon: '📋', label: '看板' },
    { id: 'calendar', icon: '📅', label: '日历' },
    { id: 'archive', icon: '📦', label: '完成' },
  ];

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-64 bg-white border-r border-slate-200 flex-col p-4">
        <div className="mb-10 px-4 py-2 flex items-center justify-between">
          <span className="text-2xl font-black tracking-tighter text-indigo-600">FocusFlow</span>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Today</span>
          </div>
        </div>
        
        <nav className="space-y-1">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id as any)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                activeTab === item.id 
                  ? 'bg-indigo-50 text-indigo-700 font-semibold shadow-sm' 
                  : 'text-slate-500 hover:bg-slate-100'
              }`}
            >
              <span className="text-xl">{item.icon}</span>
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="mt-auto p-5 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-[2rem] border border-indigo-100/50">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-lg">🤖</span>
            <p className="text-xs text-indigo-900 font-bold tracking-wider">每日清晰计划</p>
          </div>
          <p className="text-xs text-indigo-700/80 leading-relaxed font-medium">
            自动整理逾期事项与今日任务，让你打开 FocusFlow 就知道先做什么。
          </p>
        </div>
      </aside>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 flex justify-around p-2 z-50 pb-safe">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id as any)}
            className={`flex flex-col items-center justify-center p-2 rounded-xl transition-all duration-200 ${
              activeTab === item.id 
                ? 'text-indigo-600' 
                : 'text-slate-400'
            }`}
          >
            <span className="text-2xl mb-1">{item.icon}</span>
            <span className="text-[10px] font-medium">{item.label}</span>
          </button>
        ))}
      </nav>
    </>
  );
};

export default Sidebar;
