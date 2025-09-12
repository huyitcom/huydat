export interface GeminiApiResult {
  imageUrl: string | null;
  text: string | null;
}

export interface EditedImageResult extends GeminiApiResult {
  title: string;
}
