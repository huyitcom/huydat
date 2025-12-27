
export interface GeminiApiResult {
  imageUrl: string | null;
  text: string | null;
}

export interface EditedImageResult extends GeminiApiResult {
  title: string;
  prompt: string;
}

export interface ImageMaskerRef {
  undo: () => void;
  clear: () => void;
  getMaskAsBase64: () => string | null;
}

export interface HistoryItem {
  id: string;
  timestamp: number;
  imageUrl: string;
  prompt: string;
  category: 'id' | 'profile' | 'other';
}
