
import React from 'react';

interface StudioLightButtonProps {
  onClick: () => void;
  disabled: boolean;
}

const LightbulbIcon: React.FC = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 20 20" fill="currentColor">
    <path d="M11 3a1 1 0 10-2 0v1a1 1 0 102 0V3zM15.657 5.657a1 1 0 00-1.414-1.414l-.707.707a1 1 0 001.414 1.414l.707-.707zM18 10a1 1 0 01-1 1h-1a1 1 0 110-2h1a1 1 0 011 1zM5.05 14.95a1 1 0 001.414 1.414l.707-.707a1 1 0 00-1.414-1.414l-.707.707zM4 10a1 1 0 01-1 1H2a1 1 0 110-2h1a1 1 0 011 1zM10 18a1 1 0 001-1v-1a1 1 0 10-2 0v1a1 1 0 001 1zM8.94 15.95l-3.536 3.536A1 1 0 014 18.07V14a8 8 0 1111.968-4.524A6 6 0 0010 14a6.002 6.002 0 00-1.06 3.95z" />
  </svg>
);


export const StudioLightButton: React.FC<StudioLightButtonProps> = ({ onClick, disabled }) => {
  return (
    <div className="mt-2 text-right">
      <button
        type="button"
        onClick={onClick}
        disabled={disabled}
        className="inline-flex items-center rounded bg-slate-600/50 px-2.5 py-1.5 text-xs font-semibold text-slate-300 shadow-sm hover:bg-slate-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        aria-label="Add professional studio lighting effect to the prompt"
      >
        <LightbulbIcon />
        Add Studio Light
      </button>
    </div>
  );
};