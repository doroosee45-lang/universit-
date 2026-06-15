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






























// const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// // ═══════════════════════════════════════════════════════════
// // CLIENT HTTP
// // ═══════════════════════════════════════════════════════════
// class ApiClient {
//   constructor() {
//     this.baseURL = API_BASE;
//   }

//   getToken() {
//     return localStorage.getItem('token');
//   }

//   async request(endpoint, options = {}) {
//     const token = this.getToken();

//     const headers = {
//       ...(options.body instanceof FormData
//         ? {}
//         : { 'Content-Type': 'application/json' }),
//       ...(token && { Authorization: `Bearer ${token}` }),
//       ...options.headers,
//     };

//     const config = { ...options, headers };

//     if (options.body && !(options.body instanceof FormData)) {
//       config.body = JSON.stringify(options.body);
//     }

//     const res = await fetch(`${this.baseURL}${endpoint}`, config);

//     // Cas export binaire (blob)
//     if (options._blob) {
//       if (!res.ok) throw new Error(`HTTP ${res.status}`);
//       return res.blob();
//     }

//     const data = await res.json();
//     if (!res.ok) throw new Error(data.message || `HTTP ${res.status}`);
//     return data;
//   }

//   get(endpoint, params = {}) {
//     const q = new URLSearchParams(
//       Object.fromEntries(Object.entries(params).filter(([, v]) => v !== '' && v != null))
//     ).toString();
//     return this.request(`${endpoint}${q ? `?${q}` : ''}`, { method: 'GET' });
//   }

//   post(endpoint, body) {
//     return this.request(endpoint, { method: 'POST', body });
//   }

//   put(endpoint, body) {
//     return this.request(endpoint, { method: 'PUT', body });
//   }

//   patch(endpoint, body) {
//     return this.request(endpoint, { method: 'PATCH', body });
//   }

//   delete(endpoint) {
//     return this.request(endpoint, { method: 'DELETE' });
//   }

//   // Upload multipart
//   upload(endpoint, formData, method = 'POST') {
//     return this.request(endpoint, { method, body: formData });
//   }

//   // Téléchargement binaire
//   download(endpoint) {
//     return this.request(endpoint, { method: 'GET', _blob: true });
//   }
// }

// export const api = new ApiClient();

// // ═══════════════════════════════════════════════════════════
// // AUTH
// // ═══════════════════════════════════════════════════════════
// export const authAPI = {
//   login:    (data) => api.post('/auth/login', data),
//   register: (data) => api.post('/auth/register', data),
//   getMe:    ()     => api.get('/auth/me'),
//   logout:   ()     => api.post('/auth/logout'),
// };

// // ═══════════════════════════════════════════════════════════
// // DASHBOARD  — routes: /dashboard/admin  /dashboard/stats  /dashboard/me
// // ═══════════════════════════════════════════════════════════
// export const dashboardAPI = {
//   /** Dashboard admin complet (étudiants, profs, frais, délibérations…) */
//   getAdminDashboard: () => api.get('/dashboard/admin'),

//   /** Statistiques globales (taux présence, moyenne, programmes…) */
//   getOverallStats: () => api.get('/dashboard/stats'),

//   /** Dashboard dynamique selon le rôle de l'utilisateur connecté */
//   getUserDashboard: () => api.get('/dashboard/me'),

//   getTeacherDashboard:    () => api.get('/dashboard/teacher'),
//   getStudentDashboard:    () => api.get('/dashboard/student'),
//   getStaffDashboard:      () => api.get('/dashboard/staff'),
//   getDepartmentHeadDash:  () => api.get('/dashboard/department-head'),
// };

// // ═══════════════════════════════════════════════════════════
// // ÉTUDIANTS  — routes: /students
// // ═══════════════════════════════════════════════════════════
// export const studentAPI = {
//   /**
//    * Liste paginée avec filtres
//    * @param {Object} params – { page, limit, search, program, level, status, academicYear }
//    */
//   getAll: (params = {}) => api.get('/students', params),

//   getById: (id)       => api.get(`/students/${id}`),
//   getMyProfile: ()    => api.get('/students/me/profile'),

//   create: (data)      => api.post('/students', data),
//   update: (id, data)  => api.put(`/students/${id}`, data),

//   /** Désactivation (soft delete) */
//   delete: (id)        => api.delete(`/students/${id}`),

