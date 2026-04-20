import { useState, useEffect } from 'react'
import '../styles/Module.css'
import { courseAPI } from '../services/api'
import AdminClassManagement from './AdminClassManagement'

function SchedulingModule({ userData, onLogout }) {
  const [activeTab, setActiveTab] = useState('course')
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (activeTab === 'course') {
      fetchCourses()
    }
  }, [activeTab])

  const fetchCourses = async () => {
    try {
      setLoading(true)
      setError('')
      const response = await courseAPI.getAll()
      if (response.data.success || response.data.data) {
        setCourses(response.data.data || [])
      } else {
        setError('Failed to load courses')
      }
    } catch (err) {
      console.error('Failed to fetch courses:', err)
      setError('Error loading courses. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const renderContent = () => {
    if (loading) {
      return (
        <div className="module-content">
          <h2>{activeTab === 'course' ? 'Course Management' : activeTab === 'section' ? 'Section Management' : activeTab === 'rooms' ? 'Room Management' : activeTab === 'lab' ? 'Lab Management' : 'Faculty Management'}</h2>
          <p style={{ textAlign: 'center', color: '#999' }}>Loading...</p>
        </div>
      )
    }

    if (error && activeTab === 'course') {
      return (
        <div className="module-content">
          <h2>Course Management</h2>
          <p style={{ color: '#c33', background: '#fee', padding: '10px', borderRadius: '4px' }}>{error}</p>
        </div>
      )
    }

    switch (activeTab) {
      case 'course':
        return (
          <div className="module-content">
            <h2>Course Management</h2>
            {courses.length === 0 ? (
              <div style={{ background: '#f5f5f5', padding: '20px', borderRadius: '8px', marginTop: '20px' }}>
                <p style={{ color: '#999' }}>No courses available</p>
              </div>
            ) : (
              <div className="data-table">
                <table>
                  <thead>
                    <tr>
                      <th>Course Code</th>
                      <th>Course Name</th>
                      <th>Department</th>
                      <th>Credits</th>
                      <th>Units</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {courses.map(course => (
                      <tr key={course.id || course.course_id}>
                        <td>{course.course_code}</td>
                        <td>{course.course_name}</td>
                        <td>{course.department || 'N/A'}</td>
                        <td>{course.credits || '-'}</td>
                        <td>{course.units || '-'}</td>
                        <td>
                          <span className="status-badge status-active">
                            Active
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )

      case 'section':
        return <AdminClassManagement userData={userData} onLogout={onLogout} />

      case 'rooms':
        return (
          <div className="module-content">
            <h2>Room Management</h2>
            <div style={{ background: '#f5f5f5', padding: '20px', borderRadius: '8px', marginTop: '20px' }}>
              <p style={{ color: '#999' }}>Room management coming soon</p>
            </div>
          </div>
        )

      case 'lab':
        return (
          <div className="module-content">
            <h2>Laboratory Management</h2>
            <div style={{ background: '#f5f5f5', padding: '20px', borderRadius: '8px', marginTop: '20px' }}>
              <p style={{ color: '#999' }}>Laboratory management coming soon</p>
            </div>
          </div>
        )

      case 'faculty':
        return (
          <div className="module-content">
            <h2>Faculty Management</h2>
            <div style={{ background: '#f5f5f5', padding: '20px', borderRadius: '8px', marginTop: '20px' }}>
              <p style={{ color: '#999' }}>Faculty management coming soon. Backend API available at /api/faculty</p>
            </div>
          </div>
        )

      default:
        return <div className="module-content"><p>Select a tab</p></div>
    }
  }

  return (
    <div className="student-dashboard">
      <div className="dashboard-header">
        <div className="header-left">
          <h1>Scheduling Module</h1>
          <p className="subtitle">Course, section, and resource scheduling</p>
        </div>
        <div className="header-right">
          {userData && (
            <div className="user-info">
              <span className="user-label">Logged in as:</span>
              <span className="user-id">{userData.name}</span>
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

      <div className="module-container">
        <div className="module-sidebar">
          <h3>Scheduling Module</h3>
          <div className="tab-navigation">
            <button
              className={`tab-btn ${activeTab === 'course' ? 'active' : ''}`}
              onClick={() => setActiveTab('course')}
            >
              📚 Courses
            </button>
            <button
              className={`tab-btn ${activeTab === 'section' ? 'active' : ''}`}
              onClick={() => setActiveTab('section')}
            >
              📋 Sections
            </button>
            <button
              className={`tab-btn ${activeTab === 'rooms' ? 'active' : ''}`}
              onClick={() => setActiveTab('rooms')}
            >
              🏛️ Rooms
            </button>
            <button
              className={`tab-btn ${activeTab === 'lab' ? 'active' : ''}`}
              onClick={() => setActiveTab('lab')}
            >
              🔬 Labs
            </button>
            <button
              className={`tab-btn ${activeTab === 'faculty' ? 'active' : ''}`}
              onClick={() => setActiveTab('faculty')}
            >
              👨‍🏫 Faculty
            </button>
          </div>
        </div>

        <main className="module-content">
          {renderContent()}
        </main>
      </div>
    </div>
  )
}

export default SchedulingModule