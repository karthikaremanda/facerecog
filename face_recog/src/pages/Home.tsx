import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Footer from '../components/Footer';

const Home = () => {
  const { isAuthenticated } = useAuth();

  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5 }
  };

  const features = [
    {
      title: 'Face Analysis',
      description: 'Detect and analyze individual faces with high accuracy',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&h=500&fit=crop',
      type: 'face',
      details: [
        'High-precision face detection',
        'Age and gender estimation',
        'Emotion recognition',
        'Facial landmark detection'
      ]
    },
    {
      title: 'Group Analysis',
      description: 'Identify and analyze multiple people in group photos',
      image: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=500&h=500&fit=crop',
      type: 'group',
      details: [
        'Multiple face detection',
        'Group demographics analysis',
        'Relationship mapping',
        'Group emotion analysis'
      ]
    },
    {
      title: 'Crowd Analysis',
      description: 'Count and analyze large crowds automatically',
      image: 'https://images.unsplash.com/photo-1531306728370-e2ebd9d7bb99?w=500&h=500&fit=crop',
      type: 'crowd',
      details: [
        'Accurate crowd counting',
        'Density estimation',
        'Movement pattern analysis',
        'Demographics insights'
      ]
    }
  ];

  const technologies = [
    {
      name: 'Advanced AI',
      description: 'Powered by state-of-the-art deep learning models',
      icon: '🧠'
    },
    {
      name: 'Real-time Processing',
      description: 'Instant analysis with live camera feed',
      icon: '⚡'
    },
    {
      name: 'High Accuracy',
      description: '99.9% accuracy in face detection',
      icon: '🎯'
    },
    {
      name: 'Secure',
      description: 'Enterprise-grade security and privacy',
      icon: '🔒'
    }
  ];

  const useCases = [
    {
      title: 'Security & Access Control',
      description: 'Enhance security with facial recognition-based access control systems.',
      icon: '🔐'
    },
    {
      title: 'Event Management',
      description: 'Monitor crowd sizes and manage large events efficiently.',
      icon: '🎪'
    },
    {
      title: 'Retail Analytics',
      description: 'Analyze customer demographics and behavior patterns.',
      icon: '📊'
    },
    {
      title: 'Smart Cities',
      description: 'Improve urban planning and public safety.',
      icon: '🌆'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800">
      {/* Hero Section */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="container mx-auto px-6 py-20 text-center"
      >
        <motion.h1 
          {...fadeInUp}
          className="text-5xl md:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-600 mb-6"
        >
          Advanced Face Recognition
        </motion.h1>
        
        <motion.p 
          {...fadeInUp}
          transition={{ delay: 0.2 }}
          className="text-xl text-gray-300 mb-12 max-w-2xl mx-auto"
        >
          Experience state-of-the-art facial analysis technology with our powerful and intuitive platform.
        </motion.p>

        <motion.div 
          {...fadeInUp}
          transition={{ delay: 0.4 }}
          className="flex flex-wrap justify-center gap-4"
        >
          {isAuthenticated ? (
            <>
              <Link
                to="/analysis/face"
                className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-full transition-colors"
              >
                Get Started
              </Link>
              <Link
                to="/gallery"
                className="px-8 py-3 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-full transition-colors"
              >
                View Gallery
              </Link>
            </>
          ) : (
            <>
              <Link
                to="/register"
                className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-full transition-colors"
              >
                Get Started
              </Link>
              <Link
                to="/about"
                className="px-8 py-3 border border-gray-500 hover:border-gray-400 text-gray-300 hover:text-white font-medium rounded-full transition-colors"
              >
                Learn More
              </Link>
            </>
          )}
        </motion.div>
      </motion.div>

      {/* Features Section */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="container mx-auto px-6 py-20"
      >
        <motion.h2 
          {...fadeInUp}
          className="text-4xl font-bold text-white text-center mb-12"
        >
          Powerful Features
        </motion.h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 + index * 0.2 }}
              className="bg-gray-800/50 backdrop-blur-sm rounded-xl overflow-hidden"
            >
              <div className="relative h-48">
                <img
                  src={feature.image}
                  alt={feature.title}
                  className="absolute inset-0 w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-gray-900 to-transparent" />
              </div>
              
              <div className="p-6">
                <h3 className="text-xl font-semibold text-white mb-2">{feature.title}</h3>
                <p className="text-gray-400 mb-4">{feature.description}</p>
                <ul className="space-y-2 mb-4">
                  {feature.details.map((detail, i) => (
                    <li key={i} className="text-gray-400 flex items-center">
                      <span className="text-blue-400 mr-2">•</span>
                      {detail}
                    </li>
                  ))}
                </ul>
                {isAuthenticated && (
                  <Link
                    to={`/analysis/${feature.type}`}
                    className="inline-block px-4 py-2 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 rounded-lg transition-colors"
                  >
                    Try Now
                  </Link>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Technologies Section */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="container mx-auto px-6 py-20 bg-gray-800/30"
      >
        <motion.h2 
          {...fadeInUp}
          className="text-4xl font-bold text-white text-center mb-12"
        >
          Cutting-edge Technology
        </motion.h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {technologies.map((tech, index) => (
            <motion.div
              key={tech.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1 + index * 0.2 }}
              className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 text-center"
            >
              <div className="text-4xl mb-4">{tech.icon}</div>
              <h3 className="text-xl font-semibold text-white mb-2">{tech.name}</h3>
              <p className="text-gray-400">{tech.description}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Use Cases Section */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="container mx-auto px-6 py-20"
      >
        <motion.h2 
          {...fadeInUp}
          className="text-4xl font-bold text-white text-center mb-12"
        >
          Use Cases
        </motion.h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {useCases.map((useCase, index) => (
            <motion.div
              key={useCase.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.2 + index * 0.2 }}
              className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6"
            >
              <div className="text-4xl mb-4">{useCase.icon}</div>
              <h3 className="text-xl font-semibold text-white mb-2">{useCase.title}</h3>
              <p className="text-gray-400">{useCase.description}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Stats Section */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
        className="container mx-auto px-6 py-20 text-center bg-gradient-to-r from-blue-600/20 to-purple-600/20"
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-6">
            <div className="text-4xl font-bold text-blue-400 mb-2">99.9%</div>
            <div className="text-gray-400">Recognition Accuracy</div>
          </div>
          <div className="p-6">
            <div className="text-4xl font-bold text-purple-400 mb-2">100+</div>
            <div className="text-gray-400">Facial Points Analyzed</div>
          </div>
          <div className="p-6">
            <div className="text-4xl font-bold text-pink-400 mb-2">0.5s</div>
            <div className="text-gray-400">Processing Time</div>
          </div>
        </div>
      </motion.div>

      {/* CTA Section */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.4 }}
        className="container mx-auto px-6 py-20 text-center"
      >
        <h2 className="text-4xl font-bold text-white mb-8">
          Ready to Get Started?
        </h2>
        <p className="text-xl text-gray-400 mb-12 max-w-2xl mx-auto">
          Join thousands of users who are already leveraging our advanced face recognition technology.
        </p>
        <Link
          to={isAuthenticated ? "/analysis/face" : "/register"}
          className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium rounded-full hover:from-blue-700 hover:to-purple-700 transition-all transform hover:-translate-y-1"
        >
          {isAuthenticated ? "Launch App" : "Start Free Trial"}
        </Link>
      </motion.div>

      <div className="mt-20"></div>
      <Footer />
    </div>
  );
};

export default Home;
