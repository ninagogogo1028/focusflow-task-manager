
import { GoogleGenAI, Type } from "@google/genai";
import { Task, TaskStatus } from "../types";

// 使用用户提供的 API Key
const ai = new GoogleGenAI({ apiKey: "AIzaSyAZllqUqVr7foLR3DWjPLibOwy047kNEIg" });

export const parseAutoTask = async (activityDescription: string): Promise<Partial<Task>> => {
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Analyze the following computer activity: "${activityDescription}". 
    Create a professional task title and a short description. 
    Suggest 2-3 logical "next steps" for this workflow as an array of strings.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          description: { type: Type.STRING },
          nextSteps: { 
            type: Type.ARRAY,
            items: { type: Type.STRING }
          }
        },
        required: ["title", "description", "nextSteps"]
      }
    }
  });

  try {
    return JSON.parse(response.text);
  } catch (e) {
    return { title: "New Activity Task", description: activityDescription, nextSteps: ["Review activity"] };
  }
};

export const getDailyRecap = async (unfinishedTasks: Task[]): Promise<string> => {
  if (unfinishedTasks.length === 0) return "Great job! You completed everything yesterday.";
  
  const tasksList = unfinishedTasks.map(t => `- ${t.title}: ${t.description}`).join('\n');
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Here are unfinished tasks from yesterday:\n${tasksList}\n\nSummarize them into an encouraging morning to-do list for today. Keep it brief and motivating.`,
  });

  return response.text;
};
