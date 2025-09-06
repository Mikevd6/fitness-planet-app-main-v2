import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

const ProfileSettings = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    age: '',
    height: '',
    weight: '',
    activityLevel: 'moderate',
    fitnessGoals: [],
    dietPreferences: [],
    allergens: []
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Load user profile data
    if (user) {
      setProfile(prev => ({
        ...prev,
        name: user.name || '',
        email: user.email || ''
      }));
    }
  }, [user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfile(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Here you would typically save the profile data
      console.log('Saving profile:', profile);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      alert('Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Error updating profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="profile-settings">
      <div className="container">
        <h1>Profile Settings</h1>
        <p>Manage your personal information and preferences.</p>
        
        <form onSubmit={handleSubmit} className="profile-form">
          <div className="form-section">
            <h2>Personal Information</h2>
            
            <div className="form-group">
              <label htmlFor="name">Name:</label>
              <input
                type="text"
                id="name"
                name="name"
                value={profile.name}
                onChange={handleInputChange}
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="email">Email:</label>
              <input
                type="email"
                id="email"
                name="email"
                value={profile.email}
                onChange={handleInputChange}
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="age">Age:</label>
              <input
                type="number"
                id="age"
                name="age"
                value={profile.age}
                onChange={handleInputChange}
                min="13"
                max="120"
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="height">Height (cm):</label>
              <input
                type="number"
                id="height"
                name="height"
                value={profile.height}
                onChange={handleInputChange}
                min="100"
                max="250"
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="weight">Weight (kg):</label>
              <input
                type="number"
                id="weight"
                name="weight"
                value={profile.weight}
                onChange={handleInputChange}
                min="30"
                max="300"
                step="0.1"
              />
            </div>
          </div>
          
          <div className="form-section">
            <h2>Fitness Preferences</h2>
            
            <div className="form-group">
              <label htmlFor="activityLevel">Activity Level:</label>
              <select
                id="activityLevel"
                name="activityLevel"
                value={profile.activityLevel}
                onChange={handleInputChange}
              >
                <option value="sedentary">Sedentary</option>
                <option value="light">Light Activity</option>
                <option value="moderate">Moderate Activity</option>
                <option value="active">Very Active</option>
                <option value="extremely-active">Extremely Active</option>
              </select>
            </div>
          </div>
          
          <div className="form-actions">
            <button 
              type="submit" 
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? 'Saving...' : 'Save Profile'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProfileSettings;
