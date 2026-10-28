// Kill Any Stuck Service Worker & Clear Stale Caches Immediately
if (typeof window !== 'undefined') {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.getRegistrations().then((registrations) => {
      for (const registration of registrations) {
        registration.unregister().then((success) => {
          if (success) console.log('Successfully unregistered stale service worker:', registration.scope);
        });
      }
    }).catch((err) => console.warn('Error clearing service workers:', err));
  }
  if ('caches' in window) {
    caches.keys().then((keys) => {
      for (const key of keys) {
        caches.delete(key).then(() => console.log('Cleared cache storage:', key));
      }
    }).catch(() => {});
  }
}

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
