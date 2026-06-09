import React from 'react';

export const LiveChat: React.FC = () => {
  const openMessenger = () => {
    window.location.href = 'https://m.me/1188568744330200';
  };

  return (
    <button
      onClick={openMessenger}
      aria-label="Chat on Messenger"
      style={{
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        width: '52px',
        height: '52px',
        background: 'linear-gradient(45deg, #0099ff 0%, #a033ff 100%)',
        border: 'none',
        borderRadius: '50%',
        padding: '0',
        cursor: 'pointer',
        boxShadow: '0 4px 16px rgba(0,100,255,0.40)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        transition: 'transform 0.18s ease, box-shadow 0.18s ease',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'scale(1.10)';
        e.currentTarget.style.boxShadow = '0 6px 22px rgba(0,100,255,0.52)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'scale(1)';
        e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,100,255,0.40)';
      }}
    >
      {/* Official Facebook Messenger logo SVG */}
      <svg width="26" height="26" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M14 2C7.373 2 2 7.101 2 13.4c0 3.426 1.466 6.497 3.845 8.663a.93.93 0 0 1 .308.654l.062 2.04c.02.65.697 1.074 1.283.8l2.273-1.006a.93.93 0 0 1 .622-.044A13.44 13.44 0 0 0 14 24.8c6.627 0 12-5.101 12-11.4C26 7.101 20.627 2 14 2z"
          fill="white"
        />
        <path
          d="M7.6 16.8 11.3 11.1l3.3 2.4 3.5-2.4 3.7 5.7-3.7-2.4-3.5 2.5-3.3-2.5z"
          fill="url(#msg-grad)"
        />
        <defs>
          <linearGradient id="msg-grad" x1="7.6" y1="16.8" x2="21.8" y2="11.1" gradientUnits="userSpaceOnUse">
            <stop stopColor="#0099FF" />
            <stop offset="1" stopColor="#A033FF" />
          </linearGradient>
        </defs>
      </svg>
    </button>
  );
};
