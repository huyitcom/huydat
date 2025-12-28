import { GoogleGenAI, Modality } from "@google/genai";
import type { GeminiApiResult } from '../types';

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

if (!API_KEY) {
  throw new Error("API_KEY environment variable is not set.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });
const model = 'gemini-2.5-flash-image';

/**
 * Edits an image using a text prompt with the Gemini API.
 * @param personBase64Data The base64 encoded person image data (without the data URL prefix).
 * @param personMimeType The MIME type of the person image.
 * @param prompt The text prompt describing the desired edit.
 * @param clothingBase64Data Optional base64 encoded clothing image data.
 * @param clothingMimeType Optional MIME type of the clothing image.
 * @returns A promise that resolves to an object containing the edited image URL and any accompanying text.
 */
export const editImageWithGemini = async (
  personBase64Data: string,
  personMimeType: string,
  prompt: string,
  clothingBase64Data?: string,
  clothingMimeType?: string
): Promise<GeminiApiResult> => {
  try {
    const parts: any[] = [
      {
        inlineData: {
          data: personBase64Data,
          mimeType: personMimeType,
        },
      },
    ];

    if (clothingBase64Data && clothingMimeType) {
      parts.push({
        inlineData: {
          data: clothingBase64Data,
          mimeType: clothingMimeType,
        },
      });
    }

    parts.push({ text: prompt });


    const response = await ai.models.generateContent({
      model,
      contents: {
        parts: parts,
      },
      config: {
        responseModalities: [Modality.IMAGE],
      },
    });

    const result: GeminiApiResult = { imageUrl: null, text: null };

    if (response.candidates && response.candidates.length > 0) {
      const responseParts = response.candidates[0].content.parts;
      for (const part of responseParts) {
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
        let errorMessage = "The AI did not return an edited image.";

        const blockReason = response.promptFeedback?.blockReason;
        const finishReason = response.candidates?.[0]?.finishReason;

        if (blockReason) {
            errorMessage += ` The request was blocked for reason: ${blockReason}.`;
        } else if (finishReason === 'SAFETY') {
            errorMessage += ` The generation was stopped for safety reasons.`;
        } else {
            errorMessage += " It might have refused the request.";
        }
        
        if (result.text) {
            errorMessage += ` The AI's text response: "${result.text}"`;
        }
        
        throw new Error(errorMessage);
    }
    
    return result;
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    if (error instanceof Error) {
        throw error; // Re-throw the original error to preserve the detailed message.
    }
    throw new Error("The request to the AI service failed. Please check the console for details.");
  }
};


export const inpaintImageWithGemini = async (
  originalBase64Data: string,
  originalMimeType: string,
  maskBase64Data: string,
  prompt: string
): Promise<GeminiApiResult> => {
  try {
    const parts: any[] = [
      {
        inlineData: {
          data: originalBase64Data,
          mimeType: originalMimeType,
        },
      },
      {
        inlineData: {
          data: maskBase64Data,
          mimeType: 'image/png', // Mask is always PNG
        },
      },
      { text: prompt },
    ];

    const response = await ai.models.generateContent({
      model,
      contents: { parts: parts },
      config: {
        responseModalities: [Modality.IMAGE],
      },
    });

    const result: GeminiApiResult = { imageUrl: null, text: null };

    if (response.candidates && response.candidates.length > 0) {
      const responseParts = response.candidates[0].content.parts;
      for (const part of responseParts) {
        if (part.inlineData) {
          const base64Bytes = part.inlineData.data;
          const imageMimeType = part.inlineData.mimeType;
          result.imageUrl = `data:${imageMimeType};base64,${base64Bytes}`;
        }
      }
    }
    
    if (!result.imageUrl) {
        let errorMessage = "The AI did not return an edited image.";
        const blockReason = response.promptFeedback?.blockReason;
        const finishReason = response.candidates?.[0]?.finishReason;
        if (blockReason) {
            errorMessage += ` The request was blocked for reason: ${blockReason}.`;
        } else if (finishReason === 'SAFETY') {
            errorMessage += ` The generation was stopped for safety reasons.`;
        } else {
            errorMessage += " It might have refused the request.";
        }
        throw new Error(errorMessage);
    }

    return result;
  } catch (error) {
    console.error("Error calling Gemini API for inpainting:", error);
    if (error instanceof Error) {
        throw error; // Re-throw the original error
    }
    throw new Error("The inpainting request to the AI service failed. Please check the console for details.");
  }
};