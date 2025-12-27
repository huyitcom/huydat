import React, { useState, useEffect } from 'react';
import type { EditedImageResult } from '../types';
import { Spinner } from './Spinner';
import { DownloadButton } from './DownloadButton';

interface ResultDisplayProps {
  originalImageUrl: string | null;
  editedResults: EditedImageResult[] | null;
  isLoading: boolean;
  showOriginalImage?: boolean;
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


export const ResultDisplay: React.FC<ResultDisplayProps> = ({ originalImageUrl, editedResults, isLoading, showOriginalImage = true }) => {
  const [zoomedImage, setZoomedImage] = useState<string | null>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setZoomedImage(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const placeholder = (
    <div className="text-center text-slate-500 p-4">
      <p>Your images will appear here.</p>
    </div>
  );

  const firstTextResponse = editedResults?.find(r => r.text)?.text || null;

  return (
    <>
      <div className="w-full bg-gray-900/50 p-6 rounded-2xl">
        <div className="flex flex-wrap justify-center gap-8">
          {/* Original Image Card */}
          {showOriginalImage && (
            <Card title="Original Image">
              {originalImageUrl ? <img src={originalImageUrl} alt="Original" className="object-contain w-full h-full" /> : placeholder}
            </Card>
          )}

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
                      <img 
                        src={result.imageUrl} 
                        alt={result.title} 
                        className="object-contain w-full h-full cursor-pointer transition-transform hover:scale-105" 
                        onClick={() => setZoomedImage(result.imageUrl)}
                      />
                  ) : (
                      <div className="text-center text-red-400 p-4">
                          <p>Generation failed.</p>
                      </div>
                  )}
              </Card>
          ))}
        </div>
        {firstTextResponse && !isLoading && (
          <div className="mt-8 p-4 bg-slate-800/50 rounded-lg border border-slate-700">
              <h4 className="font-semibold text-cyan-400 mb-2">AI Response:</h4>
              <p className="text-slate-300 whitespace-pre-wrap">{firstTextResponse}</p>
          </div>
        )}
      </div>

      {/* Zoomed Image Modal */}
      {zoomedImage && (
        <div
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 animate-fade-in"
          onClick={() => setZoomedImage(null)}
          role="dialog"
          aria-modal="true"
        >
          <style>{`
            @keyframes fade-in {
              from { opacity: 0; }
              to { opacity: 1; }
            }
            .animate-fade-in { animation: fade-in 0.2s ease-out; }
          `}</style>
          <div
            className="relative max-w-4xl max-h-[90vh] bg-gray-950 p-2 rounded-lg shadow-2xl border border-slate-700"
            onClick={(e) => e.stopPropagation()}
          >
            <img src={zoomedImage} alt="Zoomed result" className="object-contain w-full h-full max-h-[calc(90vh-1rem)] rounded" />
            <DownloadButton imageUrl={zoomedImage} />
            <button
              onClick={() => setZoomedImage(null)}
              className="absolute -top-5 -right-5 z-20 h-10 w-10 flex items-center justify-center bg-slate-600 text-white rounded-full hover:bg-red-500 transition-colors text-2xl font-bold leading-none"
              aria-label="Close zoomed image view"
            >
              &times;
            </button>
          </div>
        </div>
      )}
    </>
  );
};