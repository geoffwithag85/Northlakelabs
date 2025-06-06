import React from 'react';

function SimpleTestComponent() {
  console.log('SimpleTestComponent rendering...');
  
  return React.createElement('div', 
    { 
      style: { 
        padding: '20px', 
        backgroundColor: '#10B981', 
        color: 'white', 
        borderRadius: '8px',
        margin: '20px 0',
        border: '3px solid #059669',
        textAlign: 'center'
      }
    },
    React.createElement('h2', 
      { style: { margin: '0 0 10px 0' } }, 
      '✅ Simple React Component Working!'
    ),
    React.createElement('p', 
      { style: { margin: '0' } }, 
      'This is a basic React component without any complex dependencies.'
    )
  );
}

export default SimpleTestComponent;
