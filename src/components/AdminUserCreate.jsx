import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './Register.css';

const AdminUserCreate = () => {
  const { user, register } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const isAdmin = user?.roles?.some((role) => String(role).toLowerCase() === 'admin');

  if (!isAdmin) {
    return (
      <main className="auth-container">
        <div className="auth-form-container">
          <h1>Geen toegang</h1>
          <p>Alleen een ingelogde NOVI-beheerder kan gebruikers aanmaken.</p>
          <Link to="/dashboard">Terug naar dashboard</Link>
        </div>
      </main>
    );
  }

  const handleSubmit = async (event) => {
    event.preventDefault();
    setBusy(true);
    setMessage('');
    setError('');

    const result = await register({ email: email.trim(), password });
    if (result.success) {
      setMessage(`Account voor ${email.trim()} aangemaakt. Deze gebruiker kan nu inloggen.`);
      setEmail('');
      setPassword('');
    } else {
      setError(result.error || 'Account aanmaken is niet gelukt.');
    }
    setBusy(false);
  };

  return (
    <main className="auth-container">
      <div className="auth-form-container">
        <h1>Gebruiker aanmaken</h1>
        <p className="auth-description">Maak als beheerder een account aan via de NOVI-API.</p>
        <form className="auth-form" onSubmit={handleSubmit}>
          <label htmlFor="new-user-email">E-mailadres</label>
          <input id="new-user-email" type="email" autoComplete="off" value={email}
            onChange={(event) => setEmail(event.target.value)} required disabled={busy} />
          <label htmlFor="new-user-password">Wachtwoord</label>
          <input id="new-user-password" type="password" autoComplete="new-password" value={password}
            onChange={(event) => setPassword(event.target.value)} minLength={6} required disabled={busy} />
          <button type="submit" className="auth-button" disabled={busy}>
            {busy ? 'Bezig met aanmaken...' : 'Account aanmaken'}
          </button>
        </form>
        {message && <p role="status">{message}</p>}
        {error && <p role="alert" className="form-error">{error}</p>}
      </div>
    </main>
  );
};

export default AdminUserCreate;
