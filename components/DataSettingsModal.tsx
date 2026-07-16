import React, { useRef, useState } from 'react';
import { Task, TaskStatus } from '../types';
import { hasAnalyticsConsent, setAnalyticsConsent, track } from '../services/analytics';
import { useI18n } from '../i18n';

const isTask = (value: unknown): value is Task => {
  if (!value || typeof value !== 'object') return false;
  const task = value as Partial<Task>;
  return typeof task.id === 'string' && typeof task.title === 'string' && typeof task.dueDate === 'string' && Object.values(TaskStatus).includes(task.status as TaskStatus);
};

const DataSettingsModal: React.FC<{ tasks: Task[]; onReplaceTasks: (tasks: Task[]) => void; onClose: () => void }> = ({ tasks, onReplaceTasks, onClose }) => {
  const { locale } = useI18n(); const zh = locale === 'zh-CN';
  const [analytics, setAnalytics] = useState(hasAnalyticsConsent());
  const [message, setMessage] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const exportData = () => {
    const payload = { product: 'FocusFlow', version: '0.2.0-beta', exportedAt: new Date().toISOString(), tasks };
    const url = URL.createObjectURL(new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' }));
    const link = document.createElement('a'); link.href = url; link.download = `focusflow-backup-${new Date().toISOString().slice(0, 10)}.json`; link.click(); URL.revokeObjectURL(url);
    track('data_exported', { version: '0.2.0-beta' });
  };

  const importData = async (file?: File) => {
    if (!file || file.size > 5_000_000) { setMessage(zh ? '请选择 5MB 以内的 FocusFlow JSON 文件。' : 'Choose a FocusFlow JSON file under 5MB.'); return; }
    try {
      const parsed = JSON.parse(await file.text());
      const incoming = Array.isArray(parsed) ? parsed : parsed.tasks;
      if (!Array.isArray(incoming) || !incoming.every(isTask)) throw new Error('invalid');
      if (!confirm(zh ? `导入会替换当前 ${tasks.length} 个任务，继续吗？` : `Import will replace your current ${tasks.length} tasks. Continue?`)) return;
      onReplaceTasks(incoming); setMessage(zh ? `已导入 ${incoming.length} 个任务。` : `Imported ${incoming.length} tasks.`); track('data_imported', { result: 'success', version: '0.2.0-beta' });
    } catch { setMessage(zh ? '文件格式无效，没有修改当前任务。' : 'Invalid backup. Your current tasks were not changed.'); }
    if (inputRef.current) inputRef.current.value = '';
  };

  const clearData = () => {
    if (!confirm(zh ? '确定清除本机的全部任务吗？此操作无法撤销，建议先导出备份。' : 'Clear every task on this device? This cannot be undone. Export a backup first.')) return;
    onReplaceTasks([]); setMessage(zh ? '本机任务已清除。' : 'Local tasks cleared.');
  };

  const toggleAnalytics = (enabled: boolean) => { setAnalytics(enabled); setAnalyticsConsent(enabled); if (enabled) track('app_opened', { locale, version: '0.2.0-beta' }); };

  return <div className="fixed inset-0 z-[255] bg-slate-950/45 backdrop-blur-sm flex items-center justify-center p-4"><div className="bg-white w-full max-w-2xl rounded-[2rem] shadow-2xl max-h-[92vh] overflow-y-auto p-7 md:p-9">
    <div className="flex justify-between gap-4"><div><p className="text-xs font-black tracking-[0.2em] text-indigo-600">DATA & PRIVACY</p><h2 className="text-2xl font-black mt-2">{zh ? '数据与隐私设置' : 'Data & Privacy'}</h2></div><button onClick={onClose} className="text-2xl text-slate-400">×</button></div>
    <section className="mt-6 rounded-2xl border border-slate-200 p-5"><h3 className="font-black">{zh ? '本机数据' : 'Local data'}</h3><p className="text-sm text-slate-500 leading-relaxed mt-2">{zh ? '当前任务保存在这个浏览器中，不会自动同步到其他设备。导出文件包含你的任务内容，请妥善保管。' : 'Tasks are stored in this browser and do not sync yet. Export files contain your task content, so keep them private.'}</p><div className="flex flex-wrap gap-3 mt-4"><button onClick={exportData} className="px-4 py-2.5 rounded-xl bg-slate-950 text-white text-sm font-bold">{zh ? '导出备份' : 'Export backup'}</button><button onClick={() => inputRef.current?.click()} className="px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-bold">{zh ? '导入备份' : 'Import backup'}</button><input ref={inputRef} type="file" accept="application/json,.json" hidden onChange={(e) => importData(e.target.files?.[0])} /></div></section>
    <section className="mt-4 rounded-2xl border border-slate-200 p-5"><div className="flex items-start justify-between gap-5"><div><h3 className="font-black">{zh ? '匿名使用统计' : 'Anonymous analytics'}</h3><p className="text-sm text-slate-500 leading-relaxed mt-2">{zh ? '帮助我们了解导览完成、任务创建、功能使用和错误情况。不会上传任务标题、描述、文件内容、AI Prompt 或 API Key。' : 'Helps us understand onboarding, feature use and errors. Task titles, descriptions, files, prompts and API keys are never sent.'}</p></div><button onClick={() => toggleAnalytics(!analytics)} role="switch" aria-checked={analytics} className={`w-12 h-7 shrink-0 rounded-full p-1 transition-colors ${analytics ? 'bg-indigo-600' : 'bg-slate-200'}`}><span className={`block w-5 h-5 bg-white rounded-full transition-transform ${analytics ? 'translate-x-5' : ''}`} /></button></div></section>
    <section className="mt-4 rounded-2xl border border-rose-100 bg-rose-50/50 p-5"><h3 className="font-black text-rose-900">{zh ? '清除本机任务' : 'Clear local tasks'}</h3><p className="text-sm text-rose-800/70 mt-2">{zh ? '只清除任务，不会删除你的 AI 配置和语言偏好。' : 'Clears tasks only. Your AI configuration and language preference remain.'}</p><button onClick={clearData} className="mt-4 px-4 py-2.5 rounded-xl border border-rose-200 bg-white text-rose-600 text-sm font-bold">{zh ? '清除全部任务' : 'Clear all tasks'}</button></section>
    {message && <p className="mt-4 text-sm bg-indigo-50 text-indigo-700 p-3 rounded-xl">{message}</p>}
    <div className="mt-6 flex items-center justify-between"><span className="text-xs text-slate-400">FocusFlow 0.2.0-beta</span><button onClick={onClose} className="px-6 py-3 rounded-xl bg-indigo-600 text-white font-bold">{zh ? '完成' : 'Done'}</button></div>
  </div></div>;
};

export default DataSettingsModal;
