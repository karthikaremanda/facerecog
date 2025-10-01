import React, { useRef, useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const CameraAnalysis = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [results, setResults] = useState<any>(null);
  const { type } = useParams<{ type: string }>();
  const navigate = useNavigate();
  const [requiredUsers, setRequiredUsers] = useState<string[]>([]);

  useEffect(() => {
    startCamera();
    return () => stopCamera();
  }, []);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
    }
  };

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
    }
  };

  const captureFrame = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');

      if (context) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        context.drawImage(video, 0, 0);
        return canvas.toDataURL('image/jpeg');
      }
    }
    return null;
  };

  const processFrame = async () => {
    const frame = captureFrame();
    if (!frame || isProcessing) return;

    setIsProcessing(true);
    try {
      let endpoint = '';
      let payload: any = { image: frame };

      switch (type) {
        case 'face':
          endpoint = '/api/identify-face';
          break;
        case 'group':
          endpoint = '/api/group-authentication';
          payload.requiredUsers = requiredUsers;
          break;
        case 'crowd':
          endpoint = '/api/crowd-count';
          break;
        default:
          throw new Error('Invalid analysis type');
      }

      const response = await fetch(`http://localhost:5001${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) throw new Error('Failed to process frame');
      
      const data = await response.json();
      setResults(data);

      // Draw results on canvas
      if (canvasRef.current) {
        const ctx = canvasRef.current.getContext('2d');
        if (ctx) {
          data.faces?.forEach((face: any) => {
            const { box } = face;
            ctx.strokeStyle = face.userId ? '#00ff00' : '#ff0000';
            ctx.lineWidth = 2;
            ctx.strokeRect(box[0], box[1], box[2], box[3]);
            
            // Draw name/count
            ctx.fillStyle = face.userId ? '#00ff00' : '#ff0000';
            ctx.font = '16px Arial';
            ctx.fillText(face.name || 'Unknown', box[0], box[1] - 5);
          });

          if (type === 'crowd' && data.count) {
            ctx.fillStyle = '#00ff00';
            ctx.font = '24px Arial';
            ctx.fillText(`Count: ${data.count}`, 10, 30);
          }
        }
      }
    } catch (error) {
      console.error('Error processing frame:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  useEffect(() => {
    const interval = setInterval(processFrame, 1000);
    return () => clearInterval(interval);
  }, [type, requiredUsers, isProcessing]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="container mx-auto px-4 py-8"
    >
      <div className="flex flex-col items-center space-y-4">
        <h1 className="text-3xl font-bold mb-6">Live Camera Analysis</h1>
        
        {type === 'group' && (
          <div className="w-full max-w-md mb-4">
            <h2 className="text-xl font-semibold mb-2">Required Users</h2>
            <input
              type="text"
              placeholder="Enter user IDs (comma-separated)"
              className="w-full p-2 border rounded"
              onChange={(e) => setRequiredUsers(e.target.value.split(',').map(id => id.trim()))}
            />
          </div>
        )}

        <div className="relative">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            className="rounded-lg shadow-lg"
          />
          <canvas
            ref={canvasRef}
            className="absolute top-0 left-0 w-full h-full"
          />
        </div>

        {results && type === 'group' && (
          <div className="mt-4 p-4 bg-white rounded-lg shadow">
            <h3 className="text-lg font-semibold">
              Status: {results.authenticated ? 'Authenticated' : 'Not Authenticated'}
            </h3>
            {results.missingUsers?.length > 0 && (
              <p className="text-red-500">
                Missing Users: {results.missingUsers.join(', ')}
              </p>
            )}
          </div>
        )}

        <button
          onClick={() => navigate(-1)}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Back
        </button>
      </div>
    </motion.div>
  );
};

export default CameraAnalysis;
