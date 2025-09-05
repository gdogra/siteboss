import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

// Suppress noisy extension errors (ChromeMethodBFE/NewWritableFile) without hiding real app issues
// This targets a known Chrome extension content script error unrelated to our app logic.
window.addEventListener('unhandledrejection', (e: PromiseRejectionEvent) => {
  try {
    const r: any = e.reason;
    const msg = typeof r === 'string' ? r : (r?.message || String(r));
    if (msg && (msg.includes('ChromeMethodBFE') || msg.includes('NewWritableFile'))) {
      e.preventDefault();
      return;
    }
  } catch {}
});

window.addEventListener('error', (e: ErrorEvent) => {
  try {
    const msg = e.message || '';
    if (msg.includes('ChromeMethodBFE') || msg.includes('NewWritableFile')) {
      e.preventDefault();
    }
  } catch {}
}, true);

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
