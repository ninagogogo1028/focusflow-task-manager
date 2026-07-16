import React from 'react';
import { useI18n } from '../i18n';

const ProductGuideModal: React.FC<{ onClose: () => void; onOpenAi: () => void; }> = ({ onClose, onOpenAi }) => {
  const { locale } = useI18n();
  const zh = locale === 'zh-CN';
  const sections = zh ? [
    { icon: '☀️', title: '从今日计划开始', text: '首页汇总今天与逾期任务。状态卡会根据任务量动态提醒你轻松开始、保持聚焦或优先处理逾期。' },
    { icon: '✎', title: '快速记录任务', text: '输入事项，选择工作或个人分类并设置日期。任务可以在看板中推进、在日历中查看、完成后进入归档。' },
    { icon: '✦', title: 'AI 捕捉行动项', text: '连接你自己的 AI API 后，可粘贴会议记录、聊天摘要或选择 .txt / .md 文件，让 AI 提取任务和下一步。' },
    { icon: '🔔', title: '提醒与每日总结', text: '给任务设置提醒时间，并用“今日总结”快速回顾已完成与待处理事项。网页提醒需要保持页面打开并允许浏览器通知。' },
    { icon: '🔒', title: '数据与隐私', text: '当前免费版任务保存在你的浏览器本地，不会展示给其他用户。清理浏览器数据或更换设备时不会自动同步；云同步属于规划中的 Pro 能力。' },
  ] : [
    { icon: '☀️', title: 'Begin with Today', text: 'The home view brings together today’s and overdue tasks. Your status changes with workload so you know whether to relax, focus or clear overdue work first.' },
    { icon: '✎', title: 'Capture Tasks Quickly', text: 'Add a task, choose Work or Personal, and set a date. Move work on the Board, see it on the Calendar, and find completed items in Archive.' },
    { icon: '✦', title: 'Capture Actions with AI', text: 'Connect your own AI API, then paste notes or choose a .txt / .md file to extract a task and next steps.' },
    { icon: '🔔', title: 'Reminders & Daily Report', text: 'Set reminder times and use Daily Report to review completed and pending work. Browser reminders require the page to remain open and notification permission.' },
    { icon: '🔒', title: 'Data & Privacy', text: 'Free-plan tasks currently stay in this browser and are never shown to other users. Clearing browser data or changing devices will not sync them yet; cloud sync is planned for Pro.' },
  ];

  return (
    <div className="fixed inset-0 z-[250] bg-slate-950/45 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-4xl rounded-[2rem] shadow-2xl overflow-hidden max-h-[92vh] flex flex-col">
        <header className="p-7 md:p-9 border-b border-slate-100 flex items-start justify-between gap-5">
          <div><p className="text-xs font-black tracking-[0.2em] text-indigo-600">FOCUSFLOW GUIDE</p><h2 className="text-2xl md:text-3xl font-black mt-2">{zh ? '产品功能与使用说明' : 'Features & How to Use'}</h2><p className="text-slate-500 mt-2">{zh ? '陪伴你度过清晰的每一天✨' : 'Start every day with a clear plan.'}</p></div>
          <button onClick={onClose} className="text-2xl text-slate-400 hover:text-slate-700" aria-label={zh ? '关闭' : 'Close'}>×</button>
        </header>
        <div className="p-7 md:p-9 overflow-y-auto">
          <div className="grid md:grid-cols-2 gap-4">
            {sections.map((section) => <section key={section.title} className="rounded-2xl border border-slate-200 bg-slate-50/70 p-5"><div className="text-2xl mb-3">{section.icon}</div><h3 className="font-black text-slate-900">{section.title}</h3><p className="text-sm text-slate-600 leading-relaxed mt-2">{section.text}</p></section>)}
          </div>
          <div className="mt-6 rounded-2xl bg-indigo-50 border border-indigo-100 p-5 flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="flex-1"><h3 className="font-black text-indigo-950">{zh ? '推荐使用顺序' : 'Recommended workflow'}</h3><p className="text-sm text-indigo-800/80 mt-1">{zh ? '先添加真实任务 → 每天查看今日计划 → 在看板推进 → 完成后回顾。AI 是可选增强，不连接也能使用基础功能。' : 'Add real tasks → check Today each morning → move work on the Board → review when complete. AI is optional.'}</p></div>
            <button onClick={() => { onClose(); onOpenAi(); }} className="shrink-0 px-5 py-3 rounded-xl bg-indigo-600 text-white font-bold">{zh ? '连接 AI' : 'Connect AI'}</button>
          </div>
        </div>
        <footer className="p-5 border-t border-slate-100 flex justify-end"><button onClick={onClose} className="px-6 py-3 rounded-xl bg-slate-950 text-white font-bold">{zh ? '我知道了' : 'Got it'}</button></footer>
      </div>
    </div>
  );
};

export default ProductGuideModal;
