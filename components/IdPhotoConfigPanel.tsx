import React from 'react';

interface IdPhotoConfigPanelProps {
  sizeOption: string;
  setSizeOption: (val: string) => void;
  bgColor: string;
  setBgColor: (val: string) => void;
  clothingOption: string;
  setClothingOption: (val: string) => void;
  skinSmooth: number;
  setSkinSmooth: (val: number) => void;
  removeBlemishes: boolean;
  setRemoveBlemishes: (val: boolean) => void;
  balanceFacialFeatures: boolean;
  setBalanceFacialFeatures: (val: boolean) => void;
  imageSize: string;
  setImageSize: (val: string) => void;
  manualPrompt: string;
  setManualPrompt: (val: string) => void;
  useManualPrompt: boolean;
  setUseManualPrompt: (val: boolean) => void;
  disabled?: boolean;
}

export const IdPhotoConfigPanel: React.FC<IdPhotoConfigPanelProps> = ({
  sizeOption, setSizeOption,
  bgColor, setBgColor,
  clothingOption, setClothingOption,
  skinSmooth, setSkinSmooth,
  removeBlemishes, setRemoveBlemishes,
  balanceFacialFeatures, setBalanceFacialFeatures,
  imageSize, setImageSize,
  manualPrompt, setManualPrompt,
  useManualPrompt, setUseManualPrompt,
  disabled
}) => {
  const sizeOptions = ['5x5 cm', '2x3 cm', '3x4 cm', '4x6 cm', '3.5x4.5 cm', '3.3x4.8 cm'];
  const bgColors = [
    { id: 'white', class: 'bg-white border-gray-300' },
    { id: 'blue', class: 'bg-[#3b82f6] border-[#2563eb]' },
    { id: 'black', class: 'bg-[#000000] border-gray-700' },
    { id: 'gray', class: 'bg-[#6b7280] border-[#4b5563]' },
    { id: 'dark-gray', class: 'bg-[#374151] border-[#1f2937]' },
    { id: 'dark-blue', class: 'bg-[#1e3a8a] border-[#1e40af]' },
    { id: 'light-pink', class: 'bg-[#fbcfe8] border-[#f9a8d4]' },
  ];
  const clothingOptionsList = [
    'Giữ Nguyên', 'Vest Nam (Đen)', 'Vest Nữ', 'Sơ Mi Nam', 'Sơ Mi Nữ', 'Polo Trắng', 'Polo Đen', 'Thun Trắng'
  ];

  return (
    <div className="bg-[#111827] rounded-xl p-6 border border-gray-800 text-gray-300">
      {/* Kích Thước */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-3">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
          </svg>
          <h3 className="font-medium">Kích Thước Khung Hình</h3>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {sizeOptions.map(size => (
            <button
              key={size}
              onClick={() => setSizeOption(size)}
              disabled={disabled}
              className={`py-2 px-4 rounded-lg text-sm border transition-colors ${
                sizeOption === size
                  ? 'bg-[#2D1B4E] border-purple-500 text-white'
                  : 'bg-[#1F2937] border-gray-700 hover:bg-gray-800'
              } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {size}
            </button>
          ))}
        </div>
      </div>

      {/* Độ Phân Giải */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-3">
          <svg className="w-4 h-4 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <h3 className="font-medium">Độ Phân Giải</h3>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {['1K', '2K', '4K'].map(res => (
            <button
              key={res}
              onClick={() => setImageSize(res)}
              disabled={disabled}
              className={`py-2 px-3 rounded-lg text-sm border transition-colors text-center ${
                imageSize === res
                  ? 'bg-[#164e63] border-cyan-500 text-white'
                  : 'bg-[#1F2937] border-gray-700 hover:bg-gray-800'
              } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {res}
            </button>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-700 mb-6">
        <button
          className={`flex-1 py-2 text-center font-medium text-sm transition-colors ${!useManualPrompt ? 'text-purple-400 border-b-2 border-purple-500' : 'text-gray-400 hover:text-gray-200'}`}
          onClick={() => setUseManualPrompt(false)}
          disabled={disabled}
        >
          Cấu Hình Tự Động
        </button>
        <button
          className={`flex-1 py-2 text-center font-medium text-sm transition-colors ${useManualPrompt ? 'text-purple-400 border-b-2 border-purple-500' : 'text-gray-400 hover:text-gray-200'}`}
          onClick={() => setUseManualPrompt(true)}
          disabled={disabled}
        >
          Nhập Prompt Thủ Công
        </button>
      </div>

      {!useManualPrompt ? (
        <>
          {/* Màu Nền */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
              </svg>
              <h3 className="font-medium">Màu Nền</h3>
            </div>
            <div className="flex items-center gap-4 bg-[#1F2937] p-3 rounded-lg border border-gray-700">
              {bgColors.map(color => (
                <button
                  key={color.id}
                  onClick={() => setBgColor(color.id)}
                  disabled={disabled}
                  className={`w-8 h-8 rounded-full border-2 transition-transform ${
                    bgColor === color.id ? 'ring-2 ring-purple-500 ring-offset-2 ring-offset-[#1F2937] scale-110' : ''
                  } ${color.class} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                />
              ))}
            </div>
          </div>

          {/* Thay Trang Phục */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <svg className="w-4 h-4 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <h3 className="font-medium">Thay Trang Phục</h3>
            </div>
            <div className="grid grid-cols-2 gap-3 max-h-48 overflow-y-auto pr-2 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-[#1F2937] [&::-webkit-scrollbar-track]:rounded-md [&::-webkit-scrollbar-thumb]:bg-[#4B5563] [&::-webkit-scrollbar-thumb]:rounded-md hover:[&::-webkit-scrollbar-thumb]:bg-[#6B7280]">
              {clothingOptionsList.map(clothing => (
                <button
                  key={clothing}
                  onClick={() => setClothingOption(clothing)}
                  disabled={disabled}
                  className={`py-2 px-4 rounded-lg text-sm border transition-colors text-left ${
                    clothingOption === clothing
                      ? 'bg-[#2D1B4E] border-purple-500 text-white'
                      : 'bg-[#1F2937] border-gray-700 hover:bg-gray-800'
                  } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {clothing}
                </button>
              ))}
            </div>
          </div>

          <hr className="border-gray-800 my-6" />

          {/* Làm Đẹp Da & Xử Lý */}
          <div>
            <h3 className="font-medium mb-4 text-white">Làm Đẹp Da & Xử Lý</h3>
            
            <div className="mb-6">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-white">Mịn Da (Skin Smooth)</span>
                <span className="text-gray-400">{skinSmooth}</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={skinSmooth}
                onChange={(e) => setSkinSmooth(parseInt(e.target.value))}
                disabled={disabled}
                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-purple-500"
              />
            </div>

            <div className="space-y-4">
              <label className={`flex items-center gap-3 ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}>
                <input
                  type="checkbox"
                  checked={removeBlemishes}
                  onChange={(e) => setRemoveBlemishes(e.target.checked)}
                  disabled={disabled}
                  className="w-5 h-5 rounded border-gray-600 text-purple-500 focus:ring-purple-500 bg-gray-800"
                />
                <div>
                  <div className="text-sm font-medium text-white">Nhặt Mụn / Xóa Vết Xước</div>
                  <div className="text-xs text-gray-500">Acne & Blemish Removal</div>
                </div>
              </label>

              <label className={`flex items-center gap-3 ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}>
                <input
                  type="checkbox"
                  checked={balanceFacialFeatures}
                  onChange={(e) => setBalanceFacialFeatures(e.target.checked)}
                  disabled={disabled}
                  className="w-5 h-5 rounded border-gray-600 text-purple-500 focus:ring-purple-500 bg-gray-800"
                />
                <div className="text-sm font-medium text-white">Cân Bằng Ngũ Quan</div>
              </label>
            </div>
          </div>
        </>
      ) : (
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <svg className="w-4 h-4 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            <h3 className="font-medium">Nhập Prompt Thủ Công</h3>
          </div>
          <textarea
            value={manualPrompt}
            onChange={(e) => setManualPrompt(e.target.value)}
            disabled={disabled}
            placeholder="Nhập prompt tiếng Anh tại đây..."
            className="w-full h-32 bg-[#1F2937] border border-gray-700 rounded-lg p-3 text-sm text-gray-200 focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
          />
          <p className="text-xs text-gray-500 mt-2">
            Lưu ý: Hệ thống sẽ chỉ sử dụng chính xác câu prompt này của bạn mà không thêm bất kỳ từ khóa nào khác. (Kích thước khung hình và độ phân giải vẫn được áp dụng ở bước cắt ảnh).
          </p>
        </div>
      )}
    </div>
  );
};
