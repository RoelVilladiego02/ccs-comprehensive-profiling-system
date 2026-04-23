import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'
const API_BASE_PATH = import.meta.env.VITE_API_BASE_PATH || '/api'

// Create axios instance
const apiClient = axios.create({
  baseURL: `${API_URL}${API_BASE_PATH}`,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
})

// Add token to requests and CSRF token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    // Add CSRF token from meta tag or cookies
    const csrfToken = document.querySelector('meta[name="csrf-token"]')?.content || 
                      document.cookie.split('; ').find(row => row.startsWith('XSRF-TOKEN='))?.split('=')[1]
    if (csrfToken) {
      config.headers['X-CSRF-TOKEN'] = csrfToken
      config.headers['X-XSRF-TOKEN'] = csrfToken
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

// Get CSRF token for SPA authentication
export const getCsrfToken = async () => {
  try {
    // Note: This endpoint is NOT under /api/ path
    await axios.get(`${API_URL}/sanctum/csrf-cookie`, {
      withCredentials: true
    })
  } catch (error) {
    console.error('Failed to get CSRF token:', error)
  }
}

// Authentication endpoints
export const authAPI = {
  login: async (email, password) => {
    await getCsrfToken()
    return apiClient.post('/auth/login', { email, password })
  },
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

// Enrollment endpoints
export const enrollmentAPI = {
  enrollStudent: (data) => apiClient.post('/enrollments', data),
  getStudentEnrollments: (studentId) => apiClient.get(`/enrollments/student/${studentId}`),
  getClassEnrollments: (classId) => apiClient.get(`/enrollments/class/${classId}`),
  getActiveEnrollments: (studentId) => apiClient.get(`/enrollments/student/${studentId}/active`),
  updateStatus: (enrollmentId, data) => apiClient.put(`/enrollments/${enrollmentId}/status`, data),
  deleteEnrollment: (enrollmentId) => apiClient.delete(`/enrollments/${enrollmentId}`)
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

// Medical Records endpoints
export const medicalRecordsAPI = {
  getStudentMedicalRecords: (studentId) => apiClient.get(`/students/${studentId}/medical-records`),
  createMedicalRecords: (studentId, data) => apiClient.post(`/students/${studentId}/medical-records`, data),
  updateMedicalRecords: (studentId, data) => apiClient.put(`/students/${studentId}/medical-records`, data),
  deleteMedicalRecords: (studentId) => apiClient.delete(`/students/${studentId}/medical-records`)
}

// Affiliations endpoints
export const affiliationsAPI = {
  getStudentAffiliations: (studentId) => apiClient.get(`/students/${studentId}/affiliations`),
  createAffiliation: (studentId, data) => apiClient.post(`/students/${studentId}/affiliations`, data),
  getAffiliation: (studentId, affiliationId) => apiClient.get(`/students/${studentId}/affiliations/${affiliationId}`),
  updateAffiliation: (studentId, affiliationId, data) => apiClient.put(`/students/${studentId}/affiliations/${affiliationId}`, data),
  deleteAffiliation: (studentId, affiliationId) => apiClient.delete(`/students/${studentId}/affiliations/${affiliationId}`)
}

// Academic History endpoints
export const academicHistoryAPI = {
  getStudentAcademicHistory: (studentId) => apiClient.get(`/students/${studentId}/academic-history`),
  createAcademicHistory: (studentId, data) => apiClient.post(`/students/${studentId}/academic-history`, data),
  getAcademicHistory: (studentId, historyId) => apiClient.get(`/students/${studentId}/academic-history/${historyId}`),
  updateAcademicHistory: (studentId, historyId, data) => apiClient.put(`/students/${studentId}/academic-history/${historyId}`, data),
  deleteAcademicHistory: (studentId, historyId) => apiClient.delete(`/students/${studentId}/academic-history/${historyId}`)
}

// Non-Academic History endpoints
export const nonAcademicHistoryAPI = {
  getStudentNonAcademicHistory: (studentId) => apiClient.get(`/students/${studentId}/non-academic-history`),
  createNonAcademicHistory: (studentId, data) => apiClient.post(`/students/${studentId}/non-academic-history`, data),
  getNonAcademicHistory: (studentId, historyId) => apiClient.get(`/students/${studentId}/non-academic-history/${historyId}`),
  updateNonAcademicHistory: (studentId, historyId, data) => apiClient.put(`/students/${studentId}/non-academic-history/${historyId}`, data),
  deleteNonAcademicHistory: (studentId, historyId) => apiClient.delete(`/students/${studentId}/non-academic-history/${historyId}`)
}

// Skills endpoints
export const skillsAPI = {
  getStudentSkills: (studentId) => apiClient.get(`/students/${studentId}/skills`),
  createSkill: (studentId, data) => apiClient.post(`/students/${studentId}/skills`, data),
  getSkill: (studentId, skillId) => apiClient.get(`/students/${studentId}/skills/${skillId}`),
  updateSkill: (studentId, skillId, data) => apiClient.put(`/students/${studentId}/skills/${skillId}`, data),
  deleteSkill: (studentId, skillId) => apiClient.delete(`/students/${studentId}/skills/${skillId}`)
}

export default apiClient
