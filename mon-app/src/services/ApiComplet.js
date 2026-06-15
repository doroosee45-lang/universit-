const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// ═══════════════════════════════════════════════════════════
// CLIENT HTTP
// ═══════════════════════════════════════════════════════════
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

  get(endpoint, options = {}) {
    const rawParams = options?.params ?? options ?? {};

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

  patch(endpoint, body) {
    return this.request(endpoint, { method: 'PATCH', body });
  }

  delete(endpoint) {
    return this.request(endpoint, { method: 'DELETE' });
  }

  upload(endpoint, formData, method = 'POST') {
    return this.request(endpoint, { method, body: formData });
  }
}

export const api = new ApiClient();


// ═══════════════════════════════════════════════════════════
// AUTH
// ═══════════════════════════════════════════════════════════
export const authAPI = {
  register:            (data)           => api.post('/auth/register', data),
  login:               (data)           => api.post('/auth/login', data),
  getMe:               ()               => api.get('/auth/me'),
  logout:              ()               => Promise.resolve(localStorage.removeItem('token')),
  forgotPassword:      (email)          => api.post('/auth/forgot-password', { email }),
  resetPassword:       (token, password)=> api.post(`/auth/reset-password/${token}`, { password }),
  verifyEmail:         (token)          => api.get(`/auth/verify-email/${token}`),
  changePassword:      (data)           => api.put('/auth/change-password', data),
  forceChangePassword: (newPassword)    => api.post('/auth/force-change-password', { newPassword }),
  createUser:          (data)           => api.post('/auth/admin/create-user', data),
};


// ═══════════════════════════════════════════════════════════
// DASHBOARD
// ═══════════════════════════════════════════════════════════
export const dashboardAPI = {
  getAdminDashboard:   (params) => api.get('/dashboard/admin', params),
  getStudentDashboard: ()       => api.get('/dashboard/student'),
  getTeacherDashboard: ()       => api.get('/dashboard/teacher'),
};


// ═══════════════════════════════════════════════════════════
// STUDENTS
// ═══════════════════════════════════════════════════════════
export const studentAPI = {
  getAll:      (params)      => api.get('/students', params),
  getById:     (id)          => api.get(`/students/${id}`),
  getMyProfile:()            => api.get('/students/me/profile'),
  create:      (data)        => api.post('/students', data),
  update:      (id, data)    => api.put(`/students/${id}`, data),
  delete:      (id)          => api.delete(`/students/${id}`),
  exportExcel: ()            => `${API_BASE}/students/export/excel`,
  importExcel: (formData)    => api.upload('/students/import/excel', formData),
};


// ═══════════════════════════════════════════════════════════
// TEACHERS
// ═══════════════════════════════════════════════════════════
export const teacherAPI = {
  getAll:             (params)   => api.get('/teachers', { params }),
  getById:            (id)       => api.get(`/teachers/${id}`),
  create:             (data)     => api.post('/teachers', data),
  update:             (id, data) => api.put(`/teachers/${id}`, data),
  delete:             (id)       => api.delete(`/teachers/${id}`),
  updateProfile:      (data)     => api.put('/teachers/profile', data),
  updateProfessional: (data)     => api.put('/teachers/professional', data),
  updateSettings:     (data)     => api.put('/teachers/settings', data),
};


// ═══════════════════════════════════════════════════════════
// STAFF
// ═══════════════════════════════════════════════════════════
export const staffAPI = {
  getAll:  (params)   => api.get('/staff', { params }),
  getById: (id)       => api.get(`/staff/${id}`),
  create:  (data)     => api.post('/staff', data),
  update:  (id, data) => api.put(`/staff/${id}`, data),
  delete:  (id)       => api.delete(`/staff/${id}`),
};


// ═══════════════════════════════════════════════════════════
// USERS (admin)
// ═══════════════════════════════════════════════════════════
export const userAPI = {
  getAll:        (params)   => api.get('/users', { params }),
  getById:       (id)       => api.get(`/users/${id}`),
  create:        (data)     => api.post('/users', data),
  update:        (id, data) => api.put(`/users/${id}`, data),
  delete:        (id)       => api.delete(`/users/${id}`),
  updateProfile: (data)     => api.put('/users/me', data),
};


// ═══════════════════════════════════════════════════════════
// PROGRAMS
// ═══════════════════════════════════════════════════════════
export const programAPI = {
  getAll:  (params)   => api.get('/programs', params),
  getById: (id)       => api.get(`/programs/${id}`),
  getUEs:  (id)       => api.get(`/programs/${id}/ues`),
  create:  (data)     => api.post('/programs', data),
  update:  (id, data) => api.put(`/programs/${id}`, data),
  delete:  (id)       => api.delete(`/programs/${id}`),
};


