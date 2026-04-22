import { useState, useEffect } from 'react'
import '../styles/Module.css'
import { courseAPI } from '../services/api'

function InstructionModule({ userData, onLogout }) {
  const [activeTab, setActiveTab] = useState('syllabus')
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (activeTab === 'syllabus') {
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
    if (loading && activeTab === 'syllabus') {
      return (
        <div className="module-content">
          <h2>Syllabus Management</h2>
          <p style={{ textAlign: 'center', color: '#999' }}>Loading...</p>
        </div>
      )
    }

    if (error && activeTab === 'syllabus') {
      return (
        <div className="module-content">
          <h2>Syllabus Management</h2>
          <p style={{ color: '#c33', background: '#fee', padding: '10px', borderRadius: '4px' }}>{error}</p>
        </div>
      )
    }

    switch (activeTab) {
      case 'syllabus':
        return (
          <div className="module-content">
            <h2>Syllabus Management</h2>
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
                          <span className="status-badge status-active">Active</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )
      case 'lessons':
        return (
          <div className="module-content">
            <h2>Lesson Management</h2>
            <div style={{ background: '#f5f5f5', padding: '20px', borderRadius: '8px', marginTop: '20px', textAlign: 'center' }}>
              <p style={{ color: '#999', marginBottom: '15px' }}>Lesson planning and management</p>
              <p style={{ color: '#666', fontSize: '0.9rem' }}>Create, organize, and manage lesson plans for your courses.</p>
            </div>
          </div>
        )
      case 'curriculum':
        return (
          <div className="module-content">
            <h2>Curriculum Management</h2>
            <div style={{ background: '#f5f5f5', padding: '20px', borderRadius: '8px', marginTop: '20px', textAlign: 'center' }}>
              <p style={{ color: '#999', marginBottom: '15px' }}>Curriculum planning and organization</p>
              <p style={{ color: '#666', fontSize: '0.9rem' }}>Manage curriculum requirements and program structures.</p>
            </div>
          </div>
        )
      default:
        return null
    }
  }

  return (
    <div className="student-dashboard">
      <div className="dashboard-header">
        <div className="header-left">
          <h1>Instruction Module</h1>
          <p className="subtitle">Course syllabus and curriculum management</p>
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
          <h3>Instruction Module</h3>
          <div className="tab-navigation">
            <button
              className={`tab-btn ${activeTab === 'syllabus' ? 'active' : ''}`}
              onClick={() => setActiveTab('syllabus')}
            >
              📚 Syllabus
            </button>
            <button
              className={`tab-btn ${activeTab === 'lessons' ? 'active' : ''}`}
              onClick={() => setActiveTab('lessons')}
            >
              📖 Lessons
            </button>
            <button
              className={`tab-btn ${activeTab === 'curriculum' ? 'active' : ''}`}
              onClick={() => setActiveTab('curriculum')}
            >
              🎓 Curriculum
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

export default InstructionModule