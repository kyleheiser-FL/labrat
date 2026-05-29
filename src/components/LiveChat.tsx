import React from 'react';

export const LiveChat: React.FC = () => {
  const openMessenger = () => {
    window.open('https://m.me/Labratapp', '_blank', 'noopener,noreferrer');
  };

  return (
    <button 
      onClick={openMessenger}
      aria-label="Chat with Labrat Support on Messenger"
      style={{
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        background: 'linear-gradient(135deg, #00c6ff 0%, #0072ff 50%, #7f00ff 100%)',
        color: '#ffffff',
        border: 'none',
        borderRadius: '50px',
        padding: '14px 28px',
        cursor: 'pointer',
        boxShadow: '0 6px 20px rgba(0, 114, 255, 0.4)',
        fontWeight: 'bold',
        fontSize: '16px',
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        zIndex: 9999,
        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'scale(1.05)';
        e.currentTarget.style.boxShadow = '0 8px 24px rgba(0, 114, 255, 0.5)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'scale(1)';
        e.currentTarget.style.boxShadow = '0 6px 20px rgba(0, 114, 255, 0.4)';
      }}
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 2C6.36 2 2 6.13 2 11.7c0 2.94 1.19 5.56 3.14 7.43.16.15.25.36.25.58l.01 2.44c0 .54.56.91 1.05.67l2.74-1.35c.18-.09.39-.11.58-.05 1.41.41 2.91.64 4.47.64 5.64 0 10-4.13 10-9.7C22 6.13 17.64 2 12 2zm1.09 12.33l-2.45-2.61-4.79 2.61 5.27-5.59 2.49 2.61 4.75-2.61-5.27 5.59z" fill="currentColor"/>
      </svg>
      Chat with us
    </button>
  );
};
