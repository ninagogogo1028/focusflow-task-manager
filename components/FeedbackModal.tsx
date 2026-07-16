import React, { useState } from 'react';
import { useI18n } from '../i18n';

const FeedbackModal: React.FC<{ onClose: () => void; onSubmitted: () => void }> = ({ onClose, onSubmitted }) => {
  const { locale } = useI18n(); const zh = locale === 'zh-CN';
  const [type, setType] = useState('suggestion');
  const [rating, setRating] = useState(5);
  const [message, setMessage] = useState('');
  const [contact, setContact] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (message.trim().length < 5) { setError(zh ? '请至少写 5 个字，让我们知道具体问题。' : 'Please add a little more detail.'); return; }
    setSending(true); setError('');
    try {
      const body = new URLSearchParams({ 'form-name': 'focusflow-feedback', type, rating: String(rating), message: message.trim(), contact: contact.trim(), locale, page: window.location.pathname, version: '0.2.0-beta' });
      const response = await fetch('/', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: body.toString() });
      if (!response.ok) throw new Error('submit_failed');
      onSubmitted(); onClose();
    } catch { setError(zh ? '提交失败，请稍后再试。' : 'Could not submit. Please try again.'); }
    finally { setSending(false); }
  };

  return <div className="fixed inset-0 z-[260] bg-slate-950/45 backdrop-blur-sm flex items-center justify-center p-4"><form onSubmit={submit} className="bg-white w-full max-w-xl rounded-[2rem] shadow-2xl p-7 md:p-9">
    <div className="flex justify-between gap-4"><div><p className="text-xs font-black tracking-[0.2em] text-indigo-600">FEEDBACK</p><h2 className="text-2xl font-black mt-2">{zh ? '告诉我们你的真实感受' : 'Tell us what you really think'}</h2></div><button type="button" onClick={onClose} className="text-2xl text-slate-400">×</button></div>
    <p className="text-sm text-slate-500 mt-3">{zh ? '反馈会用于改进产品。请不要填写任务内容、API Key 或其他敏感信息。' : 'Feedback helps improve FocusFlow. Do not include task content, API keys or sensitive information.'}</p>
    <div className="grid sm:grid-cols-2 gap-4 mt-6"><label className="text-sm font-bold text-slate-700">{zh ? '反馈类型' : 'Type'}<select value={type} onChange={(e) => setType(e.target.value)} className="mt-2 w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-normal"><option value="suggestion">{zh ? '功能建议' : 'Suggestion'}</option><option value="bug">{zh ? '遇到问题' : 'Bug'}</option><option value="experience">{zh ? '使用感受' : 'Experience'}</option></select></label><label className="text-sm font-bold text-slate-700">{zh ? '整体评分' : 'Rating'}<select value={rating} onChange={(e) => setRating(Number(e.target.value))} className="mt-2 w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-normal">{[5,4,3,2,1].map((n) => <option key={n} value={n}>{'★'.repeat(n)} ({n}/5)</option>)}</select></label></div>
    <label className="block text-sm font-bold text-slate-700 mt-5">{zh ? '反馈内容' : 'Feedback'}<textarea value={message} onChange={(e) => setMessage(e.target.value)} maxLength={2000} placeholder={zh ? '哪一点对你有帮助？哪里让你困惑？' : 'What helped? What was confusing?'} className="mt-2 w-full h-32 bg-slate-50 border border-slate-200 rounded-xl p-4 font-normal resize-none" /></label>
    <label className="block text-sm font-bold text-slate-700 mt-4">{zh ? '联系方式（选填）' : 'Contact (optional)'}<input value={contact} onChange={(e) => setContact(e.target.value)} maxLength={200} placeholder={zh ? '邮箱或微信，方便我们进一步了解' : 'Email or another way to follow up'} className="mt-2 w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-normal" /></label>
    {error && <p className="mt-4 text-sm text-rose-600 bg-rose-50 p-3 rounded-xl">{error}</p>}
    <div className="mt-6 flex justify-end gap-3"><button type="button" onClick={onClose} className="px-5 py-3 font-bold text-slate-500">{zh ? '取消' : 'Cancel'}</button><button disabled={sending} className="px-6 py-3 rounded-xl bg-indigo-600 text-white font-bold disabled:opacity-50">{sending ? (zh ? '提交中…' : 'Sending…') : (zh ? '提交反馈' : 'Send Feedback')}</button></div>
  </form></div>;
};

export default FeedbackModal;
