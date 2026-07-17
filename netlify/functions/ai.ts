interface HandlerEvent {
  httpMethod: string;
  body: string | null;
}

const json = (statusCode: number, body: unknown) => ({
  statusCode,
  headers: {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
  },
  body: JSON.stringify(body),
});

const providerUrls: Record<string, string> = {
  deepseek: "https://api.deepseek.com/chat/completions",
  moonshot: "https://api.moonshot.cn/v1/chat/completions",
  qwen: "https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions",
  siliconflow: "https://api.siliconflow.cn/v1/chat/completions",
  openai: "https://api.openai.com/v1/chat/completions",
};

interface UserAiConfig { provider: string; apiKey: string; model: string; }

const validateAiConfig = (value: unknown): UserAiConfig | undefined => {
  if (!value || typeof value !== "object") return undefined;
  const { provider, apiKey, model } = value as Record<string, unknown>;
  if (typeof provider !== "string" || typeof apiKey !== "string" || typeof model !== "string") return undefined;
  if (!(provider in providerUrls) && provider !== "gemini") return undefined;
  if (!apiKey.trim() || apiKey.length > 500 || !/^[a-zA-Z0-9._\-/:]+$/.test(model) || model.length > 160) return undefined;
  return { provider, apiKey: apiKey.trim(), model: model.trim() };
};

const requestAi = async (prompt: string, jsonMode = false, config?: UserAiConfig): Promise<string> => {
  if (!config) throw new Error("A user-provided AI configuration is required");

  if (config.provider === "gemini") {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(config.model)}:generateContent`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-goog-api-key": config.apiKey },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: jsonMode ? { responseMimeType: "application/json", temperature: 0.3 } : { temperature: 0.3 },
      }),
    });
    if (!response.ok) throw new Error(`AI request failed with status ${response.status}`);
    const result = await response.json();
    const content = result?.candidates?.[0]?.content?.parts?.map((part: { text?: string }) => part.text || "").join("");
    if (!content) throw new Error("AI provider returned an invalid response");
    return content;
  }

  const response = await fetch(providerUrls[config.provider], {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${config.apiKey}`,
    },
    body: JSON.stringify({
      model: config.model,
      messages: [{ role: "user", content: prompt }],
      temperature: 0.3,
    }),
  });

  if (!response.ok) {
    throw new Error(`AI request failed with status ${response.status}`);
  }

  const result = await response.json();
  const content = result?.choices?.[0]?.message?.content;
  if (typeof content !== "string") throw new Error("AI provider returned an invalid response");
  return content;
};

export const handler = async (event: HandlerEvent) => {
  if (event.httpMethod !== "POST") return json(405, { message: "Method not allowed" });
  if (!event.body || event.body.length > 20_000) return json(400, { message: "Invalid request" });

  try {
    const { action, payload, userAiConfig } = JSON.parse(event.body);
    const aiConfig = validateAiConfig(userAiConfig);

    if (action === "parse-task") {
      const activityDescription = payload?.activityDescription;
      const fileContent = typeof payload?.fileContent === "string" ? payload.fileContent.slice(0, 10_000) : "";
      if (typeof activityDescription !== "string" || activityDescription.length > 2_000) {
        return json(400, { message: "Invalid activity description" });
      }

      const prompt = `你是 FocusFlow 的任务整理助手。请将下面的活动转成一个清晰、可执行的任务。\n\n活动：${activityDescription}${fileContent ? `\n\n文件内容：\n${fileContent}` : ""}\n\n只返回 JSON：{"title":"简洁标题","description":"一句说明","nextSteps":["下一步1","下一步2"]}`;
      const content = await requestAi(prompt, true, aiConfig);
      const task = JSON.parse(content.replace(/```json\n?|\n?```/g, "").trim());
      return json(200, { task });
    }

    if (action === "daily-recap") {
      const completedYesterday = Array.isArray(payload?.completedYesterday) ? payload.completedYesterday.slice(0, 50) : [];
      const overdueTasks = Array.isArray(payload?.overdueTasks) ? payload.overdueTasks.slice(0, 50) : [];
      const todayTasks = Array.isArray(payload?.todayTasks) ? payload.todayTasks.slice(0, 50) : [];
      const safeTitles = (tasks: Array<{ title?: unknown }>) => tasks
        .map((task) => typeof task?.title === "string" ? task.title.slice(0, 200) : "")
        .filter(Boolean)
        .map((title) => `- ${title}`)
        .join("\n");

      const prompt = `你是一个专业但温暖的效率教练。生成一份简短、清晰、可执行的中文晨间简报。不要使用 Markdown 标题。\n\n昨天完成：\n${safeTitles(completedYesterday) || "无"}\n\n逾期任务：\n${safeTitles(overdueTasks) || "无"}\n\n今日任务：\n${safeTitles(todayTasks) || "无"}\n\n先肯定昨天的进展，再温和处理逾期事项，最后提炼今天最重要的 1–3 个方向。不要编造任务。`;
      const content = await requestAi(prompt, false, aiConfig);
      return json(200, { content });
    }

    return json(400, { message: "Unknown action" });
  } catch (error) {
    console.error("AI function failed", error instanceof Error ? error.message : error);
    return json(500, { message: "AI service is temporarily unavailable" });
  }
};
