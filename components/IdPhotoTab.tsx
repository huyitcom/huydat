
import React, { useState, useCallback, useEffect } from 'react';
import { ImageUploader } from './ImageUploader';
import { EditButton } from './EditButton';
import { ResultDisplay } from './ResultDisplay';
import { ErrorMessage } from './ErrorMessage';
import { IdPhotoConfigPanel } from './IdPhotoConfigPanel';
import { editImageWithGemini } from '../services/geminiService';
import { addToHistory } from '../services/historyService';
import type { EditedImageResult } from '../types';

const cropImageToAspectRatio = (base64: string, targetRatio: number, zoom: number = 1, panY: number = 0, forceWidth?: number, forceHeight?: number): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Could not get canvas context'));
        return;
      }

      const imgRatio = img.width / img.height;
      const actualTargetRatio = targetRatio > 0 ? targetRatio : imgRatio;
      
      let baseWidth = img.width;
      let baseHeight = img.height;

      if (imgRatio > actualTargetRatio) {
        // Image is wider than target
        baseWidth = img.height * actualTargetRatio;
      } else {
        // Image is taller than target
        baseHeight = img.width / actualTargetRatio;
      }

      // Apply zoom
      const sWidth = baseWidth / zoom;
      const sHeight = baseHeight / zoom;

      // Center X
      const sx = (img.width - sWidth) / 2;
      
      // Center Y
      const sy_center = (img.height - sHeight) / 2;
      
      // Pan Y: panY is from -100 (top) to 100 (bottom)
      const maxPan = sy_center;
      let sy = sy_center + (panY / 100) * maxPan;
      
      // Clamp sy to ensure we don't crop outside the image
      sy = Math.max(0, Math.min(sy, img.height - sHeight));

      canvas.width = forceWidth || sWidth;
      canvas.height = forceHeight || sHeight;

      ctx.drawImage(img, sx, sy, sWidth, sHeight, 0, 0, canvas.width, canvas.height);
      resolve(canvas.toDataURL('image/jpeg', 0.95));
    };
    img.onerror = reject;
    img.src = base64;
  });
};

