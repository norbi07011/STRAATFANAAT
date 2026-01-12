
import { GoogleGenAI } from "@google/genai";
import { Language } from "./types";

/**
 * Fetches styling advice for a product using Gemini API.
 * Follows the latest @google/genai guidelines for initialization and text extraction.
 */
export const getStylingAdvice = async (productName: string, lang: Language): Promise<string> => {
  // Always use a named parameter and the process.env.API_KEY directly.
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const prompt = `
    You are a professional streetwear stylist for the brand "STRAATFANAAT". 
    Provide a short, cool, and aggressive styling advice (max 3 sentences) for the product: "${productName}".
    The tone should be urban, bold, and authentic.
    Language to respond in: ${lang === 'NL' ? 'Dutch' : lang === 'PL' ? 'Polish' : 'English'}.
  `;

  try {
    // Using ai.models.generateContent directly with model name and prompt.
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        temperature: 0.9,
        topP: 0.95,
      }
    });

    // Access the .text property directly (not a method).
    return response.text || "Keep it street. Keep it real.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Error connecting to the street matrix.";
  }
};
