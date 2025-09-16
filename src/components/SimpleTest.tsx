import React from 'react';

const SimpleTest: React.FC = () => {
  return (
    <div style={{ 
      padding: '20px', 
      backgroundColor: '#f0f0f0', 
      minHeight: '100vh',
      fontSize: '24px',
      fontFamily: 'Arial, sans-serif'
    }}>
      <h1 style={{ color: '#333' }}>SiteBoss PWA Test</h1>
      <p>If you can see this, React is working!</p>
      <p>Current time: {new Date().toLocaleString()}</p>
      <div style={{ marginTop: '20px' }}>
        <button onClick={() => alert('Button clicked!')}>
          Test Button
        </button>
      </div>
    </div>
  );
};

export default SimpleTest;