
import { GoogleGenAI } from "@google/genai";
import { AccessLog, Equipment, User } from "../types";

// Fixed: Directly use process.env.API_KEY when initializing GoogleGenAI as per guidelines
const initGenAI = () => {
  return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

export const generateGymInsights = async (
  users: User[], 
  logs: AccessLog[], 
  equipment: Equipment[]
): Promise<string> => {
  // Fixed: Initialize client within the function scope to ensure it uses the current environment state
  const ai = initGenAI();

  const prompt = `
    Analyze the following Gym data and provide 3 brief, actionable business insights or maintenance alerts.
    
    Data Summary:
    - Total Users: ${users.length}
    - Active Users: ${users.filter(u => u.isActive).length}
    - Recent Access Logs (last 5): ${JSON.stringify(logs.slice(0, 5).map(l => ({ s: l.status, r: l.reason, t: l.timestamp })))}
    - Equipment Status: ${JSON.stringify(equipment.map(e => ({ n: e.name, s: e.status, next: e.nextMaintenance })))}
    
    Format: Bullet points. Keep it professional and concise.
  `;

  try {
    // Using gemini-3-pro-preview for advanced reasoning and data analysis tasks
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: prompt,
    });
    // The GenerateContentResponse has a .text getter property, do not call it as a method.
    return response.text || "No insights generated.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Failed to generate insights. Please try again later.";
  }
};
