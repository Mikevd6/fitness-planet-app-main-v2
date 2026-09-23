import React from 'react';
import { Link } from 'react-router-dom';
import './Register.css';

const Register = () => (
  <main className="auth-container">
    <div className="auth-form-container">
      <h1>Een account aanvragen</h1>
      <p className="auth-description">
        De nieuwe NOVI-API laat alleen een ingelogde beheerder gebruikers aanmaken.
        Zelf registreren met dit formulier is daarom niet beschikbaar.
        Vraag de beheerder van dit NOVI-project om een account, of probeer de demo-inlog.
      </p>
      <div className="auth-links">
        <Link to="/login">Terug naar inloggen</Link>
      </div>
    </div>
  </main>
);

export default Register;
