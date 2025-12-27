
import React from 'react';

interface PreserveFaceToggleProps {
  checked: boolean;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  disabled: boolean;
  label?: string;
  description?: string;
  id?: string;
}

export const PreserveFaceToggle: React.FC<PreserveFaceToggleProps> = ({ 
  checked, 
  onChange, 
  disabled, 
  label = "Preserve Face Structure", 
  description = "Attempts to keep the original facial features intact.",
  id = "preserve-face"
}) => {
  return (
    <div className="flex items-center justify-between bg-slate-700/30 p-3 rounded-lg">
      <div className="flex flex-col">
        <label htmlFor={id} className="font-medium text-slate-300 cursor-pointer">
          {label}
        </label>
        <span className="text-xs text-slate-400">{description}</span>
      </div>
      <label htmlFor={id} className="relative inline-flex items-center cursor-pointer">
        <input
          type="checkbox"
          id={id}
          className="sr-only peer"
          checked={checked}
          onChange={onChange}
          disabled={disabled}
        />
        <div className="w-11 h-6 bg-slate-600 rounded-full peer peer-focus:ring-2 peer-focus:ring-cyan-500 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-600"></div>
      </label>
    </div>
  );
};