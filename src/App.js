import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { RecipeProvider } from './contexts/RecipeContext';
import { MealPlanProvider } from './contexts/MealPlanContext';
import Header from './components/Header';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import WorkoutTracker from './components/WorkoutTracker';
import NutritionTracker from './components/NutritionTracker';
import ProgressTracker from './components/ProgressTracker';
import ProfileSettings from './components/ProfileSettings';
import RecipeSearchPage from './components/RecipeSearchPage';
import MealPlanPage from './components/MealPlanPage';
import './styles/App.css';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="loading">
        <div className="loading-spinner"></div>
        <p>Fitness Planet wordt geladen...</p>
      </div>
    );
  }
  return user ? children : <Navigate to="/login" replace />;
};

// Main App Content Component
const AppContent = () => {
  const { user } = useAuth();
  
  return (
    <Router>
      <div className="App">
        {user ? (
          <RecipeProvider>
            <MealPlanProvider>
              <Header />
              <main className="main-content">
                <Routes>
                  <Route path="/" element={
                    <ProtectedRoute>
                      <Dashboard />
                    </ProtectedRoute>
                  } />
                  <Route path="/dashboard" element={
                    <ProtectedRoute>
                      <Dashboard />
                    </ProtectedRoute>
                  } />
                  <Route path="/workout" element={
                    <ProtectedRoute>
                      <WorkoutTracker />
                    </ProtectedRoute>
                  } />
                  <Route path="/nutrition" element={
                    <ProtectedRoute>
                      <NutritionTracker />
                    </ProtectedRoute>
                  } />
                  <Route path="/progress" element={
                    <ProtectedRoute>
                      <ProgressTracker />
                    </ProtectedRoute>
                  } />
                  <Route path="/profile" element={
                    <ProtectedRoute>
                      <ProfileSettings />
                    </ProtectedRoute>
                  } />
                  <Route path="/recipes" element={
                    <ProtectedRoute>
                      <RecipeSearchPage />
                    </ProtectedRoute>
                  } />
                  <Route path="/meal-plan" element={
                    <ProtectedRoute>
                      <MealPlanPage />
                    </ProtectedRoute>
                  } />
                </Routes>
              </main>
            </MealPlanProvider>
          </RecipeProvider>
        ) : (
          <div className="app-login">
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
          </div>
        )}
      </div>
    </Router>
  );
};

function App() {
  console.log('App component mounting...');
  
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;