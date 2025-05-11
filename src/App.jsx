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
    <AuthProvider>
     <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" />} />
        <Route path="/login" element={<Login />} />
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/students" 
          element={
            <ProtectedRoute>
              <StudentManagement />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/drives" 
          element={
            <ProtectedRoute>
              <DrivesManagement />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/drives/add" 
          element={
            <ProtectedRoute>
              <DrivesManagement />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/drives/edit/:id" 
          element={
            <ProtectedRoute>
              <DrivesManagement />
            </ProtectedRoute>
          } 
        />
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
