import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import ActionButton from './ui/ActionButton';
import FormField from './ui/FormField';
import '../styles/Login.css';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((currentData) => ({
      ...currentData,
      [name]: value
    }));

    if (error) setError('');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
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
            <span>Dashboard</span>
            <span>Workouts</span>
            <span>Voeding</span>
            <span>Recepten</span>
            <span>Maaltijdplan</span>
            <span>Voortgang</span>
            <span>Profiel</span>
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
            <FormField
              id="email"
              label="E-mailadres"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="je@email.com"
              disabled={loading}
              required
            />

            <FormField
              id="password"
              label="Wachtwoord"
              type="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Je wachtwoord"
              disabled={loading}
              required
            />

            {error && <div className="error-message">{error}</div>}

            <ActionButton
              type="submit"
              className="login-btn"
              disabled={loading}
              label={loading ? 'Bezig met inloggen...' : 'Inloggen'}
            />
          </form>

          <div className="login-footer">
            <p>
              Nog geen account?{' '}
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

          <div className="demo-credentials">
            <h3>Demo Account</h3>
            <p>Email: demo@fitnessplanet.com</p>
            <p>Password: demo123</p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Login;
