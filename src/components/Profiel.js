import React, { useState, useEffect } from 'react';
import { storage } from '../utils/localStorage';
import { notificationService } from '../utils/notificationService';
import { withErrorHandling } from '../utils/errorHandling';
import { validateForm } from '../utils/validators';
import ScreenReaderOnly from './A11y/ScreenReaderOnly';
import DataExport from './DataExport';
import '../styles/Profiel.css';

const Profiel = ({ user }) => {
  // State
  const [profile, setProfile] = useState({
    name: user?.name || '',
    email: user?.email || '',
    weight: user?.weight || '',
    height: user?.height || '',
    goal: user?.goal || 'maintenance',
    activityLevel: user?.activityLevel || 'moderate',
    gender: user?.gender || 'female',
    age: user?.age || ''
  });
  
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  // Formulier validatieregels
  const validationRules = {
    name: { required: true, name: true },
    email: { required: true, email: true },
    weight: { required: false, min: 30, max: 300 },
    height: { required: false, min: 100, max: 250 },
    age: { required: false, min: 13, max: 120 }
  };

  useEffect(() => {
    // Load saved profile data
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
    
    // Clear errors for this field
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
    
    // Clear saved state
    if (isSaved) {
      setIsSaved(false);
    }
  };

  const saveProfile = withErrorHandling(async (e) => {
    e.preventDefault();
    
    // Validate form
    const formErrors = validateForm(profile, validationRules);
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      
      // Focus the first field with error
      const firstErrorField = document.getElementById(Object.keys(formErrors)[0]);
      if (firstErrorField) {
        firstErrorField.focus();
      }
      
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // In a real app, this would be an API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Update user profile in storage
      const updatedUser = {
        ...user,
        ...profile
      };
      
      storage.setUser(updatedUser);
      storage.setProfile(profile);
      
      setIsSaved(true);
      notificationService.success('Profiel bijgewerkt', 'Je profiel is succesvol bijgewerkt');
    } finally {
      setIsSubmitting(false);
    }
  }, { context: 'profile-saving' });

  // Calculate daily calories based on profile data and goal
  const calculateDailyCalories = () => {
    if (!profile.weight || !profile.height || !profile.age) return null;
    
    // Simple BMR calculation (Mifflin-St Jeor)
    const weight = parseFloat(profile.weight);
    const height = parseFloat(profile.height);
    const age = parseFloat(profile.age);
    const isMale = profile.gender === 'male';
    
    // BMR calculation
    let bmr;
    if (isMale) {
      bmr = 10 * weight + 6.25 * height - 5 * age + 5;
    } else {
      bmr = 10 * weight + 6.25 * height - 5 * age - 161;
    }
    
    // Activity multiplier
    const activityMultipliers = {
      sedentary: 1.2,
      light: 1.375,
      moderate: 1.55,
      active: 1.725,
      veryActive: 1.9
    };
    
    const tdee = bmr * activityMultipliers[profile.activityLevel || 'moderate'];
    
    // Adjust based on goal
    const goalAdjustments = {
      weightLoss: tdee - 500,  // 500 calorie deficit
      maintenance: tdee,       // maintain weight
      weightGain: tdee + 500   // 500 calorie surplus
    };
    
    return Math.round(goalAdjustments[profile.goal || 'maintenance']);
  };
  
  // (Removed unused getGoalDescription function)

  return (
    <div className="profile-container" aria-labelledby="profile-heading">
      <h1 id="profile-heading">Mijn Profiel</h1>
      
      {isSaved && (
        <div className="alert alert--success" role="status">
          Je profiel is succesvol bijgewerkt!
        </div>
      )}
      
      <form onSubmit={saveProfile} className="profile-form">
        <div className="profile-section" aria-labelledby="personal-info-heading">
          <h2 id="personal-info-heading">Persoonlijke informatie</h2>
          
          <div className={`form-group ${errors.name ? 'has-error' : ''}`}>
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
              placeholder="Voer je naam in"
              aria-required="true"
              aria-invalid={!!errors.name}
              aria-describedby={errors.name ? 'name-error' : undefined}
              className={`form-control ${errors.name ? 'error' : ''}`}
            />
            {errors.name && (
              <div className="error-text" id="name-error" role="alert">
                {errors.name}
              </div>
            )}
          </div>
          
          <div className={`form-group ${errors.email ? 'has-error' : ''}`}>
            <label htmlFor="email">
              E-mail
              <ScreenReaderOnly> (verplicht)</ScreenReaderOnly>
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={profile.email}
              onChange={handleChange}
              placeholder="Voer je e-mailadres in"
              readOnly
              aria-required="true"
              aria-invalid={!!errors.email}
              aria-describedby={errors.email ? 'email-error' : undefined}
              className={`form-control ${errors.email ? 'error' : ''}`}
            />
            {errors.email && (
              <div className="error-text" id="email-error" role="alert">
                {errors.email}
              </div>
            )}
          </div>
          
          <div className={`form-group ${errors.weight ? 'has-error' : ''}`}>
            <label htmlFor="weight">
              Gewicht (kg)
              <ScreenReaderOnly> (optioneel)</ScreenReaderOnly>
            </label>
            <input
              type="number"
              id="weight"
              name="weight"
              value={profile.weight}
              onChange={handleChange}
              placeholder="Voer je gewicht in"
              min="30"
              max="300"
              aria-invalid={!!errors.weight}
              aria-describedby={errors.weight ? 'weight-error' : undefined}
              className={`form-control ${errors.weight ? 'error' : ''}`}
            />
            {errors.weight && (
              <div className="error-text" id="weight-error" role="alert">
                {errors.weight}
              </div>
            )}
          </div>
          
          <div className={`form-group ${errors.height ? 'has-error' : ''}`}>
            <label htmlFor="height">
              Lengte (cm)
              <ScreenReaderOnly> (optioneel)</ScreenReaderOnly>
            </label>
            <input
              type="number"
              id="height"
              name="height"
              value={profile.height}
              onChange={handleChange}
              placeholder="Voer je lengte in"
              min="100"
              max="250"
              aria-invalid={!!errors.height}
              aria-describedby={errors.height ? 'height-error' : undefined}
              className={`form-control ${errors.height ? 'error' : ''}`}
            />
            {errors.height && (
              <div className="error-text" id="height-error" role="alert">
                {errors.height}
              </div>
            )}
          </div>
          
          <div className={`form-group ${errors.age ? 'has-error' : ''}`}>
            <label htmlFor="age">
              Leeftijd
              <ScreenReaderOnly> (optioneel)</ScreenReaderOnly>
            </label>
            <input
              type="number"
              id="age"
              name="age"
              value={profile.age}
              onChange={handleChange}
              placeholder="Voer je leeftijd in"
              min="13"
              max="120"
              aria-invalid={!!errors.age}
              aria-describedby={errors.age ? 'age-error' : undefined}
              className={`form-control ${errors.age ? 'error' : ''}`}
            />
            {errors.age && (
              <div className="error-text" id="age-error" role="alert">
                {errors.age}
              </div>
            )}
          </div>
        </div>
        
        <div className="profile-section" aria-labelledby="goals-heading">
          <h2 id="goals-heading">Doelen instellen</h2>
          
          <div className="form-group">
            <label>Doel</label>
            <div className="goal-options">
              <label className={`goal-option ${profile.goal === 'weightLoss' ? 'selected' : ''}`}>
                <input
                  type="radio"
                  name="goal"
                  value="weightLoss"
                  checked={profile.goal === 'weightLoss'}
                  onChange={handleChange}
                />
                <div className="goal-icon">🔽</div>
                <div className="goal-label">Afvallen</div>
                <div className="goal-description">Calorieën verminderen om gewicht te verliezen</div>
              </label>
              
              <label className={`goal-option ${profile.goal === 'maintenance' ? 'selected' : ''}`}>
                <input
                  type="radio"
                  name="goal"
                  value="maintenance"
                  checked={profile.goal === 'maintenance'}
                  onChange={handleChange}
                />
                <div className="goal-icon">⚖️</div>
                <div className="goal-label">Onderhoud</div>
                <div className="goal-description">Gewicht behouden en gezond blijven</div>
              </label>
              
              <label className={`goal-option ${profile.goal === 'weightGain' ? 'selected' : ''}`}>
                <input
                  type="radio"
                  name="goal"
                  value="weightGain"
                  checked={profile.goal === 'weightGain'}
                  onChange={handleChange}
                />
                <div className="goal-icon">🔼</div>
                <div className="goal-label">Aankomen</div>
                <div className="goal-description">Calorieën verhogen om spieren op te bouwen</div>
              </label>
            </div>
          </div>
          
          <div className={`form-group ${errors.activityLevel ? 'has-error' : ''}`}>
            <label htmlFor="activityLevel">
              Activiteitsniveau
              <ScreenReaderOnly> (verplicht)</ScreenReaderOnly>
            </label>
            <select
              id="activityLevel"
              name="activityLevel"
              value={profile.activityLevel}
              onChange={handleChange}
              aria-required="true"
              aria-invalid={!!errors.activityLevel}
              aria-describedby={errors.activityLevel ? 'activityLevel-error' : undefined}
              className={`form-control ${errors.activityLevel ? 'error' : ''}`}
            >
              <option value="sedentary">Sedentair (weinig tot geen beweging)</option>
              <option value="light">Licht actief (1-2 keer per week sporten)</option>
              <option value="moderate">Gemiddeld actief (3-5 keer per week sporten)</option>
              <option value="active">Zeer actief (6-7 keer per week sporten)</option>
              <option value="veryActive">Extreem actief (intensieve training/fysiek werk)</option>
            </select>
            {errors.activityLevel && (
              <div className="error-text" id="activityLevel-error" role="alert">
                {errors.activityLevel}
              </div>
            )}
          </div>
        </div>
        
        {/* Calorie aanbevelingen */}
        {profile.weight && profile.height && (
          <div className="calorie-recommendation">
            <h3>Aanbevolen dagelijkse calorie-inname</h3>
            <div className="calorie-value">{calculateDailyCalories()} kcal</div>
            <p className="calorie-explanation">
              Gebaseerd op je doel: <strong>{
                profile.goal === 'weightLoss' ? 'Afvallen' :
                profile.goal === 'maintenance' ? 'Onderhoud' :
                'Aankomen'
              }</strong>
            </p>
          </div>
        )}
        
        <div className="form-actions">
          <button type="submit" className="save-button" disabled={isSubmitting}>
            {isSubmitting ? 'Opslaan...' : 'Profiel opslaan'}
          </button>
        </div>
      </form>
      
      <DataExport user={user} />
    </div>
  );
};

export default Profiel;