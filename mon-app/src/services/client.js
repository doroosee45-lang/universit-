const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

class ApiClient {
  constructor() {
    this.baseURL = API_BASE;
  }

  getToken() {
    return localStorage.getItem('token');
  }

  async request(endpoint, options = {}) {
    const token = this.getToken();

    const headers = {
      ...(options.body instanceof FormData
        ? {}
        : { 'Content-Type': 'application/json' }),
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    };

    const config = { ...options, headers };

    if (options.body && !(options.body instanceof FormData)) {
      config.body = JSON.stringify(options.body);
    }

    const res = await fetch(`${this.baseURL}${endpoint}`, config);
    const data = await res.json();

    if (!res.ok) throw new Error(data.message || 'API error');

    return data;
  }

  // ✅ FIX CRITIQUE : get() accepte soit un objet params plat,
  //    soit { params: {...} } (format axios-like utilisé dans services.js)
  get(endpoint, options = {}) {
    // Normaliser : { params: {...} } ou directement l'objet de params
    const rawParams = options?.params ?? options ?? {};

    // Filtrer les valeurs vides/null/undefined
    const cleanParams = {};
    Object.entries(rawParams).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') {
        cleanParams[k] = v;
      }
    });

    const qs = Object.keys(cleanParams).length
      ? `?${new URLSearchParams(cleanParams).toString()}`
      : '';

    return this.request(`${endpoint}${qs}`, { method: 'GET' });
  }

  post(endpoint, body) {
    return this.request(endpoint, { method: 'POST', body });
  }

  put(endpoint, body) {
    return this.request(endpoint, { method: 'PUT', body });
  }

  delete(endpoint) {
    return this.request(endpoint, { method: 'DELETE' });
  }

  upload(endpoint, formData) {
    return this.request(endpoint, { method: 'POST', body: formData });
  }
}

export const api = new ApiClient();