//   /** Export Excel → retourne un Blob */
//   exportExcel: ()     => api.download('/students/export/excel'),

//   /**
//    * Import Excel
//    * @param {File} file
//    */
//   importExcel: (file) => {
//     const form = new FormData();
//     form.append('file', file);
//     return api.upload('/students/import/excel', form);
//   },
// };

// // ═══════════════════════════════════════════════════════════
// // PROGRAMMES / FILIÈRES  — routes: /programs
// // ═══════════════════════════════════════════════════════════
// export const programAPI = {
//   getAll:   (params = {}) => api.get('/programs', params),
//   getById:  (id)          => api.get(`/programs/${id}`),
//   create:   (data)        => api.post('/programs', data),
//   update:   (id, data)    => api.put(`/programs/${id}`, data),
//   delete:   (id)          => api.delete(`/programs/${id}`),
// };

// // ═══════════════════════════════════════════════════════════
// // ENSEIGNANTS  — routes: /teachers
// // ═══════════════════════════════════════════════════════════
// export const teacherAPI = {
//   getAll:  (params = {}) => api.get('/teachers', params),
//   getById: (id)          => api.get(`/teachers/${id}`),
//   create:  (data)        => api.post('/teachers', data),
//   update:  (id, data)    => api.put(`/teachers/${id}`, data),
//   delete:  (id)          => api.delete(`/teachers/${id}`),
// };

// // ═══════════════════════════════════════════════════════════
// // COURS  — routes: /courses
// // ═══════════════════════════════════════════════════════════
// export const courseAPI = {
//   getAll:  (params = {}) => api.get('/courses', params),
//   getById: (id)          => api.get(`/courses/${id}`),
//   create:  (data)        => api.post('/courses', data),
//   update:  (id, data)    => api.put(`/courses/${id}`, data),
//   delete:  (id)          => api.delete(`/courses/${id}`),
// };

// // ═══════════════════════════════════════════════════════════
// // UE (Unités d'Enseignement)  — routes: /ues
// // ═══════════════════════════════════════════════════════════
// export const ueAPI = {
//   getAll:  (params = {}) => api.get('/ues', params),
//   getById: (id)          => api.get(`/ues/${id}`),
//   create:  (data)        => api.post('/ues', data),
//   update:  (id, data)    => api.put(`/ues/${id}`, data),
//   delete:  (id)          => api.delete(`/ues/${id}`),
// };

// // ═══════════════════════════════════════════════════════════
// // INSCRIPTIONS  — routes: /enrollments
// // ═══════════════════════════════════════════════════════════
// export const enrollmentAPI = {
//   getAll:  (params = {}) => api.get('/enrollments', params),
//   getById: (id)          => api.get(`/enrollments/${id}`),
//   create:  (data)        => api.post('/enrollments', data),
//   update:  (id, data)    => api.put(`/enrollments/${id}`, data),
//   delete:  (id)          => api.delete(`/enrollments/${id}`),
// };

// // ═══════════════════════════════════════════════════════════
// // NOTES / GRADES  — routes: /grades
// // ═══════════════════════════════════════════════════════════
// export const gradeAPI = {
//   getAll:    (params = {}) => api.get('/grades', params),
//   getById:   (id)          => api.get(`/grades/${id}`),
//   create:    (data)        => api.post('/grades', data),
//   update:    (id, data)    => api.put(`/grades/${id}`, data),
//   validate:  (id)          => api.patch(`/grades/${id}/validate`),
//   delete:    (id)          => api.delete(`/grades/${id}`),
// };

// // ═══════════════════════════════════════════════════════════
// // PRÉSENCES  — routes: /attendances
// // ═══════════════════════════════════════════════════════════
// export const attendanceAPI = {
//   getAll:  (params = {}) => api.get('/attendances', params),
//   getById: (id)          => api.get(`/attendances/${id}`),
//   create:  (data)        => api.post('/attendances', data),
//   update:  (id, data)    => api.put(`/attendances/${id}`, data),
//   delete:  (id)          => api.delete(`/attendances/${id}`),
// };

