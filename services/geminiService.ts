
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { Message } from "../types";

const MODEL_NAME = 'gemini-3-flash-preview';

export const streamHealthChat = async (
  message: string,
  history: Message[],
  onChunk: (text: string) => void
) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  
  const contents = history.map(msg => ({
    role: msg.role === 'user' ? 'user' : 'model',
    parts: [{ text: msg.content }]
  }));

  contents.push({
    role: 'user',
    parts: [{ text: message }]
  });

  const streamResponse = await ai.models.generateContentStream({
    model: MODEL_NAME,
    contents,
    config: {
      tools: [{ googleSearch: {} }],
      systemInstruction: `You are BioBeat AI, a specialized clinical data analyst and preventive health expert. 
      Your goal is to help users understand their health vitals (Heart Rate, SpO2, Temperature). 
      Follow these rules:
      1. Provide evidence-based explanations of symptoms.
      2. Use medical grounding for explaining anomalies.
      3. ALWAYS include a disclaimer: "This is not medical advice. Consult a professional for emergencies."
      4. Use professional, reassuring, and technical language where appropriate.
      5. Focus on preventive health measures.`,
    },
  });

  let fullText = "";
  let sources: any[] = [];

  for await (const chunk of streamResponse) {
    const textPart = chunk.text || "";
    fullText += textPart;
    onChunk(textPart);

    if (chunk.candidates?.[0]?.groundingMetadata?.groundingChunks) {
        sources = chunk.candidates[0].groundingMetadata.groundingChunks;
    }
  }

  return { text: fullText, sources };
};

export const generateVitalHistory = async () => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
    const response = await ai.models.generateContent({
        model: MODEL_NAME,
        contents: "Generate a realistic time-series JSON array of 12 entries for a healthy person. Include fields: 'time' (HH:mm), 'bpm' (60-100), 'spo2' (95-100), 'temp' (36.5-37.5). Return ONLY JSON.",
        config: {
            responseMimeType: "application/json"
        }
    });
    
    try {
        return JSON.parse(response.text);
    } catch (e) {
        return Array.from({ length: 12 }, (_, i) => ({
            time: `${12 + i}:00`,
            bpm: 72 + Math.floor(Math.random() * 10),
            spo2: 98 + Math.floor(Math.random() * 2),
            temp: 36.6 + (Math.random() * 0.4)
        }));
    }
};
