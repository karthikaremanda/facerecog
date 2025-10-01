import React from 'react';
import { useNavigate } from 'react-router-dom';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();

  const features = [
    {
      title: 'Face Registration',
      description: 'Register a new face in the system',
      icon: '👤',
      path: '/face-registration',
      color: 'bg-blue-500',
    },
    {
      title: 'Face Identification',
      description: 'Identify faces in images or live camera',
      icon: '🔍',
      path: '/analysis/face',
      color: 'bg-green-500',
    },
    {
      title: 'Group Authentication',
      description: 'Verify multiple people at once',
      icon: '👥',
      path: '/analysis/group',
      color: 'bg-purple-500',
    },
    {
      title: 'Crowd Counting',
      description: 'Count number of people in an image',
      icon: '👥',
      path: '/analysis/crowd',
      color: 'bg-orange-500',
    },
    {
      title: 'Group Analysis',
      description: 'Analyze and verify multiple faces in a group',
      icon: '👥',
      path: '/group-analysis',
      color: 'bg-indigo-500',
    }
  ];

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Face Recognition Dashboard
          </h1>
          <p className="text-xl text-gray-600 mb-12">
            Choose a feature to get started
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-white rounded-lg shadow-lg overflow-hidden"
              onClick={() => navigate(feature.path)}
            >
              <div className="p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600 mb-4">
                  {feature.description}
                </p>
                <div
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 cursor-pointer"
                >
                  {feature.title === 'Face Registration' ? 'Register Face' : feature.title === 'Group Analysis' ? 'Start Group Analysis' : 'Start Recognition'}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
