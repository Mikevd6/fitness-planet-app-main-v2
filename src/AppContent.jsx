import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Header from './components/Header';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';

export default function AppContent() {
  console.debug('Header type:', typeof Header, Header?.name);
  console.debug('Dashboard type:', typeof Dashboard, Dashboard?.name);
  console.debug('Login type:', typeof Login, Login?.name);

  return (
    <BrowserRouter>
      <Header />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}