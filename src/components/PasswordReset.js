import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { notificationService } from '../utils/notificationService';
import '../styles/Auth.css';

const PasswordReset = () => {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email.trim()) {
      notificationService.error('Fout', 'Voer een e-mailadres in');
      return;
    }
    
    setLoading(true);
    
    try {
      // Simulatie van API call voor wachtwoord reset
      // In een echte applicatie zou je hier een echte API aanroepen
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setIsSubmitted(true);
      notificationService.success('Wachtwoord reset link verzonden', 
        `Een link om je wachtwoord te herstellen is verzonden naar ${email}`);
    } catch (error) {
      console.error('Error resetting password:', error);
      notificationService.error('Fout bij wachtwoord reset', 
        'Er is een fout opgetreden bij het verzenden van de reset link');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-form-container">
        <h2>Wachtwoord herstellen</h2>
        
        {!isSubmitted ? (
          <>
            <p className="auth-description">
              Voer je e-mailadres in om een link te ontvangen waarmee je je wachtwoord kunt herstellen.
            </p>
            
            <form onSubmit={handleSubmit} className="auth-form">
              <div className="form-group">
                <label htmlFor="email">E-mailadres</label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Voer je e-mailadres in"
                  required
                />
              </div>
              
              <button 
                type="submit" 
                className="auth-button"
                disabled={loading}
              >
                {loading ? 'Bezig...' : 'Reset link versturen'}
              </button>
            </form>
            
            <div className="auth-links">
              <Link to="/login">Terug naar inloggen</Link>
            </div>
          </>
        ) : (
          <div className="reset-success">
            <div className="success-icon">✓</div>
            <h3>Reset link verzonden</h3>
            <p>
              We hebben een link verzonden naar <strong>{email}</strong> om je wachtwoord te herstellen.
              Controleer je e-mail en volg de instructies.
            </p>
            <Link to="/login" className="auth-button">
              Terug naar inloggen
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default PasswordReset;