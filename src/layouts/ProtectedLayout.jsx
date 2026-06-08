import { Outlet } from 'react-router-dom';
import { RecipeProvider } from '../contexts/RecipeContext';
import { MealPlanProvider } from '../contexts/MealPlanContext';
import Header from '../components/Header';
import ProtectedRoute from '../routes/ProtectedRoute';

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

export default ProtectedLayout;
