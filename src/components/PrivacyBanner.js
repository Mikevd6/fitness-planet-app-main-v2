import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import '../styles/PrivacyBanner.css';

const PrivacyBanner = () => {
  const [visible, setVisible] = useState(false);
  
  useEffect(() => {
    // Check if user has already accepted
    const hasAccepted = localStorage.getItem('privacy_accepted');
    if (!hasAccepted) {
      setVisible(true);
    }
  }, []);
  
  const acceptAll = () => {
    localStorage.setItem('privacy_accepted', 'true');
    localStorage.setItem('privacy_analytics', 'true');
    localStorage.setItem('privacy_marketing', 'true');
    setVisible(false);
  };
  
  const acceptEssential = () => {
    localStorage.setItem('privacy_accepted', 'true');
    localStorage.setItem('privacy_analytics', 'false');
    localStorage.setItem('privacy_marketing', 'false');
    setVisible(false);
  };
  
  if (!visible) {
    return null;
  }
  
  return (
    <div className="privacy-banner">
      <div className="privacy-banner-content">
        <h3>Jouw privacy</h3>
        <p>
          Fitness Planet gebruikt cookies en vergelijkbare technologieën om de website te laten functioneren en je een
          persoonlijke ervaring te bieden. Door gebruik te maken van deze website, ga je akkoord met ons 
          <Link to="/privacy-beleid"> privacybeleid</Link>.
        </p>
        <div className="privacy-banner-buttons">
          <button onClick={acceptEssential} className="secondary-button">
            Alleen essentiële cookies
          </button>
          <button onClick={acceptAll} className="primary-button">
            Accepteer alle cookies
          </button>
        </div>
      </div>
    </div>
  );
};

export default PrivacyBanner;