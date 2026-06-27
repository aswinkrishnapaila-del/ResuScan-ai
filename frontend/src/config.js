// API Base URL configuration
// Use environment variable VITE_API_BASE if available, otherwise fallback to localhost
export const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8000/api';

console.log('[Config] API Base URL:', API_BASE);
