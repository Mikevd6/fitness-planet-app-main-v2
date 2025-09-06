import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { storage } from '../utils/localStorage';
import { notificationService } from '../utils/notificationService';
import '../styles/Auth.css';

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear errors when user types
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Naam is verplicht';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'E-mail is verplicht';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Voer een geldig e-mailadres in';
    }
    
    if (!formData.password) {
      newErrors.password = 'Wachtwoord is verplicht';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Wachtwoord moet minstens 6 tekens bevatten';
    }
    
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Wachtwoorden komen niet overeen';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    
    try {
      // Simulatie van registratie API call
      // In een echte applicatie zou je hier een echte API aanroepen
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Check if user already exists
      const existingUsers = storage.getUsers() || [];
      const userExists = existingUsers.some(user => user.email === formData.email);
      
      if (userExists) {
        setErrors({
          email: 'Dit e-mailadres is al geregistreerd'
        });
        setLoading(false);
        return;
      }
      
      // Create new user
      const newUser = {
        id: Date.now().toString(),
        name: formData.name,
        email: formData.email,
        // In a real app, NEVER store plain text passwords - this is just for demo
        password: formData.password,
        createdAt: new Date().toISOString()
      };
      
      // Save user to "database"
      storage.addUser(newUser);
      
      // Auto-login the user
      storage.setUser(newUser);
      
      notificationService.success('Registratie succesvol', 'Je account is aangemaakt');
      navigate('/dashboard');
    } catch (error) {
      console.error('Error registering:', error);
      notificationService.error('Fout bij registreren', 
        'Er is een fout opgetreden tijdens het registreren');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-form-container">
        <h2>Registreer een account</h2>
        <p className="auth-description">
          Maak een account aan om toegang te krijgen tot alle functies van Fitness Planet.
        </p>
        
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="name">Naam</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Voer je naam in"
              className={errors.name ? 'error' : ''}
            />
            {errors.name && <span className="error-text">{errors.name}</span>}
          </div>
          
          <div className="form-group">
            <label htmlFor="email">E-mailadres</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Voer je e-mailadres in"
              className={errors.email ? 'error' : ''}
            />
            {errors.email && <span className="error-text">{errors.email}</span>}
          </div>
          
          <div className="form-group">
            <label htmlFor="password">Wachtwoord</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Voer een wachtwoord in"
              className={errors.password ? 'error' : ''}
            />
            {errors.password && <span className="error-text">{errors.password}</span>}
          </div>
          
          <div className="form-group">
            <label htmlFor="confirmPassword">Bevestig wachtwoord</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Bevestig je wachtwoord"
              className={errors.confirmPassword ? 'error' : ''}
            />
            {errors.confirmPassword && <span className="error-text">{errors.confirmPassword}</span>}
          </div>
          
          <button 
            type="submit" 
            className="auth-button"
            disabled={loading}
          >
            {loading ? 'Bezig met registreren...' : 'Registreren'}
          </button>
        </form>
        
        <div className="auth-links">
          <p>Heb je al een account? <Link to="/login">Log in</Link></p>
        </div>
      </div>
    </div>
  );
};

export default Register;