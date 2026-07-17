import React from 'react';

export type Locale = 'zh-CN' | 'en';
const STORAGE_KEY = 'focusflow_locale';

const copy = {
  'zh-CN': {
    today: '今日', board: '看板', calendar: '日历', archive: '归档', todayPlan: '今日计划', taskBoard: '任务看板', completed: '已完成',
    free: '免费版', pro: '查看 Pro', connectAi: '连接 AI', aiConnected: 'AI 已连接', capture: 'AI 捕捉', help: '使用导览',
    pending: '今日待处理', completedToday: '今日已完成', focus: '今日状态', clear: '清晰可行', allClear: '轻松自在', needsFocus: '需要聚焦', heavyLoad: '任务偏多', overdueFirst: '先处理逾期', report: '今日总结',
    addTitle: '记下要做的事', work: '工作', personal: '个人', addPlaceholder: '今天有什么需要推进？', addTask: '添加任务',
    priorities: '今天先做这些', topFive: '优先 5 项', emptyToday: '今天没有待处理任务，放心安排自己的时间吧。',
    drop: '拖入文本文件，或点击使用 AI 提取行动项', analyzing: 'AI 正在整理任务…', manual: '手动创建', auto: 'AI 捕捉', overdue: '逾期',
    save: '保存', cancel: '取消', deleteTask: '删除任务', deleteConfirm: '确定要删除这个任务吗？', confirm: '确认',
    todo: '待办', inProgress: '进行中', done: '已完成', reminder: '提醒时间', nextSteps: '下一步', addStep: '添加下一步…', moveBack: '上一步', nextStage: '下一阶段',
    archiveTitle: '完成记录', archiveEmpty: '还没有完成记录。完成一件任务后，它会出现在这里。', restore: '恢复任务', keep: '永久保留', unkeep: '取消保留', daysLeft: '{count} 天后自动清理',
    reportTitle: '今日总结', copy: '复制到剪贴板', close: '关闭', copied: '已复制',
    sidebarTitle: '每日自动早报', sidebarDesc: '每天首次打开，自动回顾昨天的进展，并整理逾期事项与今日任务。',
  },
  en: {
    today: 'Today', board: 'Board', calendar: 'Calendar', archive: 'Archive', todayPlan: 'Today', taskBoard: 'Task Board', completed: 'Completed',
    free: 'Free', pro: 'View Pro', connectAi: 'Connect AI', aiConnected: 'AI Connected', capture: 'AI Capture', help: 'Guide',
    pending: 'Pending Today', completedToday: 'Completed Today', focus: 'Today’s Status', clear: 'Clear & Ready', allClear: 'All Clear', needsFocus: 'Time to Focus', heavyLoad: 'Heavy Load', overdueFirst: 'Overdue First', report: 'Daily Report',
    addTitle: 'Add a task', work: 'Work', personal: 'Personal', addPlaceholder: 'What do you want to move forward today?', addTask: 'Add Task',
    priorities: 'Today’s Priorities', topFive: 'Top 5', emptyToday: 'Nothing is due today. Your time is yours.',
    drop: 'Drop a text file, or click to extract action items with AI', analyzing: 'AI is organizing your task…', manual: 'Manual', auto: 'AI Capture', overdue: 'Overdue',
    save: 'Save', cancel: 'Cancel', deleteTask: 'Delete Task', deleteConfirm: 'Are you sure you want to delete this task?', confirm: 'Confirm',
    todo: 'To Do', inProgress: 'In Progress', done: 'Done', reminder: 'Reminder', nextSteps: 'Next Steps', addStep: 'Add next step…', moveBack: 'Move Back', nextStage: 'Next Stage',
    archiveTitle: 'Completed Archive', archiveEmpty: 'No completed tasks yet. Finish one and it will appear here.', restore: 'Restore', keep: 'Keep Forever', unkeep: 'Unkeep', daysLeft: 'Auto-clears in {count} days',
    reportTitle: 'Daily Report', copy: 'Copy to Clipboard', close: 'Close', copied: 'Copied',
    sidebarTitle: 'Automatic Morning Brief', sidebarDesc: 'Your first visit each day reviews yesterday’s progress and organizes overdue and today’s tasks.',
  },
} as const;

type Key = keyof typeof copy.en;
type I18nValue = { locale: Locale; setLocale: (locale: Locale) => void; t: (key: Key, params?: Record<string, string | number>) => string };
const Context = React.createContext<I18nValue | null>(null);

export const I18nProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [locale, setLocaleState] = React.useState<Locale>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === 'zh-CN' || saved === 'en') return saved;
    return navigator.language.toLowerCase().startsWith('zh') ? 'zh-CN' : 'en';
  });
  const setLocale = (next: Locale) => { setLocaleState(next); localStorage.setItem(STORAGE_KEY, next); };
  const t = React.useCallback((key: Key, params?: Record<string, string | number>) => {
    let value: string = copy[locale][key];
    Object.entries(params || {}).forEach(([name, replacement]) => { value = value.replace(`{${name}}`, String(replacement)); });
    return value;
  }, [locale]);
  return React.createElement(Context.Provider, { value: { locale, setLocale, t } }, children);
};

export const useI18n = () => {
  const value = React.useContext(Context);
  if (!value) throw new Error('useI18n must be used inside I18nProvider');
  return value;
};