// // ═══════════════════════════════════════════════════════════
// // EXAMENS  — routes: /exams
// // ═══════════════════════════════════════════════════════════
// export const examAPI = {
//   getAll:    (params = {}) => api.get('/exams', params),
//   getById:   (id)          => api.get(`/exams/${id}`),
//   create:    (data)        => api.post('/exams', data),
//   update:    (id, data)    => api.put(`/exams/${id}`, data),
//   delete:    (id)          => api.delete(`/exams/${id}`),
// };

// // ═══════════════════════════════════════════════════════════
// // DÉLIBÉRATIONS  — routes: /deliberations
// // ═══════════════════════════════════════════════════════════
// export const deliberationAPI = {
//   getAll:    (params = {}) => api.get('/deliberations', params),
//   getById:   (id)          => api.get(`/deliberations/${id}`),
//   create:    (data)        => api.post('/deliberations', data),
//   validate:  (id)          => api.patch(`/deliberations/${id}/validate`),
//   generateCertificate: (id) => api.post(`/deliberations/${id}/certificate`),
//   delete:    (id)          => api.delete(`/deliberations/${id}`),
// };

// // ═══════════════════════════════════════════════════════════
// // FRAIS / PAIEMENTS  — routes: /fees
// // ═══════════════════════════════════════════════════════════
// export const feeAPI = {
//   getAll:   (params = {}) => api.get('/fees', params),
//   getById:  (id)          => api.get(`/fees/${id}`),
//   create:   (data)        => api.post('/fees', data),
//   update:   (id, data)    => api.put(`/fees/${id}`, data),
//   delete:   (id)          => api.delete(`/fees/${id}`),
// };

// // ═══════════════════════════════════════════════════════════
// // EMPLOI DU TEMPS  — routes: /schedules
// // ═══════════════════════════════════════════════════════════
// export const scheduleAPI = {
//   getAll:  (params = {}) => api.get('/schedules', params),
//   getById: (id)          => api.get(`/schedules/${id}`),
//   create:  (data)        => api.post('/schedules', data),
//   update:  (id, data)    => api.put(`/schedules/${id}`, data),
//   delete:  (id)          => api.delete(`/schedules/${id}`),
// };

// // ═══════════════════════════════════════════════════════════
// // BIBLIOTHÈQUE  — routes: /library
// // ═══════════════════════════════════════════════════════════
// export const libraryAPI = {
//   getAll:       (params = {}) => api.get('/library', params),
//   getById:      (id)          => api.get(`/library/${id}`),
//   create:       (data)        => api.post('/library', data),
//   update:       (id, data)    => api.put(`/library/${id}`, data),
//   delete:       (id)          => api.delete(`/library/${id}`),
//   getLoans:     (params = {}) => api.get('/library/loans', params),
//   createLoan:   (data)        => api.post('/library/loans', data),
//   returnLoan:   (id)          => api.patch(`/library/loans/${id}/return`),
// };

// // ═══════════════════════════════════════════════════════════
// // ÉVÉNEMENTS  — routes: /events
// // ═══════════════════════════════════════════════════════════
// export const eventAPI = {
//   getAll:  (params = {}) => api.get('/events', params),
//   getById: (id)          => api.get(`/events/${id}`),
//   create:  (data)        => api.post('/events', data),
//   update:  (id, data)    => api.put(`/events/${id}`, data),
//   delete:  (id)          => api.delete(`/events/${id}`),
// };

// // ═══════════════════════════════════════════════════════════
// // NOTIFICATIONS  — routes: /notifications
// // ═══════════════════════════════════════════════════════════
// export const notificationAPI = {
//   getAll:        ()    => api.get('/notifications'),
//   getUnreadCount: ()   => api.get('/notifications/unread-count'),
//   markAsRead:    (id)  => api.put(`/notifications/${id}/read`),
//   markAllAsRead: ()    => api.put('/notifications/mark-all-read'),
//   delete:        (id)  => api.delete(`/notifications/${id}`),
// };

// // ═══════════════════════════════════════════════════════════
// // UTILISATEURS (admin)  — routes: /users
// // ═══════════════════════════════════════════════════════════
// export const userAPI = {
//   getAll:  (params = {}) => api.get('/users', params),
//   getById: (id)          => api.get(`/users/${id}`),
//   create:  (data)        => api.post('/users', data),
//   update:  (id, data)    => api.put(`/users/${id}`, data),
//   delete:  (id)          => api.delete(`/users/${id}`),
//   updateProfile: (data)  => api.put('/users/me', data),




// };