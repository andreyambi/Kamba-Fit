/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export interface Nutrients {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export async function analyzeMeal(description: string): Promise<Nutrients> {
  const prompt = `
    Analyze this meal description from an Angolan context and estimate its nutritional values.
    Meal: "${description}"
    
    Return ONLY a JSON object: {"calories": number, "protein": number, "carbs": number, "fat": number}
    Do not include any text before or after the JSON.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
    });
    
    const text = response.text.trim();
    
    // Attempt to parse text directly or extract JSON
    const jsonStr = text.startsWith("{") ? text : (text.match(/\{.*\}/s)?.[0] || "");
    if (jsonStr) {
      return JSON.parse(jsonStr) as Nutrients;
    }
    
    throw new Error("Invalid format in AI response");
  } catch (error) {
    console.error("AI Nutrition Analysis Error:", error);
    // Return a safe estimate or zeros instead of failing
    return { calories: 350, protein: 15, carbs: 45, fat: 12 };
  }
}
