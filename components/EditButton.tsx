
import React from 'react';
import { Spinner } from './Spinner';

interface EditButtonProps {
  onClick: () => void;
  isLoading: boolean;
  disabled: boolean;
  label?: string;
  buttonText?: string;
}

export const EditButton: React.FC<EditButtonProps> = ({ onClick, isLoading, disabled, label = "4. Tạo ảnh", buttonText = "Áp dụng" }) => {
  const loadingText = buttonText === "Áp dụng" ? "Đang chỉnh sửa..." : "Đang tạo...";
  
  return (
    <div className="space-y-2">
       <label className="block text-sm font-medium text-slate-300">
        {label}
      </label>
      <button
        type="button"
        onClick={onClick}
        disabled={isLoading || disabled}
        className="flex w-full justify-center items-center rounded-md bg-cyan-600 px-4 py-3 text-sm font-semibold text-white shadow-sm hover:bg-cyan-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
      >
        {isLoading ? (
          <>
            <Spinner />
            <span>{loadingText}</span>
          </>
        ) : (
          <span>{buttonText}</span>
        )}
      </button>
    </div>
  );
};