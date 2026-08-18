import React from 'react';
import ReactDOM from 'react-dom/client';
import { PROTOCOL_VERSION } from '@red-tetris/shared';

function App() {
  return (
    <div style={{ padding: '2rem', textAlign: 'center' }}>
      <h1 style={{ color: '#e52521' }}>RED TETRIS</h1>
      <p style={{ fontSize: '0.8rem', color: '#888' }}>
        PROTOCOL VERSION: {PROTOCOL_VERSION}
      </p>
    </div>
  );
}

const rootElement = document.getElementById('root');
if (rootElement) {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}
