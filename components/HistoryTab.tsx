
import React, { useEffect, useState } from 'react';
import { getHistory, clearHistory } from '../services/historyService';
import { HistoryItem } from '../types';
import { DownloadButton } from './DownloadButton';

export const HistoryTab: React.FC = () => {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [zoomedImage, setZoomedImage] = useState<string | null>(null);

  useEffect(() => {
    setHistory(getHistory());
  }, []);

  const handleClear = () => {
    if (confirm('Are you sure you want to clear your history? This cannot be undone.')) {
        clearHistory();
        setHistory([]);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <style>{`
        @keyframes fade-in {
            from { opacity: 0; }
            to { opacity: 1; }
        }
        .animate-fade-in { animation: fade-in 0.3s ease-out; }
      `}</style>

      <div className="flex justify-between items-center bg-slate-800/50 p-6 rounded-2xl border border-slate-700">
        <div>
            <h2 className="text-2xl font-bold text-slate-100">Creation History</h2>
            <p className="text-slate-400 text-sm mt-1">Images are saved locally in your browser (Max 20)</p>
        </div>
        {history.length > 0 && (
            <button
                onClick={handleClear}
                className="px-4 py-2 text-sm text-red-300 hover:text-red-200 border border-red-900/50 hover:bg-red-900/20 rounded-md transition-colors"
            >
                Clear History
            </button>
        )}
      </div>

      {history.length === 0 ? (
        <div className="text-center py-20 text-slate-500 bg-slate-900/30 rounded-2xl border border-slate-800 border-dashed">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto mb-4 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p>No history yet. Generate some images to see them here!</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {history.map((item) => (
            <div key={item.id} className="group relative bg-slate-800 rounded-xl overflow-hidden shadow-lg border border-slate-700 transition-all hover:-translate-y-1 hover:shadow-cyan-900/20">
              <div 
                className="aspect-square w-full overflow-hidden cursor-pointer bg-slate-900 relative"
                onClick={() => setZoomedImage(item.imageUrl)}
              >
                <img 
                    src={item.imageUrl} 
                    alt="Generated image"
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
                    loading="lazy"
                />
                 <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
              </div>
              <div className="p-4">
                <div className="flex justify-between items-center">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                        item.category === 'id' ? 'bg-cyan-900/50 text-cyan-200 border border-cyan-800' : 'bg-purple-900/50 text-purple-200 border border-purple-800'
                    }`}>
                        {item.category}
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">
                        {new Date(item.timestamp).toLocaleDateString()}
                    </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      
       {/* Zoomed Image Modal */}
      {zoomedImage && (
        <div
          className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4 animate-fade-in backdrop-blur-sm"
          onClick={() => setZoomedImage(null)}
        >
          <div className="relative max-w-5xl max-h-[90vh] flex flex-col items-center" onClick={(e) => e.stopPropagation()}>
            <img src={zoomedImage} alt="Zoomed" className="max-h-[85vh] w-auto max-w-full rounded-lg shadow-2xl border border-slate-700" />
            <DownloadButton imageUrl={zoomedImage} />
            <button
              onClick={() => setZoomedImage(null)}
              className="absolute -top-10 -right-4 sm:-right-10 text-slate-400 hover:text-white transition-colors p-2"
            >
               <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
