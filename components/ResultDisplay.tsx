import React from 'react';
import type { EditedImageResult } from '../types';
import { Spinner } from './Spinner';
import { DownloadButton } from './DownloadButton';

interface ResultDisplayProps {
  originalImageUrl: string | null;
  editedResults: EditedImageResult[] | null;
  isLoading: boolean;
}

const Card: React.FC<{ title: string; children: React.ReactNode; }> = ({ title, children }) => {
    return (
        <div className="flex-1 min-w-[280px] w-full sm:w-auto">
            <h3 className="text-lg font-semibold text-slate-300 mb-3 text-center">{title}</h3>
            <div className="relative aspect-square w-full bg-slate-800/50 rounded-lg flex items-center justify-center border border-slate-700 overflow-hidden">
                {children}
            </div>
        </div>
    );
}


export const ResultDisplay: React.FC<ResultDisplayProps> = ({ originalImageUrl, editedResults, isLoading }) => {
  const placeholder = (
    <div className="text-center text-slate-500 p-4">
      <p>Your images will appear here.</p>
    </div>
  );

  const firstTextResponse = editedResults?.find(r => r.text)?.text || null;

  return (
    <div className="w-full bg-slate-900/50 p-6 rounded-2xl">
      <div className="flex flex-wrap justify-center gap-8">
        {/* Original Image Card */}
        <Card title="Original Image">
          {originalImageUrl ? <img src={originalImageUrl} alt="Original" className="object-contain w-full h-full" /> : placeholder}
        </Card>

        {/* Loading Card */}
        {isLoading && (
            <Card title="Generating...">
                <div className="flex flex-col items-center gap-4 text-slate-400">
                <Spinner size="lg" />
                <span>AI is working...</span>
                </div>
            </Card>
        )}

        {/* Edited Image Cards */}
        {!isLoading && editedResults && editedResults.map((result, index) => (
            <Card key={index} title={result.title}>
                {result.imageUrl ? (
                    <>
                        <img src={result.imageUrl} alt={result.title} className="object-contain w-full h-full" />
                        <DownloadButton imageUrl={result.imageUrl} />
                    </>
                ) : (
                    <div className="text-center text-red-400 p-4">
                        <p>Generation failed.</p>
                    </div>
                )}
            </Card>
        ))}

        {/* Placeholder for Edited when not loading and no results */}
        {!isLoading && !editedResults && (
            <Card title="Edited Image">
                {placeholder}
            </Card>
        )}
      </div>
      {firstTextResponse && !isLoading && (
        <div className="mt-8 p-4 bg-slate-800/50 rounded-lg border border-slate-700">
            <h4 className="font-semibold text-purple-400 mb-2">AI Response:</h4>
            <p className="text-slate-300 whitespace-pre-wrap">{firstTextResponse}</p>
        </div>
      )}
    </div>
  );
};
