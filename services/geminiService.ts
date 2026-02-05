
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

export const getDailyRecap = async (overdueTasks: Task[], todayTasks: Task[]): Promise<string> => {
  const overdueList = overdueTasks.map(t => `- [OVERDUE] ${t.title}`).join('\n');
  const todayList = todayTasks.map(t => `- [TODAY] ${t.title}`).join('\n');
  
  const prompt = `
    Good morning! Here is the user's status:
    
    Overdue Tasks (from yesterday or earlier):
    ${overdueList || "None! Great job clearing everything."}
    
    Tasks Scheduled for Today:
    ${todayList || "None scheduled yet."}
    
    Please generate a friendly, encouraging "Daily Morning Briefing".
    1. Acknowledge if they cleared yesterday's tasks (celebrate it!).
    2. Summarize the overdue tasks if any (gentle reminder).
    3. Highlight today's focus.
    4. Keep it concise, professional yet warm. Use emojis.
  `;

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: prompt,
  });

  return response.text;
};
