
import React, { useRef } from 'react';

interface ClothingOptionsProps {
  selected: string;
  onChange: (option: string) => void;
  disabled: boolean;
  onClothingFileChange: (file: File | null) => void;
  clothingPreviewUrl: string | null;
}

const presetOptions = ['Áo sơ mi trắng', 'Áo sơ mi xanh nhạt', 'Áo sơ mi hồng nhạt', 'Áo vest', 'Áo dài trắng', 'Áo dài xanh nhạt', 'Áo dài hồng nhạt'];

export const ClothingOptions: React.FC<ClothingOptionsProps> = ({ selected, onChange, disabled, onClothingFileChange, clothingPreviewUrl }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const handleUploadAreaClick = () => {
    if (disabled) return;
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;
    onClothingFileChange(file);
    // onChange will be called from App.tsx after the file is processed
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-slate-300">
        2. Chọn trang phục
      </label>
      <div className="grid grid-cols-2 gap-2">
        {presetOptions.map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => onChange(option)}
            disabled={disabled}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-black focus:ring-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed h-12 flex items-center justify-center text-center
              ${selected === option
                ? 'bg-cyan-600 text-white shadow-md'
                : 'bg-slate-700/50 text-slate-300 hover:bg-slate-600/70'
              }`}
          >
            {option}
          </button>
        ))}
        {/* Uploader Button */}
        <div 
          onClick={handleUploadAreaClick}
          className={`px-4 py-2 rounded-md transition-colors flex items-center justify-center text-center h-12
            ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
            ${selected === 'Áo tải lên'
              ? 'bg-cyan-600 text-white shadow-md ring-2 ring-cyan-500 ring-offset-2 ring-offset-black'
              : 'bg-slate-700/50 text-slate-300 hover:bg-slate-600/70'
            }`}
          role="button"
          tabIndex={disabled ? -1 : 0}
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleUploadAreaClick();}}
          aria-label="Tải lên hình ảnh trang phục"
        >
          <input
            ref={fileInputRef}
            type="file"
            className="sr-only"
            accept="image/png, image/jpeg, image/gif"
            onChange={handleFileChange}
            disabled={disabled}
          />
          {clothingPreviewUrl && selected === 'Áo tải lên' ? (
            <img src={clothingPreviewUrl} alt="Áo tải lên" className="h-full py-1 object-contain" />
          ) : (
            <span className="text-sm font-medium">+ Tải lên</span>
          )}
        </div>
      </div>
    </div>
  );
};