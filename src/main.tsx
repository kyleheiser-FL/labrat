import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/react';
import App from './App.tsx';
import './index.css';

// Keep PWA service worker registration immediate and root-scoped for PWABuilder/Lighthouse.
declare global {
  interface Window {
    __registerLabRatServiceWorker?: () => Promise<ServiceWorkerRegistration | void>;
  }
}

if ('serviceWorker' in navigator && !window.location.hostname.includes('localhost')) {
  const register = window.__registerLabRatServiceWorker || (() =>
    navigator.serviceWorker.register('/sw.js', { scope: '/', updateViaCache: 'none' })
  );

  register().catch((err) => {
    console.error('[PWA] ServiceWorker registration failed: ', err);
  });

  // Dispatch update-ready event when a new SW takes over (skip first install)
  const hadController = !!navigator.serviceWorker.controller;
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (hadController) {
      window.dispatchEvent(new CustomEvent('labrat-update-ready'));
    }
  });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
    <Analytics />
    <SpeedInsights />
  </StrictMode>,
);

