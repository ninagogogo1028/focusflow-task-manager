import React, { useState } from 'react';
import { Task, TaskStatus } from '../types';
import { parseAutoTask } from '../services/geminiService';
import { hasUserApiKey } from '../services/apiKeyStorage';
import { Locale } from '../i18n';
import { track } from '../services/analytics';

interface CaptureModalProps { locale: Locale; onClose: () => void; onAddTask: (task: Task) => void; onConnectAi: () => void; }

const CaptureModal: React.FC<CaptureModalProps> = ({ locale, onClose, onAddTask, onConnectAi }) => {
  const zh = locale === 'zh-CN';
  const [content, setContent] = useState('');
  const [fileName, setFileName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const selectFile = async (file?: File) => {
    if (!file) return;
    setFileName(file.name);
    if (file.size > 100_000) { setContent(''); setError(zh ? '当前支持 100KB 以内的文本文件。' : 'Text files must be under 100KB.'); return; }
    const extension = file.name.split('.').pop()?.toLowerCase();
    if (!extension || !['txt', 'md', 'csv', 'json'].includes(extension)) {
      setContent('');
      setError(zh ? '当前支持 .txt、.md、.csv 和 .json 文本文件。' : 'Choose a .txt, .md, .csv or .json text file.');
      return;
    }
    try {
      const text = await file.text();
      if (!text.trim()) throw new Error('empty_file');
      setContent(text);
      setError('');
    } catch {
      setContent('');
      setError(zh ? '无法读取该文件，请确认它是 UTF-8 文本文件。' : 'Could not read this file. Make sure it is a UTF-8 text file.');
    }
  };

  const capture = async () => {
    if (!hasUserApiKey()) { onClose(); onConnectAi(); return; }
    if (!content.trim()) { setError(zh ? '请先粘贴文字或选择文本文件。' : 'Paste text or choose a text file first.'); return; }
    setLoading(true); setError('');
    track('ai_capture_started', { locale, version: '0.2.0-beta' });
    try {
      const suggestion = await parseAutoTask(fileName ? `${zh ? '从文件提取任务' : 'Extract a task from file'}: ${fileName}` : content.slice(0, 500), content);
      onAddTask({
        id: Date.now().toString(), title: suggestion.title || (zh ? 'AI 捕捉任务' : 'AI captured task'), description: suggestion.description || '',
        status: TaskStatus.TODO, createdAt: Date.now(), dueDate: new Date().toISOString().split('T')[0], nextSteps: suggestion.nextSteps || [], source: 'auto', category: 'work', isArchived: false,
      });
      track('ai_capture_succeeded', { locale, result: 'task_created', version: '0.2.0-beta' });
      onClose();
    } catch (e) { track('ai_capture_failed', { locale, error_type: 'provider_or_network', version: '0.2.0-beta' }); setError(zh ? 'AI 处理失败，请检查服务商、模型名称和 API Key。' : 'AI request failed. Check your provider, model and API key.'); }
    finally { setLoading(false); }
  };

  return (
    <div className="fixed inset-0 z-[240] bg-slate-950/45 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-2xl rounded-[2rem] shadow-2xl p-7 md:p-9">
        <div className="flex justify-between gap-4"><div><p className="text-xs font-black tracking-[0.2em] text-indigo-600">AI CAPTURE</p><h2 className="text-2xl font-black mt-2">{zh ? '从内容中提取下一步' : 'Turn content into a next step'}</h2></div><button onClick={onClose} className="text-2xl text-slate-400">×</button></div>
        <p className="mt-3 text-sm text-slate-500">{zh ? '粘贴会议记录、聊天摘要或想法，也可以选择 .txt / .md / .csv / .json 文本文件。' : 'Paste meeting notes, a chat summary or an idea, or choose a .txt / .md / .csv / .json text file.'}</p>
        <textarea value={content} onChange={(e) => setContent(e.target.value)} placeholder={zh ? '粘贴需要整理的内容…' : 'Paste content to organize…'} className="mt-5 w-full h-44 bg-slate-50 border border-slate-200 rounded-2xl p-4 outline-none focus:ring-2 focus:ring-indigo-500 resize-none" />
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <label className="cursor-pointer px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-bold text-slate-700 hover:bg-slate-50"><input type="file" accept=".txt,.md,.csv,.json,text/plain,text/markdown,text/csv,application/json" className="hidden" onChange={(e) => selectFile(e.target.files?.[0])} />{zh ? '选择文本文件' : 'Choose text file'}</label>
          {fileName && <span className="text-sm text-slate-500 truncate">{fileName}</span>}
        </div>
        {error && <p className="mt-4 text-sm text-rose-600 bg-rose-50 p-3 rounded-xl">{error}</p>}
        <div className="mt-6 flex justify-end gap-3"><button onClick={onClose} className="px-5 py-3 font-bold text-slate-500">{zh ? '取消' : 'Cancel'}</button><button onClick={capture} disabled={loading} className="px-6 py-3 rounded-xl bg-indigo-600 text-white font-bold disabled:opacity-50">{loading ? (zh ? '正在整理…' : 'Organizing…') : (hasUserApiKey() ? (zh ? '生成任务' : 'Create Task') : (zh ? '先连接 AI' : 'Connect AI First'))}</button></div>
      </div>
    </div>
  );
};

export default CaptureModal;
