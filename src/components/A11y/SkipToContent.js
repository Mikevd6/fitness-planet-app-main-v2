import React from 'react';

/**
 * SkipToContent - Toetsenbordtoegankelijkheidscomponent
 * Stelt gebruikers in staat om direct naar de hoofdinhoud te navigeren
 */
const SkipToContent = () => {
  return (
    <a href="#main-content" className="skip-link">
      Ga direct naar inhoud
    </a>
  );
};

export default SkipToContent;