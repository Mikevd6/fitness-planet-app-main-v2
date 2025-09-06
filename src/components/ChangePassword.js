import React, { useState } from 'react';
import '../styles/ChangePassword.css';
import { storage } from '../utils/localStorage';
import { notificationService } from '../utils/notificationService';

const ChangePassword = ({ onClose }) => {
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.currentPassword.trim()) {
      newErrors.currentPassword = 'Huidig wachtwoord is verplicht';
    }

    if (!formData.newPassword.trim()) {
      newErrors.newPassword = 'Nieuw wachtwoord is verplicht';
    } else if (formData.newPassword.length < 6) {
      newErrors.newPassword = 'Wachtwoord moet minimaal 6 karakters bevatten';
    }

    if (!formData.confirmPassword.trim()) {
      newErrors.confirmPassword = 'Bevestig wachtwoord is verplicht';
    } else if (formData.newPassword !== formData.confirmPassword) {
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

    setIsSubmitting(true);

    try {
      // Simuleer API-aanroep voor wachtwoord wijziging
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // In een echte app zou je hier een API-aanroep doen om het wachtwoord te wijzigen
      // Voor nu simuleren we een succesvolle wijziging
      
      // Update lokale opslag
      const user = storage.getUser();
      if (user) {
        user.passwordLastChanged = new Date().toISOString();
        storage.setUser(user);
      }
      
      // Toon succes notificatie
      notificationService.success('Wachtwoord succesvol gewijzigd');
      
      // Sluit modal
      onClose();
    } catch (error) {
      console.error('Error changing password:', error);
      notificationService.error('Wachtwoord wijzigen mislukt', 'Probeer het later opnieuw');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>Wachtwoord wijzigen</h2>
          <button className="close-button" onClick={onClose}>×</button>
        </div>

        <form className="password-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="currentPassword">Huidig wachtwoord</label>
            <input 
              type="password" 
              id="currentPassword" 
              name="currentPassword"
              value={formData.currentPassword} 
              onChange={handleChange}
              className={errors.currentPassword ? 'error' : ''}
            />
            {errors.currentPassword && <span className="error-text">{errors.currentPassword}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="newPassword">Nieuw wachtwoord</label>
            <input 
              type="password" 
              id="newPassword" 
              name="newPassword"
              value={formData.newPassword} 
              onChange={handleChange}
              className={errors.newPassword ? 'error' : ''}
            />
            {errors.newPassword && <span className="error-text">{errors.newPassword}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Bevestig nieuw wachtwoord</label>
            <input 
              type="password" 
              id="confirmPassword" 
              name="confirmPassword"
              value={formData.confirmPassword} 
              onChange={handleChange}
              className={errors.confirmPassword ? 'error' : ''}
            />
            {errors.confirmPassword && <span className="error-text">{errors.confirmPassword}</span>}
          </div>

          <div className="form-actions">
            <button 
              type="button" 
              className="cancel-btn"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Annuleren
            </button>
            <button 
              type="submit" 
              className="submit-btn"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Bezig met wijzigen..." : "Wachtwoord wijzigen"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChangePassword;