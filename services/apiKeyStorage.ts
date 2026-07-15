export type AiProvider = 'deepseek' | 'moonshot' | 'qwen' | 'siliconflow' | 'openai' | 'gemini';

export interface UserAiConfig {
  provider: AiProvider;
  apiKey: string;
  model: string;
}

const SESSION_KEY = 'focusflow_ai_config_session';
const DEVICE_KEY = 'focusflow_ai_config_device';
const LEGACY_SESSION_KEY = 'focusflow_deepseek_key_session';
const LEGACY_DEVICE_KEY = 'focusflow_deepseek_key_device';

const defaultModels: Record<AiProvider, string> = {
  deepseek: 'deepseek-chat',
  moonshot: 'moonshot-v1-8k',
  qwen: 'qwen-turbo',
  siliconflow: 'Qwen/Qwen2.5-7B-Instruct',
  openai: 'gpt-4o-mini',
  gemini: 'gemini-2.5-flash',
};

export const getDefaultModel = (provider: AiProvider) => defaultModels[provider];

const parseConfig = (value: string | null): UserAiConfig | null => {
  if (!value) return null;
  try {
    const parsed = JSON.parse(value);
    if (parsed?.provider && parsed?.apiKey && parsed?.model) return parsed;
  } catch {
    return null;
  }
  return null;
};

export const getUserAiConfig = (): UserAiConfig | null => {
  const current = parseConfig(sessionStorage.getItem(SESSION_KEY)) || parseConfig(localStorage.getItem(DEVICE_KEY));
  if (current) return current;

  const legacyKey = sessionStorage.getItem(LEGACY_SESSION_KEY) || localStorage.getItem(LEGACY_DEVICE_KEY);
  return legacyKey ? { provider: 'deepseek', apiKey: legacyKey, model: defaultModels.deepseek } : null;
};

export const hasUserApiKey = () => Boolean(getUserAiConfig()?.apiKey);

export const saveUserAiConfig = (config: UserAiConfig, rememberOnDevice: boolean) => {
  clearUserApiKey();
  const normalized = { ...config, apiKey: config.apiKey.trim(), model: config.model.trim() };
  if (!normalized.apiKey || !normalized.model) return;
  (rememberOnDevice ? localStorage : sessionStorage).setItem(
    rememberOnDevice ? DEVICE_KEY : SESSION_KEY,
    JSON.stringify(normalized),
  );
};

export const clearUserApiKey = () => {
  [SESSION_KEY, LEGACY_SESSION_KEY].forEach((key) => sessionStorage.removeItem(key));
  [DEVICE_KEY, LEGACY_DEVICE_KEY].forEach((key) => localStorage.removeItem(key));
};

export const isApiKeyRemembered = () => Boolean(localStorage.getItem(DEVICE_KEY) || localStorage.getItem(LEGACY_DEVICE_KEY));
