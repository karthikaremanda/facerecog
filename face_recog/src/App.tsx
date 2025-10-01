import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import About from './pages/About';
import Dashboard from './pages/Dashboard';
import Analysis from './pages/Analysis';
import CameraAnalysis from './pages/CameraAnalysis';
import Gallery from './pages/Gallery';
import PrivateRoute from './components/PrivateRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import FaceRegistration from './pages/FaceRegistration';
import GroupAnalysis from './pages/GroupAnalysis';
import CrowdAnalysis from './pages/CrowdAnalysis';
import { AuthProvider } from './context/AuthContext';

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="min-h-screen bg-gray-50">
          <Navbar />
          <div className="pt-16"> {/* Add padding top to account for fixed navbar */}
            <AnimatePresence mode="wait">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/about" element={<About />} />
                <Route element={<PrivateRoute />}>
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/face-registration" element={<FaceRegistration />} />
                  <Route path="/face-analysis" element={<Analysis />} />
                  <Route path="/camera-analysis/:type" element={<CameraAnalysis />} />
                  <Route path="/gallery" element={<Gallery />} />
                  <Route path="/group-analysis" element={<GroupAnalysis />} />
                  <Route path="/crowd-analysis" element={<CrowdAnalysis />} />
                </Route>
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </AnimatePresence>
          </div>
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;
