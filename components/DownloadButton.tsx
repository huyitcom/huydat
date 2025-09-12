import React from 'react';

interface DownloadButtonProps {
  imageUrl: string;
}

const DownloadIcon: React.FC = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
  </svg>
);

export const DownloadButton: React.FC<DownloadButtonProps> = ({ imageUrl }) => {
  const handleDownload = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation(); // Prevent any parent onClick handlers from firing
    if (!imageUrl) return;

    const link = document.createElement('a');
    link.href = imageUrl;

    // Infer extension from mime type in data URL
    const mimeType = imageUrl.split(';')[0].split(':')[1];
    const extension = mimeType ? mimeType.split('/')[1] : 'png';
    link.download = `edited-image.${extension}`;
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <button
      onClick={handleDownload}
      className="absolute top-4 right-4 z-10 flex items-center bg-slate-800/80 text-white font-semibold py-2 px-4 border border-slate-600 rounded-lg shadow-lg transition-all backdrop-blur-sm hover:bg-purple-600 hover:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-75"
      aria-label="Download edited image"
    >
      <DownloadIcon />
      Download
    </button>
  );
};
