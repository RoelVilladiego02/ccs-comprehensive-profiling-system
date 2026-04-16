import { useState, useMemo, useEffect } from 'react'
import '../styles/StudentDashboard.css'
import AdminStudentTable from './AdminStudentTable'
import StudentGrid from './StudentGrid'
import FilterPanel from './FilterPanel'
import SearchBar from './SearchBar'
import StudentForm from './StudentForm'
import DeleteConfirmModal from './DeleteConfirmModal'
import { studentAPI, facultyAPI, courseAPI } from '../services/api'
import Sidebar from './Sidebar'

function AdminDashboard({ userData, onLogout }) {
  const [activeSection, setActiveSection] = useState('students')
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [availableSkills, setAvailableSkills] = useState([])
  const [availableAffiliations, setAvailableAffiliations] = useState([])
  
  // Dashboard stats
  const [dashboardStats, setDashboardStats] = useState({
    totalStudents: 0,
    totalUsers: 0,
    totalFaculty: 0,
    totalCourses: 0,
    loadingStats: true
  })

  const [searchTerm, setSearchTerm] = useState('')
  const [filters, setFilters] = useState({
    gender: [],
    student_identification: [],
    year_level: [],
    status: [],
    gpa_min: 0,
    gpa_max: 4.0,
    violations_min: 0,
    violations_max: 10,
    attendance_min: 0,
    attendance_max: 100,
    skills: [],
    affiliations: []
  })

  const [sortConfig, setSortConfig] = useState({
    field: 'student_number',
    direction: 'asc'
  })

  const [viewMode, setViewMode] = useState('table')
  const [isFilterOpen, setIsFilterOpen] = useState(false)

  // Modal state for add/edit/delete operations
  const [showFormModal, setShowFormModal] = useState(false)
  const [selectedStudent, setSelectedStudent] = useState(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [studentToDelete, setStudentToDelete] = useState(null)
  const [showViewModal, setShowViewModal] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const [availableIdentifications, setAvailableIdentifications] = useState([])

  // Courses management state
  const [courses, setCourses] = useState([])
  const [showCourseForm, setShowCourseForm] = useState(false)
  const [selectedCourse, setSelectedCourse] = useState(null)
  const [showCourseDeleteConfirm, setShowCourseDeleteConfirm] = useState(false)
  const [courseToDelete, setCourseToDelete] = useState(null)
  const [courseFormData, setCourseFormData] = useState({
    course_code: '',
    course_title: '',
    course_description: '',
    units_lecture: 3,
    units_lab: 0,
    department: '',
    is_active: true
  })

  // Fetch students on component mount
  useEffect(() => {
    if (activeSection === 'dashboard') {
      fetchDashboardStats()
    } else if (activeSection === 'students') {
      fetchStudents()
      fetchFilterOptions()
    } else if (activeSection === 'courses') {
      fetchCourses()
    }
  }, [activeSection])

  const fetchStudents = async () => {
    try {
      setLoading(true)
      const response = await studentAPI.getAll(100)
      if (response.data.success) {
        setStudents(response.data.data || [])
      }
    } catch (err) {
      setError('Failed to load students')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const fetchFilterOptions = async () => {
    try {
      const [skillsRes, affiliationsRes] = await Promise.all([
        studentAPI.getAvailableSkills(),
        studentAPI.getAvailableAffiliations()
      ])
      
      if (skillsRes.data.success) {
        setAvailableSkills(skillsRes.data.data || [])
      }
      if (affiliationsRes.data.success) {
        setAvailableAffiliations(affiliationsRes.data.data || [])
      }

      // Set default identifications if not available from API
      setAvailableIdentifications([
        'Regular',
        'Irregular',
        'Transferred',
        'International'
      ])
    } catch (err) {
      console.error('Failed to load filter options', err)
      // Set default identifications on error
      setAvailableIdentifications([
        'Regular',
        'Irregular',
        'Transferred',
        'International'
      ])
    }
  }

  const fetchDashboardStats = async () => {
    try {
      setDashboardStats(prev => ({ ...prev, loadingStats: true }))
      
      // Fetch students, faculty, and courses for counts and at-risk calculation
      const [studentsRes, facultyRes, coursesRes] = await Promise.all([
        studentAPI.getAll(1000),
        facultyAPI.getAll(),
        courseAPI.getAll()
      ])
      
      const allStudents = studentsRes.data.data || []
      const allFaculty = facultyRes.data.data || []
      const allCourses = coursesRes.data.data || []
      
      // Calculate at-risk students (GPA < 2.0)
      const atRiskCount = allStudents.filter(s => s.gpa < 2.0).length
      
      setDashboardStats({
        totalStudents: allStudents.length,
        totalFaculty: allFaculty.length,
        totalCourses: allCourses.length,
        atRiskStudents: atRiskCount,
        loadingStats: false
      })
    } catch (err) {
      console.error('Failed to load dashboard stats', err)
      setDashboardStats(prev => ({ ...prev, loadingStats: false }))
    }
  }

  const handleFilterBySkill = async (skillName) => {
    if (!skillName) return
    try {
      setLoading(true)
      const response = await studentAPI.getBySkill(skillName)
      if (response.data.success) {
        setStudents(response.data.data || [])
        setFilters(prev => ({ ...prev, skills: [skillName] }))
      }
    } catch (err) {
      setError('Failed to filter by skill')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleFilterByAffiliation = async (affiliationType) => {
    if (!affiliationType) return
    try {
      setLoading(true)
      const response = await studentAPI.getByAffiliation(affiliationType)
      if (response.data.success) {
        setStudents(response.data.data || [])
        setFilters(prev => ({ ...prev, affiliations: [affiliationType] }))
      }
    } catch (err) {
      setError('Failed to filter by affiliation')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const filteredAndSortedStudents = useMemo(() => {
    let result = [...students]

    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      result = result.filter(student =>
        student.student_number.toLowerCase().includes(term) ||
        student.first_name.toLowerCase().includes(term) ||
        student.last_name.toLowerCase().includes(term) ||
        student.email.toLowerCase().includes(term)
      )
    }

    if (filters.gender.length > 0) {
      result = result.filter(student => filters.gender.includes(student.gender))
    }

    if (filters.student_identification.length > 0) {
      result = result.filter(student => 
        filters.student_identification.includes(student.student_identification)
      )
    }

    if (filters.year_level.length > 0) {
      result = result.filter(student => 
        filters.year_level.includes(student.year_level)
      )
    }

    if (filters.status.length > 0) {
      result = result.filter(student => 
        filters.status.includes(student.status)
      )
    }

    // Only filter by GPA if the field exists in the response
    if (filters.gpa_min !== 0 || filters.gpa_max !== 4.0) {
      result = result.filter(student => {
        const gpa = student.gpa ?? 0
        return gpa >= filters.gpa_min && gpa <= filters.gpa_max
      })
    }

    // Only filter by violations if the field exists in the response
    if (filters.violations_min !== 0 || filters.violations_max !== 10) {
      result = result.filter(student => {
        const violations = student.violations_count ?? 0
        return violations >= filters.violations_min && violations <= filters.violations_max
      })
    }

    // Only filter by attendance if the field exists in the response
    if (filters.attendance_min !== 0 || filters.attendance_max !== 100) {
      result = result.filter(student => {
        const attendance = student.attendance_rate ?? 0
        return attendance >= filters.attendance_min && attendance <= filters.attendance_max
      })
    }

    result.sort((a, b) => {
      const aValue = a[sortConfig.field]
      const bValue = b[sortConfig.field]

      if (typeof aValue === 'string') {
        return sortConfig.direction === 'asc'
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue)
      } else {
        return sortConfig.direction === 'asc'
          ? aValue - bValue
          : bValue - aValue
      }
    })

    return result
  }, [students, searchTerm, filters, sortConfig])

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters)
  }

  const handleSort = (field) => {
    setSortConfig(prev => ({
      field,
      direction: prev.field === field && prev.direction === 'asc' ? 'desc' : 'asc'
    }))
  }

  const handleResetFilters = () => {
    setFilters({
      gender: [],
      student_identification: [],
      year_level: [],
      status: [],
      gpa_min: 0,
      gpa_max: 4.0,
      violations_min: 0,
      violations_max: 10,
      attendance_min: 0,
      attendance_max: 100,
      skills: [],
      affiliations: []
    })
    setSearchTerm('')
    fetchStudents()
  }

  // Add/Edit/Delete handlers
  const handleOpenAddForm = () => {
    setSelectedStudent(null)
    setShowFormModal(true)
  }

  const handleEditStudent = (student) => {
    setSelectedStudent(student)
    setShowFormModal(true)
  }

  const handleViewStudent = (student) => {
    setSelectedStudent(student)
    setShowViewModal(true)
  }

  const handleCloseViewModal = () => {
    setShowViewModal(false)
    setSelectedStudent(null)
  }

  const handleDeleteStudent = (student) => {
    setStudentToDelete(student)
    setShowDeleteConfirm(true)
  }

  const handleConfirmDelete = async () => {
    if (!studentToDelete) return

    try {
      await studentAPI.delete(studentToDelete.student_id || studentToDelete.id)
      setSuccessMessage(`Student ${studentToDelete.first_name} ${studentToDelete.last_name} deleted successfully`)
      setShowDeleteConfirm(false)
      setStudentToDelete(null)
      fetchStudents()
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(''), 3000)
    } catch (err) {
      setError('Failed to delete student')
      console.error(err)
    }
  }

  const handleFormSubmit = async (formData) => {
    try {
      if (selectedStudent) {
        // Edit existing student
        await studentAPI.update(selectedStudent.student_id || selectedStudent.id, formData)
        setSuccessMessage('Student updated successfully')
      } else {
        // Create new student
        await studentAPI.create(formData)
        setSuccessMessage('Student created successfully')
      }
      
      setShowFormModal(false)
      setSelectedStudent(null)
      fetchStudents()
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(''), 3000)
    } catch (err) {
      throw new Error(err.response?.data?.message || 'Failed to save student')
    }
  }

  // ====== COURSES MANAGEMENT FUNCTIONS ======
  const fetchCourses = async () => {
    try {
      setLoading(true)
      const response = await courseAPI.getAll()
      if (response.data.success) {
        setCourses(response.data.data || [])
      }
    } catch (err) {
      setError('Failed to load courses')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleOpenAddCourse = () => {
    setSelectedCourse(null)
    setCourseFormData({
      course_code: '',
      course_title: '',
      course_description: '',
      units_lecture: 3,
      units_lab: 0,
      department: '',
      is_active: true
    })
    setShowCourseForm(true)
  }

  const handleEditCourse = (course) => {
    setSelectedCourse(course)
    setCourseFormData({
      course_code: course.course_code,
      course_title: course.course_title,
      course_description: course.course_description || '',
      units_lecture: course.units_lecture,
      units_lab: course.units_lab,
      department: course.department,
      is_active: course.is_active
    })
    setShowCourseForm(true)
  }

  const handleDeleteCourse = (course) => {
    setCourseToDelete(course)
    setShowCourseDeleteConfirm(true)
  }

  const handleConfirmDeleteCourse = async () => {
    if (!courseToDelete) return

    try {
      await courseAPI.delete(courseToDelete.course_id || courseToDelete.id)
      setSuccessMessage(`Course ${courseToDelete.course_code} deleted successfully`)
      setShowCourseDeleteConfirm(false)
      setCourseToDelete(null)
      fetchCourses()
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(''), 3000)
    } catch (err) {
      setError('Failed to delete course')
      console.error(err)
    }
  }

  const handleSaveCourse = async () => {
    try {
      if (!courseFormData.course_code || !courseFormData.course_title) {
        setError('Course code and title are required')
        return
      }

      if (selectedCourse) {
        // Edit existing course
        await courseAPI.update(selectedCourse.course_id || selectedCourse.id, courseFormData)
        setSuccessMessage('Course updated successfully')
      } else {
        // Create new course
        await courseAPI.create(courseFormData)
        setSuccessMessage('Course created successfully')
      }
      
      setShowCourseForm(false)
      setSelectedCourse(null)
      fetchCourses()
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(''), 3000)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save course')
      console.error(err)
    }
  }

  const renderDashboard = () => (
    <div className="dashboard-welcome">
      <h1>Admin Dashboard</h1>
      <p>Welcome, {userData?.name}!</p>
      <div className="dashboard-stats">
        <div className="stat-card">
          <span className="stat-icon">👤</span>
          <h3>Total Students</h3>
          <p className="stat-value">{dashboardStats.totalStudents}</p>
        </div>
        <div className="stat-card">
          <span className="stat-icon">🎓</span>
          <h3>Faculty</h3>
          <p className="stat-value">{dashboardStats.totalFaculty}</p>
        </div>
        <div className="stat-card">
          <span className="stat-icon">📚</span>
          <h3>Courses</h3>
          <p className="stat-value">{dashboardStats.totalCourses}</p>
        </div>
        <div className="stat-card">
          <span className="stat-icon">⚠️</span>
          <h3>At-Risk Students</h3>
          <p className="stat-value">{dashboardStats.atRiskStudents}</p>
        </div>
      </div>
    </div>
  )

  const renderStudents = () => (
    <>
      <aside className={`filters-sidebar ${isFilterOpen ? 'open' : ''}`}>
        <div className="filters-header">
          <h3>Filters</h3>
          <button
            className="close-filters"
            onClick={() => setIsFilterOpen(false)}
            aria-label="Close filters"
          >
            ✕
          </button>
        </div>
        <FilterPanel 
          filters={filters} 
          onFilterChange={handleFilterChange}
          onReset={handleResetFilters}
          availableSkills={availableSkills}
          availableAffiliations={availableAffiliations}
          onFilterBySkill={handleFilterBySkill}
          onFilterByAffiliation={handleFilterByAffiliation}
        />
      </aside>

      <main className="admin-main">
        <div className="content-header">
          <button
            className="filter-toggle"
            onClick={() => setIsFilterOpen(prev => !prev)}
            aria-label="Toggle filters"
          >
            ☰ Filters
          </button>

          <SearchBar 
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            placeholder="Search by student number, name, or email..."
          />
          
          <div className="view-controls">
            <button 
              className={`view-btn ${viewMode === 'table' ? 'active' : ''}`}
              onClick={() => setViewMode('table')}
              title="Table view"
            >
              ≡ Table
            </button>
            <button 
              className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
              onClick={() => setViewMode('grid')}
              title="Grid view"
            >
              ⊞ Grid
            </button>
            <button
              className="add-btn"
              onClick={handleOpenAddForm}
              title="Add new student"
              style={{
                background: '#28a745',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                padding: '8px 16px',
                cursor: 'pointer',
                fontSize: '0.95rem',
                fontWeight: '500'
              }}
            >
              + Add Student
            </button>
          </div>
        </div>

        <div className="results-info">
          <span className="result-count">
            Showing <strong>{filteredAndSortedStudents.length}</strong> students
          </span>
        </div>

        {successMessage && (
          <div style={{ 
            margin: '20px 0', 
            padding: '12px', 
            background: '#d4edda', 
            border: '1px solid #c3e6cb', 
            borderRadius: '4px', 
            color: '#155724',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <span>✓ {successMessage}</span>
            <button
              onClick={() => setSuccessMessage('')}
              style={{
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                fontSize: '1.2rem',
                color: '#155724'
              }}
            >
              ✕
            </button>
          </div>
        )}

        {error && (
          <div className="error-message" style={{ margin: '20px 0', padding: '12px', background: '#fee', border: '1px solid #fcc', borderRadius: '4px', color: '#c00', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>{error}</span>
            <button
              onClick={() => setError('')}
              style={{
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                fontSize: '1.2rem',
                color: '#c00'
              }}
            >
              ✕
            </button>
          </div>
        )}

        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
            <p>Loading students...</p>
          </div>
        ) : filteredAndSortedStudents.length > 0 ? (
          viewMode === 'table' ? (
            <AdminStudentTable 
              students={filteredAndSortedStudents}
              sortConfig={sortConfig}
              onSort={handleSort}
              onViewStudent={handleViewStudent}
              onEditStudent={handleEditStudent}
              onDeleteStudent={handleDeleteStudent}
            />
          ) : (
            <StudentGrid 
              students={filteredAndSortedStudents}
              onViewStudent={handleViewStudent}
            />
          )
        ) : (
          <div className="empty-state">
            <p>No students found matching your criteria</p>
            <button className="reset-btn" onClick={handleResetFilters}>
              Reset Filters
            </button>
          </div>
        )}
      </main>
    </>
  )

  const renderUsers = () => (
    <div className="section-content">
      <h2>Users Management</h2>
      <p>User management section coming soon...</p>
    </div>
  )

  const renderFaculty = () => (
    <div className="section-content">
      <h2>Faculty Management</h2>
      <p>Faculty management section coming soon...</p>
    </div>
  )

  const renderCourses = () => (
    <div className="section-content">
      <div className="content-header">
        <h2>Courses Management</h2>
        <button
          className="add-btn"
          onClick={handleOpenAddCourse}
          style={{
            background: '#28a745',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            padding: '8px 16px',
            cursor: 'pointer',
            fontSize: '0.95rem',
            fontWeight: '500'
          }}
        >
          + Add Course
        </button>
      </div>

      <div className="results-info">
        <span className="result-count">
          Total Courses: <strong>{courses.length}</strong>
        </span>
      </div>

      {successMessage && (
        <div style={{ 
          margin: '20px 0', 
          padding: '12px', 
          background: '#d4edda', 
          border: '1px solid #c3e6cb', 
          borderRadius: '4px', 
          color: '#155724',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <span>✓ {successMessage}</span>
          <button
            onClick={() => setSuccessMessage('')}
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              fontSize: '1.2rem',
              color: '#155724'
            }}
          >
            ✕
          </button>
        </div>
      )}

      {error && (
        <div style={{ 
          margin: '20px 0', 
          padding: '12px', 
          background: '#fee', 
          border: '1px solid #fcc', 
          borderRadius: '4px', 
          color: '#c00',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <span>{error}</span>
          <button
            onClick={() => setError('')}
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              fontSize: '1.2rem',
              color: '#c00'
            }}
          >
            ✕
          </button>
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
          <p>Loading courses...</p>
        </div>
      ) : courses.length > 0 ? (
        <div className="courses-table-container" style={{ 
          overflowX: 'auto', 
          marginTop: '20px',
          borderRadius: '4px',
          border: '1px solid #dee2e6',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          width: '100%'
        }}>
          <table style={{ 
            width: '100%', 
            borderCollapse: 'collapse',
            minWidth: '1400px'
          }}>
            <thead>
              <tr style={{ background: '#f8f9fa', borderBottom: '2px solid #dee2e6' }}>
                <th style={{ padding: '18px 20px', textAlign: 'left', fontWeight: '700', width: '9%', minWidth: '120px', fontSize: '1rem' }}>Code</th>
                <th style={{ padding: '18px 20px', textAlign: 'left', fontWeight: '700', width: '26%', minWidth: '280px', fontSize: '1rem' }}>Title</th>
                <th style={{ padding: '18px 20px', textAlign: 'left', fontWeight: '700', width: '16%', minWidth: '180px', fontSize: '1rem' }}>Department</th>
                <th style={{ padding: '18px 20px', textAlign: 'center', fontWeight: '700', width: '10%', minWidth: '100px', fontSize: '1rem' }}>Lecture</th>
                <th style={{ padding: '18px 20px', textAlign: 'center', fontWeight: '700', width: '10%', minWidth: '100px', fontSize: '1rem' }}>Lab</th>
                <th style={{ padding: '18px 20px', textAlign: 'center', fontWeight: '700', width: '12%', minWidth: '130px', fontSize: '1rem' }}>Status</th>
                <th style={{ padding: '18px 20px', textAlign: 'center', fontWeight: '700', width: '17%', minWidth: '200px', fontSize: '1rem' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {courses.map((course, index) => (
                <tr 
                  key={course.course_id || index}
                  style={{ 
                    borderBottom: '1px solid #e9ecef',
                    background: index % 2 === 0 ? '#fff' : '#f8f9fa',
                    transition: 'background-color 0.15s ease'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#e7f3ff'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = index % 2 === 0 ? '#fff' : '#f8f9fa'}
                >
                  <td style={{ padding: '16px 20px', fontWeight: '700', color: '#0056b3', fontSize: '1.02rem' }}>
                    {course.course_code}
                  </td>
                  <td style={{ padding: '16px 20px', fontSize: '0.98rem', color: '#333333' }}>
                    {course.course_title}
                  </td>
                  <td style={{ padding: '16px 20px', fontSize: '0.98rem', color: '#666666' }}>
                    {course.department || '-'}
                  </td>
                  <td style={{ padding: '16px 20px', textAlign: 'center', fontSize: '0.98rem', fontWeight: '500', color: '#333333' }}>
                    {course.units_lecture}
                  </td>
                  <td style={{ padding: '16px 20px', textAlign: 'center', fontSize: '0.98rem', fontWeight: '500', color: '#333333' }}>
                    {course.units_lab}
                  </td>
                  <td style={{ padding: '16px 20px', textAlign: 'center' }}>
                    <span style={{
                      padding: '8px 16px',
                      borderRadius: '16px',
                      fontSize: '0.88rem',
                      fontWeight: '600',
                      display: 'inline-block',
                      background: course.is_active ? '#d4edda' : '#f8d7da',
                      color: course.is_active ? '#155724' : '#721c24'
                    }}>
                      {course.is_active ? '✓ Active' : '✕ Inactive'}
                    </span>
                  </td>
                  <td style={{ padding: '16px 20px', textAlign: 'center', whiteSpace: 'nowrap' }}>
                    <button
                      onClick={() => handleEditCourse(course)}
                      style={{
                        background: '#007bff',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        padding: '8px 14px',
                        cursor: 'pointer',
                        marginRight: '8px',
                        fontSize: '0.88rem',
                        fontWeight: '500',
                        transition: 'all 0.15s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#0056b3'
                        e.currentTarget.style.transform = 'translateY(-1px)'
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = '#007bff'
                        e.currentTarget.style.transform = 'translateY(0)'
                      }}
                    >
                      ✎ Edit
                    </button>
                    <button
                      onClick={() => handleDeleteCourse(course)}
                      style={{
                        background: '#dc3545',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        padding: '8px 14px',
                        cursor: 'pointer',
                        fontSize: '0.88rem',
                        fontWeight: '500',
                        transition: 'all 0.15s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#c82333'
                        e.currentTarget.style.transform = 'translateY(-1px)'
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = '#dc3545'
                        e.currentTarget.style.transform = 'translateY(0)'
                      }}
                    >
                      🗑 Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="empty-state" style={{ textAlign: 'center', padding: '40px' }}>
          <p>No courses found</p>
          <button 
            onClick={handleOpenAddCourse}
            style={{
              background: '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              padding: '8px 16px',
              cursor: 'pointer',
              marginTop: '10px'
            }}
          >
            Create First Course
          </button>
        </div>
      )}

      {/* Course Form Modal */}
      {showCourseForm && (
        <div className="modal-overlay" onClick={() => setShowCourseForm(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{selectedCourse ? 'Edit Course' : 'Add New Course'}</h2>
              <button 
                className="modal-close" 
                onClick={() => setShowCourseForm(false)}
              >
                ✕
              </button>
            </div>
            <div className="modal-body" style={{ padding: '20px' }}>
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>
                  Course Code *
                </label>
                <input
                  type="text"
                  value={courseFormData.course_code}
                  onChange={(e) => setCourseFormData({ ...courseFormData, course_code: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '8px',
                    border: '1px solid #ccc',
                    borderRadius: '4px',
                    fontSize: '0.95rem',
                    boxSizing: 'border-box'
                  }}
                  placeholder="e.g., CS101"
                />
              </div>

              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>
                  Course Title *
                </label>
                <input
                  type="text"
                  value={courseFormData.course_title}
                  onChange={(e) => setCourseFormData({ ...courseFormData, course_title: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '8px',
                    border: '1px solid #ccc',
                    borderRadius: '4px',
                    fontSize: '0.95rem',
                    boxSizing: 'border-box'
                  }}
                  placeholder="e.g., Introduction to Programming"
                />
              </div>

              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>
                  Description
                </label>
                <textarea
                  value={courseFormData.course_description}
                  onChange={(e) => setCourseFormData({ ...courseFormData, course_description: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '8px',
                    border: '1px solid #ccc',
                    borderRadius: '4px',
                    fontSize: '0.95rem',
                    boxSizing: 'border-box',
                    minHeight: '80px',
                    fontFamily: 'inherit'
                  }}
                  placeholder="Course description..."
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>
                    Lecture Units *
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.5"
                    value={courseFormData.units_lecture}
                    onChange={(e) => setCourseFormData({ ...courseFormData, units_lecture: parseFloat(e.target.value) || 0 })}
                    style={{
                      width: '100%',
                      padding: '8px',
                      border: '1px solid #ccc',
                      borderRadius: '4px',
                      fontSize: '0.95rem',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>
                    Lab Units
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.5"
                    value={courseFormData.units_lab}
                    onChange={(e) => setCourseFormData({ ...courseFormData, units_lab: parseFloat(e.target.value) || 0 })}
                    style={{
                      width: '100%',
                      padding: '8px',
                      border: '1px solid #ccc',
                      borderRadius: '4px',
                      fontSize: '0.95rem',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>
                  Department *
                </label>
                <input
                  type="text"
                  value={courseFormData.department}
                  onChange={(e) => setCourseFormData({ ...courseFormData, department: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '8px',
                    border: '1px solid #ccc',
                    borderRadius: '4px',
                    fontSize: '0.95rem',
                    boxSizing: 'border-box'
                  }}
                  placeholder="e.g., Computer Science"
                />
              </div>

              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'flex', alignItems: 'center', fontWeight: '500' }}>
                  <input
                    type="checkbox"
                    checked={courseFormData.is_active}
                    onChange={(e) => setCourseFormData({ ...courseFormData, is_active: e.target.checked })}
                    style={{ marginRight: '8px' }}
                  />
                  Active
                </label>
              </div>
            </div>
            <div className="modal-footer" style={{ padding: '20px', borderTop: '1px solid #eee', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                onClick={() => setShowCourseForm(false)}
                style={{
                  background: '#6c757d',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  padding: '8px 16px',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleSaveCourse}
                style={{
                  background: '#28a745',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  padding: '8px 16px',
                  cursor: 'pointer'
                }}
              >
                {selectedCourse ? 'Update' : 'Create'} Course
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showCourseDeleteConfirm && courseToDelete && (
        <div className="modal-overlay" onClick={() => setShowCourseDeleteConfirm(false)}>
          <div className="modal-content" style={{ maxWidth: '400px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Delete Course</h2>
              <button 
                className="modal-close" 
                onClick={() => setShowCourseDeleteConfirm(false)}
              >
                ✕
              </button>
            </div>
            <div className="modal-body" style={{ padding: '20px' }}>
              <p>Are you sure you want to delete <strong>{courseToDelete.course_code}</strong>?</p>
              <p style={{ color: '#666', fontSize: '0.9rem' }}>This action cannot be undone.</p>
            </div>
            <div className="modal-footer" style={{ padding: '20px', borderTop: '1px solid #eee', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                onClick={() => setShowCourseDeleteConfirm(false)}
                style={{
                  background: '#6c757d',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  padding: '8px 16px',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDeleteCourse}
                style={{
                  background: '#dc3545',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  padding: '8px 16px',
                  cursor: 'pointer'
                }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )

  const renderSettings = () => (
    <div className="section-content">
      <h2>System Settings</h2>
      <p>System settings section coming soon...</p>
    </div>
  )

  const getSectionContent = () => {
    switch (activeSection) {
      case 'dashboard':
        return renderDashboard()
      case 'students':
        return renderStudents()
      case 'users':
        return renderUsers()
      case 'faculty':
        return renderFaculty()
      case 'courses':
        return renderCourses()
      case 'settings':
        return renderSettings()
      default:
        return renderDashboard()
    }
  }

  return (
    <div className="dashboard-layout">
      <Sidebar 
        userRole="admin" 
        userData={userData} 
        onLogout={onLogout}
        activeSection={activeSection}
        onSectionChange={setActiveSection}
      />
      <div className="dashboard-content">
        <div className="admin-container">
          {getSectionContent()}
        </div>
      </div>

      {/* Student Form Modal */}
      <StudentForm 
        student={selectedStudent}
        isOpen={showFormModal}
        onClose={() => {
          setShowFormModal(false)
          setSelectedStudent(null)
        }}
        onSubmit={handleFormSubmit}
        availableIdentifications={availableIdentifications}
      />

      {/* View Student Modal */}
      {showViewModal && selectedStudent && (
        <div className="modal-overlay" onClick={handleCloseViewModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Student Profile</h2>
              <button className="modal-close" onClick={handleCloseViewModal}>✕</button>
            </div>
            <div className="modal-body">
              <div className="student-details">
                <div className="detail-row">
                  <label>Student Number:</label>
                  <span>{selectedStudent.student_number}</span>
                </div>
                <div className="detail-row">
                  <label>Name:</label>
                  <span>
                    {selectedStudent.first_name} 
                    {selectedStudent.middle_name ? ` ${selectedStudent.middle_name.charAt(0)}.` : ''} 
                    {selectedStudent.last_name}
                    {selectedStudent.suffix ? ` ${selectedStudent.suffix}` : ''}
                  </span>
                </div>
                <div className="detail-row">
                  <label>Email:</label>
                  <span>{selectedStudent.email}</span>
                </div>
                <div className="detail-row">
                  <label>Gender:</label>
                  <span>{selectedStudent.gender}</span>
                </div>
                <div className="detail-row">
                  <label>Student Identification:</label>
                  <span>{selectedStudent.student_identification}</span>
                </div>
                {selectedStudent.curriculum && (
                  <div className="detail-row">
                    <label>Curriculum:</label>
                    <span>{selectedStudent.curriculum}</span>
                  </div>
                )}
                {selectedStudent.phone_number && (
                  <div className="detail-row">
                    <label>Phone Number:</label>
                    <span>{selectedStudent.phone_number}</span>
                  </div>
                )}
                {selectedStudent.gpa !== undefined && (
                  <div className="detail-row">
                    <label>GPA:</label>
                    <span>{selectedStudent.gpa.toFixed(2)}</span>
                  </div>
                )}
                {selectedStudent.year_level && (
                  <div className="detail-row">
                    <label>Year Level:</label>
                    <span>{selectedStudent.year_level}</span>
                  </div>
                )}
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={handleCloseViewModal}>Close</button>
              <button 
                className="btn-primary" 
                onClick={() => {
                  handleCloseViewModal()
                  handleEditStudent(selectedStudent)
                }}
              >
                ✏️ Edit
              </button>
              <button 
                className="btn-danger" 
                onClick={() => {
                  handleCloseViewModal()
                  handleDeleteStudent(selectedStudent)
                }}
                style={{
                  background: '#dc3545',
                  color: 'white',
                  border: 'none'
                }}
              >
                🗑 Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal 
        isOpen={showDeleteConfirm}
        onClose={() => {
          setShowDeleteConfirm(false)
          setStudentToDelete(null)
        }}
        onConfirm={handleConfirmDelete}
        title="Delete Student"
        message={`Are you sure you want to delete ${studentToDelete?.first_name} ${studentToDelete?.last_name}? This action cannot be undone.`}
      />
    </div>
  )
}

export default AdminDashboard


