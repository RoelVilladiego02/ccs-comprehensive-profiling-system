import { useState, useMemo, useEffect } from 'react'
import '../styles/StudentDashboard.css'
import AdminStudentTable from './AdminStudentTable'
import StudentGrid from './StudentGrid'
import FilterPanel from './FilterPanel'
import SearchBar from './SearchBar'
import StudentForm from './StudentForm'
import DeleteConfirmModal from './DeleteConfirmModal'
import { studentAPI } from '../services/api'
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

  // Fetch students on component mount
  useEffect(() => {
    if (activeSection === 'dashboard') {
      fetchDashboardStats()
    } else if (activeSection === 'students') {
      fetchStudents()
      fetchFilterOptions()
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
      
      // Fetch students for count and at-risk calculation
      const studentsRes = await studentAPI.getAll(1000)
      const allStudents = studentsRes.data.data || []
      
      // Calculate at-risk students (GPA < 2.0)
      const atRiskCount = allStudents.filter(s => s.gpa < 2.0).length
      
      setDashboardStats({
        totalStudents: allStudents.length,
        totalFaculty: 0, // Will update from API
        totalCourses: 0, // Will update from API
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
      <h2>Courses Management</h2>
      <p>Courses management section coming soon...</p>
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


