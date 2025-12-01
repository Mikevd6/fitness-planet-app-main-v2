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
import LoadingScreen from './components/LoadingScreen';
import './styles/App.css';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingScreen />;
  }

  return user ? children : <Navigate to="/login" replace />;
};

const protectedRoutes = [
  { path: '/', element: <Dashboard /> },
  { path: '/dashboard', element: <Dashboard /> },
  { path: '/workouts', element: <WorkoutTracker /> },
  { path: '/voeding', element: <NutritionTracker /> },
  { path: '/recepten', element: <RecipeSearchPage /> },
  { path: '/maaltijdplan', element: <MealPlanPage /> },
  { path: '/voortgang', element: <ProgressTracker /> },
  { path: '/profiel', element: <ProfileSettings /> },
];

const AppContent = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <Router>
      <div className="App">
        {user ? (
          <RecipeProvider>
            <MealPlanProvider>
              <Header />
              <main className="main-content">
                <Routes>
                  {protectedRoutes.map(({ path, element }) => (
                    <Route
                      key={path}
                      path={path}
                      element={<ProtectedRoute>{element}</ProtectedRoute>}
                    />
                  ))}
                  <Route path="*" element={<Navigate to="/dashboard" replace />} />
                </Routes>
              </main>
            </MealPlanProvider>
          </RecipeProvider>
        ) : (
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        )}
      </div>
    </Router>
  );
};

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
