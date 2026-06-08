import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import AuthRedirectHandler from './routes/AuthRedirectHandler';
import AppRoutes from './routes/AppRoutes';
import './styles/App.css';

const App = () => (
  <AuthProvider>
    <BrowserRouter>
      <AuthRedirectHandler />
      <div className="App">
        <AppRoutes />
      </div>
    </BrowserRouter>
  </AuthProvider>
);

export default App;
