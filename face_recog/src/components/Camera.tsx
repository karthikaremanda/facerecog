import React, { useRef, useEffect, useState } from 'react';

interface DetectedFace {
  name: string;
  confidence: number;
  box: [number, number, number, number];
}

interface CameraProps {
  onCapture: (imageData: string) => void;
  isActive: boolean;
  mode: 'register' | 'identify';
  continuousProcessing?: boolean;
  processingInterval?: number;
  detectedFaces?: DetectedFace[];
}

const Camera: React.FC<CameraProps> = ({ 
  onCapture, 
  isActive, 
  mode,
  continuousProcessing = false,
  processingInterval = 1000,
  detectedFaces = []
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const processingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    let stream: MediaStream | null = null;

    const startCamera = async () => {
      try {
        if (isActive) {
          stream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: 'user' },
            audio: false,
          });

          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
        }
      } catch (err) {
        setError('Failed to access camera. Please make sure you have granted camera permissions.');
      }
    };

    startCamera();

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      if (processingTimeoutRef.current) {
        clearTimeout(processingTimeoutRef.current);
      }
    };
  }, [isActive]);

  useEffect(() => {
    const drawDetections = () => {
      if (!canvasRef.current || !videoRef.current) return;
      
      const ctx = canvasRef.current.getContext('2d');
      if (!ctx) return;

      // Clear previous drawings
      ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);

      // Draw the video frame
      ctx.drawImage(videoRef.current, 0, 0, canvasRef.current.width, canvasRef.current.height);

      // Ensure detectedFaces is iterable
      if (!Array.isArray(detectedFaces)) return;

      // Draw detection boxes and labels
      detectedFaces.forEach(face => {
        const [x, y, w, h] = face.box;
        const scale = canvasRef.current!.width / videoRef.current!.videoWidth;

        // Draw box
        ctx.strokeStyle = '#00ff00';
        ctx.lineWidth = 2;
        ctx.strokeRect(x * scale, y * scale, w * scale, h * scale);

        // Draw label background
        ctx.fillStyle = '#00ff00';
        ctx.fillRect(x * scale, (y * scale) - 20, 200, 20);

        // Draw label text
        ctx.fillStyle = '#000000';
        ctx.font = '16px Arial';
        ctx.fillText(
          `${face.name} (${(face.confidence * 100).toFixed(1)}%)`,
          x * scale + 5,
          (y * scale) - 5
        );
      });
    };

    // Set up animation loop for drawing
    let animationFrame: number;
    const animate = () => {
      drawDetections();
      animationFrame = requestAnimationFrame(animate);
    };

    if (isActive) {
      animate();
    }

    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
    };
  }, [isActive, detectedFaces]);

  useEffect(() => {
    const processFrame = () => {
      if (!isProcessing && continuousProcessing && videoRef.current && isActive) {
        captureAndProcess();
      }
    };

    if (continuousProcessing && isActive) {
      processingTimeoutRef.current = setInterval(processFrame, processingInterval);
    }

    return () => {
      if (processingTimeoutRef.current) {
        clearInterval(processingTimeoutRef.current);
      }
    };
  }, [continuousProcessing, isActive, isProcessing, processingInterval]);

  const captureAndProcess = () => {
    if (!videoRef.current || !canvasRef.current || isProcessing) return;

    setIsProcessing(true);
    const context = canvasRef.current.getContext('2d');
    
    if (context && videoRef.current) {
      // Ensure canvas dimensions match video
      canvasRef.current.width = videoRef.current.videoWidth;
      canvasRef.current.height = videoRef.current.videoHeight;
      
      // Draw the current video frame
      context.drawImage(videoRef.current, 0, 0);
      
      // Get the frame as base64
      const imageData = canvasRef.current.toDataURL('image/jpeg');
      onCapture(imageData);
      setIsProcessing(false);
    }
  };

  return (
    <div className="relative">
      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}
      
      <div className="relative">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          className="hidden"
        />
        <canvas
          ref={canvasRef}
          className="w-full rounded-lg shadow-lg"
        />
        
        {!continuousProcessing && (
          <button
            onClick={captureAndProcess}
            className="absolute bottom-4 left-1/2 transform -translate-x-1/2 px-4 py-2 bg-indigo-600 text-white rounded-full shadow-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Capture
          </button>
        )}

        {continuousProcessing && (
          <div className="absolute top-4 right-4 bg-green-500 text-white px-3 py-1 rounded-full text-sm">
            Live Processing
          </div>
        )}
      </div>
    </div>
  );
};

export default Camera;
