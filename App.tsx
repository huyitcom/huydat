import React, { useState, useCallback } from 'react';
import { Header } from './components/Header';
import { ImageUploader } from './components/ImageUploader';
import { EditButton } from './components/EditButton';
import { ResultDisplay } from './components/ResultDisplay';
import { ErrorMessage } from './components/ErrorMessage';
import { PreserveFaceToggle } from './components/PreserveFaceToggle';
import { ClothingOptions } from './components/ClothingOptions';
import { editImageWithGemini } from './services/geminiService';
import type { EditedImageResult } from './types';

const App: React.FC = () => {
  const [originalImage, setOriginalImage] = useState<{ file: File | null; base64: string | null }>({
    file: null,
    base64: null,
  });
  const [clothingOption, setClothingOption] = useState<string>('Business suit');
  const [preserveFace, setPreserveFace] = useState<boolean>(true);
  const [editedResults, setEditedResults] = useState<EditedImageResult[] | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (file: File | null) => {
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setOriginalImage({ file, base64: reader.result as string });
        setEditedResults(null); // Clear previous results on new image upload
        setError(null);
      };
      reader.onerror = () => {
        setError('Failed to read the image file.');
      };
      reader.readAsDataURL(file);
    } else {
      setOriginalImage({ file: null, base64: null });
    }
  };

  const handleEdit = useCallback(async () => {
    if (!originalImage.base64 || !originalImage.file) {
      setError('Please upload an image first.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setEditedResults(null);

    try {
      let clothingPrompt = '';
      switch (clothingOption) {
        case 'Business suit':
          clothingPrompt = 'Replace the outfit with a professional business suit, suitable for a corporate headshot.';
          break;
        case 'Vietnamese Ao Dai':
          clothingPrompt = 'Replace the outfit with an elegant, traditional Vietnamese Ao Dai.';
          break;
        case 'White shirt':
        default:
          clothingPrompt = 'Replace the outfit with a white collared shirt in a formal style, suitable for a CV or job application photo.';
          break;
      }

      let promptsToRun: { title: string; prompt: string }[] = [];

      if (preserveFace) {
        promptsToRun = [
          {
            title: 'Original Face',
            prompt: `Edit the photo to have a clean, solid white background. ${clothingPrompt} Set the frame to a 4x6 aspect ratio. IMPORTANT: Keep the original body posture and posing straight, do not rotate the body. The face, lighting, and shadows from the original photo must be preserved 100% identically.`
          },
          {
            title: 'Studio Lighting',
            prompt: `Edit the photo into a professional picture with a solid white background. ${clothingPrompt} Set the frame to a 4x6 aspect ratio. Relight the entire image with professional studio lighting to create a high-quality look with balanced light and soft shadows. IMPORTANT: Keep the original body posture and posing straight, do not rotate the body. The face structure and features must be preserved 100% identically to the original photo; do not apply any retouching.`
          },
          {
            title: 'Face Retouch',
            prompt: `Edit the photo into a professional headshot with a solid white background. ${clothingPrompt} Set the frame to a 4x6 aspect ratio. Relight the entire image with professional studio lighting. Apply professional, magazine-style face retouching, including skin smoothing, blemish removal, and subtle light and shadow enhancement on the face to make the features pop. IMPORTANT: Keep the original body posture and posing straight, do not rotate the body. The person must remain clearly identifiable, preserving their core identity.`
          }
        ];
      } else {
        promptsToRun = [
          {
            title: 'Edited Image',
            prompt: `Edit the photo into a professional headshot with a solid white background. ${clothingPrompt} Set the frame to a 4x6 aspect ratio. Relight the entire image with professional studio lighting. Apply professional face retouching.`
          }
        ];
      }

      const base64Data = originalImage.base64.split(',')[1];
      const mimeType = originalImage.file.type;

      const promises = promptsToRun.map(p => editImageWithGemini(base64Data, mimeType, p.prompt));

      const results = await Promise.all(promises);
      
      const finalResults: EditedImageResult[] = results.map((result, index) => ({
        ...result,
        title: promptsToRun[index].title,
      }));

      setEditedResults(finalResults);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
      setError(`Failed to edit image: ${errorMessage}`);
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [originalImage, clothingOption, preserveFace]);

  return (
    <div className="min-h-screen bg-slate-900 text-slate-200 font-sans p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <Header />
        <main className="mt-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Controls Column */}
          <div className="lg:col-span-4 bg-slate-800/50 p-6 rounded-2xl shadow-lg border border-slate-700 h-fit">
            <div className="space-y-6">
              <ImageUploader 
                onFileChange={handleFileChange} 
                previewUrl={originalImage.base64}
              />
              <ClothingOptions
                selected={clothingOption}
                onChange={setClothingOption}
                disabled={isLoading}
              />
              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-300">
                  3. Options
                </label>
                <PreserveFaceToggle
                  checked={preserveFace}
                  onChange={(e) => setPreserveFace(e.target.checked)}
                  disabled={isLoading}
                />
              </div>
              <EditButton 
                onClick={handleEdit} 
                isLoading={isLoading}
                disabled={!originalImage.file}
              />
              {error && <ErrorMessage message={error} />}
            </div>
          </div>

          {/* Results Column */}
          <div className="lg:col-span-8">
            <ResultDisplay
              originalImageUrl={originalImage.base64}
              editedResults={editedResults}
              isLoading={isLoading}
            />
          </div>
        </main>
      </div>
    </div>
  );
};

export default App;
