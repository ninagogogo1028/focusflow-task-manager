import React from 'react';
import { Task, TaskStatus } from '../types';
import { useI18n } from '../i18n';

interface DailyReportModalProps {
  tasks: Task[];
  onClose: () => void;
}

const DailyReportModal: React.FC<DailyReportModalProps> = ({ tasks, onClose }) => {
  const { locale, t } = useI18n();
  const zh = locale === 'zh-CN';
  const todayStr = new Date().toDateString();
  const completedToday = tasks.filter(t => t.status === TaskStatus.COMPLETED && new Date(t.createdAt).toDateString() === todayStr);
  const pending = tasks.filter(t => t.status !== TaskStatus.COMPLETED && !t.isArchived);

  const generateReport = () => {
    let report = `📅 ${zh ? '今日总结' : 'Daily Report'} - ${new Date().toLocaleDateString(locale)}\n\n`;
    
    report += `✅ ${zh ? '今日完成' : 'Completed Today'}:\n`;
    if (completedToday.length === 0) report += `  - ${zh ? '暂无' : 'None'}\n`;
    completedToday.forEach(t => report += `  - [${t.category?.toUpperCase() || 'TASK'}] ${t.title}\n`);
    
    report += `\n🚧 ${zh ? '待办 / 进行中' : 'Pending / In Progress'}:\n`;
    if (pending.length === 0) report += `  - ${zh ? '暂无' : 'None'}\n`;
    pending.forEach(t => report += `  - [${t.category?.toUpperCase() || 'TASK'}] ${t.title} ${t.nextSteps?.length ? `(Next: ${t.nextSteps[t.nextSteps.length-1]})` : ''}\n`);

    return report;
  };

  const reportText = generateReport();

  const handleCopy = () => {
    navigator.clipboard.writeText(reportText);
    alert(t('copied'));
  };

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[200] flex items-center justify-center p-6">
      <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden animate-pop-in flex flex-col max-h-[90vh]">
        <div className="bg-slate-900 p-6 text-white flex justify-between items-center">
          <h2 className="text-xl font-bold">{t('reportTitle')}</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white">✕</button>
        </div>
        
        <div className="p-6 flex-1 overflow-auto">
          <textarea 
            readOnly
            value={reportText}
            className="w-full h-96 bg-slate-50 border border-slate-200 rounded-xl p-4 font-mono text-sm leading-relaxed focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        
        <div className="p-6 border-t border-slate-100 flex gap-4">
          <button 
            onClick={handleCopy}
            className="flex-1 bg-indigo-600 text-white py-3 rounded-xl font-bold hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200"
          >
            {t('copy')}
          </button>
          <button 
            onClick={onClose}
            className="flex-1 bg-white text-slate-700 border border-slate-200 py-3 rounded-xl font-bold hover:bg-slate-50 transition-colors"
          >
            {t('close')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DailyReportModal;