// ═══════════════════════════════════════════════════════════
// UEs
// ═══════════════════════════════════════════════════════════
export const ueAPI = {
  getAll:     (params)   => api.get('/ues', params),
  getById:    (id)       => api.get(`/ues/${id}`),
  getCourses: (id)       => api.get(`/ues/${id}/courses`),
  create:     (data)     => api.post('/ues', data),
  update:     (id, data) => api.put(`/ues/${id}`, data),
  delete:     (id)       => api.delete(`/ues/${id}`),
};


// ═══════════════════════════════════════════════════════════
// COURSES
// ═══════════════════════════════════════════════════════════
export const courseAPI = {
  getAll:  (params)   => api.get('/courses', params),
  getById: (id)       => api.get(`/courses/${id}`),
  create:  (data)     => api.post('/courses', data),
  update:  (id, data) => api.put(`/courses/${id}`, data),
  delete:  (id)       => api.delete(`/courses/${id}`),
};


// ═══════════════════════════════════════════════════════════
// GRADES
// ═══════════════════════════════════════════════════════════
export const gradeAPI = {
  getAll:               (params)           => api.get('/grades', params),
  upsert:               (data)             => api.post('/grades', data),
  bulkUpsert:           (data)             => api.post('/grades/bulk', data),
  publish:              (data)             => api.post('/grades/publish', data),
  getStudentTranscript: (studentId, params)=> api.get(`/grades/student/${studentId}/transcript`, params),
  addSession2:          (id, data)         => api.put(`/grades/${id}/session2`, data),
};


// ═══════════════════════════════════════════════════════════
// ATTENDANCE
// ═══════════════════════════════════════════════════════════
export const attendanceAPI = {
  getCourseAttendance:  (courseId, params)  => api.get(`/attendance/course/${courseId}`, params),
  getCourseStats:       (courseId)          => api.get(`/attendance/course/${courseId}/stats`),
  getStudentAttendance: (studentId, params) => api.get(`/attendance/student/${studentId}`, params),
  take:                 (data)              => api.post('/attendance', data),
  justify:              (id, data)          => api.put(`/attendance/${id}/justify`, data),
  generateQR:           (courseId)          => api.get(`/attendance/qr/${courseId}`),
  scanQR:               (data)              => api.post('/attendance/qr/scan', data),
};


// ═══════════════════════════════════════════════════════════
// EXAMS
// ═══════════════════════════════════════════════════════════
export const examAPI = {
  getAll:          (params)   => api.get('/exams', params),
  getById:         (id)       => api.get(`/exams/${id}`),
  getTeacherExams: ()         => api.get('/exams/teacher/me'),
  create:          (data)     => api.post('/exams', data),
  update:          (id, data) => api.put(`/exams/${id}`, data),
  delete:          (id)       => api.delete(`/exams/${id}`),
  getResults:      (id)       => api.get(`/exams/${id}/results`),
  publishResults:  (id)       => api.post(`/exams/${id}/publish`),
};


// ═══════════════════════════════════════════════════════════
// DELIBERATIONS
// ═══════════════════════════════════════════════════════════
export const deliberationAPI = {
  getEligibleStudents: (params) => api.get('/deliberations/eligible', params),
  validate:            (data)   => api.post('/deliberations/validate', data),
  generateCertificate: (data)   => api.post('/deliberations/certificate', data),
  getStats:            (params) => api.get('/deliberations/stats', params),
};


// ═══════════════════════════════════════════════════════════
// FEES
// ═══════════════════════════════════════════════════════════
export const feeAPI = {
  getAll:          (params)   => api.get('/fees', params),
  create:          (data)     => api.post('/fees', data),
  recordPayment:   (id, data) => api.post(`/fees/${id}/pay`, data),
  getPaymentHistory:(id)      => api.get(`/fees/${id}/history`),
  sendReminders:   ()         => api.post('/fees/reminders'),
  getStats:        (params)   => api.get('/fees/stats', params),
};


// ═══════════════════════════════════════════════════════════
// PAYMENTS
// ═══════════════════════════════════════════════════════════
export const paymentAPI = {
  initiatePayment: (data) => api.post('/payments/initiate', data),
};


