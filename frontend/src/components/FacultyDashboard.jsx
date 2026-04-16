import { useState, useMemo, useEffect } from 'react'
import '../styles/FacultyDashboard.css'
import FacultyTable from './FacultyTable'
import FacultyFilterPanel from './FacultyFilterPanel'
import SearchBar from './SearchBar'
import Sidebar from './Sidebar'
import { facultyAPI } from '../services/api'

function FacultyDashboard({ userData, onLogout }) {
  const [activeSection, setActiveSection] = useState('dashboard')
  const [faculty, setFaculty] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [searchTerm, setSearchTerm] = useState('')
  const [filters, setFilters] = useState({
    gender: [],
    department: [],
    position: [],
    employment_status: [],
    status: [],
    years_of_service_min: 0,
    years_of_service_max: 50,
    teaching_load_min: 0,
    teaching_load_max: 30,
    research_projects_min: 0,
    research_projects_max: 50,
    publications_min: 0,
    publications_max: 100
  })

  const [sortConfig, setSortConfig] = useState({
    field: 'faculty_number',
    direction: 'asc'
  })

  const [viewMode, setViewMode] = useState('table') // 'table' or 'grid'
  const [isFilterOpen, setIsFilterOpen] = useState(false)

  // Fetch faculty data on component mount
  useEffect(() => {
    fetchFaculty()
  }, [])

  const fetchFaculty = async () => {
    try {
      setLoading(true)
      const response = await facultyAPI.getAll()
      if (response.data.success) {
        setFaculty(response.data.data || [])
      } else {
        setError('Failed to load faculty data')
      }
    } catch (err) {
      console.error('Failed to fetch faculty:', err)
      setError('Error loading faculty data')
    } finally {
      setLoading(false)
    }
  }

  // Filter and search logic
  const filteredAndSortedFaculty = useMemo(() => {
    let result = [...faculty]

    // Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      result = result.filter(facultyMember =>
        facultyMember.faculty_number.toLowerCase().includes(term) ||
        facultyMember.first_name.toLowerCase().includes(term) ||
        facultyMember.last_name.toLowerCase().includes(term) ||
        facultyMember.email.toLowerCase().includes(term) ||
        facultyMember.department.toLowerCase().includes(term) ||
        facultyMember.specialization.toLowerCase().includes(term)
      )
    }

    // Filter by gender
    if (filters.gender.length > 0) {
      result = result.filter(facultyMember => filters.gender.includes(facultyMember.gender))
    }

    // Filter by department
    if (filters.department.length > 0) {
      result = result.filter(facultyMember =>
        filters.department.includes(facultyMember.department)
      )
    }

    // Filter by position
    if (filters.position.length > 0) {
      result = result.filter(facultyMember =>
        filters.position.includes(facultyMember.position)
      )
    }

    // Filter by employment status
    if (filters.employment_status.length > 0) {
      result = result.filter(facultyMember =>
        filters.employment_status.includes(facultyMember.employment_status)
      )
    }

    // Filter by status
    if (filters.status.length > 0) {
      result = result.filter(facultyMember =>
        filters.status.includes(facultyMember.status)
      )
    }

    // Filter by years of service
    result = result.filter(facultyMember =>
      facultyMember.years_of_service >= filters.years_of_service_min &&
      facultyMember.years_of_service <= filters.years_of_service_max
    )

    // Filter by teaching load
    result = result.filter(facultyMember =>
      facultyMember.teaching_load >= filters.teaching_load_min &&
      facultyMember.teaching_load <= filters.teaching_load_max
    )

    // Filter by research projects
    result = result.filter(facultyMember =>
      facultyMember.research_projects >= filters.research_projects_min &&
      facultyMember.research_projects <= filters.research_projects_max
    )

    // Filter by publications
    result = result.filter(facultyMember =>
      facultyMember.publications_count >= filters.publications_min &&
      facultyMember.publications_count <= filters.publications_max
    )

    // Sort
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
  }, [faculty, searchTerm, filters, sortConfig])

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
      department: [],
      position: [],
      employment_status: [],
      status: [],
      years_of_service_min: 0,
      years_of_service_max: 50,
      teaching_load_min: 0,
      teaching_load_max: 30,
      research_projects_min: 0,
      research_projects_max: 50,
      publications_min: 0,
      publications_max: 100
    })
    setSearchTerm('')
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
        {error && (
          <div style={{ background: '#fee', padding: '15px', borderRadius: '4px', marginBottom: '20px', color: '#c33', border: '1px solid #fcc' }}>
            {error}
          </div>
        )}

        {activeSection === 'dashboard' && (
          <div className="dashboard-welcome">
            <h1>Welcome, {userData?.name}!</h1>
            <p>Faculty Dashboard</p>
            <div className="dashboard-stats">
              <div className="stat-card">
                <span className="stat-icon">👥</span>
                <h3>My Classes</h3>
                <p className="stat-value">0</p>
              </div>
              <div className="stat-card">
                <span className="stat-icon">📊</span>
                <h3>Students</h3>
                <p className="stat-value">0</p>
              </div>
              <div className="stat-card">
                <span className="stat-icon">✏️</span>
                <h3>Grades Submitted</h3>
                <p className="stat-value">0</p>
              </div>
              <div className="stat-card">
                <span className="stat-icon">✓</span>
                <h3>Attendance Tracked</h3>
                <p className="stat-value">0</p>
              </div>
            </div>
          </div>
        )}

        {activeSection === 'classes' && (
          <div className="section-content">
            <h2>My Classes</h2>
            <p>List of classes and sections you are teaching.</p>
            {/* Placeholder for classes list */}
            <div style={{ background: '#f5f5f5', padding: '20px', borderRadius: '8px', marginTop: '20px' }}>
              <p style={{ color: '#999' }}>No classes assigned yet</p>
            </div>
          </div>
        )}

        {activeSection === 'grades' && (
          <div className="section-content">
            <h2>Grades Management</h2>
            <p>View and manage student grades.</p>
            {/* Placeholder for grades */}
            <div style={{ background: '#f5f5f5', padding: '20px', borderRadius: '8px', marginTop: '20px' }}>
              <p style={{ color: '#999' }}>No grades to display</p>
            </div>
          </div>
        )}

        {activeSection === 'attendance' && (
          <div className="section-content">
            <h2>Attendance Tracking</h2>
            <p>Track and manage student attendance records.</p>
            {/* Placeholder for attendance */}
            <div style={{ background: '#f5f5f5', padding: '20px', borderRadius: '8px', marginTop: '20px' }}>
              <p style={{ color: '#999' }}>No attendance records</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default FacultyDashboard