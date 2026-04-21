const API_BASE =
  import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

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

    if (
      options.body &&
      !(options.body instanceof FormData)
    ) {
      config.body = JSON.stringify(options.body);
    }

    const res = await fetch(`${this.baseURL}${endpoint}`, config);
    const data = await res.json();

    if (!res.ok) throw new Error(data.message || 'API error');

    return data;
  }

  get(e, p = {}) {
    const q = new URLSearchParams(p).toString();
    return this.request(`${e}${q ? `?${q}` : ''}`, { method: 'GET' });
  }

  post(e, b) {
    return this.request(e, { method: 'POST', body: b });
  }

  put(e, b) {
    return this.request(e, { method: 'PUT', body: b });
  }

  delete(e) {
    return this.request(e, { method: 'DELETE' });
  }
}

// ================== INSTANCE ==================
export const api = new ApiClient();


// ================== AUTH ==================
export const authAPI = {
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
  getMe: () => api.get('/auth/me'),
};


// ================== NOTIFICATIONS ==================
export const notificationAPI = {
  getAll: () => api.get('/notifications'),
  getUnreadCount: () => api.get('/notifications/unread-count'),
  markAsRead: (id) => api.put(`/notifications/${id}/read`),
  markAllAsRead: () => api.put('/notifications/mark-all-read'),
};


// ================== COURSES ==================
export const courseAPI = {
  getAll: () => api.get('/courses'),
  getById: (id) => api.get(`/courses/${id}`),
};


// ================== UE ==================
export const ueAPI = {
  getAll: () => api.get('/ues'),
  getById: (id) => api.get(`/ues/${id}`),
};


// ================== SCHEDULE ==================
export const scheduleAPI = {
  getAll: () => api.get('/schedules'),
  getById: (id) => api.get(`/schedules/${id}`),
};