import React, { useState, useEffect } from 'react';
import type { EditedImageResult } from '../types';
import { Spinner } from './Spinner';
import { DownloadButton } from './DownloadButton';

interface ResultDisplayProps {
  originalImageUrl: string | null;
  editedResults: EditedImageResult[] | null;
  isLoading: boolean;
  showOriginalImage?: boolean;
  showIdPhotoGuide?: boolean;
  sizeOption?: string;
  originalImageComponent?: React.ReactNode;
}

const Card: React.FC<{ title: string; children: React.ReactNode; sizeOption?: string }> = ({ title, children, sizeOption }) => {
    let aspectClass = "aspect-[3/4]";
    if (sizeOption === '5x5 cm') {
      aspectClass = "aspect-square";
    } else if (sizeOption === '2x3 cm') {
      aspectClass = "aspect-[2/3]";
    } else if (sizeOption === '4x6 cm') {
      aspectClass = "aspect-[2/3]"; // 4x6 is 2:3
    } else if (sizeOption === '3.5x4.5 cm') {
      aspectClass = "aspect-[7/9]";
    } else if (sizeOption === '3.3x4.8 cm') {
      aspectClass = "aspect-[11/16]";
    }

    return (
        <div className="flex-1 min-w-[280px] w-full sm:w-auto">
            <h3 className="text-lg font-semibold text-slate-300 mb-3 text-center">{title}</h3>
            <div className={`relative ${aspectClass} w-full bg-slate-800/50 rounded-lg flex items-center justify-center border border-slate-700 overflow-hidden`}>
                {children}
            </div>
        </div>
    );
}


