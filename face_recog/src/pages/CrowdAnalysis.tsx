import React, { useState, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import Webcam from 'react-webcam';
import axios from 'axios';

interface CrowdAnalysisResult {
  success: boolean;
  total_count?: number;
  message?: string;
  annotated_image?: string;
}

const CrowdAnalysis: React.FC = () => {
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [result, setResult] = useState<CrowdAnalysisResult | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const webcamRef = useRef<Webcam | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setImageBase64(base64String);
        setError(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const captureImage = useCallback(() => {
    if (webcamRef.current) {
      const imageSrc = webcamRef.current.getScreenshot();
      if (imageSrc) {
        setImageBase64(imageSrc);
      }
    }
  }, [webcamRef]);

  const handleSubmit = async () => {
    if (!imageBase64) {
      setError('Please upload an image or capture one from the camera');
      return;
    }

    setIsProcessing(true);
    setError(null);
    setResult(null);

    try {
      const response = await axios.post<CrowdAnalysisResult>(
        'http://localhost:5001/api/crowd-count', 
        { image: imageBase64 }
      );

      if (response.data.success) {
        setResult(response.data);
      } else {
        setError(response.data.message || 'Crowd counting failed');
      }
    } catch (err) {
      console.error('Crowd Analysis Error:', err);
      setError('An error occurred during crowd analysis');
    } finally {
      setIsProcessing(false);
    }
  };

  const resetAnalysis = () => {
    setImageBase64(null);
    setResult(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-white shadow-2xl rounded-2xl overflow-hidden">
        <div className="p-8">
          <h2 className="text-3xl font-extrabold text-center text-gray-900 mb-8">
            Crowd Analysis
          </h2>

          {/* Image Upload and Capture Section */}
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            {/* File Upload */}
            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="text-xl font-semibold mb-4 text-gray-800">
                Upload Image
              </h3>
              <input 
                type="file" 
                ref={fileInputRef}
                accept="image/*"
                onChange={handleFileUpload}
                className="block w-full text-sm text-gray-500
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-full file:border-0
                  file:text-sm file:font-semibold
                  file:bg-violet-50 file:text-violet-700
                  hover:file:bg-violet-100"
              />
            </div>

            {/* Camera Capture */}
            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="text-xl font-semibold mb-4 text-gray-800">
                Capture from Camera
              </h3>
              <Webcam
                audio={false}
                ref={webcamRef}
                screenshotFormat="image/jpeg"
                className="w-full rounded-lg mb-4"
              />
              <button 
                onClick={captureImage}
                className="w-full bg-blue-600 text-white py-2 rounded-full hover:bg-blue-700 transition duration-300"
              >
                Capture Image
              </button>
            </div>
          </div>

          {/* Preview and Analysis */}
          {imageBase64 && (
            <div className="mb-8">
              <h3 className="text-xl font-semibold mb-4 text-gray-800">
                Selected Image Preview
              </h3>
              <img 
                src={imageBase64} 
                alt="Selected" 
                className="max-w-full h-auto rounded-lg shadow-md mx-auto"
              />
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-center space-x-4 mb-8">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleSubmit}
              disabled={!imageBase64 || isProcessing}
              className={`px-6 py-3 rounded-full text-white transition duration-300 ${
                imageBase64 && !isProcessing 
                  ? 'bg-green-600 hover:bg-green-700' 
                  : 'bg-gray-400 cursor-not-allowed'
              }`}
            >
              {isProcessing ? 'Analyzing...' : 'Start Crowd Analysis'}
            </motion.button>

            {imageBase64 && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={resetAnalysis}
                className="px-6 py-3 bg-red-500 text-white rounded-full hover:bg-red-600 transition duration-300"
              >
                Reset
              </motion.button>
            )}
          </div>

          {/* Analysis Results */}
          {result && result.success && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-green-50 border border-green-200 p-6 rounded-lg text-center"
            >
              <h3 className="text-2xl font-bold text-green-800 mb-4">
                Crowd Analysis Results
              </h3>
              <p className="text-xl text-green-700">
                Total People Counted: <span className="font-bold">{result.total_count}</span>
              </p>
              {result.annotated_image && (
                <div className="mt-6">
                  <h4 className="text-xl font-semibold mb-4 text-gray-800">
                    Annotated Detection
                  </h4>
                  <img 
                    src={result.annotated_image} 
                    alt="Annotated Crowd" 
                    className="max-w-full h-auto rounded-lg shadow-md mx-auto"
                  />
                </div>
              )}
            </motion.div>
          )}

          {/* Error Handling */}
          {error && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-red-50 border border-red-200 p-6 rounded-lg text-center"
            >
              <h3 className="text-xl font-bold text-red-800 mb-4">
                Analysis Error
              </h3>
              <p className="text-red-700">{error}</p>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CrowdAnalysis;
