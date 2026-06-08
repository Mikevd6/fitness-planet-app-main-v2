import { Navigate, Route, Routes } from 'react-router-dom';
import ProtectedLayout from '../layouts/ProtectedLayout';
import PublicRoute from './PublicRoute';
import Dashboard from '../pages/Dashboard';
import Login from '../pages/Login';
import Register from '../pages/Register';
import Workouts from '../pages/Workouts';
import WorkoutDetail from '../pages/WorkoutDetail';
import Nutrition from '../pages/Nutrition';
import Recipes from '../pages/Recipes';
import MealPlan from '../pages/MealPlan';
import Progress from '../pages/Progress';
import Profile from '../pages/Profile';

const AppRoutes = () => (
  <Routes>
    <Route element={<ProtectedLayout />}>
      <Route index element={<Dashboard />} />
      <Route path="dashboard" element={<Dashboard />} />
      <Route path="workouts" element={<Workouts />} />
      <Route path="workouts/:id" element={<WorkoutDetail />} />
      <Route path="voeding" element={<Nutrition />} />
      <Route path="recepten" element={<Recipes />} />
      <Route path="maaltijdplan" element={<MealPlan />} />
      <Route path="voortgang" element={<Progress />} />
      <Route path="profiel" element={<Profile />} />
    </Route>

    <Route path="login" element={<PublicRoute><Login /></PublicRoute>} />
    <Route path="register" element={<PublicRoute><Register /></PublicRoute>} />
    <Route path="*" element={<Navigate to="/dashboard" replace />} />
  </Routes>
);

export default AppRoutes;
