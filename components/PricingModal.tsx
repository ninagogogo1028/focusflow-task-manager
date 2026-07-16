import React from 'react';
import { useI18n } from '../i18n';

interface PricingModalProps {
  onClose: () => void;
}

const PricingModal: React.FC<PricingModalProps> = ({ onClose }) => {
  const { locale } = useI18n(); const zh = locale === 'zh-CN';
  return (
  <div className="fixed inset-0 bg-slate-950/50 backdrop-blur-sm z-[220] flex items-center justify-center p-4">
    <div className="bg-white w-full max-w-3xl rounded-[2rem] shadow-2xl overflow-hidden">
      <div className="p-7 md:p-9 border-b border-slate-100 flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-indigo-600">FocusFlow Plans</p>
          <h2 className="text-2xl md:text-3xl font-black mt-2">{zh ? '先免费开始，需要时再升级' : 'Start free. Upgrade when you need more.'}</h2>
          <p className="text-slate-500 mt-2">{zh ? '基础任务管理长期可用，Pro 为更深入的每日规划和 AI 能力服务。' : 'Core task management stays free. Pro adds deeper planning and hosted AI.'}</p>
        </div>
        <button onClick={onClose} className="text-slate-400 hover:text-slate-700 text-2xl" aria-label="关闭">×</button>
      </div>

      <div className="grid md:grid-cols-2 gap-5 p-7 md:p-9 bg-slate-50">
        <section className="bg-white rounded-3xl border border-slate-200 p-6">
          <p className="font-bold text-slate-900">Free</p>
          <p className="text-3xl font-black mt-3">¥0</p>
          <ul className="mt-6 space-y-3 text-sm text-slate-600">
            <li>✓ {zh ? '今日任务与快速记录' : 'Today list and quick capture'}</li><li>✓ {zh ? '工作 / 个人分类' : 'Work / personal categories'}</li><li>✓ {zh ? '看板、日历和完成记录' : 'Board, calendar and archive'}</li><li>✓ {zh ? '基础每日计划' : 'Basic daily plan'}</li><li>✓ {zh ? '连接自己的 AI API' : 'Connect your own AI API'}</li>
          </ul>
          <button onClick={onClose} className="w-full mt-7 py-3 rounded-xl border border-slate-300 font-bold text-slate-700">{zh ? '继续使用免费版' : 'Continue with Free'}</button>
        </section>

        <section className="bg-slate-950 text-white rounded-3xl p-6 relative overflow-hidden">
          <span className="absolute top-5 right-5 text-xs font-bold bg-indigo-500 px-3 py-1 rounded-full">{zh ? '即将开放' : 'Coming soon'}</span>
          <p className="font-bold">Pro</p>
          <div className="flex items-end gap-1 mt-3"><p className="text-3xl font-black">¥10</p><span className="text-slate-400 mb-1">/ 月</span></div>
          <ul className="mt-6 space-y-3 text-sm text-slate-300">
            <li>✓ {zh ? '免配置的托管 AI 额度' : 'Hosted AI allowance'}</li><li>✓ {zh ? '多设备云同步' : 'Multi-device sync'}</li><li>✓ {zh ? 'AI 文件与内容拆任务' : 'AI content-to-task capture'}</li><li>✓ {zh ? '历史总结与桌面增强能力' : 'History insights and desktop tools'}</li>
          </ul>
          <button disabled className="w-full mt-7 py-3 rounded-xl bg-white/10 text-slate-400 font-bold cursor-not-allowed">{zh ? 'Pro 开放后通知我' : 'Notify me when Pro launches'}</button>
          <div className="absolute -right-12 -bottom-16 w-48 h-48 rounded-full bg-indigo-500/20 blur-2xl" />
        </section>
      </div>
    </div>
  </div>
  );
};

export default PricingModal;
