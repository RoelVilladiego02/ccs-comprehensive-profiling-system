import { useState, useMemo, useEffect } from 'react'
import '../styles/StudentDashboard.css'
import StudentTable from './StudentTable'
import FilterPanel from './FilterPanel'
import SearchBar from './SearchBar'
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
        </div>
      </div>
    </div>
  )
}

export default StaffDashboard
