
import React from 'react';
import { Spinner } from './Spinner';

interface EditButtonProps {
  onClick: () => void;
  isLoading: boolean;
  disabled: boolean;
}

export const EditButton: React.FC<EditButtonProps> = ({ onClick, isLoading, disabled }) => {
  return (
    <div className="space-y-2">
       <label className="block text-sm font-medium text-slate-300">
        4. Generate
      </label>
      <button
        type="button"
        onClick={onClick}
        disabled={isLoading || disabled}
        className="flex w-full justify-center items-center rounded-md bg-purple-600 px-4 py-3 text-sm font-semibold text-white shadow-sm hover:bg-purple-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-purple-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
      >
        {isLoading ? (
          <>
            <Spinner />
            <span>Editing...</span>
          </>
        ) : (
          <span>Apply Edit</span>
        )}
      </button>
    </div>
  );
};
