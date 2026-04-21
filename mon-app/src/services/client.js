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
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    };

    const config = { ...options, headers };
    if (options.body && typeof options.body === 'object' && !(options.body instanceof FormData)) {
      config.body = JSON.stringify(options.body);
      headers['Content-Type'] = 'application/json';
    }
    if (options.body instanceof FormData) {
      delete headers['Content-Type'];
    }

    const response = await fetch(`${this.baseURL}${endpoint}`, config);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Une erreur est survenue');
    }
    return data;
  }

  get(endpoint, params = {}) {
    const query = new URLSearchParams(params).toString();
    return this.request(`${endpoint}${query ? `?${query}` : ''}`, { method: 'GET' });
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

  upload(endpoint, formData, method = 'POST') {
    return this.request(endpoint, { method, body: formData });
  }
}

export const api = new ApiClient();

















// // services/services.js — mise à jour avec les nouvelles routes auth

// import axios from 'axios';

// const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// const api = axios.create({
//   baseURL: API_BASE,
//   headers: { 'Content-Type': 'application/json' }
// });

// // ─── Intercepteur : injecter le token JWT ─────────────────────────────────────
// api.interceptors.request.use((config) => {
//   const token = localStorage.getItem('token');
//   if (token) config.headers.Authorization = `Bearer ${token}`;
//   return config;
// });

// // ─── Intercepteur : normaliser les erreurs ────────────────────────────────────
// api.interceptors.response.use(
//   (res) => res.data,
//   (err) => {
//     const message =
//       err.response?.data?.message ||
//       err.response?.data?.error ||
//       err.message ||
//       'Une erreur est survenue';
//     return Promise.reject(new Error(message));
//   }
// );

// // ─── Auth API ─────────────────────────────────────────────────────────────────
// export const authAPI = {
//   register:  (data)          => api.post('/auth/register', data),
//   login:     (data)          => api.post('/auth/login', data),
//   getMe:     ()              => api.get('/auth/me'),
//   logout:    ()              => Promise.resolve(localStorage.removeItem('token')),

//   forgotPassword:  (email)   => api.post('/auth/forgot-password', { email }),
//   resetPassword:   (token, password) => api.post(`/auth/reset-password/${token}`, { password }),
//   verifyEmail:     (token)   => api.get(`/auth/verify-email/${token}`),

//   changePassword:  (data)    => api.put('/auth/change-password', data),

//   // ⭐ Changement forcé au premier login (sans l'ancien MDP)
//   forceChangePassword: (newPassword) =>
//     api.post('/auth/force-change-password', { newPassword }),

//   // ⭐ Création d'utilisateur par admin/super_admin
//   createUser: (data) => api.post('/auth/admin/create-user', data),
// };

// // ─── Students API ─────────────────────────────────────────────────────────────
// export const studentsAPI = {
//   getAll:    (params)     => api.get('/students', { params }),
//   getById:   (id)         => api.get(`/students/${id}`),
//   update:    (id, data)   => api.put(`/students/${id}`, data),
//   delete:    (id)         => api.delete(`/students/${id}`),
// };

// // ─── Teachers API ────────────────────────────────────────────────────────────
// export const teachersAPI = {
//   getAll:    (params)     => api.get('/teachers', { params }),
//   getById:   (id)         => api.get(`/teachers/${id}`),
//   update:    (id, data)   => api.put(`/teachers/${id}`, data),
// };

// // ─── Programs API ────────────────────────────────────────────────────────────
// export const programsAPI = {
//   getAll:  (params)       => api.get('/programs', { params }),
//   getById: (id)           => api.get(`/programs/${id}`),
//   create:  (data)         => api.post('/programs', data),
//   update:  (id, data)     => api.put(`/programs/${id}`, data),
//   delete:  (id)           => api.delete(`/programs/${id}`),
// };

// // ─── Courses API ─────────────────────────────────────────────────────────────
// export const coursesAPI = {
//   getAll:  (params)       => api.get('/courses', { params }),
//   getById: (id)           => api.get(`/courses/${id}`),
//   create:  (data)         => api.post('/courses', data),
//   update:  (id, data)     => api.put(`/courses/${id}`, data),
//   delete:  (id)           => api.delete(`/courses/${id}`),
// };

// export default api;