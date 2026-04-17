import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'
const API_BASE_PATH = import.meta.env.VITE_API_BASE_PATH || '/api'

// Create axios instance
const apiClient = axios.create({
  baseURL: `${API_URL}${API_BASE_PATH}`,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
})

// Add token to requests
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Handle responses
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('auth_token')
      localStorage.removeItem('student_session')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// Authentication endpoints
export const authAPI = {
  login: (email, password) => apiClient.post('/auth/login', { email, password }),
  register: (data) => apiClient.post('/auth/register', data),
  logout: () => apiClient.post('/auth/logout'),
  getMe: () => apiClient.get('/auth/me'),
  updateProfile: (data) => apiClient.put('/auth/profile', data),
  changePassword: (data) => apiClient.post('/auth/change-password', data)
}

// Student endpoints
export const studentAPI = {
  getAll: (perPage = 15) => apiClient.get('/students', { params: { per_page: perPage } }),
  search: (query) => apiClient.get('/students/search', { params: { q: query } }),
  getById: (id) => apiClient.get(`/students/${id}`),
  create: (data) => apiClient.post('/students', data),
  update: (id, data) => apiClient.put(`/students/${id}`, data),
  delete: (id) => apiClient.delete(`/students/${id}`),
  getByStatus: (status) => apiClient.get(`/students/status/${status}`),
  getBySkill: (skill) => apiClient.get('/students/filter/skills', { params: { skill } }),
  getByAffiliation: (affiliation) => apiClient.get('/students/filter/affiliations', { params: { affiliation } }),
  getAvailableSkills: () => apiClient.get('/students/filter/skills-list'),
  getAvailableAffiliations: () => apiClient.get('/students/filter/affiliations-list')
}

// Student Profile endpoints
export const studentProfileAPI = {
  getProfile: (studentId) => apiClient.get(`/students/${studentId}/profile`),
  getAcademicPerformance: (studentId) => apiClient.get(`/students/${studentId}/academic-performance`),
  getCurrentCourses: (studentId) => apiClient.get(`/students/${studentId}/current-courses`)
}

// Course endpoints
export const courseAPI = {
  getAll: () => apiClient.get('/courses'),
  search: (query) => apiClient.get('/courses/search', { params: { q: query } }),
  getActive: () => apiClient.get('/courses/active'),
  getById: (id) => apiClient.get(`/courses/${id}`),
  create: (data) => apiClient.post('/courses', data),
  update: (id, data) => apiClient.put(`/courses/${id}`, data),
  delete: (id) => apiClient.delete(`/courses/${id}`),
  getByDepartment: (department) => apiClient.get(`/courses/department/${department}`)
}

// Faculty endpoints
export const facultyAPI = {
  getAll: () => apiClient.get('/faculty'),
  search: (query) => apiClient.get('/faculty/search', { params: { q: query } }),
  getById: (id) => apiClient.get(`/faculty/${id}`),
  create: (data) => apiClient.post('/faculty', data),
  update: (id, data) => apiClient.put(`/faculty/${id}`, data),
  delete: (id) => apiClient.delete(`/faculty/${id}`),
  getByDepartment: (department) => apiClient.get(`/faculty/department/${department}`)
}

// Class endpoints
export const classAPI = {
  getAll: (perPage = 15) => apiClient.get('/classes', { params: { per_page: perPage } }),
  getById: (id) => apiClient.get(`/classes/${id}`),
  getOpen: () => apiClient.get('/classes/open'),
  getByFaculty: (facultyId) => apiClient.get(`/classes/faculty/${facultyId}`),
  create: (data) => apiClient.post('/classes', data),
  update: (id, data) => apiClient.put(`/classes/${id}`, data),
  delete: (id) => apiClient.delete(`/classes/${id}`)
}

// Grade endpoints
export const gradeAPI = {
  getStudentGrades: (studentId) => apiClient.get(`/grades/student/${studentId}`),
  getClassGrades: (classId) => apiClient.get(`/grades/class/${classId}`),
  getStudentAverageGrade: (studentId) => apiClient.get(`/grades/student/${studentId}/average`),
  createGrade: (data) => apiClient.post('/grades', data),
  updateMidtermGrade: (studentId, classId, grade) => 
    apiClient.put(`/grades/student/${studentId}/class/${classId}/midterm`, { grade }),
  updateFinalGrade: (studentId, classId, grade) => 
    apiClient.put(`/grades/student/${studentId}/class/${classId}/final`, { grade })
}

// Attendance endpoints
export const attendanceAPI = {
  recordAttendance: (data) => apiClient.post('/attendance', data),
  bulkRecord: (data) => apiClient.post('/attendance/bulk', data),
  getStudentClassAttendance: (studentId, classId) => 
    apiClient.get(`/attendance/student/${studentId}/class/${classId}`),
  getAttendanceStats: (studentId, classId) => 
    apiClient.get(`/attendance/student/${studentId}/class/${classId}/stats`),
  getClassAttendanceByDate: (classId, date) => 
    apiClient.get(`/attendance/class/${classId}/date/${date}`)
}

// Violation endpoints
export const violationAPI = {
  getStudentViolations: (studentId) => apiClient.get(`/violations/student/${studentId}`),
  getUnresolved: () => apiClient.get('/violations/unresolved'),
  getByStatus: (status) => apiClient.get(`/violations/status/${status}`),
  getByType: (type) => apiClient.get(`/violations/type/${type}`),
  getRecent: () => apiClient.get('/violations/recent'),
  createViolation: (data) => apiClient.post('/violations', data),
  resolveViolation: (violationId, data) => 
    apiClient.put(`/violations/${violationId}/resolve`, data),
  deleteViolation: (violationId) => apiClient.delete(`/violations/${violationId}`)
}

export default apiClient
