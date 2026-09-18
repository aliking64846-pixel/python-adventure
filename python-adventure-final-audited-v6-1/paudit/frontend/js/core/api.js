const API_BASE = '/api';
async function api(url, options = {}) {
  const res = await fetch(url, { credentials: 'include', headers: { ...(options.body ? {'Content-Type':'application/json'} : {}), ...(options.headers || {}) }, ...options });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || 'حدث خطأ');
  return data;
}
async function apiRequest(path, options = {}) {
  try {
    const res = await fetch(API_BASE + path, {
      credentials: 'include',
      headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
      ...options
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || ('API ' + res.status));
    return data;
  } catch (error) {
    console.warn('API unavailable', error);
    return null;
  }
}
