/**
 * ResuScan AI — Client-Side Cookie Utilities
 * Provides secure, standards-compliant cookie get, set, and delete operations.
 */

export function setCookie(name, value, days = 30) {
  const date = new Date();
  date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
  const expires = `expires=${date.toUTCString()}`;
  document.cookie = `${encodeURIComponent(name)}=${encodeURIComponent(value)};${expires};path=/;SameSite=Lax`;
}

export function getCookie(name) {
  const nameEQ = `${encodeURIComponent(name)}=`;
  const ca = document.cookie.split(';');
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) === ' ') c = c.substring(1, c.length);
    if (c.indexOf(nameEQ) === 0) return decodeURIComponent(c.substring(nameEQ.length, c.length));
  }
  return null;
}

export function deleteCookie(name) {
  document.cookie = `${encodeURIComponent(name)}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;SameSite=Lax`;
}

export function getAllCookies() {
  const cookies = {};
  if (!document.cookie) return cookies;
  document.cookie.split(';').forEach(cookie => {
    const parts = cookie.split('=');
    const key = parts[0]?.trim();
    if (key) cookies[key] = decodeURIComponent(parts.slice(1).join('=') || '');
  });
  return cookies;
}
