import { useState, useMemo } from 'react'
import { Link, useLocation } from 'react-router-dom'
import '../styles/FacultyDashboard.css'
import FacultyTable from './FacultyTable'
import FacultyFilterPanel from './FacultyFilterPanel'
import SearchBar from './SearchBar'

function FacultyDashboard({ facultyData, onLogout }) {
  const location = useLocation()
  const [faculty, _setFaculty] = useState([
    {
      faculty_id: 1,
      faculty_number: 'FAC-2024-001',
      first_name: 'Dr. Maria',
      middle_name: 'Sofia',
      last_name: 'Rodriguez',
      email: 'maria.rodriguez@faculty.edu',
      phone_number: '09123456789',
      gender: 'Female',
      department: 'Computer Science',
      position: 'Associate Professor',
      specialization: 'Artificial Intelligence',
      employment_status: 'Full-time',
      years_of_service: 8,
      qualification: 'PhD in Computer Science',
      teaching_load: 18,
      research_projects: 5,
      publications_count: 12,
      status: 'Active'
    },
    {
      faculty_id: 2,
      faculty_number: 'FAC-2024-002',
      first_name: 'Prof. Juan',
      middle_name: 'Carlos',
      last_name: 'Santos',
      email: 'juan.santos@faculty.edu',
      phone_number: '09234567890',
      gender: 'Male',
      department: 'Information Technology',
      position: 'Assistant Professor',
      specialization: 'Cybersecurity',
      employment_status: 'Full-time',
      years_of_service: 5,
      qualification: 'MS in Information Technology',
      teaching_load: 21,
      research_projects: 3,
      publications_count: 8,
      status: 'Active'
    },
    {
      faculty_id: 3,
      faculty_number: 'FAC-2024-003',
      first_name: 'Dr. Ana',
      middle_name: 'Beatriz',
      last_name: 'Garcia',
      email: 'ana.garcia@faculty.edu',
      phone_number: '09345678901',
      gender: 'Female',
      department: 'Computer Science',
      position: 'Lecturer',
      specialization: 'Software Engineering',
      employment_status: 'Part-time',
      years_of_service: 3,
      qualification: 'MS in Software Engineering',
      teaching_load: 12,
      research_projects: 2,
      publications_count: 5,
      status: 'Active'
    },
    {
      faculty_id: 4,
      faculty_number: 'FAC-2024-004',
      first_name: 'Prof. Miguel',
      middle_name: 'Antonio',
      last_name: 'Torres',
      email: 'miguel.torres@faculty.edu',
      phone_number: '09456789012',
      gender: 'Male',
      department: 'Mathematics',
      position: 'Professor',
      specialization: 'Applied Mathematics',
      employment_status: 'Full-time',
      years_of_service: 15,
      qualification: 'PhD in Mathematics',
      teaching_load: 15,
      research_projects: 8,
      publications_count: 25,
      status: 'Active'
    },
    {
      faculty_id: 5,
      faculty_number: 'FAC-2024-005',
      first_name: 'Dr. Elena',
      middle_name: 'Rosa',
      last_name: 'Diaz',
      email: 'elena.diaz@faculty.edu',
      phone_number: '09567890123',
      gender: 'Female',
      department: 'Information Technology',
      position: 'Associate Professor',
      specialization: 'Data Science',
      employment_status: 'Full-time',
      years_of_service: 7,
      qualification: 'PhD in Data Science',
      teaching_load: 16,
      research_projects: 6,
      publications_count: 15,
      status: 'On Leave'
    }
  ])

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
    <div className="faculty-dashboard">
      <div className="dashboard-header">
        <div className="header-left">
          <h1>CCS Comprehensive Profiling System</h1>
          <p className="subtitle">Faculty management and academic profiling platform</p>
        </div>
        <div className="header-right">
          {facultyData && (
            <div className="user-info">
              <span className="user-label">Logged in as:</span>
              <span className="user-id">{facultyData.facultyNumber}</span>
              <button
                className="logout-btn"
                onClick={onLogout}
                title="Logout from dashboard"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>

      <nav className="module-navigation">
        <Link to="/dashboard" className={`nav-link ${location.pathname === '/dashboard' ? 'active' : ''}`}>
          Student Dashboard
        </Link>
        <Link to="/faculty" className={`nav-link ${location.pathname === '/faculty' ? 'active' : ''}`}>
          Faculty Dashboard
        </Link>
        <Link to="/instruction" className={`nav-link ${location.pathname === '/instruction' ? 'active' : ''}`}>
          Instruction Module
        </Link>
        <Link to="/scheduling" className={`nav-link ${location.pathname === '/scheduling' ? 'active' : ''}`}>
          Scheduling Module
        </Link>
      </nav>

      <div className="dashboard-container">
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
          <FacultyFilterPanel
            filters={filters}
            onFilterChange={handleFilterChange}
            onReset={handleResetFilters}
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
              placeholder="Search by faculty number, name, email, department, or specialization..."
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
              Showing <strong>{filteredAndSortedFaculty.length}</strong> faculty members
            </span>
          </div>

          {filteredAndSortedFaculty.length > 0 ? (
            viewMode === 'table' ? (
              <FacultyTable
                faculty={filteredAndSortedFaculty}
                sortConfig={sortConfig}
                onSort={handleSort}
              />
            ) : (
              <FacultyGrid faculty={filteredAndSortedFaculty} />
            )
          ) : (
            <div className="empty-state">
              <p>No faculty members found matching your criteria</p>
              <button className="reset-btn" onClick={handleResetFilters}>
                Reset Filters
              </button>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}

// Grid view component
function FacultyGrid({ faculty }) {
  return (
    <div className="faculty-grid">
      {faculty.map(facultyMember => (
        <div key={facultyMember.faculty_id} className="faculty-card">
          <div className="card-header">
            <h3>{facultyMember.first_name} {facultyMember.last_name}</h3>
            <span className={`status-badge status-${facultyMember.status.toLowerCase().replace(' ', '-')}`}>
              {facultyMember.status}
            </span>
          </div>

          <div className="card-body">
            <p><strong>Faculty #:</strong> {facultyMember.faculty_number}</p>
            <p><strong>Email:</strong> {facultyMember.email}</p>
            <p><strong>Department:</strong> {facultyMember.department}</p>
            <p><strong>Position:</strong> {facultyMember.position}</p>
            <p><strong>Specialization:</strong> {facultyMember.specialization}</p>

            <div className="card-stats">
              <div className="stat">
                <span className="stat-label">Years of Service</span>
                <span className="stat-value">{facultyMember.years_of_service}</span>
              </div>
              <div className="stat">
                <span className="stat-label">Teaching Load</span>
                <span className="stat-value">{facultyMember.teaching_load}h</span>
              </div>
              <div className="stat">
                <span className="stat-label">Publications</span>
                <span className="stat-value">{facultyMember.publications_count}</span>
              </div>
            </div>
          </div>

          <div className="card-footer">
            <button className="card-action-btn">View Profile</button>
          </div>
        </div>
      ))}
    </div>
  )
}

export default FacultyDashboard