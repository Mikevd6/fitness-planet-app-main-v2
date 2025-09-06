import React from 'react';

/**
 * ScreenReaderOnly - Verbergt tekst visueel, maar houdt het toegankelijk voor screenreaders
 */
const ScreenReaderOnly = ({ children }) => {
  return <span className="sr-only">{children}</span>;
};

export default ScreenReaderOnly;