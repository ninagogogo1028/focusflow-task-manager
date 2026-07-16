import React, { useState } from 'react';
import { AiProvider, clearUserApiKey, getDefaultModel, getUserAiConfig, isApiKeyRemembered, saveUserAiConfig } from '../services/apiKeyStorage';
import { useI18n } from '../i18n';
import { track } from '../services/analytics';

interface ApiKeyModalProps { onClose: () => void; onChanged: () => void; }

const providers: Array<{ id: AiProvider; label: string }> = [
  { id: 'deepseek', label: 'DeepSeek' },
  { id: 'moonshot', label: 'Kimi / Moonshot' },
  { id: 'qwen', label: '通义千问 / 百炼' },
  { id: 'siliconflow', label: '硅基流动' },
  { id: 'gemini', label: 'Google Gemini' },
  { id: 'openai', label: 'OpenAI' },
];

const ApiKeyModal: React.FC<ApiKeyModalProps> = ({ onClose, onChanged }) => {
  const { locale } = useI18n();
  const zh = locale === 'zh-CN';
  const saved = getUserAiConfig();
  const [provider, setProvider] = useState<AiProvider>(saved?.provider || 'deepseek');
  const [apiKey, setApiKey] = useState(saved?.apiKey || '');
  const [model, setModel] = useState(saved?.model || getDefaultModel(provider));
  const [showKey, setShowKey] = useState(false);
  const [remember, setRemember] = useState(isApiKeyRemembered());

  const changeProvider = (next: AiProvider) => {
    setProvider(next);
    setModel(getDefaultModel(next));
  };

  const save = () => {
    saveUserAiConfig({ provider, apiKey, model }, remember);
    track('ai_connected', { provider, version: '0.2.0-beta' });
    onChanged();
    onClose();
  };

  const clear = () => {
    clearUserApiKey();
    setApiKey('');
    setRemember(false);
    onChanged();
  };

  return (
    <div className="fixed inset-0 bg-slate-950/50 backdrop-blur-sm z-[230] flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-xl rounded-[2rem] shadow-2xl p-7 md:p-9 max-h-[92vh] overflow-y-auto">
        <div className="flex items-start justify-between gap-4">
          <div><p className="text-xs font-bold uppercase tracking-[0.2em] text-indigo-600">Bring your own AI</p><h2 className="text-2xl font-black mt-2">{zh ? '连接你的 AI API' : 'Connect your AI API'}</h2></div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 text-2xl" aria-label="关闭">×</button>
        </div>
        <p className="text-sm text-slate-600 leading-relaxed mt-5">{zh ? '选择你已有的 AI 服务。FocusFlow 只需要轻量文本生成能力，不限定模型强度。' : 'Choose an AI service you already use. FocusFlow only needs lightweight text generation.'}</p>

        <div className="mt-5 grid gap-3 text-sm">
          <div className="rounded-2xl bg-indigo-50 border border-indigo-100 p-4 text-indigo-950 leading-relaxed">
            <p className="font-bold mb-1">{zh ? '哪些 API 可以使用？' : 'Which APIs work?'}</p><p>{zh ? '目前支持下方列出的服务商。DeepSeek、Kimi、通义千问、硅基流动和 OpenAI 使用兼容协议；Gemini 由 FocusFlow 单独适配。暂不支持填写任意 API 地址。' : 'The providers below are supported. Gemini has a dedicated adapter; arbitrary API URLs are not supported yet.'}</p>
          </div>
          <div className="rounded-2xl bg-slate-50 border border-slate-200 p-4 text-slate-700 leading-relaxed">
            <p className="font-bold mb-1">{zh ? '费用与模型' : 'Cost and models'}</p><p>{zh ? '调用费用由你的 AI 服务商账户承担，与 FocusFlow 订阅费无关。默认模型已经够用；如果修改模型名称，请确保该模型已在你的账户中开通。' : 'Usage is billed by your AI provider. The default model is sufficient; if you change it, ensure your account has access.'}</p>
          </div>
        </div>

        <label className="block text-sm font-bold text-slate-700 mt-6 mb-2">{zh ? 'AI 服务商' : 'AI Provider'}</label>
        <select value={provider} onChange={(e) => changeProvider(e.target.value as AiProvider)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500">
          {providers.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}
        </select>

        <label className="block text-sm font-bold text-slate-700 mt-5 mb-2">{zh ? '模型名称' : 'Model name'}</label>
        <input value={model} onChange={(e) => setModel(e.target.value)} spellCheck={false} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500" />

        <label className="block text-sm font-bold text-slate-700 mt-5 mb-2">API Key</label>
        <div className="flex gap-2">
          <input type={showKey ? 'text' : 'password'} value={apiKey} onChange={(e) => setApiKey(e.target.value)} placeholder={zh ? '输入该服务商的 API Key' : 'Enter your provider API key'} autoComplete="off" spellCheck={false} className="min-w-0 flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500" />
          <button onClick={() => setShowKey((v) => !v)} className="px-4 rounded-xl border border-slate-200 text-sm font-bold text-slate-600">{showKey ? (zh ? '隐藏' : 'Hide') : (zh ? '显示' : 'Show')}</button>
        </div>

        <div className="mt-5 p-4 bg-amber-50 border border-amber-100 text-amber-950 rounded-xl text-xs leading-relaxed">
          <p className="font-bold text-sm mb-1">{zh ? 'Key 如何处理？' : 'How is your key handled?'}</p><p>{zh ? 'Key 不写入 FocusFlow 数据库或服务端日志，也不会出现在网页代码中。网页调用时，Key 会临时经过 FocusFlow 的 Netlify 转发函数，再发送给所选 AI 服务商。选择“记住在此设备”后，配置会保存在当前浏览器，请勿在公共电脑使用。' : 'Your key is not stored in the database or server logs. It passes through the Netlify relay only for each request. Do not remember it on a shared computer.'}</p>
        </div>
        <label className="flex items-start gap-3 mt-4 cursor-pointer"><input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} className="mt-1" /><span className="text-sm text-slate-600">{zh ? '记住在此设备；否则只保留到当前浏览器会话结束。' : 'Remember on this device; otherwise keep it for this browser session only.'}</span></label>

        <div className="mt-7 flex flex-col-reverse sm:flex-row gap-3">
          <button onClick={clear} className="sm:mr-auto px-5 py-3 rounded-xl text-sm font-bold text-rose-600 hover:bg-rose-50">{zh ? '清除配置' : 'Clear'}</button><button onClick={onClose} className="px-5 py-3 rounded-xl border border-slate-200 font-bold text-slate-600">{zh ? '取消' : 'Cancel'}</button><button onClick={save} disabled={!apiKey.trim() || !model.trim()} className="px-6 py-3 rounded-xl bg-slate-950 text-white font-bold disabled:opacity-40">{zh ? '保存并启用' : 'Save & Enable'}</button>
        </div>
      </div>
    </div>
  );
};

export default ApiKeyModal;
