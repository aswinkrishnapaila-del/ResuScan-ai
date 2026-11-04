// API Base URL configuration
// Supports VITE_API_BASE environment variable, localStorage override, and localhost fallback.

function getInitialApiBase() {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('resuscan_api_base');
    if (saved && saved.trim()) {
      return saved.trim().replace(/\/+$/, '');
    }
  }

  const envUrl = import.meta.env.VITE_API_BASE;
  if (envUrl && envUrl.trim()) {
    return envUrl.trim().replace(/\/+$/, '');
  }

  // If running in browser on a production domain without explicit VITE_API_BASE
  if (typeof window !== 'undefined') {
    const host = window.location.hostname;
    if (host !== 'localhost' && host !== '127.0.0.1' && !host.startsWith('192.168.')) {
      // In production without env var, warn in console
      console.warn(
        '[Config] VITE_API_BASE is not configured. Falling back to relative /api. ' +
        'Set VITE_API_BASE in your hosting dashboard or run setApiBase("https://your-backend-url/api")'
      );
      return '/api';
    }
  }

  return 'http://localhost:8000/api';
}

export let API_BASE = getInitialApiBase();

export function setApiBase(newUrl) {
  if (!newUrl) return;
  const cleaned = newUrl.trim().replace(/\/+$/, '');
  API_BASE = cleaned;
  if (typeof window !== 'undefined') {
    localStorage.setItem('resuscan_api_base', cleaned);
  }
  console.log('[Config] Updated API Base URL:', API_BASE);
}

console.log('[Config] Active API Base URL:', API_BASE);
