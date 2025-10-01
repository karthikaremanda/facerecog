import React, { useState, useCallback, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import Webcam from 'react-webcam';
import axios from 'axios';

// API Response Types
interface Face {
  name: string;
  confidence: number;
  box: [number, number, number, number];
}

interface RegisteredUsersResponse {
  success: boolean;
  users: string[];
  message?: string;
}

interface AnalysisResponse {
  success: boolean;
  faces: Face[];
  total_faces: number;
  identified_count: number;
  message?: string;
}

interface VerificationResponse {
  success: boolean;
  verified: boolean;
  missing_users: string[];
  extra_users: string[];
  faces: Face[];
  total_faces?: number;
  identified_count?: number;
  message: string;
}

type ResultResponse = AnalysisResponse | VerificationResponse;

// Type guard for Axios errors
function isAxiosError(error: unknown): error is { response?: { data?: { message?: string }, status?: number }, request?: unknown } {
  return (
    typeof error === 'object' && 
    error !== null && 
    'response' in error
  );
}

const GroupAnalysis: React.FC = () => {
  const [mode, setMode] = useState<'analysis' | 'verification'>('analysis');
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [results, setResults] = useState<ResultResponse | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const webcamRef = useRef<Webcam | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [requiredUsers, setRequiredUsers] = useState<string[]>([]);
  const [registeredUsers, setRegisteredUsers] = useState<string[]>([]);

  // Fetch registered users when component mounts
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get<RegisteredUsersResponse>('http://localhost:5001/api/registered-users');
        if (response.data.success) {
          setRegisteredUsers(response.data.users);
        }
      } catch (err) {
        console.error('Failed to fetch registered users:', err);
      }
    };
    fetchUsers();
  }, []);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
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
      setError('Please select an image or capture one from the camera');
      return;
    }

    if (mode === 'verification' && requiredUsers.length === 0) {
      setError('Please select at least one required user for verification');
      return;
    }

    setIsProcessing(true);
    setError(null);
    setResults(null);

    try {
      const endpoint = mode === 'analysis' 
        ? 'http://localhost:5001/api/analyze-group' 
        : 'http://localhost:5001/api/verify-group';

      const requestData = {
        image: imageBase64,
        ...(mode === 'verification' && { required_users: requiredUsers })
      };

      console.log('Request Endpoint:', endpoint);
      console.log('Request Data:', {
        ...requestData,
        image: `${requestData.image.substring(0, 50)}... (truncated)`
      });

      if (mode === 'analysis') {
        const response = await axios.post<AnalysisResponse>(endpoint, requestData);
        console.log('Analysis Response:', response.data);
        
        if (response.data.success) {
          console.log('Faces detected:', response.data.faces);
          console.log('Total faces:', response.data.total_faces);
          console.log('Identified count:', response.data.identified_count);
          
          setResults(response.data);
        } else {
          setError(response.data.message || 'An error occurred during analysis');
        }
      } else {
        const response = await axios.post<VerificationResponse>(endpoint, requestData);
        console.log('Verification Response:', response.data);
        
        if (response.data.success) {
          console.log('Faces detected:', response.data.faces);
          console.log('Total faces:', response.data.total_faces || response.data.faces.length);
          console.log('Identified count:', 
            response.data.identified_count || 
            response.data.faces.filter(face => face.name !== 'Unknown').length
          );
          
          setResults(response.data);
        } else {
          setError(response.data.message || 'An error occurred during verification');
        }
      }
    } catch (err) {
      console.error('Analysis Error:', err);
      
      if (isAxiosError(err)) {
        if (err.response) {
          // The request was made and the server responded with a status code
          // that falls out of the range of 2xx
          const errorMessage = err.response.data?.message || 
                               'An error occurred during group analysis';
          setError(errorMessage);
        } else if (err.request) {
          // The request was made but no response was received
          setError('No response received from the server. Please check your network connection.');
        } else {
          // Something happened in setting up the request that triggered an Error
          setError('An unexpected error occurred. Please try again.');
        }
      } else {
        // Handle non-Axios errors
        setError('An unexpected error occurred. Please try again.');
      }
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white shadow-lg rounded-lg p-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Group Analysis</h1>

          {/* Mode Selection */}
          <div className="mb-8">
            <div className="flex justify-center space-x-4">
              <button
                onClick={() => setMode('analysis')}
                className={`px-4 py-2 rounded-md ${
                  mode === 'analysis'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Analysis Mode
              </button>
              <button
                onClick={() => setMode('verification')}
                className={`px-4 py-2 rounded-md ${
                  mode === 'verification'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Verification Mode
              </button>
            </div>
          </div>

          {/* Required Users Selection (for Verification mode) */}
          {mode === 'verification' && (
            <div className="mb-6">
              <h3 className="text-lg font-medium text-gray-900 mb-2">Select Required Users</h3>
              <div className="grid grid-cols-2 gap-2">
                {registeredUsers.map((user) => (
                  <label key={user} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={requiredUsers.includes(user)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setRequiredUsers([...requiredUsers, user]);
                        } else {
                          setRequiredUsers(requiredUsers.filter(u => u !== user));
                        }
                      }}
                      className="form-checkbox h-4 w-4 text-indigo-600"
                    />
                    <span>{user}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Image Input */}
          <div className="mb-6">
            <div className="flex justify-center space-x-4 mb-4">
              <button
                onClick={() => {
                  setIsCameraActive(false);
                  document.getElementById('fileInput')?.click();
                }}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Upload Image
              </button>
              <button
                onClick={() => setIsCameraActive(!isCameraActive)}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                {isCameraActive ? 'Close Camera' : 'Open Camera'}
              </button>
            </div>

            <input
              type="file"
              id="fileInput"
              onChange={handleFileChange}
              accept="image/*"
              className="hidden"
            />

            {isCameraActive && (
              <div className="mb-4">
                <Webcam
                  ref={webcamRef}
                  audio={false}
                  screenshotFormat="image/jpeg"
                  className="w-full rounded-lg"
                />
                <button
                  onClick={captureImage}
                  className="mt-2 w-full px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                >
                  Capture Image
                </button>
              </div>
            )}

            {imageBase64 && !isCameraActive && (
              <div className="mt-4">
                <img
                  src={imageBase64}
                  alt="Preview"
                  className="max-w-full h-auto rounded-lg"
                />
              </div>
            )}
          </div>

          {error && (
            <div className="mb-4 p-4 text-red-700 bg-red-100 rounded-md">
              {error}
            </div>
          )}

          <button
            onClick={handleSubmit}
            disabled={isProcessing}
            className="w-full px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            {isProcessing ? 'Processing...' : 'Analyze Group'}
          </button>

          {/* Results Display */}
          {results && mode === 'analysis' && (
            <div className="mt-8">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Analysis Results</h3>
              <p className="text-gray-600 mb-2">
                Found {results.faces?.length || 0} faces in the image
              </p>
              <ul className="space-y-2">
                {results.faces?.length === 0 ? (
                  <li className="text-red-600">No faces identified</li>
                ) : (
                  results.faces?.map((face: Face, index: number) => (
                    <li 
                      key={index} 
                      className={`flex items-center justify-between p-2 rounded ${
                        face.name === 'Unknown' 
                          ? 'bg-red-50 text-red-800' 
                          : 'bg-green-50 text-green-800'
                      }`}
                    >
                      <span className="font-medium">
                        {face.name === 'Unknown' 
                          ? 'Unrecognized Face' 
                          : `Matched ${face.name}`}
                      </span>
                      <span className="text-sm text-gray-500">
                        {face.name === 'Unknown' 
                          ? 'No match found' 
                          : `${(face.confidence * 100).toFixed(2)}% confidence`}
                      </span>
                    </li>
                  ))
                )}
              </ul>
            </div>
          )}
          {results && mode === 'verification' && (
            <div className="mt-8">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Verification Results</h3>
              {(() => {
                const verificationResult = results as VerificationResponse;
                return (
                  <>
                    <p className={`text-lg font-medium ${verificationResult.verified ? 'text-green-600' : 'text-red-600'}`}>
                      {verificationResult.verified ? 'Verification Successful' : 'Verification Failed'}
                    </p>
                    
                    {/* Faces Detected Section */}
                    <div className="mt-4">
                      <h4 className="text-md font-semibold mb-2">Faces Detected</h4>
                      {verificationResult.faces?.length === 0 ? (
                        <p className="text-red-600">No faces identified</p>
                      ) : (
                        <ul className="space-y-2">
                          {verificationResult.faces?.map((face: Face, index: number) => (
                            <li 
                              key={index} 
                              className={`flex items-center justify-between p-2 rounded ${
                                face.name === 'Unknown' 
                                  ? 'bg-gray-50 text-gray-600' 
                                  : 'bg-green-50 text-green-800'
                              }`}
                            >
                              <span className="font-medium">
                                {face.name === 'Unknown' 
                                  ? 'Unrecognized Face' 
                                  : `Matched ${face.name}`}
                              </span>
                              <span className="text-sm text-gray-500">
                                {(face.confidence * 100).toFixed(2)}% confidence
                              </span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>

                    {verificationResult.missing_users?.length > 0 && (
                      <div className="mt-2">
                        <p className="text-gray-600">Missing Users:</p>
                        <ul className="list-disc list-inside">
                          {verificationResult.missing_users.map((user: string) => (
                            <li key={user}>{user}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {verificationResult.extra_users?.length > 0 && (
                      <div className="mt-2">
                        <p className="text-gray-600">Additional Users Detected:</p>
                        <ul className="list-disc list-inside">
                          {verificationResult.extra_users.map((user: string) => (
                            <li key={user}>{user}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </>
                );
              })()}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GroupAnalysis;
