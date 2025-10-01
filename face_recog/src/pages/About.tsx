import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import LoadingScreen from '../components/LoadingScreen';

const About = () => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading time
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return <LoadingScreen />;
  }

  const features = [
    {
      title: 'Face Detection',
      description: 'Advanced AI-powered face detection capabilities for identifying faces in images and videos.',
      icon: '👤',
      color: 'from-purple-400 to-indigo-500'
    },
    {
      title: 'Real-time Analysis',
      description: 'Process images and videos in real-time with high accuracy and low latency.',
      icon: '⚡',
      color: 'from-green-400 to-cyan-500'
    },
    {
      title: 'Secure & Private',
      description: 'Your data is encrypted and protected with industry-standard security measures.',
      icon: '🔒',
      color: 'from-red-400 to-pink-500'
    },
    {
      title: 'Advanced Analytics',
      description: 'Get detailed insights and analytics about facial features and expressions.',
      icon: '📊',
      color: 'from-yellow-400 to-orange-500'
    }
  ];

  const technologies = [
    {
      name: 'React',
      description: 'Modern frontend framework',
      icon: '⚛️'
    },
    {
      name: 'TypeScript',
      description: 'Type-safe JavaScript',
      icon: '📘'
    },
    {
      name: 'Node.js',
      description: 'Backend runtime',
      icon: '🟢'
    },
    {
      name: 'MongoDB',
      description: 'NoSQL Database',
      icon: '🍃'
    },
    {
      name: 'TensorFlow.js',
      description: 'ML Framework',
      icon: '🧠'
    },
    {
      name: 'WebGL',
      description: 'GPU Acceleration',
      icon: '🎮'
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-12 px-4 sm:px-6 lg:px-8"
    >
      {/* Hero Section */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="text-center max-w-4xl mx-auto mb-16"
      >
        <h1 className="text-5xl font-bold text-gray-900 mb-6">
          Welcome to{' '}
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-purple-500">
            FaceAI
          </span>
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          A cutting-edge face recognition platform powered by artificial intelligence
        </p>
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="rounded-lg overflow-hidden shadow-2xl mb-12"
        >
          <img
            src="https://images.unsplash.com/photo-1555421689-491a97ff2040?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80"
            alt="AI Technology"
            className="w-full h-[400px] object-cover"
          />
        </motion.div>
      </motion.div>

      {/* Features Section */}
      <motion.section
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-7xl mx-auto mb-20"
      >
        <h2 className="text-3xl font-bold text-center mb-12">Key Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              variants={itemVariants}
              whileHover={{ scale: 1.05 }}
              className={`p-6 rounded-xl bg-gradient-to-br ${feature.color} text-white shadow-lg`}
            >
              <div className="text-4xl mb-4">{feature.icon}</div>
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-white/90">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* Technology Stack */}
      <motion.section
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-7xl mx-auto mb-20"
      >
        <h2 className="text-3xl font-bold text-center mb-12">Technology Stack</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
          {technologies.map((tech, index) => (
            <motion.div
              key={tech.name}
              variants={itemVariants}
              whileHover={{ y: -5 }}
              className="p-4 bg-white rounded-lg shadow-md text-center"
            >
              <div className="text-4xl mb-2">{tech.icon}</div>
              <h3 className="font-semibold mb-1">{tech.name}</h3>
              <p className="text-sm text-gray-600">{tech.description}</p>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* How It Works */}
      <motion.section
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-4xl mx-auto text-center mb-20"
      >
        <h2 className="text-3xl font-bold mb-12">How It Works</h2>
        <div className="space-y-8">
          <motion.div
            variants={itemVariants}
            className="flex items-center justify-center space-x-4"
          >
            <div className="w-16 h-16 flex items-center justify-center rounded-full bg-blue-500 text-white text-2xl">
              1
            </div>
            <div className="flex-1 text-left">
              <h3 className="text-xl font-semibold mb-2">Upload Your Image</h3>
              <p className="text-gray-600">
                Simply upload any image containing faces you want to analyze
              </p>
            </div>
          </motion.div>
          <motion.div
            variants={itemVariants}
            className="flex items-center justify-center space-x-4"
          >
            <div className="w-16 h-16 flex items-center justify-center rounded-full bg-purple-500 text-white text-2xl">
              2
            </div>
            <div className="flex-1 text-left">
              <h3 className="text-xl font-semibold mb-2">AI Processing</h3>
              <p className="text-gray-600">
                Our advanced AI algorithms analyze the facial features and expressions
              </p>
            </div>
          </motion.div>
          <motion.div
            variants={itemVariants}
            className="flex items-center justify-center space-x-4"
          >
            <div className="w-16 h-16 flex items-center justify-center rounded-full bg-green-500 text-white text-2xl">
              3
            </div>
            <div className="flex-1 text-left">
              <h3 className="text-xl font-semibold mb-2">Get Results</h3>
              <p className="text-gray-600">
                Receive detailed analysis and insights about the detected faces
              </p>
            </div>
          </motion.div>
        </div>
      </motion.section>

      {/* Call to Action */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1 }}
        className="max-w-3xl mx-auto text-center"
      >
        <h2 className="text-3xl font-bold mb-6">Ready to Get Started?</h2>
        <p className="text-xl text-gray-600 mb-8">
          Join thousands of users who are already using FaceAI for their face recognition needs
        </p>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-full font-semibold text-lg shadow-lg"
        >
          Try FaceAI Now
        </motion.button>
      </motion.section>
    </motion.div>
  );
};

export default About;
