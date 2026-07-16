import { Task } from "../types";
import { getUserAiConfig } from "./apiKeyStorage";

type AiAction = "parse-task" | "daily-recap";

async function callAi<T>(action: AiAction, payload: unknown): Promise<T> {
  const response = await fetch("/api/ai", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action, payload, userAiConfig: getUserAiConfig() || undefined }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || "AI service is temporarily unavailable");
  }

  return response.json() as Promise<T>;
}

export const parseAutoTask = async (activityDescription: string, fileContent?: string): Promise<Partial<Task>> => {
  const result = await callAi<{ task: Partial<Task> }>("parse-task", { activityDescription, fileContent });
  return result.task;
};

export const getDailyRecap = async (overdueTasks: Task[], todayTasks: Task[]): Promise<string> => {
  const result = await callAi<{ content: string }>("daily-recap", {
    overdueTasks: overdueTasks.map(({ title }) => ({ title })),
    todayTasks: todayTasks.map(({ title }) => ({ title })),
  });
  return result.content;
};
