import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

try {
  const root = createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
} catch (error) {
  console.error("Application initialization failed:", error);
  // Fallback UI if React fails completely
  rootElement.innerHTML = `
    <div style="color: white; padding: 20px; text-align: center; font-family: sans-serif;">
      <h1>Application Error</h1>
      <p>Failed to initialize. Please refresh.</p>
      <pre style="color: #ff6b6b; font-size: 12px; overflow: auto;">${error}</pre>
    </div>
  `;
}