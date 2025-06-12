import React, { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Login from './components/Login';
import Register from './components/Register';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import Browse from './pages/Browse';
import PostSkill from './pages/PostSkill';
import Profile from './pages/Profile';
import Messages from './pages/Messages';
import UserProfile from './pages/UserProfile';
import Navbar from './components/Navbar';
import LoadingSpinner from './components/LoadingSpinner';

// Protected Route Component
function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return <LoadingSpinner />;
  }
  
  return isAuthenticated ? children : <Navigate to="/auth" />;
}

// Auth Wrapper Component
function AuthWrapper() {
  const [isLogin, setIsLogin] = useState(true);
  const { login, register } = useAuth();

  const handleLogin = (userData) => {
    login(userData);
  };

  const handleRegister = (userData) => {
    register(userData);
  };

  return isLogin ? (
    <Login 
      onLogin={handleLogin} 
      switchToRegister={() => setIsLogin(false)} 
    />
  ) : (
    <Register 
      onRegister={handleRegister} 
      switchToLogin={() => setIsLogin(true)} 
    />
  );
}

// Main App Component
function AppContent() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!isAuthenticated) {
    return <AuthWrapper />;
  }

  return (
    <div>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } />
        <Route path="/browse" element={
          <ProtectedRoute>
            <Browse />
          </ProtectedRoute>
        } />
        <Route path="/post" element={
          <ProtectedRoute>
            <PostSkill />
          </ProtectedRoute>
        } />
        <Route path="/profile" element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        } />
        <Route path="/messages" element={
          <ProtectedRoute>
            <Messages />
          </ProtectedRoute>
        } />
        <Route path="/user/:userId" element={
          <ProtectedRoute>
            <UserProfile />
          </ProtectedRoute>
        } />
        <Route path="/auth" element={<Navigate to="/" />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;