export const ResultDisplay: React.FC<ResultDisplayProps> = ({ originalImageUrl, editedResults, isLoading, showOriginalImage = true, showIdPhotoGuide = false, sizeOption, originalImageComponent }) => {
  const [zoomedImage, setZoomedImage] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isGeneratingSheet, setIsGeneratingSheet] = useState<boolean>(false);

  const handleCreateSheet = async (imageUrl: string) => {
    if (!sizeOption) return;
    setIsGeneratingSheet(true);
    try {
      const img = new Image();
      img.crossOrigin = "anonymous";
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
        img.src = imageUrl;
      });

      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Canvas context not available');

      // 13x18 cm at 300 DPI
      const DPI = 300;
      const MM_TO_INCH = 1 / 25.4;
      const sheetWidthPx = Math.round(130 * MM_TO_INCH * DPI); // ~1535
      const sheetHeightPx = Math.round(180 * MM_TO_INCH * DPI); // ~2126

      canvas.width = sheetWidthPx;
      canvas.height = sheetHeightPx;

      // Fill white background
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, sheetWidthPx, sheetHeightPx);

      // Determine photo physical size
      let photoWidthMm = 40;
      let photoHeightMm = 60;
      switch (sizeOption) {
        case '5x5 cm': photoWidthMm = 50; photoHeightMm = 50; break;
        case '2x3 cm': photoWidthMm = 20; photoHeightMm = 30; break;
        case '3x4 cm': photoWidthMm = 30; photoHeightMm = 40; break;
        case '4x6 cm': photoWidthMm = 40; photoHeightMm = 60; break;
        case '3.5x4.5 cm': photoWidthMm = 35; photoHeightMm = 45; break;
        case '3.3x4.8 cm': photoWidthMm = 33; photoHeightMm = 48; break;
      }

      const photoWidthPx = Math.round(photoWidthMm * MM_TO_INCH * DPI);
      const photoHeightPx = Math.round(photoHeightMm * MM_TO_INCH * DPI);

      // Calculate grid layout (2x2)
      const gapMm = 2; // 2mm gap
      const marginMm = 5; // 5mm margin from top-left
      const gapPx = Math.round(gapMm * MM_TO_INCH * DPI);
      const marginPx = Math.round(marginMm * MM_TO_INCH * DPI);

      const startX = marginPx;
      const startY = marginPx;

      // Draw 4 photos
      for (let row = 0; row < 2; row++) {
        for (let col = 0; col < 2; col++) {
          const x = startX + col * (photoWidthPx + gapPx);
          const y = startY + row * (photoHeightPx + gapPx);
          ctx.drawImage(img, x, y, photoWidthPx, photoHeightPx);
          
          // Draw a thin cut line/border
          ctx.strokeStyle = '#cccccc';
          ctx.lineWidth = 2;
          ctx.strokeRect(x, y, photoWidthPx, photoHeightPx);
        }
      }

      // Download
      const sheetDataUrl = canvas.toDataURL('image/jpeg', 1.0);
      const link = document.createElement('a');
      link.href = sheetDataUrl;
      link.download = `id-photo-sheet-13x18-${Date.now()}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setToastMessage('Đã tải xuống sheet 13x18cm!');
    } catch (error) {
      console.error('Error creating sheet:', error);
      setToastMessage('Có lỗi xảy ra khi tạo sheet.');
    } finally {
      setIsGeneratingSheet(false);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setZoomedImage(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => setToastMessage(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  const placeholder = (
    <div className="text-center text-slate-500 p-4">
      <p>Hình ảnh của bạn sẽ xuất hiện ở đây.</p>
    </div>
  );

  const firstTextResponse = editedResults?.find(r => r.text)?.text || null;

  const getGuideLines = () => {
    if (sizeOption === '5x5 cm') {
      return { top: '8%', eyes: '46%', chin: '76%' };
    }
    if (sizeOption === '3.5x4.5 cm' || sizeOption === '3.3x4.8 cm') {
      return { top: '8%', eyes: '45%', chin: '82%' };
    }
    // Default for 4x6, 3x4, etc.
    return { top: '8%', eyes: '37%', chin: '66.5%' };
  };

  const guideLines = getGuideLines();

  return (
    <>
      <div className="w-full bg-gray-900/50 p-6 rounded-2xl">
        <div className="flex flex-wrap justify-center gap-8">
          {/* Original Image Card */}
          {showOriginalImage && (
            <Card title="Ảnh gốc" sizeOption={sizeOption}>
              {originalImageComponent ? originalImageComponent : originalImageUrl ? <img src={originalImageUrl} alt="Original" className="object-contain w-full h-full" /> : placeholder}
            </Card>
          )}

          {/* Loading Card */}
          {isLoading && (
              <Card title="Đang tạo..." sizeOption={sizeOption}>
                  <div className="flex flex-col items-center gap-4 text-slate-400">
                  <Spinner size="lg" />
                  <span>AI đang xử lý...</span>
                  </div>
              </Card>
          )}

          {/* Edited Image Cards */}
          {!isLoading && editedResults && editedResults.map((result, index) => (
              <Card key={index} title={result.title} sizeOption={sizeOption}>
                  {result.imageUrl ? (
                      <div className="relative w-full h-full group">
                        <img 
                          src={result.imageUrl} 
                          alt={result.title} 
                          className="object-contain w-full h-full cursor-pointer transition-transform group-hover:scale-105" 
                          onClick={(e) => {
                            if (e.shiftKey) {
                              navigator.clipboard.writeText(result.prompt);
                              setToastMessage('Đã copy prompt vào clipboard!');
                            } else {
                              setZoomedImage(result.imageUrl);
                            }
                          }}
                          title="Click để phóng to, Shift + Click để copy prompt"
                        />
                        {showIdPhotoGuide && (
                          <div className="absolute inset-0 pointer-events-none opacity-50 group-hover:opacity-100 transition-opacity">
                            {/* Top of head line */}
                            <div className="absolute w-full border-t border-dashed border-green-400" style={{ top: guideLines.top }}>
                              <span className="absolute left-1 -top-4 text-[10px] text-green-400 font-mono bg-black/50 px-1 rounded">Đỉnh đầu</span>
                            </div>
                            {/* Eyes line */}
                            <div className="absolute w-full border-t border-dashed border-blue-400" style={{ top: guideLines.eyes }}>
                              <span className="absolute left-1 -top-4 text-[10px] text-blue-400 font-mono bg-black/50 px-1 rounded">Mắt</span>
                            </div>
                            {/* Chin line */}
                            <div className="absolute w-full border-t border-dashed border-green-400" style={{ top: guideLines.chin }}>
                              <span className="absolute left-1 -top-4 text-[10px] text-green-400 font-mono bg-black/50 px-1 rounded">Cằm</span>
                            </div>
                            {/* Center vertical line */}
                            <div className="absolute h-full border-l border-dashed border-white/30" style={{ left: '50%' }}></div>
                          </div>
                        )}
                      </div>
                  ) : (
                      <div className="text-center text-red-400 p-4">
                          <p>Tạo ảnh thất bại.</p>
                      </div>
                  )}
              </Card>
          ))}
        </div>
        {firstTextResponse && !isLoading && (
          <div className="mt-8 p-4 bg-slate-800/50 rounded-lg border border-slate-700">
              <h4 className="font-semibold text-cyan-400 mb-2">Phản hồi từ AI:</h4>
              <p className="text-slate-300 whitespace-pre-wrap">{firstTextResponse}</p>
          </div>
        )}
      </div>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-4 right-4 bg-emerald-600 text-white px-4 py-2 rounded-lg shadow-lg z-50 animate-fade-in">
          {toastMessage}
        </div>
      )}

      {/* Zoomed Image Modal */}
      {zoomedImage && (
        <div
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 animate-fade-in"
          onClick={() => setZoomedImage(null)}
          role="dialog"
          aria-modal="true"
        >
          <style>{`
            @keyframes fade-in {
              from { opacity: 0; }
              to { opacity: 1; }
            }
            .animate-fade-in { animation: fade-in 0.2s ease-out; }
          `}</style>
          <div
            className="relative max-w-4xl max-h-[90vh] bg-gray-950 p-2 rounded-lg shadow-2xl border border-slate-700"
            onClick={(e) => e.stopPropagation()}
          >
            <img src={zoomedImage} alt="Zoomed result" className="object-contain w-full h-full max-h-[calc(90vh-1rem)] rounded" />
            <DownloadButton imageUrl={zoomedImage} />
            {sizeOption && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleCreateSheet(zoomedImage);
                }}
                disabled={isGeneratingSheet}
                className="absolute top-4 left-4 z-10 flex items-center bg-slate-800/80 text-white font-semibold py-2 px-4 border border-slate-600 rounded-lg shadow-lg transition-all backdrop-blur-sm hover:bg-purple-600 hover:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50"
              >
                {isGeneratingSheet ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Đang tạo...
                  </span>
                ) : (
                  <span className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                    </svg>
                    Tạo Sheet 13x18cm (4 ảnh)
                  </span>
                )}
              </button>
            )}
            <button
              onClick={() => setZoomedImage(null)}
              className="absolute -top-5 -right-5 z-20 h-10 w-10 flex items-center justify-center bg-slate-600 text-white rounded-full hover:bg-red-500 transition-colors text-2xl font-bold leading-none"
              aria-label="Đóng chế độ xem ảnh phóng to"
            >
              &times;
            </button>
          </div>
        </div>
      )}
    </>
  );
};