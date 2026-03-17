import { GoogleGenAI, Modality } from "@google/genai";
import type { GeminiApiResult } from '../types';

const model = 'gemini-3.1-flash-image-preview';

const getAiInstance = () => {
  const API_KEY = process.env.API_KEY;
  if (!API_KEY) {
    throw new Error("API_KEY environment variable is not set.");
  }
  return new GoogleGenAI({ apiKey: API_KEY });
};

const handleApiError = (error: any) => {
  console.error("Error calling Gemini API:", error);
  if (error instanceof Error) {
    if (error.message.includes("Requested entity was not found")) {
      // Reset key selection state if needed by the app, but here we just throw a clear message
      throw new Error("API Key error: Requested entity was not found. Please select your API key again.");
    }
    throw error;
  }
  throw new Error("Yêu cầu tới dịch vụ AI thất bại. Vui lòng kiểm tra console để biết chi tiết.");
};

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
  aspectRatio?: string,
  clothingBase64Data?: string,
  clothingMimeType?: string,
  imageSize: string = "4K"
): Promise<GeminiApiResult> => {
  try {
    const ai = getAiInstance();
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

    const config: any = {
      responseModalities: [Modality.IMAGE],
      imageConfig: {
        imageSize: imageSize,
      },
    };

    if (aspectRatio) {
      config.imageConfig.aspectRatio = aspectRatio;
    }

    const response = await ai.models.generateContent({
      model,
      contents: {
        parts: parts,
      },
      config: config,
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
        let errorMessage = "AI không trả về ảnh đã chỉnh sửa.";

        const blockReason = response.promptFeedback?.blockReason;
        const finishReason = response.candidates?.[0]?.finishReason;

        if (blockReason) {
            errorMessage += ` Yêu cầu bị chặn vì lý do: ${blockReason}.`;
        } else if (finishReason === 'SAFETY') {
            errorMessage += ` Quá trình tạo ảnh bị dừng vì lý do an toàn.`;
        } else {
            errorMessage += " AI có thể đã từ chối yêu cầu.";
        }
        
        if (result.text) {
            errorMessage += ` Phản hồi văn bản của AI: "${result.text}"`;
        }
        
        throw new Error(errorMessage);
    }
    
    return result;
  } catch (error) {
    return handleApiError(error);
  }
};


export const inpaintImageWithGemini = async (
  originalBase64Data: string,
  originalMimeType: string,
  maskBase64Data: string,
  prompt: string
): Promise<GeminiApiResult> => {
  try {
    const ai = getAiInstance();
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
        imageConfig: {
          imageSize: "4K",
        },
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
        let errorMessage = "AI không trả về ảnh đã chỉnh sửa.";
        const blockReason = response.promptFeedback?.blockReason;
        const finishReason = response.candidates?.[0]?.finishReason;
        if (blockReason) {
            errorMessage += ` Yêu cầu bị chặn vì lý do: ${blockReason}.`;
        } else if (finishReason === 'SAFETY') {
            errorMessage += ` Quá trình tạo ảnh bị dừng vì lý do an toàn.`;
        } else {
            errorMessage += " AI có thể đã từ chối yêu cầu.";
        }
        throw new Error(errorMessage);
    }

    return result;
  } catch (error) {
    return handleApiError(error);
  }
};