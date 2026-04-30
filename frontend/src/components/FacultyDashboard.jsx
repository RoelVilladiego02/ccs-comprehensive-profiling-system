import { useState, useEffect } from 'react'
import '../styles/FacultyDashboard.css'
import Sidebar from './Sidebar'
import FacultyClassTable from './FacultyClassTable'
import FacultyStudentsView from './FacultyStudentsView'
import FacultyGradeManagement from './FacultyGradeManagement'
import FacultyAttendanceManagement from './FacultyAttendanceManagement'
import InstructionModule from './InstructionModule'
import EventsModule from './EventsModule'
import { classAPI } from '../services/api'

function FacultyDashboard({ userData, onLogout }) {
  const [activeSection, setActiveSection] = useState('dashboard')
  const [classes, setClasses] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [classesError, setClassesError] = useState('')
  const [classesLoading, setClassesLoading] = useState(false)
  const [classSort, setClassSort] = useState({
    field: 'course_code',
    direction: 'asc'
  })

  // Fetch classes data on component mount
  useEffect(() => {
    fetchClasses()
  }, [userData?.faculty_id])

  const fetchClasses = async () => {
    if (!userData?.faculty_id) {
      setError('Faculty information not available')
      setLoading(false)
      return
    }

    try {
      setClassesLoading(true)
      setClassesError('')
      const response = await classAPI.getByFaculty(userData.faculty_id)
      if (response.data.success) {
        setClasses(response.data.data || [])
      } else {
        setClassesError('Failed to load classes data')
      }
    } catch (err) {
      console.error('Failed to fetch classes:', err)
      setClassesError('Error loading classes data')
    } finally {
      setClassesLoading(false)
      setLoading(false)
    }
  }

  const handleClassSort = (field) => {
    setClassSort(prev => ({
      field,
      direction: prev.field === field && prev.direction === 'asc' ? 'desc' : 'asc'
    }))
  }

  // Calculate enrollment statistics
  const totalEnrollment = classes.reduce((sum, schoolClass) => sum + schoolClass.enrolled_students, 0)
  const totalCapacity = classes.reduce((sum, schoolClass) => sum + schoolClass.max_students, 0)

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
                <span className="stat-icon">📚</span>
                <h3>My Classes</h3>
                <p className="stat-value">{classes.length}</p>
              </div>
              <div className="stat-card">
                <span className="stat-icon">👥</span>
                <h3>Total Students</h3>
                <p className="stat-value">{totalEnrollment}</p>
              </div>
              <div className="stat-card">
                <span className="stat-icon">📊</span>
                <h3>Capacity Used</h3>
                <p className="stat-value">{totalCapacity > 0 ? Math.round((totalEnrollment / totalCapacity) * 100) : 0}%</p>
              </div>
              <div className="stat-card">
                <span className="stat-icon">✓</span>
                <h3>Active Classes</h3>
                <p className="stat-value">{classes.filter(c => c.class_status === 'Open').length}</p>
              </div>
            </div>
          </div>
        )}

        {activeSection === 'classes' && (
          <div className="section-content">
            <div className="section-header">
              <h2>My Classes</h2>
              <p className="section-subtitle">List of classes and sections you are teaching</p>
            </div>
            
            {classesError && (
              <div style={{ background: '#fee', padding: '15px', borderRadius: '4px', marginBottom: '20px', color: '#c33', border: '1px solid #fcc' }}>
                {classesError}
              </div>
            )}

            {classesLoading ? (
              <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
                Loading classes...
              </div>
            ) : (
              <div style={{ marginTop: '20px' }}>
                <FacultyClassTable 
                  classes={classes}
                  sortConfig={classSort}
                  onSort={handleClassSort}
                />
              </div>
            )}
          </div>
        )}

        {activeSection === 'students' && (
          <div className="section-content">
            <div className="section-header">
              <h2>View Students</h2>
              <p className="section-subtitle">View enrolled students in each of your classes</p>
            </div>
            <FacultyStudentsView classes={classes} />
          </div>
        )}

        {activeSection === 'grades' && (
          <div className="section-content">
            <div className="section-header">
              <h2>Grades Management</h2>
              <p className="section-subtitle">Record and manage student grades</p>
            </div>
            <FacultyGradeManagement classes={classes} />
          </div>
        )}

        {activeSection === 'attendance' && (
          <div className="section-content">
            <div className="section-header">
              <h2>Attendance Tracking</h2>
              <p className="section-subtitle">Track and record student attendance</p>
            </div>
            <FacultyAttendanceManagement classes={classes} />
          </div>
        )}

        {activeSection === 'instruction' && (
          <div style={{ padding: '0' }}>
            <InstructionModule userData={userData} onLogout={onLogout} />
          </div>
        )}

        {activeSection === 'events' && (
          <div style={{ padding: '0' }}>
            <EventsModule userData={userData} onLogout={onLogout} />
          </div>
        )}
      </div>
    </div>
  )
}

export default FacultyDashboard