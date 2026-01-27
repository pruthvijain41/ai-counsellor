
import { GoogleGenAI } from "@google/genai";

// Fixed: Initializing GoogleGenAI with API key directly from process.env.API_KEY as per the coding guidelines.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getUniversityInsight = async (universityName: string, userProfile: any) => {
  try {
    const response = await ai.models.generateContent({
      // Fixed: Using gemini-3-pro-preview for complex reasoning and evaluation tasks.
      model: 'gemini-3-pro-preview',
      contents: `Provide a critical fit analysis for a student applying to ${universityName}. 
      Student Profile: ${JSON.stringify(userProfile)}. 
      Include: Why they fit, Potential challenges, and a 1-sentence recommendation.`,
      config: {
        temperature: 0.7,
      }
    });
    // Fixed: Accessed .text property directly (not a method).
    return response.text;
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Could not generate insights at this time.";
  }
};

export const chatWithAI = async (history: { role: 'user' | 'model', parts: { text: string }[] }[], message: string) => {
  try {
    const chat = ai.chats.create({
      // Fixed: Using gemini-3-pro-preview for complex conversational tasks like counseling.
      model: 'gemini-3-pro-preview',
      // Fixed: Passing the conversation history to maintain context in the chat session.
      history: history,
      config: {
        systemInstruction: "You are an expert University Admission Counsellor. Help students find universities, understand requirements, and guide them through the application process. Be professional, encouraging, and data-driven.",
      }
    });
    
    // Fixed: chat.sendMessage correctly sends the message and returns a GenerateContentResponse where .text is used.
    const response = await chat.sendMessage({ message });
    return response.text;
  } catch (error) {
    console.error("Gemini Chat Error:", error);
    return "I'm having trouble connecting to my brain right now. Please try again!";
  }
};
