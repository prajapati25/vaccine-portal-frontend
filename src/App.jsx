/**
 * Main application component that sets up routing and authentication
 * Uses React Router for navigation and AuthContext for authentication state
 */
import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from './pages/Dashboard';
import StudentManagement from './pages/StudentManagement';
import DrivesManagement from './pages/DrivesManagement';
import Reports from './pages/Reports';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    // Wrap entire app with AuthProvider for authentication context
    <AuthProvider>
     <Router>
      <Routes>
        {/* Redirect root to dashboard */}
        <Route path="/" element={<Navigate to="/dashboard" />} />
        
        {/* Public route for login */}
        <Route path="/login" element={<Login />} />
        
        {/* Protected routes requiring authentication */}
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } 
        />
        
        {/* Student management routes */}
        <Route 
          path="/students" 
          element={
            <ProtectedRoute>
              <StudentManagement />
            </ProtectedRoute>
          } 
        />
        
        {/* Vaccination drive management routes */}
        <Route 
          path="/drives" 
          element={
            <ProtectedRoute>
              <DrivesManagement />
            </ProtectedRoute>
          } 
        />
        
        {/* Add new vaccination drive */}
        <Route 
          path="/drives/add" 
          element={
            <ProtectedRoute>
              <DrivesManagement />
            </ProtectedRoute>
          } 
        />
        
        {/* Edit existing vaccination drive */}
        <Route 
          path="/drives/edit/:id" 
          element={
            <ProtectedRoute>
              <DrivesManagement />
            </ProtectedRoute>
          } 
        />
        
        {/* Reports and analytics */}
        <Route 
          path="/reports" 
          element={
            <ProtectedRoute>
              <Reports />
            </ProtectedRoute>
          } 
        />
      </Routes>
    </Router>
    </AuthProvider>
  );
}
export default App
