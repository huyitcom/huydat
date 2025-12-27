import React, { useRef, useEffect, useState, useImperativeHandle, forwardRef, useCallback } from 'react';
import type { ImageMaskerRef } from '../types';

interface ImageMaskerProps {
  src: string;
  brushSize: number;
  brushColor?: string;
}

const ImageMasker = forwardRef<ImageMaskerRef, ImageMaskerProps>(({ src, brushSize, brushColor = '#FFFFFF' }, ref) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const imageCanvasRef = useRef<HTMLCanvasElement>(null);
  const drawingCanvasRef = useRef<HTMLCanvasElement>(null);
  
  const [isDrawing, setIsDrawing] = useState(false);
  const lastPoint = useRef<{ x: number; y: number } | null>(null);
  const [history, setHistory] = useState<ImageData[]>([]);

  const getCanvasCoordinates = (event: React.MouseEvent | React.TouchEvent) => {
    const canvas = drawingCanvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const touch = (event as React.TouchEvent).touches?.[0];
    const clientX = touch ? touch.clientX : (event as React.MouseEvent).clientX;
    const clientY = touch ? touch.clientY : (event as React.MouseEvent).clientY;
    
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY,
    };
  };

  const drawLine = useCallback((x1: number, y1: number, x2: number, y2: number) => {
    const context = drawingCanvasRef.current?.getContext('2d');
    if (!context) return;
    context.strokeStyle = brushColor;
    context.lineWidth = brushSize;
    context.lineCap = 'round';
    context.lineJoin = 'round';
    context.beginPath();
    context.moveTo(x1, y1);
    context.lineTo(x2, y2);
    context.stroke();
  }, [brushColor, brushSize]);

  const handleStartDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    const context = drawingCanvasRef.current?.getContext('2d');
    if (!context) return;
    
    const currentHistory = context.getImageData(0, 0, context.canvas.width, context.canvas.height);
    setHistory(prev => [...prev, currentHistory]);

    setIsDrawing(true);
    const coords = getCanvasCoordinates(e);
    lastPoint.current = coords;
    // Draw a dot for single clicks
    drawLine(coords.x, coords.y, coords.x, coords.y);
  };

  const handleDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;
    e.preventDefault();
    const coords = getCanvasCoordinates(e);
    if (lastPoint.current) {
      drawLine(lastPoint.current.x, lastPoint.current.y, coords.x, coords.y);
    }
    lastPoint.current = coords;
  };

  const handleEndDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    setIsDrawing(false);
    lastPoint.current = null;
  };
  
  useImperativeHandle(ref, () => ({
    undo: () => {
      const context = drawingCanvasRef.current?.getContext('2d');
      if (!context || history.length === 0) return;
      const lastState = history[history.length - 1];
      context.putImageData(lastState, 0, 0);
      setHistory(prev => prev.slice(0, -1));
    },
    clear: () => {
      const canvas = drawingCanvasRef.current;
      const context = canvas?.getContext('2d');
      if (!context || !canvas) return;
      const currentHistory = context.getImageData(0, 0, canvas.width, canvas.height);
      setHistory(prev => [...prev, currentHistory]);
      context.clearRect(0, 0, canvas.width, canvas.height);
    },
    getMaskAsBase64: (): string | null => {
        const canvas = drawingCanvasRef.current;
        if (!canvas) return null;
        
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = canvas.width;
        tempCanvas.height = canvas.height;
        const tempCtx = tempCanvas.getContext('2d');
        if (!tempCtx) return null;

        // Create a black background
        tempCtx.fillStyle = '#000000';
        tempCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
        
        // Draw the (white) strokes from the drawing canvas on top
        tempCtx.drawImage(canvas, 0, 0);

        return tempCanvas.toDataURL('image/png');
    }
  }));

  useEffect(() => {
    const image = new Image();
    image.crossOrigin = "anonymous";
    image.src = src;
    image.onload = () => {
        const container = containerRef.current;
        const imageCanvas = imageCanvasRef.current;
        const drawingCanvas = drawingCanvasRef.current;
        if (!container || !imageCanvas || !drawingCanvas) return;

        const containerWidth = container.offsetWidth;
        const aspectRatio = image.width / image.height;
        const canvasHeight = containerWidth / aspectRatio;

        imageCanvas.width = image.width;
        imageCanvas.height = image.height;
        drawingCanvas.width = image.width;
        drawingCanvas.height = image.height;
        
        imageCanvas.style.width = `${containerWidth}px`;
        imageCanvas.style.height = `${canvasHeight}px`;
        drawingCanvas.style.width = `${containerWidth}px`;
        drawingCanvas.style.height = `${canvasHeight}px`;

        const ctx = imageCanvas.getContext('2d');
        ctx?.drawImage(image, 0, 0);
        
        setHistory([]); // Clear history on new image
    };
  }, [src]);

  return (
    <div ref={containerRef} className="relative w-full cursor-crosshair rounded-lg overflow-hidden">
      <canvas ref={imageCanvasRef} className="w-full h-auto block" />
      <canvas
        ref={drawingCanvasRef}
        className="absolute top-0 left-0 w-full h-auto"
        onMouseDown={handleStartDrawing}
        onMouseMove={handleDrawing}
        onMouseUp={handleEndDrawing}
        onMouseLeave={handleEndDrawing}
        onTouchStart={handleStartDrawing}
        onTouchMove={handleDrawing}
        onTouchEnd={handleEndDrawing}
      />
    </div>
  );
});

export { ImageMasker };