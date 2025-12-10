import React, { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import '../styles/Login.css';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { user, login } = useAuth();

  // If user is already logged in, redirect to dashboard
  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (!formData.email || !formData.password) {
        throw new Error('Please fill in all fields');
      }

      const result = await login({
        email: formData.email.trim(),
        password: formData.password
      });

      if (!result?.success) {
        setError(result?.error || 'Login failed. Please try again.');
      }
      // Navigation will happen automatically due to auth state change
    } catch (err) {
      setError(err.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <header className="login-nav">
        <div className="nav-left">
          <div className="nav-brand">
            <img
              src="/images/planet-fitness-logo.png"
              alt="Fitness Planet"
              className="nav-logo"
            />
            <span className="brand-name">Fitness Planet</span>
          </div>
          <nav className="nav-links">
            <Link to="/dashboard">Dashboard</Link>
            <Link to="/workouts">Workouts</Link>
            <Link to="/voeding">Voeding</Link>
            <Link to="/recepten">Recepten</Link>
            <Link to="/maaltijdplan">Maaltijdplan</Link>
            <Link to="/voortgang">Voortgang</Link>
            <Link to="/profiel">Profiel</Link>
          </nav>
        </div>
        <div className="nav-actions">
          <Link to="/login" className="nav-btn secondary">Login</Link>
          <Link to="/register" className="nav-btn primary">Register</Link>
        </div>
      </header>

      <main className="login-main">
        <div className="login-card">
          <div className="card-header">
            <div className="card-logo">
              <img
                src="/images/planet-fitness-logo.png"
                alt="Fitness Planet"
              />
              <h1>Fitness Planet</h1>
            </div>
            <p>Welkom terug! Log in om je fitness reis voort te zetten.</p>
          </div>

          <form onSubmit={handleSubmit} className="login-form">
            <div className="form-group">
              <label htmlFor="email">E-mailadres</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="je@email.com"
                required
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Wachtwoord</label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Je wachtwoord"
                required
                disabled={loading}
              />
            </div>

            {error && (
              <div className="error-message">
                {error}
              </div>
            )}

            <button
              type="submit"
              className="login-btn"
              disabled={loading}
            >
              {loading ? 'Bezig met inloggen...' : 'Inloggen'}
            </button>
          </form>

          <div className="login-footer">
            <p>
              Nog geen account? {' '}
              <Link to="/register" className="link">
                Registreer hier
              </Link>
            </p>
            <p>
              <Link to="/password-reset" className="link">
                Wachtwoord vergeten?
              </Link>
            </p>
          </div>

          {process.env.NODE_ENV !== 'production' && (
            <div className="demo-credentials">
              <h3>Demo Account</h3>
              <p>Email: demo@fitnessplanet.com</p>
              <p>Password: demo123</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Login;
