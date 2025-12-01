import React, { useState, useEffect } from 'react';
import '../styles/Dashboard.css';

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Get user data from localStorage
    const userData = JSON.parse(localStorage.getItem('user'));
    
    setTimeout(() => {
      setUser(userData || { username: 'Mike' }); // Default to Mike if no user found
      setIsLoading(false);
    }, 500);
  }, []);

  if (isLoading) {
    return (
      <div className="loading">
        <div className="loading-spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <h1 className="page-title">Dashboard</h1>
      <h1 className="welcome-message">Welkom {user.username}!</h1>
      
      <div className="dashboard-stats">
        <div className="stat-card">
          <h3>Dagelijkse Calorieën</h3>
          <p>1,850 / 2,200</p>
        </div>
        
        <div className="stat-card">
          <h3>Workouts Deze Week</h3>
          <p>3 / 5</p>
        </div>
        
        <div className="stat-card">
          <h3>Water Gedronken</h3>
          <p>1.5L / 2.5L</p>
        </div>
        
        <div className="stat-card">
          <h3>Slaap Vannacht</h3>
          <p>7h 30m</p>
        </div>
      </div>

      <div className="dashboard-grid">
        <div className="dashboard-card">
          <h2>Voedingsoverzicht</h2>
          <p>Je hebt vandaag 1850 calorieën gegeten.</p>
        </div>
        
        <div className="dashboard-card">
          <h2>Recente Workouts</h2>
          <ul>
            <li>Bovenlichaam Krachttraining - Gisteren</li>
            <li>HIIT Cardio - 3 dagen geleden</li>
            <li>Benen & Core - 5 dagen geleden</li>
          </ul>
        </div>
        
        <div className="dashboard-card">
          <h2>Voortgang</h2>
          <p>Je bent goed op weg! Blijf zo doorgaan.</p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;