export const IdPhotoTab: React.FC = () => {
  const [originalImage, setOriginalImage] = useState<{ file: File | null; base64: string | null }>({
    file: null,
    base64: null,
  });
  const [editedResults, setEditedResults] = useState<EditedImageResult[] | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const [sizeOption, setSizeOption] = useState<string>('4x6');
  const [appliedSizeOption, setAppliedSizeOption] = useState<string>('4x6');
  const [bgColor, setBgColor] = useState<string>('white');
  const [clothingOption, setClothingOption] = useState<string>('Sơ Mi Nam');
  const [skinSmooth, setSkinSmooth] = useState<number>(0);
  const [removeBlemishes, setRemoveBlemishes] = useState<boolean>(false);
  const [balanceFacialFeatures, setBalanceFacialFeatures] = useState<boolean>(false);
  const [imageSize, setImageSize] = useState<string>('1K');
  const [manualPrompt, setManualPrompt] = useState<string>('');
  const [useManualPrompt, setUseManualPrompt] = useState<boolean>(false);
  const [customClothingImage, setCustomClothingImage] = useState<{ file: File | null; base64: string | null }>({
    file: null,
    base64: null,
  });
  const [customClothingDescription, setCustomClothingDescription] = useState<string>('');
  
  const [rawAiImage, setRawAiImage] = useState<string | null>(null);
  const [faceZoom, setFaceZoom] = useState<number>(1.0);
  const [verticalPan, setVerticalPan] = useState<number>(0);

  // Interactive cropping effect
  useEffect(() => {
    if (!rawAiImage) return;

    const cleanSize = appliedSizeOption.replace(' cm', '');
    let targetRatio = 1;
    let targetWidthPx = 0;
    let targetHeightPx = 0;
    const MM_TO_INCH = 1 / 25.4;
    const DPI = 400;

    switch (cleanSize) {
      case '5x5': targetRatio = 1; targetWidthPx = Math.round(50 * MM_TO_INCH * DPI); targetHeightPx = Math.round(50 * MM_TO_INCH * DPI); break;
      case '2x3': targetRatio = 2 / 3; targetWidthPx = Math.round(20 * MM_TO_INCH * DPI); targetHeightPx = Math.round(30 * MM_TO_INCH * DPI); break;
      case '3x4': targetRatio = 3 / 4; targetWidthPx = Math.round(30 * MM_TO_INCH * DPI); targetHeightPx = Math.round(40 * MM_TO_INCH * DPI); break;
      case '4x6': targetRatio = 4 / 6; targetWidthPx = Math.round(40 * MM_TO_INCH * DPI); targetHeightPx = Math.round(60 * MM_TO_INCH * DPI); break;
      case '3.5x4.5': targetRatio = 3.5 / 4.5; targetWidthPx = Math.round(35 * MM_TO_INCH * DPI); targetHeightPx = Math.round(45 * MM_TO_INCH * DPI); break;
      case '3.3x4.8': targetRatio = 3.3 / 4.8; targetWidthPx = Math.round(33 * MM_TO_INCH * DPI); targetHeightPx = Math.round(48 * MM_TO_INCH * DPI); break;
      case '6x9': targetRatio = 6 / 9; targetWidthPx = Math.round(60 * MM_TO_INCH * DPI); targetHeightPx = Math.round(90 * MM_TO_INCH * DPI); break;
      case '5x7': targetRatio = 5 / 7; targetWidthPx = Math.round(50 * MM_TO_INCH * DPI); targetHeightPx = Math.round(70 * MM_TO_INCH * DPI); break;
      case 'Gốc': targetRatio = 0; break;
    }

    cropImageToAspectRatio(rawAiImage, targetRatio, faceZoom, verticalPan, targetWidthPx || undefined, targetHeightPx || undefined)
      .then(cropped => {
        setEditedResults(prev => {
          if (!prev || prev.length === 0) return prev;
          return [{ ...prev[0], imageUrl: cropped }];
        });
      })
      .catch(err => console.error("Error re-cropping image:", err));
  }, [rawAiImage, appliedSizeOption, faceZoom, verticalPan]);

  const handleFileChange = (file: File | null) => {
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setOriginalImage({ file, base64: reader.result as string });
        setEditedResults(null); // Clear previous results on new image upload
        setError(null);
      };
      reader.onerror = () => {
        setError('Không thể đọc tệp hình ảnh.');
      };
      reader.readAsDataURL(file);
    } else {
      setOriginalImage({ file: null, base64: null });
    }
  };

  const handleEdit = useCallback(async () => {
    if (!originalImage.base64 || !originalImage.file) {
      setError('Vui lòng tải ảnh lên trước.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setEditedResults(null);
    setAppliedSizeOption(sizeOption);

    try {
      let clothingPrompt = '';
      switch (clothingOption) {
        case 'Giữ Nguyên':
          clothingPrompt = 'Keep the original clothing.';
          break;
        case 'Vest Nam (Đen)':
          clothingPrompt = 'Replace the outfit with a black professional business suit for men.';
          break;
        case 'Vest Nữ':
          clothingPrompt = 'Replace the outfit with a professional business suit for women.';
          break;
        case 'Sơ Mi Nam':
          clothingPrompt = 'Replace the outfit with a formal button-down shirt for men.';
          break;
        case 'Sơ Mi Nữ':
          clothingPrompt = 'Replace the outfit with a formal button-down shirt for women.';
          break;
        case 'Polo Trắng':
          clothingPrompt = 'Replace the outfit with a white polo shirt.';
          break;
        case 'Áo Dài Trắng':
          clothingPrompt = 'Replace the outfit with a traditional Vietnamese white Ao Dai.';
          break;
        case 'Tùy Chỉnh':
          if (customClothingDescription.trim()) {
            clothingPrompt = `Replace the outfit with: ${customClothingDescription}.`;
          } else {
            clothingPrompt = 'Replace the outfit with the clothing provided in the reference image.';
          }
          break;
      }

      let bgPrompt = '';
      switch (bgColor) {
        case 'white': bgPrompt = 'solid white background'; break;
        case 'blue': bgPrompt = 'solid blue background'; break;
        case 'black': bgPrompt = 'solid black background'; break;
        case 'gray': bgPrompt = 'solid gray background'; break;
        case 'dark-gray': bgPrompt = 'solid dark gray background'; break;
        case 'dark-blue': bgPrompt = 'solid dark blue background'; break;
        case 'light-pink': bgPrompt = 'solid light pink background'; break;
      }

      let sizePrompt = '';
      let geminiAspectRatio: string | undefined = '3:4';
      let targetRatio = 3 / 4;

      switch (sizeOption) {
        case '5x5':
          sizePrompt = 'Set the frame to a 1x1 aspect ratio.';
          geminiAspectRatio = '1:1';
          targetRatio = 1 / 1;
          break;
        case '2x3': 
          sizePrompt = 'Set the frame to a 2x3 aspect ratio.'; 
          geminiAspectRatio = '3:4';
          targetRatio = 2 / 3;
          break;
        case '3x4': 
          sizePrompt = 'Set the frame to a 3x4 aspect ratio.'; 
          geminiAspectRatio = '3:4';
          targetRatio = 3 / 4;
          break;
        case '4x6': 
          sizePrompt = 'Set the frame to a 4x6 aspect ratio.'; 
          geminiAspectRatio = '3:4';
          targetRatio = 4 / 6;
          break;
        case '3.5x4.5': 
          sizePrompt = 'Set the frame to a 3.5x4.5 aspect ratio.'; 
          geminiAspectRatio = '3:4';
          targetRatio = 3.5 / 4.5;
          break;
        case '3.3x4.8': 
          sizePrompt = 'Set the frame to a 3.3x4.8 aspect ratio.'; 
          geminiAspectRatio = '3:4';
          targetRatio = 3.3 / 4.8;
          break;
        case '6x9':
          sizePrompt = 'Set the frame to a 6x9 aspect ratio.';
          geminiAspectRatio = '3:4';
          targetRatio = 6 / 9;
          break;
        case '5x7':
          sizePrompt = 'Set the frame to a 5x7 aspect ratio.';
          geminiAspectRatio = '3:4';
          targetRatio = 5 / 7;
          break;
        case 'Gốc':
          sizePrompt = 'Keep the original aspect ratio of the image.';
          geminiAspectRatio = undefined;
          targetRatio = 0;
          break;
      }

      let retouchPrompt = '';
      if (skinSmooth > 0) {
        retouchPrompt += ` Apply skin smoothing at ${skinSmooth}% intensity.`;
      }
      if (removeBlemishes) {
        retouchPrompt += ` Remove acne and blemishes.`;
      }
      if (balanceFacialFeatures) {
        retouchPrompt += ` Ensure perfect facial symmetry. Align the eyes horizontally so they are on the exact same level. Straighten the nose so it is perfectly vertical and centered. Align the mouth horizontally and center it under the nose. Fix any asymmetrical facial features to make the left and right sides of the face perfectly balanced.`;
      }

      let prompt = '';
      if (useManualPrompt && manualPrompt.trim() !== '') {
        prompt = manualPrompt;
      } else {
        prompt = `Edit the photo into a professional headshot with a ${bgPrompt}. ${clothingPrompt} ${sizePrompt} Relight the entire image with professional studio lighting.${retouchPrompt} IMPORTANT: Keep the original body posture and posing straight, do not rotate the body. The person must remain clearly identifiable, preserving their core identity. CRITICAL FRAMING INSTRUCTION: This is an official passport/visa photo. Ensure the head and shoulders are clearly visible. Leave some space above the head and around the shoulders to allow for cropping. The face should be centered.`;
      }

      const personBase64Data = originalImage.base64.split(',')[1];
      const personMimeType = originalImage.file.type;
      
      let clothingBase64Data: string | undefined = undefined;
      let clothingMimeType: string | undefined = undefined;
      
      if (clothingOption === 'Tùy Chỉnh' && customClothingImage.base64 && customClothingImage.file) {
        clothingBase64Data = customClothingImage.base64.split(',')[1];
        clothingMimeType = customClothingImage.file.type;
      }

      const result = await editImageWithGemini(
        personBase64Data, 
        personMimeType, 
        prompt,
        geminiAspectRatio,
        clothingBase64Data,
        clothingMimeType,
        imageSize
      );

      if (result.imageUrl) {
        setRawAiImage(result.imageUrl);
        
        const cleanSize = sizeOption.replace(' cm', '');
        let tw = 0;
        let th = 0;
        const MM_TO_INCH = 1 / 25.4;
        const DPI = 400;
        
        switch (cleanSize) {
          case '5x5': tw = Math.round(50 * MM_TO_INCH * DPI); th = Math.round(50 * MM_TO_INCH * DPI); break;
          case '2x3': tw = Math.round(20 * MM_TO_INCH * DPI); th = Math.round(30 * MM_TO_INCH * DPI); break;
          case '3x4': tw = Math.round(30 * MM_TO_INCH * DPI); th = Math.round(40 * MM_TO_INCH * DPI); break;
          case '4x6': tw = Math.round(40 * MM_TO_INCH * DPI); th = Math.round(60 * MM_TO_INCH * DPI); break;
          case '3.5x4.5': tw = Math.round(35 * MM_TO_INCH * DPI); th = Math.round(45 * MM_TO_INCH * DPI); break;
          case '3.3x4.8': tw = Math.round(33 * MM_TO_INCH * DPI); th = Math.round(48 * MM_TO_INCH * DPI); break;
          case '6x9': tw = Math.round(60 * MM_TO_INCH * DPI); th = Math.round(90 * MM_TO_INCH * DPI); break;
          case '5x7': tw = Math.round(50 * MM_TO_INCH * DPI); th = Math.round(70 * MM_TO_INCH * DPI); break;
        }

        try {
          const croppedBase64 = await cropImageToAspectRatio(result.imageUrl, targetRatio, faceZoom, verticalPan, tw || undefined, th || undefined);
          result.imageUrl = croppedBase64;
        } catch (cropErr) {
          console.error("Error cropping image:", cropErr);
        }
      }

      const finalResult: EditedImageResult = {
        ...result,
        title: 'Ảnh Thẻ',
        prompt: prompt,
      };

      setEditedResults([finalResult]);

      if (finalResult.imageUrl) {
        addToHistory({
            imageUrl: finalResult.imageUrl,
            prompt: finalResult.prompt,
            category: 'id'
        });
      }

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Đã xảy ra lỗi không xác định.';
      setError(`Chỉnh sửa ảnh thất bại: ${errorMessage}`);
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [originalImage, clothingOption, bgColor, sizeOption, skinSmooth, removeBlemishes, balanceFacialFeatures, imageSize, useManualPrompt, manualPrompt, faceZoom, verticalPan, customClothingImage, customClothingDescription]);

  const handleUseOriginal = useCallback(async () => {
    if (!originalImage.base64) {
      setError('Vui lòng tải ảnh lên trước.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setAppliedSizeOption(sizeOption);

    try {
      const cleanSize = sizeOption.replace(' cm', '');
      let targetRatio = 1;
      let targetWidthPx = 0;
      let targetHeightPx = 0;
      
      const MM_TO_INCH = 1 / 25.4;
      const DPI = 400;

      switch (cleanSize) {
        case '5x5': targetRatio = 1; targetWidthPx = Math.round(50 * MM_TO_INCH * DPI); targetHeightPx = Math.round(50 * MM_TO_INCH * DPI); break;
        case '2x3': targetRatio = 2 / 3; targetWidthPx = Math.round(20 * MM_TO_INCH * DPI); targetHeightPx = Math.round(30 * MM_TO_INCH * DPI); break;
        case '3x4': targetRatio = 3 / 4; targetWidthPx = Math.round(30 * MM_TO_INCH * DPI); targetHeightPx = Math.round(40 * MM_TO_INCH * DPI); break;
        case '4x6': targetRatio = 4 / 6; targetWidthPx = Math.round(40 * MM_TO_INCH * DPI); targetHeightPx = Math.round(60 * MM_TO_INCH * DPI); break;
        case '3.5x4.5': targetRatio = 3.5 / 4.5; targetWidthPx = Math.round(35 * MM_TO_INCH * DPI); targetHeightPx = Math.round(45 * MM_TO_INCH * DPI); break;
        case '3.3x4.8': targetRatio = 3.3 / 4.8; targetWidthPx = Math.round(33 * MM_TO_INCH * DPI); targetHeightPx = Math.round(48 * MM_TO_INCH * DPI); break;
        case '6x9': targetRatio = 6 / 9; targetWidthPx = Math.round(60 * MM_TO_INCH * DPI); targetHeightPx = Math.round(90 * MM_TO_INCH * DPI); break;
        case '5x7': targetRatio = 5 / 7; targetWidthPx = Math.round(50 * MM_TO_INCH * DPI); targetHeightPx = Math.round(70 * MM_TO_INCH * DPI); break;
        case 'Gốc': targetRatio = 0; break;
      }

      setRawAiImage(originalImage.base64);
      
      let croppedBase64 = originalImage.base64;
      try {
        croppedBase64 = await cropImageToAspectRatio(originalImage.base64, targetRatio, faceZoom, verticalPan, targetWidthPx || undefined, targetHeightPx || undefined);
      } catch (cropErr) {
        console.error("Error cropping image:", cropErr);
      }

      const finalResult: EditedImageResult = {
        imageUrl: croppedBase64,
        title: 'Ảnh Thẻ (Gốc)',
        prompt: 'Sử dụng ảnh gốc',
        text: null,
      };

      setEditedResults([finalResult]);

      addToHistory({
          imageUrl: finalResult.imageUrl,
          prompt: finalResult.prompt,
          category: 'id'
      });
    } catch (err) {
      setError('Đã xảy ra lỗi khi xử lý ảnh gốc.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [originalImage, sizeOption, faceZoom, verticalPan]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      {/* Controls Column */}
      <div className="lg:col-span-4 space-y-6 h-fit">
        <IdPhotoConfigPanel
          sizeOption={sizeOption}
          setSizeOption={setSizeOption}
          bgColor={bgColor}
          setBgColor={setBgColor}
          clothingOption={clothingOption}
          setClothingOption={setClothingOption}
          skinSmooth={skinSmooth}
          setSkinSmooth={setSkinSmooth}
          removeBlemishes={removeBlemishes}
          setRemoveBlemishes={setRemoveBlemishes}
          balanceFacialFeatures={balanceFacialFeatures}
          setBalanceFacialFeatures={setBalanceFacialFeatures}
          imageSize={imageSize}
          setImageSize={setImageSize}
          manualPrompt={manualPrompt}
          setManualPrompt={setManualPrompt}
          useManualPrompt={useManualPrompt}
          setUseManualPrompt={setUseManualPrompt}
          customClothingImage={customClothingImage}
          setCustomClothingImage={setCustomClothingImage}
          customClothingDescription={customClothingDescription}
          setCustomClothingDescription={setCustomClothingDescription}
          disabled={isLoading}
        />

        <div className="bg-slate-800/50 p-6 rounded-2xl shadow-lg border border-slate-700">
          <EditButton 
            onClick={handleEdit} 
            isLoading={isLoading}
            disabled={!originalImage.file}
          />
          <button
            type="button"
            onClick={handleUseOriginal}
            disabled={isLoading || !originalImage.file}
            className="mt-3 flex w-full justify-center items-center rounded-md bg-slate-700 px-4 py-3 text-sm font-semibold text-white shadow-sm hover:bg-slate-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            Dùng ảnh gốc (Miễn phí)
          </button>
          {error && <div className="mt-4"><ErrorMessage message={error} /></div>}
        </div>
      </div>

      {/* Results Column */}
      <div className="lg:col-span-8 flex flex-col gap-6">
        <ResultDisplay
          originalImageUrl={originalImage.base64}
          editedResults={editedResults}
          isLoading={isLoading}
          showIdPhotoGuide={true}
          sizeOption={appliedSizeOption}
          originalImageComponent={
            <div className="h-full w-full">
              <ImageUploader 
                onFileChange={handleFileChange} 
                previewUrl={originalImage.base64}
                showCameraButton={true}
                hideLabel={true}
                borderless={true}
              />
            </div>
          }
        />

        {/* Căn Chỉnh Khung Hình (Hiện khi có ảnh kết quả) */}
        {!isLoading && editedResults && editedResults.length > 0 && (
          <div className="bg-gray-900/50 p-6 rounded-2xl border border-gray-800">
            <h3 className="font-medium mb-4 text-white flex items-center gap-2">
              <svg className="w-5 h-5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
              </svg>
              Căn Chỉnh Khung Hình
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-white">Phóng To (Zoom)</span>
                  <span className="text-gray-400">{faceZoom.toFixed(2)}x</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="2"
                  step="0.05"
                  value={faceZoom}
                  onChange={(e) => setFaceZoom(parseFloat(e.target.value))}
                  className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-purple-500"
                />
              </div>

              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-white">Dịch Chuyển Lên/Xuống</span>
                  <span className="text-gray-400">{verticalPan}%</span>
                </div>
                <input
                  type="range"
                  min="-100"
                  max="100"
                  step="5"
                  value={verticalPan}
                  onChange={(e) => setVerticalPan(parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-purple-500"
                />
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-4 text-center">
              * Sử dụng thanh trượt để căn chỉnh khuôn mặt khớp với các đường gióng tiêu chuẩn trên ảnh.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
