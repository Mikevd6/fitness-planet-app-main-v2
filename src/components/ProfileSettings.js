import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import '../styles/ProfileSettings.css';

const ProfileSettings = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState({
    name: '', email: '', age: '', height: '', weight: '',
    activityLevel: 'moderate'
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setProfile(p => ({ ...p, name: user.name || '', email: user.email || '' }));
    }
  }, [user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfile(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    await new Promise(r => setTimeout(r, 600));
    setLoading(false);
    // TODO persist
  };

  return (
    <div className="page profile-page">
      <header className="page-header">
        <div className="page-heading-group">
          <h1 className="page-title">Profiel</h1>
          <p className="page-subtitle">Persoonlijke gegevens en voorkeuren.</p>
        </div>
        <div className="page-actions">
          <button className="btn btn-outline">Wachtwoord</button>
          <button className="btn btn-primary" form="profile-form" disabled={loading}>{loading ? 'Opslaan...' : 'Opslaan'}</button>
        </div>
      </header>

      <form id="profile-form" onSubmit={handleSubmit} className="profile-layout">
        <section className="panel section-basic">
          <h2 className="panel-title">Basis</h2>
          <div className="form-grid">
            <div className="form-field"><label>Naam</label><input name="name" value={profile.name} onChange={handleInputChange} /></div>
            <div className="form-field"><label>Email</label><input name="email" value={profile.email} disabled /></div>
            <div className="form-field"><label>Leeftijd</label><input name="age" value={profile.age} onChange={handleInputChange} type="number" /></div>
            <div className="form-field"><label>Lengte (cm)</label><input name="height" value={profile.height} onChange={handleInputChange} type="number" /></div>
            <div className="form-field"><label>Gewicht (kg)</label><input name="weight" value={profile.weight} onChange={handleInputChange} type="number" step="0.1" /></div>
            <div className="form-field"><label>Activiteit</label><select name="activityLevel" value={profile.activityLevel} onChange={handleInputChange}><option value="sedentary">Laag</option><option value="light">Licht</option><option value="moderate">Gemiddeld</option><option value="active">Actief</option><option value="extremely-active">Zeer Actief</option></select></div>
          </div>
        </section>

        <section className="panel section-preferences">
          <h2 className="panel-title">Instellingen</h2>
          <div className="placeholder-block">(Uitbreiden met dieet & doelen in latere fase)</div>
        </section>
      </form>
    </div>
  );
};

export default ProfileSettings;
