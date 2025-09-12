
import React from 'react';

interface ClothingOptionsProps {
  selected: string;
  onChange: (option: string) => void;
  disabled: boolean;
}

const options = ['White shirt', 'Business suit', 'Vietnamese Ao Dai'];

export const ClothingOptions: React.FC<ClothingOptionsProps> = ({ selected, onChange, disabled }) => {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-slate-300">
        2. Choose Clothing
      </label>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => onChange(option)}
            disabled={disabled}
            className={`flex-grow px-4 py-2 text-sm font-medium rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed
              ${selected === option
                ? 'bg-purple-600 text-white shadow-md'
                : 'bg-slate-700/50 text-slate-300 hover:bg-slate-600/70'
              }`}
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  );
};
