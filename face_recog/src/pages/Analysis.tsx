import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import LoadingScreen from '../components/LoadingScreen';
import Camera from '../components/Camera';

// Define interfaces for API responses
interface FaceResult {
  name: string;
  confidence: number;
  box: [number, number, number, number];
  distance?: number;
}

interface FaceRegistrationResponse {
  success: boolean;
  message?: string;
  results?: FaceResult[];
  num_images_processed?: number;
}

interface FaceIdentificationResponse {
  success: boolean;
  message?: string;
  results?: FaceResult[];
  total_faces?: number;
  identified_count?: number;
  faces?: FaceResult[];
}

interface RouteParams {
  [key: string]: string | undefined;
}

const Analysis: React.FC = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<FaceRegistrationResponse | FaceIdentificationResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [maxImagesReached, setMaxImagesReached] = useState(false);
  const [detectedFaces, setDetectedFaces] = useState<FaceResult[]>([]);
  const [name, setName] = useState('');
  const [mode, setMode] = useState<'register' | 'identify'>('identify');
  const [inputMethod, setInputMethod] = useState<'upload' | 'camera'>('upload');
  const [continuousProcessing, setContinuousProcessing] = useState(false);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    const newImages: string[] = [];
    const fileArray = Array.from(files);

    fileArray.forEach((file) => {
      // Limit to 5 images
      if (selectedImages.length + newImages.length < 5) {
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64Image = reader.result as string;
          setSelectedImages((prevImages) => {
            const updatedImages = [...prevImages, base64Image];
            setMaxImagesReached(updatedImages.length >= 5);
            return updatedImages;
          });
          // Set first image as preview for single image mode
          if (!imagePreview) {
            setImagePreview(base64Image);
          }
        };
        reader.readAsDataURL(file);
      }
    });
  };

  const removeImage = (indexToRemove: number) => {
    setSelectedImages((prevImages) => 
      prevImages.filter((_, index) => index !== indexToRemove)
    );
    setMaxImagesReached(false);

    // Update image preview if removed image was the preview
    if (selectedImages[indexToRemove] === imagePreview) {
      setImagePreview(selectedImages.length > 1 ? selectedImages[0] : null);
    }
  };

  const handleCameraCapture = async (imageData: string) => {
    setImagePreview(imageData);
    setSelectedImages([imageData]);
    setError(null);

    if (continuousProcessing) {
      // Implement continuous processing logic if needed
    }
  };

  const handleRegisterFace = async () => {
    if (!name.trim()) {
      setError('Please enter a name');
      return;
    }

    if (selectedImages.length === 0) {
      setError('Please upload at least one image');
      return;
    }

    setIsProcessing(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await axios.post<FaceRegistrationResponse>('http://localhost:5001/api/register-face', {
        name: name.trim(),
        images: selectedImages
      });

      if (response.data.success) {
        // Success handling
        setResult(response.data);
        setSuccess(`Successfully registered ${name} using ${response.data.num_images_processed} images`);
        
        if (response.data.results) {
          setDetectedFaces(response.data.results);
        }
        
        // Reset form
        setName('');
        setSelectedImages([]);
        setImagePreview(null);
        setMaxImagesReached(false);
      } else {
        setError(response.data.message || 'Registration failed');
      }
    } catch (err) {
      console.error('Registration error:', err);
      setError('Failed to register face. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleIdentifyFace = async () => {
    if (!imagePreview) {
      setError('Please select an image or capture one from camera');
      return;
    }

    setIsProcessing(true);
    setError(null);
    setResult(null);

    try {
      const response = await axios.post<FaceIdentificationResponse>('http://localhost:5001/api/identify-face', {
        image: imagePreview
      });

      if (response.data.success) {
        setResult(response.data);
        if (response.data.results) {
          setDetectedFaces(response.data.results);
        }
      } else {
        setError(response.data.message || 'Identification failed');
      }
    } catch (err) {
      console.error('Identification error:', err);
      setError('Failed to identify face. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Check if images are available
    if (!selectedImages.length && !imagePreview) {
      setError('Please select an image or capture one from camera');
      return;
    }

    // Determine action based on mode
    if (mode === 'register') {
      await handleRegisterFace();
    } else {
      await handleIdentifyFace();
    }
  };

  const getTitle = () => {
    switch (mode) {
      case 'register':
        return 'Face Registration';
      case 'identify':
        return 'Face Identification';
      default:
        return 'Analysis';
    }
  };

  const renderFaceAnalysisContent = () => (
    <div className="w-full max-w-md mx-auto">
      <div className="mb-6 flex justify-center space-x-4">
        <button
          onClick={() => setMode('identify')}
          className={`px-4 py-2 rounded-md ${
            mode === 'identify'
              ? 'bg-indigo-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Identify Face
        </button>
        <button
          onClick={() => setMode('register')}
          className={`px-4 py-2 rounded-md ${
            mode === 'register'
              ? 'bg-indigo-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Register Face
        </button>
      </div>

      <div className="mb-6 flex justify-center space-x-4">
        <button
          onClick={() => {
            setInputMethod('upload');
            setIsCameraActive(false);
            setContinuousProcessing(false);
          }}
          className={`px-4 py-2 rounded-md ${
            inputMethod === 'upload'
              ? 'bg-green-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Upload Image
        </button>
        <button
          onClick={() => {
            setInputMethod('camera');
            setIsCameraActive(true);
          }}
          className={`px-4 py-2 rounded-md ${
            inputMethod === 'camera'
              ? 'bg-green-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Use Camera
        </button>
      </div>

      {inputMethod === 'camera' && (
        <div className="mb-6 flex justify-center space-x-4">
          <button
            onClick={() => setContinuousProcessing(!continuousProcessing)}
            className={`px-4 py-2 rounded-md ${
              continuousProcessing
                ? 'bg-red-600 text-white'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            {continuousProcessing ? 'Stop Live Processing' : 'Start Live Processing'}
          </button>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {mode === 'register' && (
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
              Name
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Enter name"
              required={inputMethod === 'camera' && continuousProcessing}
            />
          </div>
        )}

        {inputMethod === 'upload' ? (
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Upload Face Images (1-5 images)
            </label>
            <input 
              type="file" 
              multiple 
              accept="image/*"
              onChange={handleImageUpload}
              disabled={maxImagesReached}
              className="block w-full text-sm text-gray-500
                file:mr-4 file:py-2 file:px-4
                file:rounded-full file:border-0
                file:text-sm file:font-semibold
                file:bg-violet-50 file:text-violet-700
                hover:file:bg-violet-100"
            />
            {maxImagesReached && (
              <p className="text-yellow-600 text-sm mt-2">
                Maximum of 5 images reached
              </p>
            )}
            {selectedImages.length > 0 && (
              <div className="mb-4">
                <h3 className="text-md font-semibold mb-2">Selected Images</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedImages.map((image, index) => (
                    <div key={index} className="relative">
                      <img 
                        src={image} 
                        alt={`Selected face ${index + 1}`} 
                        className="w-24 h-24 object-cover rounded"
                      />
                      <button 
                        onClick={() => removeImage(index)}
                        className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1 text-xs"
                      >
                        X
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <label className="block text-sm font-medium text-gray-700">
              Camera
            </label>
            <Camera 
              onCapture={handleCameraCapture} 
              isActive={isCameraActive} 
              mode={mode}
              continuousProcessing={continuousProcessing}
              processingInterval={1000}
              detectedFaces={detectedFaces}
            />
          </div>
        )}

        {imagePreview && !isCameraActive && (
          <div className="mt-4">
            <img
              src={imagePreview}
              alt="Preview"
              className="max-w-full h-auto rounded-lg shadow-md"
            />
          </div>
        )}

        {error && (
          <div className="bg-red-50 border-l-4 border-red-400 p-4">
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

        {success && (
          <div className="bg-green-50 border-l-4 border-green-400 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-green-700">{success}</p>
              </div>
            </div>
          </div>
        )}

        <div className="flex justify-between space-x-4">
          <button
            type="button"
            onClick={() => window.location.href = '/dashboard'}
            className="flex-1 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Back
          </button>
          {!continuousProcessing && (
            <button
              type="submit"
              disabled={isProcessing || (isCameraActive && !imagePreview)}
              className="flex-1 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {isProcessing ? 'Processing...' : mode === 'register' ? 'Register Face' : 'Identify Face'}
            </button>
          )}
        </div>
      </form>
    </div>
  );

  const renderResults = () => {
    if (!result) return null;

    return (
      <div className="mt-6">
        <h3 className="text-lg font-semibold mb-4">Analysis Results</h3>
        {result.message && (
          <p className="text-gray-700 mb-4">{result.message}</p>
        )}
        
        {/* Handle group analysis results */}
        {'faces' in result && result.faces && result.faces.map((face: FaceResult, index: number) => (
          <div
            key={index}
            className={`p-4 rounded-lg mb-4 ${
              face.name !== 'Unknown'
                ? 'bg-green-50 border-green-200'
                : 'bg-gray-50 border-gray-200'
            } border`}
          >
            <div className="flex justify-between items-center">
              <div>
                <h4 className="font-medium text-lg">
                  {face.name !== 'Unknown' ? face.name : 'Unrecognized Face'}
                </h4>
                {face.name !== 'Unknown' ? (
                  <p className="text-sm text-gray-600">
                    Confidence: {face.confidence.toFixed(2)}%
                  </p>
                ) : (
                  <p className="text-sm text-gray-600">No match found</p>
                )}
              </div>
              {face.box && (
                <div className="text-sm text-gray-500">
                  <p>Position: {face.box.join(', ')}</p>
                </div>
              )}
            </div>
          </div>
        ))}

        {/* Handle individual face recognition results */}
        {result.results && result.results.map((face: FaceResult, index: number) => (
          <div
            key={index}
            className={`p-4 rounded-lg mb-4 ${
              face.name !== 'Unknown'
                ? 'bg-green-50 border-green-200'
                : 'bg-gray-50 border-gray-200'
            } border`}
          >
            <div className="flex justify-between items-center">
              <div>
                <h4 className="font-medium text-lg">
                  {face.name !== 'Unknown' ? face.name : 'Unrecognized Face'}
                </h4>
                {face.name !== 'Unknown' ? (
                  <>
                    <p className="text-sm text-gray-600">
                      Confidence: {face.confidence.toFixed(2)}%
                    </p>
                    {face.distance !== undefined && (
                      <p className="text-sm text-gray-600">
                        Distance: {face.distance.toFixed(3)}
                      </p>
                    )}
                  </>
                ) : (
                  <p className="text-sm text-gray-600">No match found</p>
                )}
              </div>
            </div>
          </div>
        ))}

        {/* Display total faces and identified count for group analysis */}
        {'total_faces' in result && result.total_faces !== undefined && (
          <div className="mt-4 p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-700">
              Total faces detected: {result.total_faces}
            </p>
            <p className="text-sm text-blue-700">
              Identified faces: {result.identified_count}
            </p>
          </div>
        )}
      </div>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8"
    >
      <div className="max-w-4xl mx-auto">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-8">
          {getTitle()}
        </h2>

        {renderFaceAnalysisContent()}
        {renderResults()}

        {isProcessing && <LoadingScreen message="Processing..." />}
      </div>
    </motion.div>
  );
};

export default Analysis;
