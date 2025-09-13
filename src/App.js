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
        <p>Bezig met laden...</p>
      </div>
    );
  }
  return user ? children : <Navigate to="/login" replace />;
};

function App() {
  return (
    <AuthProvider>
      <RecipeProvider>
        <MealPlanProvider>
          <Router>
            <div className="app-shell">
              <Header />
              <main className="main-content">
                <Routes>
                  <Route path="/login" element={<Login />} />
                  <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                  <Route path="/workouts" element={<ProtectedRoute><WorkoutTracker /></ProtectedRoute>} />
                  <Route path="/voeding" element={<ProtectedRoute><NutritionTracker /></ProtectedRoute>} />
                  <Route path="/voortgang" element={<ProtectedRoute><ProgressTracker /></ProtectedRoute>} />
                  <Route path="/profiel" element={<ProtectedRoute><ProfileSettings /></ProtectedRoute>} />
                  <Route path="/recepten" element={<ProtectedRoute><RecipeSearchPage /></ProtectedRoute>} />
                  <Route path="/maaltijdplan" element={<ProtectedRoute><MealPlanPage /></ProtectedRoute>} />
                  {/* Aliassen Engels -> Nederlands */}
                  <Route path="/meal-plan" element={<Navigate to="/maaltijdplan" replace />} />
                  <Route path="/recipes" element={<Navigate to="/recepten" replace />} />
                  <Route path="/nutrition" element={<Navigate to="/voeding" replace />} />
                  <Route path="/progress" element={<Navigate to="/voortgang" replace />} />
                  <Route path="/profile" element={<Navigate to="/profiel" replace />} />
                  <Route path="/workout" element={<Navigate to="/workouts" replace />} />
                  <Route path="/" element={<Navigate to="/dashboard" replace />} />
                  <Route path="*" element={<Navigate to="/dashboard" replace />} />
                </Routes>
              </main>
            </div>
          </Router>
        </MealPlanProvider>
      </RecipeProvider>
    </AuthProvider>
  );
}

export default App;