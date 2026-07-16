const allowedEvents = new Set(['app_opened','onboarding_completed','task_created','task_completed','daily_plan_viewed','report_opened','ai_connected','ai_capture_started','ai_capture_succeeded','ai_capture_failed','pro_viewed','feedback_submitted','data_exported','data_imported']);
const allowedProperties = new Set(['category','source','provider','result','error_type','locale','version']);
const response = (statusCode: number, body = '') => ({ statusCode, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' }, body });

export const handler = async (event: { httpMethod: string; body: string | null }) => {
  if (event.httpMethod !== 'POST' || !event.body || event.body.length > 4000) return response(400);
  try {
    const input = JSON.parse(event.body);
    if (!allowedEvents.has(input.event) || typeof input.anonymous_id !== 'string' || input.anonymous_id.length > 100) return response(400);
    const properties = Object.fromEntries(Object.entries(input.properties || {}).filter(([key]) => allowedProperties.has(key)).map(([key, value]) => [key, String(value).slice(0, 100)]));
    console.log(JSON.stringify({ type: 'product_event', event: input.event, anonymous_id: input.anonymous_id, occurred_at: input.occurred_at, properties }));
    return response(204);
  } catch { return response(400); }
};