// ═══════════════════════════════════════════════════════════
// LIBRARY
// ═══════════════════════════════════════════════════════════
export const libraryAPI = {
  getBooks:      (params)   => api.get('/library/books', params),
  getBookById:   (id)       => api.get(`/library/books/${id}`),
  createBook:    (data)     => api.post('/library/books', data),
  updateBook:    (id, data) => api.put(`/library/books/${id}`, data),
  deleteBook:    (id)       => api.delete(`/library/books/${id}`),
  getActiveLoans:()         => api.get('/library/loans'),
  getOverdueLoans:()        => api.get('/library/loans/overdue'),
  borrowBook:    (data)     => api.post('/library/loans/borrow', data),
  returnBook:    (loanId)   => api.put(`/library/loans/${loanId}/return`),
};


// ═══════════════════════════════════════════════════════════
// INTERNSHIPS
// ═══════════════════════════════════════════════════════════
export const internshipAPI = {
  getAll:        (params)   => api.get('/internships', params),
  getById:       (id)       => api.get(`/internships/${id}`),
  create:        (data)     => api.post('/internships', data),
  update:        (id, data) => api.put(`/internships/${id}`, data),
  delete:        (id)       => api.delete(`/internships/${id}`),
  getCompanies:  (params)   => api.get('/internships/companies', params),
  createCompany: (data)     => api.post('/internships/companies', data),
  updateCompany: (id, data) => api.put(`/internships/companies/${id}`, data),
};


// ═══════════════════════════════════════════════════════════
// SCHEDULES
// ═══════════════════════════════════════════════════════════
export const scheduleAPI = {
  getAll:             (params)     => api.get('/schedules', params),
  getById:            (id)         => api.get(`/schedules/${id}`),
  getTeacherSchedule: (teacherId)  => api.get(`/schedules/teacher/${teacherId}`),
  create:             (data)       => api.post('/schedules', data),
  update:             (id, data)   => api.put(`/schedules/${id}`, data),
  delete:             (id)         => api.delete(`/schedules/${id}`),
};


// ═══════════════════════════════════════════════════════════
// ROOMS
// ═══════════════════════════════════════════════════════════
export const roomAPI = {
  getAll:  (params)   => api.get('/rooms', { params }),
  getById: (id)       => api.get(`/rooms/${id}`),
  create:  (data)     => api.post('/rooms', data),
  update:  (id, data) => api.put(`/rooms/${id}`, data),
  delete:  (id)       => api.delete(`/rooms/${id}`),
};


// ═══════════════════════════════════════════════════════════
// ASSIGNMENTS
// ═══════════════════════════════════════════════════════════
export const assignmentAPI = {
  getAll:                (params)         => api.get('/assignments', params),
  create:                (data)           => api.post('/assignments', data),
  update:                (id, data)       => api.put(`/assignments/${id}`, data),
  delete:                (id)             => api.delete(`/assignments/${id}`),
  getSubmissions:        (id)             => api.get(`/assignments/${id}/submissions`),
  getStudentAssignments: (page=1, limit=10) => api.get(`/assignments/student?page=${page}&limit=${limit}`),
  submitAssignment:      (id, formData)   => api.upload(`/assignments/${id}/submit`, formData),
  getSubmissionStatus:   (id)             => api.get(`/assignments/${id}/submission/status`),
};


// ═══════════════════════════════════════════════════════════
// JURY
// ═══════════════════════════════════════════════════════════
export const juryAPI = {
  getMembers:    (params)       => api.get('/jury', { params }),
  updateMembers: (data, params) => api.put('/jury', data, { params }),
  inviteMembers: (data)         => api.post('/jury/invite', data),
};


// ═══════════════════════════════════════════════════════════
// NOTIFICATIONS
// ═══════════════════════════════════════════════════════════
export const notificationAPI = {
  getAll:         () => api.get('/notifications'),
  getUnreadCount: () => api.get('/notifications/unread-count'),
  markAsRead:    (id) => api.put(`/notifications/${id}/read`),
  markAllAsRead:  () => api.put('/notifications/mark-all-read'),
  delete:        (id) => api.delete(`/notifications/${id}`),
};


// ═══════════════════════════════════════════════════════════
// REPORTS
// ═══════════════════════════════════════════════════════════
export const reportAPI = {
  getGlobalStats:      ()                  => api.get('/reports/stats'),
  getTranscript:       (studentId, params) => api.get(`/reports/transcript/${studentId}`, params),
  getAttendanceReport: (params)            => api.get('/reports/attendance', params),
  getFinancialReport:  (params)            => api.get('/reports/financial', params),
};


// ═══════════════════════════════════════════════════════════
// SETTINGS
// ═══════════════════════════════════════════════════════════
export const settingsAPI = {
  get:               ()             => api.get('/settings'),
  update:            (data)         => api.put('/settings', data),
  updateAcademicYear:(academicYear) => api.put('/settings/academic-year', { academicYear }),
};