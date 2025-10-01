import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import LoadingScreen from '../components/LoadingScreen';
import Footer from '../components/Footer';

interface AnalysisResult {
  id: string;
  type: 'face' | 'group' | 'crowd';
  imageUrl: string;
  date: string;
  details: {
    names?: string[];
    peopleCount?: number;
    confidence?: number;
  };
}

// Example data - replace with your actual data from backend
const exampleResults: AnalysisResult[] = [
  {
    id: '1',
    type: 'face',
    imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500',
    date: '2024-01-15',
    details: {
      names: ['John Doe'],
      confidence: 98.5
    }
  },
  {
    id: '2',
    type: 'face',
    imageUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=500',
    date: '2024-01-16',
    details: {
      names: ['Jane Smith'],
      confidence: 97.8
    }
  },
  {
    id: '3',
    type: 'group',
    imageUrl: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=500',
    date: '2024-01-17',
    details: {
      names: ['Alice', 'Bob', 'Charlie'],
      peopleCount: 3
    }
  },
  {
    id: '4',
    type: 'group',
    imageUrl: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=500',
    date: '2024-01-18',
    details: {
      names: ['David', 'Emma', 'Frank', 'Grace'],
      peopleCount: 4
    }
  },
  {
    id: '5',
    type: 'crowd',
    imageUrl: 'https://images.unsplash.com/photo-1531306728370-e2ebd9d7bb99?w=500',
    date: '2024-01-19',
    details: {
      peopleCount: 25
    }
  },
  {
    id: '6',
    type: 'crowd',
    imageUrl: 'https://images.unsplash.com/photo-1506869640319-fe1a24fd76dc?w=500',
    date: '2024-01-20',
    details: {
      peopleCount: 42
    }
  }
];

const Gallery = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [selectedType, setSelectedType] = useState<'all' | 'face' | 'group' | 'crowd'>('all');
  const [results, setResults] = useState<AnalysisResult[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    // Simulate loading data
    const timer = setTimeout(() => {
      setResults(exampleResults);
      setIsLoading(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  const filteredResults = selectedType === 'all' 
    ? results 
    : results.filter(result => result.type === selectedType);

  if (isLoading) {
    return <LoadingScreen />;
  }

  const typeColors = {
    face: 'from-purple-500 to-pink-500',
    group: 'from-blue-500 to-teal-500',
    crowd: 'from-orange-500 to-red-500'
  };

  const getGradient = (type: 'face' | 'group' | 'crowd') => typeColors[type];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 p-6"
    >
      <div className="container mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center mb-8">
          <motion.h1 
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="text-4xl font-bold text-white mb-4 md:mb-0"
          >
            Analysis Gallery
          </motion.h1>
          
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="flex space-x-4"
          >
            {['all', 'face', 'group', 'crowd'].map((type) => (
              <button
                key={type}
                onClick={() => setSelectedType(type as any)}
                className={`px-4 py-2 rounded-full text-white font-medium transition-all
                  ${selectedType === type 
                    ? 'bg-blue-600 shadow-lg scale-105' 
                    : 'bg-gray-700 hover:bg-gray-600'}`}
              >
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </button>
            ))}
          </motion.div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence mode="popLayout">
            {filteredResults.map((result) => (
              <motion.div
                key={result.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className={`bg-gradient-to-br ${getGradient(result.type)} rounded-xl p-1`}
              >
                <div className="bg-gray-900 rounded-lg p-4">
                  <div className="relative aspect-square rounded-lg overflow-hidden mb-4">
                    <img 
                      src={result.imageUrl} 
                      alt="Analysis result" 
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-white font-medium">
                        {result.type.charAt(0).toUpperCase() + result.type.slice(1)} Analysis
                      </span>
                      <span className="text-gray-400 text-sm">{result.date}</span>
                    </div>

                    {result.type === 'face' && (
                      <div className="text-gray-300">
                        <p>Name: {result.details.names?.[0]}</p>
                        <p>Confidence: {result.details.confidence}%</p>
                      </div>
                    )}

                    {result.type === 'group' && (
                      <div className="text-gray-300">
                        <p>People: {result.details.names?.join(', ')}</p>
                        <p>Count: {result.details.peopleCount}</p>
                      </div>
                    )}

                    {result.type === 'crowd' && (
                      <div className="text-gray-300">
                        <p>People Count: {result.details.peopleCount}</p>
                      </div>
                    )}
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => navigate(`/analysis/${result.type}`)}
                    className="mt-4 w-full px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
                  >
                    New Analysis
                  </motion.button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {filteredResults.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center text-gray-400 py-12"
          >
            No results found for this category.
          </motion.div>
        )}
      </div>

      <div className="mt-20"></div>
      <Footer />
    </motion.div>
  );
};

export default Gallery;
