export type AnalyticsEvent =
  | 'app_opened' | 'onboarding_completed' | 'task_created' | 'task_completed'
  | 'daily_plan_viewed' | 'report_opened' | 'ai_connected' | 'ai_capture_started'
  | 'ai_capture_succeeded' | 'ai_capture_failed' | 'pro_viewed'
  | 'feedback_submitted' | 'data_exported' | 'data_imported';

const CONSENT_KEY = 'focusflow_analytics_consent';
const DEVICE_KEY = 'focusflow_analytics_device';
const safePropertyNames = new Set(['category', 'source', 'provider', 'result', 'error_type', 'locale', 'version']);

const getDeviceId = () => {
  let id = localStorage.getItem(DEVICE_KEY);
  if (!id) { id = crypto.randomUUID(); localStorage.setItem(DEVICE_KEY, id); }
  return id;
};

export const hasAnalyticsConsent = () => localStorage.getItem(CONSENT_KEY) === 'yes';
export const setAnalyticsConsent = (enabled: boolean) => localStorage.setItem(CONSENT_KEY, enabled ? 'yes' : 'no');

export const track = (event: AnalyticsEvent, properties: Record<string, string | number | boolean> = {}) => {
  if (!hasAnalyticsConsent()) return;
  const safeProperties = Object.fromEntries(Object.entries(properties).filter(([key]) => safePropertyNames.has(key)).map(([key, value]) => [key, String(value).slice(0, 100)]));
  const payload = JSON.stringify({ event, anonymous_id: getDeviceId(), occurred_at: new Date().toISOString(), properties: safeProperties });
  if (navigator.sendBeacon) navigator.sendBeacon('/api/events', new Blob([payload], { type: 'application/json' }));
  else fetch('/api/events', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: payload, keepalive: true }).catch(() => undefined);
};
