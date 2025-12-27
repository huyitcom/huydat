import React, { useState, useRef, useCallback } from 'react';
import { ImageUploader } from './ImageUploader';
import { ImageMasker } from './ImageMasker';
import { PromptInput } from './PromptInput';
import { EditButton } from './EditButton';
import { ErrorMessage } from './ErrorMessage';
import { ResultDisplay } from './ResultDisplay';
import { inpaintImageWithGemini } from '../services/geminiService';
import type { EditedImageResult, ImageMaskerRef } from '../types';

export const ProEditTab: React.FC = () => {
  const [originalImage, setOriginalImage] = useState<{ file: File | null; base64: string | null }>({ file: null, base64: null });
  const [prompt, setPrompt] = useState('');
  const [brushSize, setBrushSize] = useState(40);
  const [editedResults, setEditedResults] = useState<EditedImageResult[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const maskerRef = useRef<ImageMaskerRef>(null);

  const handleFileChange = (file: File | null) => {
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setOriginalImage({ file, base64: reader.result as string });
        setEditedResults(null);
        setError(null);
      };
      reader.onerror = () => setError('Failed to read the image file.');
      reader.readAsDataURL(file);
    } else {
      setOriginalImage({ file: null, base64: null });
    }
  };
  
  const removeImage = () => {
      setOriginalImage({ file: null, base64: null });
      setEditedResults(null);
      setError(null);
      setPrompt('');
  }

  const handleGenerate = useCallback(async () => {
    if (!originalImage.base64 || !originalImage.file) {
      setError('Please upload an image first.');
      return;
    }
    if (!prompt.trim()) {
      setError('Please enter a description for the edit.');
      return;
    }
    const maskBase64 = maskerRef.current?.getMaskAsBase64();
    if (!maskBase64) {
      setError('Could not generate the mask.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setEditedResults(null);

    try {
      const originalBase64Data = originalImage.base64.split(',')[1];
      const maskBase64Data = maskBase64.split(',')[1];
      
      const result = await inpaintImageWithGemini(
        originalBase64Data,
        originalImage.file.type,
        maskBase64Data,
        prompt
      );
      
      const finalResult: EditedImageResult = {
          ...result,
          title: 'Edited Image',
          prompt: prompt
      }
      setEditedResults([finalResult]);

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
      setError(`Failed to edit image: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  }, [originalImage, prompt]);
  
  if (!originalImage.base64) {
      return (
        <div className="max-w-md mx-auto bg-slate-800/50 p-6 rounded-2xl shadow-lg border border-slate-700">
            <ImageUploader 
                onFileChange={handleFileChange} 
                previewUrl={null}
            />
        </div>
      )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      {/* Controls Column */}
      <div className="bg-slate-800/50 p-6 rounded-2xl shadow-lg border border-slate-700 h-fit">
        <h2 className="text-xl font-bold mb-4 text-slate-200">Upload image for Inpaint edit</h2>
        <div className="space-y-6">
            <div className="relative">
                <ImageMasker ref={maskerRef} src={originalImage.base64} brushSize={brushSize} />
                <button 
                    onClick={removeImage}
                    className="absolute top-2 right-2 z-10 w-8 h-8 flex items-center justify-center bg-black/50 text-white rounded-full hover:bg-black/80 transition-colors"
                    aria-label="Remove image"
                >
                    &times;
                </button>
            </div>
          
            <div className="p-4 bg-slate-700/50 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                    <label htmlFor="brush-size" className="text-sm font-medium text-slate-300">Brush size: {brushSize}</label>
                </div>
                <input
                    id="brush-size"
                    type="range"
                    min="1"
                    max="100"
                    value={brushSize}
                    onChange={(e) => setBrushSize(Number(e.target.value))}
                    className="w-full h-2 bg-slate-600 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                    disabled={isLoading}
                />
                <div className="flex justify-end space-x-2 mt-3">
                    <button onClick={() => maskerRef.current?.undo()} disabled={isLoading} className="px-4 py-1 text-sm border border-slate-600 text-slate-300 rounded-md hover:bg-slate-700">Undo</button>
                    <button onClick={() => maskerRef.current?.clear()} disabled={isLoading} className="px-4 py-1 text-sm border border-slate-600 text-slate-300 rounded-md hover:bg-slate-700">Clear selection</button>
                </div>
            </div>

            <div>
                <PromptInput
                    label="Describe the area to edit"
                    placeholder="e.g., 'a beautiful castle on a hill'"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    disabled={isLoading}
                />
            </div>
          
            <EditButton
                label=""
                buttonText="Edit Image"
                onClick={handleGenerate}
                isLoading={isLoading}
                disabled={!originalImage.file || !prompt.trim()}
            />

            {error && <ErrorMessage message={error} />}
        </div>
      </div>

      {/* Results Column */}
      <div>
        {isLoading || editedResults ? (
            <ResultDisplay
                originalImageUrl={null} // Don't show original in the result pane for this tab
                editedResults={editedResults}
                isLoading={isLoading}
                showOriginalImage={false}
            />
        ) : (
            <div className="w-full bg-gray-900/50 p-6 rounded-2xl flex items-center justify-center min-h-[500px]">
                <div className="text-center text-slate-500">
                    <p>Your edited image will appear here.</p>
                </div>
            </div>
        )}
      </div>
    </div>
  );
};