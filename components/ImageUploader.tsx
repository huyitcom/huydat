
import React, { useRef, useState, useEffect, useCallback } from 'react';

interface ImageUploaderProps {
  onFileChange: (file: File | null) => void;
  previewUrl: string | null;
  showCameraButton?: boolean;
}

const CameraIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M4 5a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V7a2 2 0 00-2-2h-1.586l-1.707-1.707A2 2 0 0013.207 3H6.793a2 2 0 00-1.414.586L4.586 5H4zm6 5a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
    </svg>
);


export const ImageUploader: React.FC<ImageUploaderProps> = ({ onFileChange, previewUrl, showCameraButton }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [countdown, setCountdown] = useState<number | null>(null);
  const countdownIntervalRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const startCountdown = useCallback(() => {
    setCountdown(5);
  }, []);

  const capturePhoto = useCallback(() => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      const video = videoRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const context = canvas.getContext('2d');
      if (context) {
        // Flip the canvas horizontally to match the mirrored video preview
        context.translate(canvas.width, 0);
        context.scale(-1, 1);
        context.drawImage(video, 0, 0, canvas.width, canvas.height);

        canvas.toBlob((blob) => {
          if (blob) {
            const file = new File([blob], 'camera-capture.png', { type: 'image/png' });
            onFileChange(file);
          }
        }, 'image/png');
      }
      setIsCameraOpen(false); // Close camera after capture
    }
  }, [onFileChange]);

  // Effect for camera stream
  useEffect(() => {
    let stream: MediaStream | null = null;
    const videoEl = videoRef.current;

    if (isCameraOpen) {
      const openCamera = async () => {
        try {
          stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            // Start countdown when the video is ready
            videoRef.current.onloadedmetadata = () => {
              startCountdown();
            };
          }
        } catch (err) {
          console.error("Error accessing camera:", err);
          setIsCameraOpen(false); // Close modal on error
        }
      };
      openCamera();
    }

    // Cleanup function
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      if (videoEl) {
        videoEl.srcObject = null;
        videoEl.onloadedmetadata = null;
      }
      if (countdownIntervalRef.current) {
        clearTimeout(countdownIntervalRef.current);
      }
      setCountdown(null);
    };
  }, [isCameraOpen, startCountdown]);

  // Effect for countdown timer
  useEffect(() => {
    if (countdown !== null && countdown > 0) {
      countdownIntervalRef.current = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
    } else if (countdown === 0) {
      capturePhoto();
      setCountdown(null);
    }

    // Cleanup timeout on unmount or if countdown is stopped
    return () => {
      if (countdownIntervalRef.current) {
        clearTimeout(countdownIntervalRef.current);
      }
    };
  }, [countdown, capturePhoto]);

  const handleAreaClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;
    onFileChange(file);
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(false);

    if (event.dataTransfer.files && event.dataTransfer.files.length > 0) {
      const file = event.dataTransfer.files[0];
      onFileChange(file);
      event.dataTransfer.clearData();
    }
  };
  
  const handleCancelCamera = () => {
    setIsCameraOpen(false);
  };


  return (
    <div className="space-y-2">
       <div className="flex justify-between items-center">
        <label className="block text-sm font-medium text-slate-300">
          1. Upload Your Image
        </label>
        {showCameraButton && (
          <button
            type="button"
            onClick={() => setIsCameraOpen(true)}
            className="inline-flex items-center rounded bg-slate-600/50 px-2.5 py-1.5 text-xs font-semibold text-slate-300 shadow-sm hover:bg-slate-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-500 transition-colors"
          >
            <CameraIcon />
            Use Camera
          </button>
        )}
      </div>
      <div
        onClick={handleAreaClick}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`mt-1 flex justify-center items-center w-full h-64 px-6 pt-5 pb-6 border-2 border-slate-600 border-dashed rounded-lg cursor-pointer hover:border-cyan-500 transition-all ${isDragging ? 'border-cyan-500 bg-slate-800/50 scale-105' : ''}`}
      >
        {previewUrl ? (
          <img src={previewUrl} alt="Preview" className="max-h-full max-w-full object-contain rounded-md" />
        ) : (
          <div className="space-y-1 text-center">
            <svg
              className="mx-auto h-12 w-12 text-slate-500"
              stroke="currentColor"
              fill="none"
              viewBox="0 0 48 48"
              aria-hidden="true"
            >
              <path
                d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <div className="flex text-sm text-slate-400">
              <p className="pl-1">Click to upload or drag and drop</p>
            </div>
            <p className="text-xs text-slate-500">PNG, JPG, GIF up to 10MB</p>
          </div>
        )}
      </div>
      <input
        ref={fileInputRef}
        id="file-upload"
        name="file-upload"
        type="file"
        className="sr-only"
        accept="image/png, image/jpeg, image/gif"
        onChange={handleFileChange}
      />
      {isCameraOpen && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4" aria-modal="true" role="dialog">
            <div className="bg-slate-800 rounded-lg shadow-xl p-4 w-full max-w-2xl border border-slate-700">
                <div className="relative">
                    <video ref={videoRef} autoPlay playsInline className="w-full h-auto rounded-md transform -scale-x-100"></video>
                    {countdown !== null && countdown > 0 && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-md">
                            <span className="text-white text-9xl font-bold drop-shadow-lg">{countdown}</span>
                        </div>
                    )}
                    {countdown === 0 && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-md">
                            <span className="text-white text-4xl font-bold drop-shadow-lg">Capturing...</span>
                        </div>
                    )}
                </div>
                <div className="mt-4 flex justify-center">
                    <button onClick={handleCancelCamera} className="w-full justify-center items-center rounded-md bg-slate-600 px-4 py-3 text-sm font-semibold text-white shadow-sm hover:bg-slate-500">
                        Cancel
                    </button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};