import React, { useState } from 'react';
import { Locale } from '../i18n';

interface WelcomeModalProps { locale: Locale; onFinish: () => void; }

const WelcomeModal: React.FC<WelcomeModalProps> = ({ locale, onFinish }) => {
  const [step, setStep] = useState(0);
  const zh = locale === 'zh-CN';
  const pages = [
    {
      eyebrow: 'FOCUSFLOW',
      title: zh ? '陪伴你度过清晰的每一天✨' : 'Start every day with a clear plan.',
      text: zh ? '把昨天没完成的、今天要推进的，都收进一份可以马上开始的计划。' : 'Bring yesterday’s unfinished work and today’s priorities into one plan you can act on.',
      visual: '☀️',
    },
    {
      eyebrow: zh ? '三步开始' : 'THREE SIMPLE STEPS',
      title: zh ? '记录、安排、完成' : 'Capture, plan, complete',
      text: zh ? '添加任务并区分工作与个人；在看板推进状态；每天从“今天先做这些”开始。' : 'Add work and personal tasks, move them through the board, and begin with today’s priorities.',
      visual: '✓',
    },
    {
      eyebrow: zh ? '可选 AI' : 'OPTIONAL AI',
      title: zh ? '用你自己的 AI，帮你整理行动项' : 'Use your own AI to organize action items',
      text: zh ? '你可以连接已有的 AI API，再粘贴文字或选择文本文件。基础任务管理无需连接 AI。' : 'Connect an AI API you already have, then paste text or choose a text file. Core task management works without AI.',
      visual: '✦',
    },
  ];
  const page = pages[step];

  return (
    <div className="fixed inset-0 z-[300] bg-slate-950/45 backdrop-blur-md flex items-center justify-center p-4">
      <div className="w-full max-w-4xl bg-white rounded-[2rem] shadow-2xl overflow-hidden grid md:grid-cols-[0.9fr_1.1fr]">
        <div className="bg-gradient-to-br from-indigo-600 to-violet-500 min-h-56 md:min-h-[500px] flex items-center justify-center text-white relative overflow-hidden">
          <div className="text-[7rem] md:text-[9rem] font-black opacity-95 relative z-10">{page.visual}</div>
          <div className="absolute w-72 h-72 rounded-full border border-white/20" />
          <div className="absolute w-96 h-96 rounded-full border border-white/10" />
        </div>
        <div className="p-8 md:p-12 flex flex-col min-h-[420px] md:min-h-[500px]">
          <div className="flex gap-2 mb-auto">{pages.map((_, i) => <span key={i} className={`h-1.5 rounded-full transition-all ${i === step ? 'w-10 bg-indigo-600' : 'w-5 bg-slate-200'}`} />)}</div>
          <div className="my-10">
            <p className="text-xs font-black tracking-[0.2em] text-indigo-600 mb-4">{page.eyebrow}</p>
            <h1 className="text-3xl md:text-4xl font-black text-slate-950 tracking-tight leading-tight">{page.title}</h1>
            <p className="mt-5 text-slate-500 leading-relaxed">{page.text}</p>
          </div>
          <div className="flex items-center justify-between gap-3">
            <button onClick={onFinish} className="text-sm font-bold text-slate-400 hover:text-slate-700">{zh ? '跳过导览' : 'Skip'}</button>
            <button onClick={() => step === pages.length - 1 ? onFinish() : setStep(step + 1)} className="bg-slate-950 text-white px-7 py-3.5 rounded-xl font-bold hover:bg-indigo-700 transition-colors">
              {step === pages.length - 1 ? (zh ? '开始使用' : 'Get Started') : (zh ? '下一步' : 'Next')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WelcomeModal;
