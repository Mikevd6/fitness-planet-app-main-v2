import React, { useState, useEffect } from 'react';
import { storage } from '../utils/localStorage';
import { notificationService } from '../utils/notificationService';
import { withErrorHandling } from '../utils/errorHandling';
import { validateForm } from '../utils/validators';
import ScreenReaderOnly from './A11y/ScreenReaderOnly';
import DataExport from './DataExport';
import '../styles/Profiel.css';

const Profiel = ({ user }) => {
  const [profile, setProfile] = useState({
    name: user?.name || '',
    email: user?.email || '',
    weight: user?.weight || '',
    height: user?.height || '',
    goal: user?.goal || 'maintenance',
    activityLevel: user?.activityLevel || 'moderate',
    gender: user?.gender || 'female',
    age: user?.age || '',
    birthDate: user?.birthDate || ''
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [isEditMode, setIsEditMode] = useState(true);

  const validationRules = {
    name: { required: true, name: true },
    email: { required: true, email: true },
    weight: { required: false, min: 30, max: 300 },
    height: { required: false, min: 100, max: 250 },
    age: { required: false, min: 13, max: 120 }
  };

  useEffect(() => {
    const loadProfile = withErrorHandling(async () => {
      const savedProfile = storage.getProfile();
      if (savedProfile) {
        setProfile(prev => ({
          ...prev,
          ...savedProfile
        }));
      }
    }, { context: 'profile-loading' });

    loadProfile();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile(prev => ({
      ...prev,
      [name]: value
    }));

    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }

    if (isSaved) {
      setIsSaved(false);
    }
  };

  const saveProfile = withErrorHandling(async (e) => {
    e.preventDefault();

    const formErrors = validateForm(profile, validationRules);
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      const firstErrorField = document.getElementById(Object.keys(formErrors)[0]);
      if (firstErrorField) {
        firstErrorField.focus();
      }
      return;
    }

    setIsSubmitting(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 500));

      const updatedUser = {
        ...user,
        ...profile
      };

      storage.setUser(updatedUser);
      storage.setProfile(profile);

      setIsSaved(true);
      notificationService.success('Profiel bijgewerkt', 'Je profiel is succesvol bijgewerkt');
      setIsEditMode(false);
    } finally {
      setIsSubmitting(false);
    }
  }, { context: 'profile-saving' });

  const toggleEditMode = () => {
    setIsEditMode(prev => !prev);
  };

  return (
    <div className="profiel-page" aria-labelledby="profile-heading">
      <div className="profile-hero">
        <div className="hero-left">
          <p className="breadcrumb">Fitness Planet / Profiel</p>
          <h1 id="profile-heading">Profiel</h1>
        </div>
        <div className="hero-actions">
          <button type="button" className="ghost-button" onClick={toggleEditMode}>
            {isEditMode ? 'Bekijk modus' : 'Wijzig modus'}
          </button>
          <button
            type="submit"
            className="primary-button"
            form="profile-form"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Opslaan...' : 'Opslaan'}
          </button>
        </div>
      </div>

      {isSaved && (
        <div className="profile-alert" role="status">
          Je profiel is succesvol bijgewerkt!
        </div>
      )}

      <form id="profile-form" onSubmit={saveProfile} className="profile-grid">
        <section className="profile-card" aria-labelledby="basic-heading">
          <div className="card-header">
            <h2 id="basic-heading">Basis</h2>
            {!isEditMode && (
              <span className="view-mode-label" aria-live="polite">Leesmodus</span>
            )}
          </div>

          <div className="card-grid">
            <div className={`input-group ${errors.name ? 'has-error' : ''}`}>
              <label htmlFor="name">
                Naam
                <ScreenReaderOnly> (verplicht)</ScreenReaderOnly>
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={profile.name}
                onChange={handleChange}
                placeholder="Je naam"
                aria-required="true"
                aria-invalid={!!errors.name}
                aria-describedby={errors.name ? 'name-error' : undefined}
                disabled={!isEditMode}
              />
              {errors.name && (
                <div className="error-text" id="name-error" role="alert">
                  {errors.name}
                </div>
              )}
            </div>

            <div className={`input-group ${errors.email ? 'has-error' : ''}`}>
              <label htmlFor="email">
                Email
                <ScreenReaderOnly> (verplicht)</ScreenReaderOnly>
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={profile.email}
                onChange={handleChange}
                placeholder="Je e-mailadres"
                readOnly
                aria-required="true"
                aria-invalid={!!errors.email}
                aria-describedby={errors.email ? 'email-error' : undefined}
                disabled={!isEditMode}
              />
              {errors.email && (
                <div className="error-text" id="email-error" role="alert">
                  {errors.email}
                </div>
              )}
            </div>

            <div className={`input-group ${errors.height ? 'has-error' : ''}`}>
              <label htmlFor="height">Lengte (cm)</label>
              <input
                type="number"
                id="height"
                name="height"
                value={profile.height}
                onChange={handleChange}
                placeholder="183"
                min="100"
                max="250"
                aria-invalid={!!errors.height}
                aria-describedby={errors.height ? 'height-error' : undefined}
                disabled={!isEditMode}
              />
              {errors.height && (
                <div className="error-text" id="height-error" role="alert">
                  {errors.height}
                </div>
              )}
            </div>

            <div className={`input-group ${errors.weight ? 'has-error' : ''}`}>
              <label htmlFor="weight">Gewicht (kg)</label>
              <input
                type="number"
                id="weight"
                name="weight"
                value={profile.weight}
                onChange={handleChange}
                placeholder="82"
                min="30"
                max="300"
                aria-invalid={!!errors.weight}
                aria-describedby={errors.weight ? 'weight-error' : undefined}
                disabled={!isEditMode}
              />
              {errors.weight && (
                <div className="error-text" id="weight-error" role="alert">
                  {errors.weight}
                </div>
              )}
            </div>

            <div className={`input-group ${errors.activityLevel ? 'has-error' : ''}`}>
              <label htmlFor="activityLevel">Activiteitsniveau</label>
              <select
                id="activityLevel"
                name="activityLevel"
                value={profile.activityLevel}
                onChange={handleChange}
                aria-required="true"
                aria-invalid={!!errors.activityLevel}
                aria-describedby={errors.activityLevel ? 'activityLevel-error' : undefined}
                disabled={!isEditMode}
              >
                <option value="sedentary">Sedentair</option>
                <option value="light">Licht actief</option>
                <option value="moderate">Gemiddeld</option>
                <option value="active">Zeer actief</option>
                <option value="veryActive">Extreem actief</option>
              </select>
              {errors.activityLevel && (
                <div className="error-text" id="activityLevel-error" role="alert">
                  {errors.activityLevel}
                </div>
              )}
            </div>

            <div className={`input-group ${errors.age ? 'has-error' : ''}`}>
              <label htmlFor="age">Leeftijd</label>
              <input
                type="number"
                id="age"
                name="age"
                value={profile.age}
                onChange={handleChange}
                placeholder="25"
                min="13"
                max="120"
                aria-invalid={!!errors.age}
                aria-describedby={errors.age ? 'age-error' : undefined}
                disabled={!isEditMode}
              />
              {errors.age && (
                <div className="error-text" id="age-error" role="alert">
                  {errors.age}
                </div>
              )}
            </div>

            <div className="input-group">
              <label htmlFor="birthDate">Geboortedatum</label>
              <input
                type="date"
                id="birthDate"
                name="birthDate"
                value={profile.birthDate}
                onChange={handleChange}
                placeholder="1999-04-29"
                disabled={!isEditMode}
              />
            </div>

            <div className="input-group">
              <label htmlFor="goal">Goal</label>
              <select
                id="goal"
                name="goal"
                value={profile.goal}
                onChange={handleChange}
                disabled={!isEditMode}
              >
                <option value="weightLoss">Afvallen</option>
                <option value="maintenance">Gemiddeld</option>
                <option value="weightGain">Spieropbouw</option>
              </select>
            </div>
          </div>
        </section>

        <section className="profile-card" aria-labelledby="settings-heading">
          <div className="card-header">
            <h2 id="settings-heading">Instellingen</h2>
          </div>
          <p className="settings-text">
            Instellingen voor doel & voedsel in deze pagina
          </p>
        </section>
      </form>

      <DataExport user={user} />
    </div>
  );
};

export default Profiel;
