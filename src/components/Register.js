import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { notificationService } from '../utils/notificationService';
import { useAuth } from '../contexts/AuthContext';
import ActionButton from './ui/ActionButton';
import FormField from './ui/FormField';
import '../styles/Auth.css';

const registerFields = [
  { id: 'name', label: 'Naam', placeholder: 'Voer je naam in' },
  { id: 'email', label: 'E-mailadres', type: 'email', placeholder: 'Voer je e-mailadres in' },
  { id: 'password', label: 'Wachtwoord', type: 'password', placeholder: 'Voer een wachtwoord in' },
  { id: 'confirmPassword', label: 'Bevestig wachtwoord', type: 'password', placeholder: 'Bevestig je wachtwoord' }
];

const Register = () => {
  const navigate = useNavigate();
  const { register: registerUser } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((currentData) => ({
      ...currentData,
      [name]: value
    }));

    if (errors[name]) {
      setErrors((currentErrors) => ({
        ...currentErrors,
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

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const result = await registerUser({
        username: formData.email.trim(),
        email: formData.email.trim(),
        password: formData.password,
        info: formData.name
      });

      if (result?.success) {
        notificationService.success('Registratie succesvol', 'Je account is aangemaakt. Log nu in.');
        navigate('/login');
      } else {
        setErrors({ form: result?.error || 'Registratie is mislukt. Probeer het opnieuw.' });
      }
    } catch (error) {
      setErrors({ form: error.message || 'Er ging iets mis tijdens het registreren.' });
      notificationService.error('Fout bij registreren', 'Er is een fout opgetreden tijdens het registreren');
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
          {registerFields.map((field) => (
            <FormField
              key={field.id}
              id={field.id}
              label={field.label}
              type={field.type || 'text'}
              value={formData[field.id]}
              placeholder={field.placeholder}
              error={errors[field.id]}
              onChange={handleChange}
            />
          ))}

          <ActionButton
            type="submit"
            className="auth-button"
            disabled={loading}
            label={loading ? 'Bezig met registreren...' : 'Registreren'}
          />
        </form>

        <div className="auth-links">
          <p>Heb je al een account? <Link to="/login">Log in</Link></p>
        </div>

        {errors.form && <p className="error-text form-error">{errors.form}</p>}
      </div>
    </div>
  );
};

export default Register;
