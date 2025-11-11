import { GoogleGenAI, Type } from "@google/genai";
import type { PredictionResult } from '../types';

const predictionSchema = {
  type: Type.OBJECT,
  properties: {
    predictions: {
      type: Type.ARRAY,
      description: "A list of potential medical conditions based on the symptoms.",
      items: {
        type: Type.OBJECT,
        properties: {
          condition: {
            type: Type.STRING,
            description: "The name of the potential medical condition.",
          },
          confidence: {
            type: Type.NUMBER,
            description: "A confidence score from 0 to 100 on how likely the condition is, based on the provided symptoms.",
          },
          description: {
            type: Type.STRING,
            description: "A brief, easy-to-understand description of the condition.",
          },
          nextSteps: {
            type: Type.STRING,
            description: "Recommended next steps, such as 'Consult a primary care physician' or 'Monitor symptoms at home'. This should always include advice to see a doctor.",
          },
        },
        required: ["condition", "confidence", "description", "nextSteps"],
      },
    },
  },
  required: ["predictions"],
};

export const getDiseasePrediction = async (
  symptoms: string[],
  otherSymptoms: string,
  apiKey: string,
): Promise<PredictionResult> => {
  if (!apiKey) {
    throw new Error("API key is missing. Please provide a valid API key.");
  }
  const ai = new GoogleGenAI({ apiKey });

  const prompt = `
    Analyze the following symptoms and provide a list of 3 to 5 potential medical conditions.
    
    Selected Symptoms: ${symptoms.join(', ')}
    Other Symptoms described by user: "${otherSymptoms}"

    For each condition, provide a confidence score (0-100), a brief description, and recommended next steps.
    Crucially, always emphasize that this is not a diagnosis and the user must consult a healthcare professional.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: { parts: [{ text: prompt }] },
      config: {
        responseMimeType: "application/json",
        responseSchema: predictionSchema,
        temperature: 0.5,
      },
    });

    const jsonText = response.text.trim();
    
    if (!jsonText) {
      console.error("The model returned an empty response.", response);
      throw new Error("The model's response was empty. This might be due to a content safety policy or an internal error.");
    }

    try {
      const result = JSON.parse(jsonText) as PredictionResult;
      
      if (result.predictions) {
        result.predictions.sort((a, b) => b.confidence - a.confidence);
      }

      return result;
    } catch (parseError) {
      console.error("Failed to parse JSON response:", jsonText);
      throw new Error("The model returned an invalid format. Could not parse the prediction data.");
    }

  } catch (error) {
    console.error("Error fetching prediction:", error);
    throw error;
  }
};