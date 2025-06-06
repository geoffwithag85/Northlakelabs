import React, { useEffect } from 'react';

const TestReactComponent: React.FC = () => {
  useEffect(() => {
    console.log('🚀 TestReactComponent mounted successfully!');
    if (typeof window !== 'undefined') {
      console.log('🌍 Browser environment detected');
    }
  }, []);

  return (
    <div style={{ 
      padding: '20px', 
      backgroundColor: '#3B82F6', 
      color: 'white', 
      borderRadius: '8px',
      margin: '20px 0',
      border: '3px solid #1D4ED8'
    }}>
      <h3 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '10px' }}>
        🎉 React Component is Working!
      </h3>
      <p style={{ marginBottom: '15px' }}>
        If you can see this blue box, React is properly integrated with Astro.
      </p>
      <p style={{ marginBottom: '15px', fontSize: '14px', opacity: 0.9 }}>
        Current timestamp: {new Date().toLocaleTimeString()}
      </p>
      <button 
        style={{ 
          padding: '10px 20px', 
          backgroundColor: 'white', 
          color: '#3B82F6', 
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          fontSize: '16px'
        }}
        onClick={() => {
          if (typeof window !== 'undefined') {
            alert('✅ React click event working!');
          }
        }}
      >
        Test Click Event
      </button>
    </div>
  );
};

export { TestReactComponent };
export default TestReactComponent;
