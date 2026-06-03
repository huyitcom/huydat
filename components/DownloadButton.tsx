
import React, { useState } from 'react';
import { changeDpi } from '../src/lib/imageUtils';

interface DownloadButtonProps {
  imageUrl: string;
  sizeOption?: string;
}

const DownloadIcon: React.FC = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
  </svg>
);

const PrinterIcon: React.FC = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="6 9 6 2 18 2 18 9"></polyline>
    <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path>
    <rect x="6" y="14" width="12" height="8"></rect>
  </svg>
);

const resizeAndGetBase64 = (base64: string, targetWidth: number, targetHeight: number): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = targetWidth;
      canvas.height = targetHeight;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Canvas context not available'));
        return;
      }
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(img, 0, 0, img.width, img.height, 0, 0, targetWidth, targetHeight);
      
      const mimeTypeMatch = base64.match(/^data:([^;]+);base64,/);
      const mimeType = mimeTypeMatch ? mimeTypeMatch[1] : 'image/jpeg';
      const quality = mimeType === 'image/png' ? undefined : 0.98;
      
      resolve(canvas.toDataURL(mimeType, quality));
    };
    img.onerror = reject;
    img.src = base64;
  });
};

export const DownloadButton: React.FC<DownloadButtonProps> = ({ imageUrl, sizeOption }) => {
  const [isResizing, setIsResizing] = useState(false);
  const [isResizingHd, setIsResizingHd] = useState(false);

  // Normalize sizeOption and fallback to '4x6' if not a standard size or undefined/empty
  const rawSize = sizeOption && sizeOption !== 'Gốc' ? sizeOption.trim() : '4x6';
  const cleanSize = rawSize.replace(' cm', '');
  
  const standardSizes = ['5x5', '2x3', '3x4', '4x6', '3.5x4.5', '3.3x4.8', '6x9', '5x7'];
  const isStandardSize = standardSizes.includes(cleanSize);

  const getTargetPhysicalDimensions = (dpi: number = 400) => {
    let targetWidthMm = 0;
    let targetHeightMm = 0;

    switch (cleanSize) {
      case '5x5': targetWidthMm = 50; targetHeightMm = 50; break;
      case '2x3': targetWidthMm = 20; targetHeightMm = 30; break;
      case '3x4': targetWidthMm = 30; targetHeightMm = 40; break;
      case '4x6': targetWidthMm = 40; targetHeightMm = 60; break;
      case '3.5x4.5': targetWidthMm = 35; targetHeightMm = 45; break;
      case '3.3x4.8': targetWidthMm = 33; targetHeightMm = 48; break;
      case '6x9': targetWidthMm = 60; targetHeightMm = 90; break;
      case '5x7': targetWidthMm = 50; targetHeightMm = 70; break;
      default: return null;
    }
    const MM_TO_INCH = 1 / 25.4;
    return {
      width: Math.round(targetWidthMm * MM_TO_INCH * dpi),
      height: Math.round(targetHeightMm * MM_TO_INCH * dpi)
    };
  };

  const handleDownloadHighRes = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    if (!imageUrl) return;

    const dimensions = getTargetPhysicalDimensions(1300);
    if (!dimensions) return;

    setIsResizingHd(true);
    try {
      const resizedBase64 = await resizeAndGetBase64(imageUrl, dimensions.width, dimensions.height);
      const highDpiImageUrl = changeDpi(resizedBase64, 1300);

      const link = document.createElement('a');
      link.href = highDpiImageUrl;

      const mimeType = highDpiImageUrl.split(';')[0].split(':')[1];
      const extension = mimeType ? mimeType.split('/')[1] : 'png';
      link.download = `photo-${cleanSize}cm-1300dpi.${extension}`;
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error('Error resizing HD image:', err);
    } finally {
      setIsResizingHd(false);
    }
  };

  const handleDownloadStandard = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    if (!imageUrl) return;

    const dimensions = getTargetPhysicalDimensions();
    if (!dimensions) return;

    setIsResizing(true);
    try {
      const resizedBase64 = await resizeAndGetBase64(imageUrl, dimensions.width, dimensions.height);
      const highDpiResizedUrl = changeDpi(resizedBase64, 400);

      const link = document.createElement('a');
      link.href = highDpiResizedUrl;

      const mimeType = highDpiResizedUrl.split(';')[0].split(':')[1];
      const extension = mimeType ? mimeType.split('/')[1] : 'png';
      link.download = `photo-${cleanSize}cm-400dpi.${extension}`;
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error('Error resizing image:', err);
    } finally {
      setIsResizing(false);
    }
  };

  return (
    <div className="flex flex-col sm:flex-row gap-2 items-center">
      {isStandardSize && (
        <button
          onClick={handleDownloadStandard}
          disabled={isResizing || isResizingHd}
          className="w-full sm:w-auto flex items-center justify-center bg-cyan-600 border border-cyan-500 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition-all hover:bg-cyan-500 hover:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 disabled:opacity-50 text-xs sm:text-sm active:scale-95"
          aria-label={`Tải xuống ảnh cỡ chuẩn ${cleanSize} cm`}
        >
          <PrinterIcon />
          {isResizing ? 'Đang tạo...' : 'Tải file'}
        </button>
      )}
      <button
        onClick={handleDownloadHighRes}
        disabled={isResizing || isResizingHd}
        className="w-full sm:w-auto flex items-center justify-center bg-slate-800 border border-slate-700 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition-all hover:bg-slate-700 hover:border-slate-600 focus:outline-none focus:ring-2 focus:ring-cyan-500 disabled:opacity-50 text-xs sm:text-sm active:scale-95"
        aria-label="Tải xuống ảnh chất lượng cao 1300 DPI"
      >
        <DownloadIcon />
        {isResizingHd ? 'Đang xử lý...' : 'Tải file HD'}
      </button>
    </div>
  );
};