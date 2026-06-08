import React, { useEffect } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  Outlet,
  useLocation,
  useNavigate
} from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { RecipeProvider } from './contexts/RecipeContext';
import { MealPlanProvider } from './contexts/MealPlanContext';
import { AUTH_UNAUTHORIZED_EVENT } from './utils/authEvents';
import Header from './components/Header';
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './components/Dashboard';
import WorkoutTracker from './components/WorkoutTracker';
import WorkoutDetail from './components/WorkoutDetail';
import NutritionTracker from './components/NutritionTracker';
import ProgressTracker from './components/ProgressTracker';
import ProfileSettings from './components/ProfileSettings';
import RecipeSearchPage from './components/RecipeSearchPage';
import MealPlanPage from './components/MealPlanPage';
import LoadingScreen from './components/LoadingScreen';
import './styles/App.css';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <LoadingScreen />;
  }

  return user ? children : <Navigate to="/login" replace state={{ from: location }} />;
};

const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingScreen />;
  }

  return user ? <Navigate to="/dashboard" replace /> : children;
};

const AuthRedirectHandler = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();

  useEffect(() => {
    const handleUnauthorized = () => {
      logout();
      navigate('/login', { replace: true });
    };

    window.addEventListener(AUTH_UNAUTHORIZED_EVENT, handleUnauthorized);
    return () => window.removeEventListener(AUTH_UNAUTHORIZED_EVENT, handleUnauthorized);
  }, [logout, navigate]);

  return null;
};

const ProtectedLayout = () => (
  <ProtectedRoute>
    <RecipeProvider>
      <MealPlanProvider>
        <Header />
        <main className="main-content">
          <Outlet />
        </main>
      </MealPlanProvider>
    </RecipeProvider>
  </ProtectedRoute>
);

const AppRoutes = () => (
  <Routes>
    <Route element={<ProtectedLayout />}>
      <Route index element={<Dashboard />} />
      <Route path="dashboard" element={<Dashboard />} />
      <Route path="workouts" element={<WorkoutTracker />} />
      <Route path="workouts/:id" element={<WorkoutDetail />} />
      <Route path="voeding" element={<NutritionTracker />} />
      <Route path="recepten" element={<RecipeSearchPage />} />
      <Route path="maaltijdplan" element={<MealPlanPage />} />
      <Route path="voortgang" element={<ProgressTracker />} />
      <Route path="profiel" element={<ProfileSettings />} />
    </Route>

    <Route path="login" element={<PublicRoute><Login /></PublicRoute>} />
    <Route path="register" element={<PublicRoute><Register /></PublicRoute>} />
    <Route path="*" element={<Navigate to="/dashboard" replace />} />
  </Routes>
);

const AppContent = () => (
  <Router>
    <AuthRedirectHandler />
    <div className="App">
      <AppRoutes />
    </div>
  </Router>
);

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
