
import React from 'react';

interface PromptInputProps {
  value: string;
  onChange: (event: React.ChangeEvent<HTMLTextAreaElement>) => void;
  disabled: boolean;
  label?: string;
  placeholder?: string;
  rows?: number;
}

export const PromptInput: React.FC<PromptInputProps> = ({ 
  value, 
  onChange, 
  disabled, 
  label = "4. Xem lại & Sửa mô tả", 
  placeholder = "VD: 'Thêm mũ dự tiệc dễ thương cho mèo' hoặc 'Đổi nền thành ngọn núi tuyết'", 
  rows = 6 
}) => {
  return (
    <div className="space-y-2">
      <label htmlFor="prompt" className="block text-sm font-medium text-slate-300">
        {label}
      </label>
      <textarea
        id="prompt"
        name="prompt"
        rows={rows}
        className="block w-full rounded-md border-0 bg-slate-700/50 py-2 px-3 text-slate-200 shadow-sm ring-1 ring-inset ring-slate-600 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-cyan-500 sm:text-sm sm:leading-6 transition"
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        disabled={disabled}
      />
    </div>
  );
};