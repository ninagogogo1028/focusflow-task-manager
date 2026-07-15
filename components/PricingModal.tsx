import React from 'react';

interface PricingModalProps {
  onClose: () => void;
}

const PricingModal: React.FC<PricingModalProps> = ({ onClose }) => (
  <div className="fixed inset-0 bg-slate-950/50 backdrop-blur-sm z-[220] flex items-center justify-center p-4">
    <div className="bg-white w-full max-w-3xl rounded-[2rem] shadow-2xl overflow-hidden">
      <div className="p-7 md:p-9 border-b border-slate-100 flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-indigo-600">FocusFlow Plans</p>
          <h2 className="text-2xl md:text-3xl font-black mt-2">先免费开始，需要时再升级</h2>
          <p className="text-slate-500 mt-2">基础任务管理长期可用，Pro 为更深入的每日规划和 AI 能力服务。</p>
        </div>
        <button onClick={onClose} className="text-slate-400 hover:text-slate-700 text-2xl" aria-label="关闭">×</button>
      </div>

      <div className="grid md:grid-cols-2 gap-5 p-7 md:p-9 bg-slate-50">
        <section className="bg-white rounded-3xl border border-slate-200 p-6">
          <p className="font-bold text-slate-900">Free</p>
          <p className="text-3xl font-black mt-3">¥0</p>
          <ul className="mt-6 space-y-3 text-sm text-slate-600">
            <li>✓ 今日任务与快速记录</li>
            <li>✓ 工作 / 个人分类</li>
            <li>✓ 看板、日历和完成记录</li>
            <li>✓ 基础每日计划</li>
            <li>✓ 连接自己的 AI API</li>
          </ul>
          <button onClick={onClose} className="w-full mt-7 py-3 rounded-xl border border-slate-300 font-bold text-slate-700">继续使用免费版</button>
        </section>

        <section className="bg-slate-950 text-white rounded-3xl p-6 relative overflow-hidden">
          <span className="absolute top-5 right-5 text-xs font-bold bg-indigo-500 px-3 py-1 rounded-full">即将开放</span>
          <p className="font-bold">Pro</p>
          <div className="flex items-end gap-1 mt-3"><p className="text-3xl font-black">¥10</p><span className="text-slate-400 mb-1">/ 月</span></div>
          <ul className="mt-6 space-y-3 text-sm text-slate-300">
            <li>✓ 免配置的托管 AI 额度</li>
            <li>✓ 多设备云同步</li>
            <li>✓ AI 文件与内容拆任务</li>
            <li>✓ 历史总结与桌面增强能力</li>
          </ul>
          <button disabled className="w-full mt-7 py-3 rounded-xl bg-white/10 text-slate-400 font-bold cursor-not-allowed">Pro 开放后通知我</button>
          <div className="absolute -right-12 -bottom-16 w-48 h-48 rounded-full bg-indigo-500/20 blur-2xl" />
        </section>
      </div>
    </div>
  </div>
);

export default PricingModal;
