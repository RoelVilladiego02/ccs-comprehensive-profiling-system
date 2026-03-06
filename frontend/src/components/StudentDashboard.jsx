import { useState, useMemo } from 'react'
import '../styles/StudentDashboard.css'
import StudentTable from './StudentTable'
import FilterPanel from './FilterPanel'
import SearchBar from './SearchBar'

function StudentDashboard({ studentData, onLogout }) {
  const [students, setStudents] = useState([
    // Mock data - will be replaced with API calls
    {
      student_id: 1,
      student_number: 'STU-2024-001',
      first_name: 'John',
      middle_name: 'Patrick',
      last_name: 'Doe',
      email: 'john.doe@student.edu',
      phone_number: '09123456789',
      gender: 'Male',
      student_identification: 'Regular',
      curriculum: 'BS Computer Science',
      program_name: 'BS Computer Science',
      year_level: 2,
      semester: 2,
      academic_year: '2025-2026',
      gpa: 3.75,
      violations_count: 0,
      attendance_rate: 95,
      status: 'Enrolled'
    },
    {
      student_id: 2,
      student_number: 'STU-2024-002',
      first_name: 'Maria',
      middle_name: 'Anna',
      last_name: 'Santos',
      email: 'maria.santos@student.edu',
      phone_number: '09234567890',
      gender: 'Female',
      student_identification: 'Regular',
      curriculum: 'BS Information Technology',
      program_name: 'BS Information Technology',
      year_level: 3,
      semester: 1,
      academic_year: '2025-2026',
      gpa: 3.92,
      violations_count: 0,
      attendance_rate: 98,
      status: 'Enrolled'
    },
    {
      student_id: 3,
      student_number: 'STU-2024-003',
      first_name: 'Juan',
      middle_name: 'Carlos',
      last_name: 'Cruz',
      email: 'juan.cruz@student.edu',
      phone_number: '09345678901',
      gender: 'Male',
      student_identification: 'Regular',
      curriculum: 'BS Computer Science',
      program_name: 'BS Computer Science',
      year_level: 1,
      semester: 2,
      academic_year: '2025-2026',
      gpa: 3.45,
      violations_count: 2,
      attendance_rate: 87,
      status: 'Enrolled'
    },
    {
      student_id: 4,
      student_number: 'STU-2024-004',
      first_name: 'Anna',
      middle_name: 'Marie',
      last_name: 'Reyes',
      email: 'anna.reyes@student.edu',
      phone_number: '09456789012',
      gender: 'Female',
      student_identification: 'On Leave',
      curriculum: 'BS Engineering',
      program_name: 'BS Engineering',
      year_level: 2,
      semester: 1,
      academic_year: '2025-2026',
      gpa: 3.60,
      violations_count: 1,
      attendance_rate: 65,
      status: 'On Leave'
    }
  ])

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
    attendance_max: 100
  })

  const [sortConfig, setSortConfig] = useState({
    field: 'student_number',
    direction: 'asc'
  })

  const [viewMode, setViewMode] = useState('table') // 'table' or 'grid'

  // Filter and search logic
  const filteredAndSortedStudents = useMemo(() => {
    let result = [...students]

    // Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      result = result.filter(student =>
        student.student_number.toLowerCase().includes(term) ||
        student.first_name.toLowerCase().includes(term) ||
        student.last_name.toLowerCase().includes(term) ||
        student.email.toLowerCase().includes(term)
      )
    }

    // Filter by gender
    if (filters.gender.length > 0) {
      result = result.filter(student => filters.gender.includes(student.gender))
    }

    // Filter by student identification
    if (filters.student_identification.length > 0) {
      result = result.filter(student => 
        filters.student_identification.includes(student.student_identification)
      )
    }

    // Filter by year level
    if (filters.year_level.length > 0) {
      result = result.filter(student => 
        filters.year_level.includes(student.year_level)
      )
    }

    // Filter by status
    if (filters.status.length > 0) {
      result = result.filter(student => 
        filters.status.includes(student.status)
      )
    }

    // Filter by GPA range
    result = result.filter(student =>
      student.gpa >= filters.gpa_min && student.gpa <= filters.gpa_max
    )

    // Filter by violations
    result = result.filter(student =>
      student.violations_count >= filters.violations_min && 
      student.violations_count <= filters.violations_max
    )

    // Filter by attendance rate
    result = result.filter(student =>
      student.attendance_rate >= filters.attendance_min && 
      student.attendance_rate <= filters.attendance_max
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
      attendance_max: 100
    })
    setSearchTerm('')
  }

  return (
    <div className="student-dashboard">
      <div className="dashboard-header">
        <div className="header-left">
          <h1>Student Dashboard</h1>
          <p className="subtitle">Comprehensive student management and profiling system</p>
        </div>
        <div className="header-right">
          {studentData && (
            <div className="user-info">
              <span className="user-label">Logged in as:</span>
              <span className="user-id">{studentData.studentNumber}</span>
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

      <div className="dashboard-container">
        <aside className="filters-sidebar">
          <FilterPanel 
            filters={filters} 
            onFilterChange={handleFilterChange}
            onReset={handleResetFilters}
          />
        </aside>

        <main className="dashboard-content">
          <div className="content-header">
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

          {filteredAndSortedStudents.length > 0 ? (
            viewMode === 'table' ? (
              <StudentTable 
                students={filteredAndSortedStudents}
                sortConfig={sortConfig}
                onSort={handleSort}
              />
            ) : (
              <StudentGrid students={filteredAndSortedStudents} />
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
      </div>
    </div>
  )
}

// Grid view component
function StudentGrid({ students }) {
  return (
    <div className="student-grid">
      {students.map(student => (
        <div key={student.student_id} className="student-card">
          <div className="card-header">
            <h3>{student.first_name} {student.last_name}</h3>
            <span className={`status-badge status-${student.status.toLowerCase()}`}>
              {student.status}
            </span>
          </div>
          
          <div className="card-body">
            <p><strong>Student #:</strong> {student.student_number}</p>
            <p><strong>Email:</strong> {student.email}</p>
            <p><strong>Program:</strong> {student.program_name}</p>
            <p><strong>Year Level:</strong> {student.year_level}</p>
            
            <div className="card-stats">
              <div className="stat">
                <span className="stat-label">GPA</span>
                <span className="stat-value">{student.gpa.toFixed(2)}</span>
              </div>
              <div className="stat">
                <span className="stat-label">Attendance</span>
                <span className="stat-value">{student.attendance_rate}%</span>
              </div>
              <div className="stat">
                <span className="stat-label">Violations</span>
                <span className="stat-value">{student.violations_count}</span>
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

export default StudentDashboard
