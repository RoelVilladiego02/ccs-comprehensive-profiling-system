import { useState, useMemo, useEffect } from 'react'
import '../styles/StudentDashboard.css'
import StudentTable from './StudentTable'
import FilterPanel from './FilterPanel'
import SearchBar from './SearchBar'
import EventsModule from './EventsModule'
import EligibilityReports from './EligibilityReports'
import { studentAPI } from '../services/api'
import Sidebar from './Sidebar'

function StaffDashboard({ userData, onLogout }) {
  const [activeSection, setActiveSection] = useState('dashboard')
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [availableSkills, setAvailableSkills] = useState([])
  const [availableAffiliations, setAvailableAffiliations] = useState([])

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
  
  // Dashboard stats state
  const [dashboardStats, setDashboardStats] = useState({
    totalStudents: 0,
    atRiskStudents: 0,
    averageAttendance: 0,
    loadingStats: true
  })

  // Fetch data based on active section
  useEffect(() => {
    if (activeSection === 'dashboard') {
      fetchDashboardStats()
    } else if (activeSection === 'students') {
      fetchStudents()
      fetchFilterOptions()
    } else if (activeSection === 'attendance' || activeSection === 'reports') {
      fetchStudents()
    }
  }, [activeSection])

  // Fetch students on component mount
  useEffect(() => {
    fetchStudents()
    fetchFilterOptions()
  }, [])

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
    } catch (err) {
      console.error('Failed to load filter options', err)
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

    result = result.filter(student =>
      student.gpa >= filters.gpa_min && student.gpa <= filters.gpa_max
    )

    result = result.filter(student =>
      student.violations_count >= filters.violations_min && 
      student.violations_count <= filters.violations_max
    )

    result = result.filter(student =>
      student.attendance_rate >= filters.attendance_min && 
      student.attendance_rate <= filters.attendance_max
    )

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

  const fetchDashboardStats = async () => {
    try {
      setDashboardStats(prev => ({ ...prev, loadingStats: true }))
      const response = await studentAPI.getAll(1000)
      const allStudents = response.data.data || []
      
      const atRiskCount = allStudents.filter(s => s.gpa < 2.0).length
      const avgAttendance = allStudents.length > 0 
        ? (allStudents.reduce((sum, s) => sum + (s.attendance_rate || 0), 0) / allStudents.length).toFixed(1)
        : 0
      
      setDashboardStats({
        totalStudents: allStudents.length,
        atRiskStudents: atRiskCount,
        averageAttendance: avgAttendance,
        loadingStats: false
      })
    } catch (err) {
      console.error('Failed to load dashboard stats', err)
      setDashboardStats(prev => ({ ...prev, loadingStats: false }))
    }
  }

  // Render functions for each section
  const renderDashboard = () => (
    <div className="section-content">
      <h2>Dashboard Overview</h2>
      <div className="stats-grid">
        <div className="stat-card">
          <span className="stat-icon">👥</span>
          <h3>Total Students</h3>
          <p className="stat-value">{dashboardStats.totalStudents}</p>
        </div>
        <div className="stat-card">
          <span className="stat-icon">⚠️</span>
          <h3>At-Risk Students</h3>
          <p className="stat-value" style={{ color: dashboardStats.atRiskStudents > 0 ? '#dc3545' : '#28a745' }}>
            {dashboardStats.atRiskStudents}
          </p>
        </div>
        <div className="stat-card">
          <span className="stat-icon">✓</span>
          <h3>Average Attendance</h3>
          <p className="stat-value">{dashboardStats.averageAttendance}%</p>
        </div>
      </div>
      {dashboardStats.loadingStats && (
        <p style={{ textAlign: 'center', color: '#999', marginTop: '20px' }}>Loading statistics...</p>
      )}
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

      <main className="dashboard-content">
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
          <StudentTable 
            students={filteredAndSortedStudents}
            sortConfig={sortConfig}
            onSort={handleSort}
          />
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

  const renderAttendance = () => (
    <div className="section-content">
      <h2>Attendance Tracking</h2>
      <div style={{ background: '#f5f5f5', padding: '30px', borderRadius: '8px', marginTop: '20px', textAlign: 'center' }}>
        <p style={{ color: '#999', marginBottom: '15px', fontSize: '1.1rem' }}>📊 Attendance Analytics</p>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <p style={{ color: '#666', fontSize: '0.95rem', lineHeight: '1.6', marginBottom: '20px' }}>
            Monitor student attendance rates, identify patterns, and track attendance trends across different classes and time periods.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px', marginTop: '20px' }}>
            <div style={{ background: 'white', padding: '15px', borderRadius: '6px', border: '1px solid #ddd' }}>
              <p style={{ fontSize: '0.85rem', color: '#666', marginBottom: '5px' }}>Average Attendance</p>
              <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#007bff' }}>{dashboardStats.averageAttendance}%</p>
            </div>
            <div style={{ background: 'white', padding: '15px', borderRadius: '6px', border: '1px solid #ddd' }}>
              <p style={{ fontSize: '0.85rem', color: '#666', marginBottom: '5px' }}>Total Students Tracked</p>
              <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#28a745' }}>{dashboardStats.totalStudents}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  const renderReports = () => (
    <div className="section-content">
      <h2>Reports & Analytics</h2>
      <div style={{ background: '#f5f5f5', padding: '30px', borderRadius: '8px', marginTop: '20px', textAlign: 'center' }}>
        <p style={{ color: '#999', marginBottom: '15px', fontSize: '1.1rem' }}>📋 Report Generation</p>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <p style={{ color: '#666', fontSize: '0.95rem', lineHeight: '1.6', marginBottom: '20px' }}>
            Generate comprehensive reports on student performance, attendance, violations, and academic progress. Export data for further analysis.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px', marginTop: '20px' }}>
            <div style={{ background: 'white', padding: '15px', borderRadius: '6px', border: '1px solid #ddd', textAlign: 'left' }}>
              <p style={{ fontSize: '0.9rem', fontWeight: '600', color: '#333', marginBottom: '8px' }}>📊 Performance Report</p>
              <p style={{ fontSize: '0.85rem', color: '#666' }}>GPA trends and academic performance analysis</p>
            </div>
            <div style={{ background: 'white', padding: '15px', borderRadius: '6px', border: '1px solid #ddd', textAlign: 'left' }}>
              <p style={{ fontSize: '0.9rem', fontWeight: '600', color: '#333', marginBottom: '8px' }}>✓ Attendance Report</p>
              <p style={{ fontSize: '0.85rem', color: '#666' }}>Attendance patterns and trends</p>
            </div>
            <div style={{ background: 'white', padding: '15px', borderRadius: '6px', border: '1px solid #ddd', textAlign: 'left' }}>
              <p style={{ fontSize: '0.9rem', fontWeight: '600', color: '#333', marginBottom: '8px' }}>⚠️ Violations Report</p>
              <p style={{ fontSize: '0.85rem', color: '#666' }}>Student conduct and violations summary</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  const getSectionContent = () => {
    switch(activeSection) {
      case 'dashboard':
        return renderDashboard()
      case 'students':
        return renderStudents()
      case 'attendance':
        return renderAttendance()
      case 'events':
        return <EventsModule userData={userData} onLogout={onLogout} />
      case 'eligibility-reports':
        return <EligibilityReports />
      case 'reports':
        return renderReports()
      default:
        return renderStudents()
    }
  }

  return (
    <div className="dashboard-layout">
      <Sidebar 
        userRole="staff" 
        userData={userData} 
        onLogout={onLogout}
        activeSection={activeSection}
        onSectionChange={setActiveSection}
      />
      <div className="dashboard-content">
        <div className="staff-container">
          {activeSection === 'students' && (
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
          )}
          {getSectionContent()}
        </div>
      </div>
    </div>
  )
}

export default StaffDashboard
