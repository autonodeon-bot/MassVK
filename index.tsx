
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';

// Полифилл окружения до инициализации React приложения
(window as any).process = (window as any).process || {};
(window as any).process.env = (window as any).process.env || {};
if (!(window as any).process.env.API_KEY) {
  (window as any).process.env.API_KEY = (window as any).API_KEY || '';
}

const rootElement = document.getElementById('root');
if (rootElement) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}
