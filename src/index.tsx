import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// Find the root element
const rootElement = document.getElementById('root');

if (!rootElement) {
  // If root element doesn't exist, create one
  const newRoot = document.createElement('div');
  newRoot.id = 'root';
  document.body.appendChild(newRoot);
  
  const root = ReactDOM.createRoot(newRoot);
  root.render(<App />);
} else {
  const root = ReactDOM.createRoot(rootElement);
  root.render(<App />);
}