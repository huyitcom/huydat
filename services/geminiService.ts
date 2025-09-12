import { GoogleGenAI, Modality } from "@google/genai";
import type { GeminiApiResult } from '../types';

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  throw new Error("API_KEY environment variable is not set.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });
const model = 'gemini-2.5-flash-image-preview';

/**
 * Edits an image using a text prompt with the Gemini API.
 * @param base64ImageData The base64 encoded image data (without the data URL prefix).
 * @param mimeType The MIME type of the image (e.g., 'image/png').
 * @param prompt The text prompt describing the desired edit.
 * @returns A promise that resolves to an object containing the edited image URL and any accompanying text.
 */
export const editImageWithGemini = async (
  base64ImageData: string,
  mimeType: string,
  prompt: string
): Promise<GeminiApiResult> => {
  try {
    const response = await ai.models.generateContent({
      model,
      contents: {
        parts: [
          {
            inlineData: {
              data: base64ImageData,
              mimeType: mimeType,
            },
          },
          {
            text: prompt,
          },
        ],
      },
      config: {
        responseModalities: [Modality.IMAGE, Modality.TEXT],
      },
    });

    const result: GeminiApiResult = { imageUrl: null, text: null };

    if (response.candidates && response.candidates.length > 0) {
      const parts = response.candidates[0].content.parts;
      for (const part of parts) {
        if (part.text) {
          result.text = part.text;
        } else if (part.inlineData) {
          const base64Bytes = part.inlineData.data;
          const imageMimeType = part.inlineData.mimeType;
          result.imageUrl = `data:${imageMimeType};base64,${base64Bytes}`;
        }
      }
    }

    if (!result.imageUrl) {
        throw new Error("The AI did not return an edited image. It might have refused the request.");
    }
    
    return result;
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    throw new Error("The request to the AI service failed. Please check the console for details.");
  }
};
