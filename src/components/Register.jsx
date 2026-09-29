import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './Register.css';

const Register = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [created, setCreated] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    setError('');
    if (password !== confirmation) {
      setError('De wachtwoorden komen niet overeen.');
      return;
    }

    setBusy(true);
    try {
      const response = await fetch('/registration', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password })
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Registratie is niet gelukt.');
      setPassword('');
      setConfirmation('');
      setCreated(true);
    } catch (failure) {
      setError(failure.message || 'Registratie is tijdelijk niet beschikbaar.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="auth-container">
      <div className="auth-form-container">
        <h1>Registreren</h1>
        {created ? (
          <>
            <p role="status">Je account is aangemaakt. Je kunt nu met je e-mailadres en wachtwoord inloggen.</p>
            <div className="auth-links"><Link to="/login">Ga naar inloggen</Link></div>
          </>
        ) : (
          <>
            <p className="auth-description">Maak een account om je workouts, recepten en maaltijdplan te bewaren.</p>
            <form className="auth-form" onSubmit={submit}>
              <label htmlFor="register-email">E-mailadres</label>
              <input id="register-email" type="email" autoComplete="email" value={email}
                onChange={(event) => setEmail(event.target.value)} required disabled={busy} />
              <label htmlFor="register-password">Wachtwoord (minimaal 8 tekens)</label>
              <input id="register-password" type="password" autoComplete="new-password" value={password}
                onChange={(event) => setPassword(event.target.value)} minLength={8} maxLength={128} required disabled={busy} />
              <label htmlFor="register-confirmation">Herhaal wachtwoord</label>
              <input id="register-confirmation" type="password" autoComplete="new-password" value={confirmation}
                onChange={(event) => setConfirmation(event.target.value)} minLength={8} maxLength={128} required disabled={busy} />
              <button type="submit" className="auth-button" disabled={busy}>
                {busy ? 'Account aanmaken...' : 'Registreren'}
              </button>
            </form>
            {error && <p role="alert" className="form-error">{error}</p>}
            <div className="auth-links">Al een account? <Link to="/login">Inloggen</Link></div>
          </>
        )}
      </div>
    </main>
  );
};

export default Register;
