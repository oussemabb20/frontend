import React from 'react';

/**
 * Skip Link component for keyboard navigation
 * Allows users to skip directly to main content
 * WCAG 2.1 AA compliant with 4.5:1 contrast ratio
 */
const SkipLink = ({ targetId = "main-content", children = "Skip to main content" }) => {
  return (
    <a 
      href={`#${targetId}`} 
      className="skip-link"
      style={{
        position: 'absolute',
        top: '-40px',
        left: 0,
        background: '#0056b3', // Darker blue for better contrast (4.5:1 ratio)
        color: '#ffffff',
        padding: '8px 16px',
        textDecoration: 'none',
        borderRadius: '0 0 4px 0',
        zIndex: 10000,
        fontWeight: 600,
        transition: 'top 0.2s',
        border: '2px solid #003d82', // Added border for better visibility
      }}
      onFocus={(e) => {
        e.target.style.top = '0';
      }}
      onBlur={(e) => {
        e.target.style.top = '-40px';
      }}
    >
      {children}
    </a>
  );
};

export default SkipLink;
