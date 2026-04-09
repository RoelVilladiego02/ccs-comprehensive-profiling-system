import { useState, useMemo, useEffect } from 'react'
import '../styles/StudentDashboard.css'
import '../styles/modal-styles.css'
import StudentTable from './StudentTable'
import StudentGrid from './StudentGrid'
import FilterPanel from './FilterPanel'
import SearchBar from './SearchBar'
import { studentAPI } from '../services/api'
import Sidebar from './Sidebar'

/**
 * FacultyStudentDashboard - Dashboard for logged-in faculty users
 * Shows students they can view with filtering capabilities
 * Hides create/edit/delete operations (faculty cannot perform these)
 */
function FacultyStudentDashboard({ userData, onLogout }) {
  const [activeSection, setActiveSection] = useState('dashboard')
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [availableSkills, setAvailableSkills] = useState([])
  const [availableAffiliations, setAvailableAffiliations] = useState([])
  
  // Faculty dashboard stats (limited to their scope)
  const [dashboardStats, setDashboardStats] = useState({
    totalStudents: 0,
    viewableStudents: 0,
    atRiskStudents: 0,
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
  const [selectedStudent, setSelectedStudent] = useState(null)
  const [showViewModal, setShowViewModal] = useState(false)

  // Fetch data on component mount and section change
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
      setError('Failed to load students. You may not have permission to view this data.')
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
    } catch (err) {
      console.error('Failed to load filter options', err)
    }
  }

  const fetchDashboardStats = async () => {
    try {
      setDashboardStats(prev => ({ ...prev, loadingStats: true }))
      
      // Fetch students for count and analysis
      const studentsRes = await studentAPI.getAll(1000)
      const allStudents = studentsRes.data.data || []
      
      // Calculate at-risk students (GPA < 2.0)
      const atRiskCount = allStudents.filter(s => s.gpa < 2.0).length
      
      setDashboardStats({
        totalStudents: allStudents.length,
        viewableStudents: allStudents.length,
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
        student.student_number?.toLowerCase().includes(term) ||
        student.first_name?.toLowerCase().includes(term) ||
        student.last_name?.toLowerCase().includes(term) ||
        student.email?.toLowerCase().includes(term)
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

    // Note: year_level and status fields not available in current API response

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

      // Handle undefined/null values
      if (aValue === undefined || aValue === null) return 1
      if (bValue === undefined || bValue === null) return -1

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

  const handleViewStudent = (student) => {
    setSelectedStudent(student)
    setShowViewModal(true)
  }

  const closeViewModal = () => {
    setShowViewModal(false)
    setSelectedStudent(null)
  }

  const renderDashboard = () => (
    <div className="dashboard-welcome">
      <h1>Faculty Dashboard</h1>
      <p>Welcome, {userData?.name}!</p>
      
      <div className="faculty-permissions-info" style={{
        background: '#f0f8ff',
        border: '1px solid #b3d9ff',
        borderRadius: '6px',
        padding: '16px',
        marginBottom: '24px',
        maxWidth: '600px'
      }}>
        <h3 style={{ marginTop: 0, color: '#0066cc' }}>Your Permissions</h3>
        <ul style={{ margin: '8px 0', paddingLeft: '20px' }}>
          <li>✓ View student list and profiles</li>
          <li>✓ Search students by name, email, student number</li>
          <li>✓ Filter students by skill and affiliations</li>
          <li>✓ View academic performance and metadata</li>
          <li>✗ Cannot create, edit, or delete student records</li>
        </ul>
      </div>

      <div className="dashboard-stats">
        <div className="stat-card">
          <span className="stat-icon">👥</span>
          <h3>Viewable Students</h3>
          <p className="stat-value">{dashboardStats.viewableStudents}</p>
        </div>
        <div className="stat-card">
          <span className="stat-icon">⚠️</span>
          <h3>At-Risk Students</h3>
          <p className="stat-value">{dashboardStats.atRiskStudents}</p>
        </div>
        <div className="stat-card">
          <span className="stat-icon">📊</span>
          <h3>GPA Range Query</h3>
          <p className="stat-value">Available</p>
        </div>
        <div className="stat-card">
          <span className="stat-icon">🏆</span>
          <h3>Skills Filter</h3>
          <p className="stat-value">Available</p>
        </div>
      </div>

      <div style={{
        background: '#fff9e6',
        border: '1px solid #ffdb80',
        borderRadius: '6px',
        padding: '12px 16px',
        marginTop: '24px'
      }}>
        <strong>💡 Tip:</strong> Navigate to "Students" section to search and filter student data by skills, affiliations, GPA, and more!
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
          </div>
        </div>

        <div className="results-info">
          <span className="result-count">
            Showing <strong>{filteredAndSortedStudents.length}</strong> students
          </span>
        </div>

        {error && (
          <div className="error-message" style={{ margin: '20px 0', padding: '12px', background: '#fee', border: '1px solid #fcc', borderRadius: '4px', color: '#c00' }}>
            {error}
          </div>
        )}

        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
            <p>Loading students...</p>
          </div>
        ) : filteredAndSortedStudents.length > 0 ? (
          viewMode === 'table' ? (
            <StudentTable 
              students={filteredAndSortedStudents}
              sortConfig={sortConfig}
              onSort={handleSort}
              onViewStudent={handleViewStudent}
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

  const getSectionContent = () => {
    switch (activeSection) {
      case 'dashboard':
        return renderDashboard()
      case 'students':
        return renderStudents()
      default:
        return renderDashboard()
    }
  }

  return (
    <div className="dashboard-layout">
      <Sidebar 
        userRole="faculty" 
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

      {/* Student View Modal */}
      {showViewModal && selectedStudent && (
        <div className="modal-overlay" onClick={closeViewModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Student Profile</h2>
              <button className="modal-close" onClick={closeViewModal}>✕</button>
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
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-close" onClick={closeViewModal}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default FacultyStudentDashboard
