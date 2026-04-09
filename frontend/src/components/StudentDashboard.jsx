import { useState, useEffect } from 'react'
import '../styles/StudentDashboard.css'
import { studentProfileAPI } from '../services/api'
import Sidebar from './Sidebar'

function StudentDashboard({ userData, onLogout }) {
  const [activeSection, setActiveSection] = useState('profile')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [profileData, setProfileData] = useState(null)
  const [academicPerformance, setAcademicPerformance] = useState(null)
  const [currentCourses, setCurrentCourses] = useState([])

  // Fetch student's own profile data when activeSection changes
  useEffect(() => {
    if (activeSection === 'profile' || activeSection === 'courses' || activeSection === 'grades') {
      fetchStudentProfile()
    }
  }, [userData, activeSection])

  const fetchStudentProfile = async () => {
    try {
      setLoading(true)
      setError('')
      
      // Get profile data
      const profileRes = await studentProfileAPI.getProfile(userData.student_id)
      if (profileRes.data.success) {
        console.log('Profile data received:', profileRes.data.data)
        setProfileData(profileRes.data.data)
      }

      // Get academic performance
      const perfRes = await studentProfileAPI.getAcademicPerformance(userData.student_id)
      if (perfRes.data.success) {
        setAcademicPerformance(perfRes.data.data)
      }

      // Get current courses
      const coursesRes = await studentProfileAPI.getCurrentCourses(userData.student_id)
      if (coursesRes.data.success) {
        setCurrentCourses(coursesRes.data.data || [])
      }
    } catch (err) {
      setError('Failed to load student profile')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="dashboard-layout">
      <Sidebar 
        userRole="student" 
        userData={userData} 
        onLogout={onLogout}
        activeSection={activeSection}
        onSectionChange={setActiveSection}
      />
      <div className="dashboard-content">
        <div className="student-profile-container">
          {error && (
            <div className="error-message" style={{ margin: '20px', padding: '12px', background: '#fee', border: '1px solid #fcc', borderRadius: '4px', color: '#c00' }}>
              {error}
            </div>
          )}

          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
              <p>Loading...</p>
            </div>
          ) : (
            <>
              {activeSection === 'profile' && (
                <div className="profile-content">
            {/* Student Info */}
            <section className="profile-section">
              <h2>Personal Information</h2>
              <div className="info-grid">
                <div className="info-item">
                  <span className="label">Full Name:</span>
                  <span className="value">
                    {profileData?.student?.first_name} {profileData?.student?.last_name}
                  </span>
                </div>
                <div className="info-item">
                  <span className="label">Student Number:</span>
                  <span className="value">{userData.student_number}</span>
                </div>
                <div className="info-item">
                  <span className="label">Email:</span>
                  <span className="value">{userData.email}</span>
                </div>
                <div className="info-item">
                  <span className="label">Status:</span>
                  <span className={`status-badge status-${String(profileData?.student?.student_identification || 'N/A').toLowerCase()}`}>
                    {profileData?.student?.student_identification || 'Not Available'}
                  </span>
                </div>
              </div>
            </section>

            {/* Profile Data */}
            {profileData && (
              <section className="profile-section">
                <h2>Additional Information</h2>
                <div className="info-grid">
                  <div className="info-item">
                    <span className="label">Gender:</span>
                    <span className="value">{profileData.student?.gender || 'N/A'}</span>
                  </div>
                  <div className="info-item">
                    <span className="label">Phone:</span>
                    <span className="value">{profileData.student?.phone_number || 'N/A'}</span>
                  </div>
                  <div className="info-item">
                    <span className="label">Curriculum:</span>
                    <span className="value">{profileData.student?.curriculum || 'N/A'}</span>
                  </div>
                  <div className="info-item">
                    <span className="label">GPA:</span>
                    <span className="value">{profileData.academic_summary?.gpa?.toFixed(2) || '0.00'}</span>
                  </div>
                </div>
              </section>
            )}
                </div>
              )}

              {activeSection === 'courses' && (
                <div className="profile-content">
            {/* Current Courses */}
            {currentCourses.length > 0 && (
              <section className="profile-section">
                <h2>Current Courses</h2>
                <div className="courses-table">
                  <table>
                    <thead>
                      <tr>
                        <th>Course Code</th>
                        <th>Course Title</th>
                        <th>Instructor</th>
                        <th>Time</th>
                        <th>Room</th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentCourses.map(course => (
                        <tr key={course.class_id}>
                          <td>{course.course_code}</td>
                          <td>{course.course_title}</td>
                          <td>{course.faculty}</td>
                          <td>{course.schedule_time || '-'}</td>
                          <td>{course.room || '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            )}
                </div>
              )}

              {activeSection === 'grades' && (
                <div className="profile-content">
            {/* Academic Performance */}
            {profileData && (
              <section className="profile-section">
                <h2>Academic Performance</h2>
                <div className="performance-grid">
                  <div className="performance-card">
                    <span className="label">GPA</span>
                    <span className="value">{profileData.academic_summary?.gpa?.toFixed(2) || '0.00'}</span>
                  </div>
                  <div className="performance-card">
                    <span className="label">Attendance Rate</span>
                    <span className="value">{profileData.attendance_summary?.attendance_rate || 0}%</span>
                  </div>
                  <div className="performance-card">
                    <span className="label">Total Violations</span>
                    <span className="value">{profileData.violations_summary?.total_violations || 0}</span>
                  </div>
                  <div className="performance-card">
                    <span className="label">Current Courses</span>
                    <span className="value">{profileData.academic_summary?.current_courses || 0}</span>
                  </div>
                </div>
              </section>
            )}
                </div>
              )}
            </>
        )}
      </div>
    </div>

    <style>{`
        .student-profile-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 30px 20px;
          background: var(--color-light-gray);
          min-height: calc(100vh - 200px);
        }

        .profile-section {
          background: var(--color-white);
          border-radius: 8px;
          border: 1px solid var(--color-gray-200);
          padding: 24px;
          margin-bottom: 24px;
          box-shadow: var(--shadow-sm);
        }

        .profile-section h2 {
          font-size: 1.3rem;
          font-weight: 600;
          color: var(--color-gray-900);
          margin-bottom: 20px;
          letter-spacing: -0.5px;
        }

        .info-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 20px;
        }

        .info-item {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .info-item .label {
          font-size: 0.85rem;
          font-weight: 600;
          color: var(--color-gray-600);
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .info-item .value {
          font-size: 0.95rem;
          color: var(--color-gray-900);
          font-weight: 500;
        }

        .performance-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 16px;
        }

        .performance-card {
          background: var(--color-gray-50);
          border: 1px solid var(--color-gray-200);
          border-radius: 6px;
          padding: 16px;
          display: flex;
          flex-direction: column;
          gap: 8px;
          text-align: center;
        }

        .performance-card .label {
          font-size: 0.85rem;
          font-weight: 600;
          color: var(--color-gray-600);
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .performance-card .value {
          font-size: 1.8rem;
          font-weight: 700;
          color: var(--color-gray-900);
        }

        .courses-table {
          overflow-x: auto;
        }

        .courses-table table {
          width: 100%;
          border-collapse: collapse;
        }

        .courses-table th {
          background: var(--color-gray-100);
          padding: 12px 16px;
          text-align: left;
          font-weight: 600;
          font-size: 0.85rem;
          color: var(--color-gray-900);
          text-transform: uppercase;
          letter-spacing: 0.5px;
          border-bottom: 1px solid var(--color-gray-200);
        }

        .courses-table td {
          padding: 12px 16px;
          border-bottom: 1px solid var(--color-gray-200);
          color: var(--color-gray-700);
          font-size: 0.9rem;
        }

        .courses-table tr:hover {
          background: var(--color-gray-50);
        }

        .status-badge {
          display: inline-block;
          padding: 4px 12px;
          border-radius: 4px;
          font-size: 0.8rem;
          font-weight: 600;
          text-transform: capitalize;
        }

        .status-badge.status-enrolled {
          background: #dcfce7;
          color: #166534;
        }

        .status-badge.status-graduated {
          background: #e5e7eb;
          color: #374151;
        }

        .status-badge.status-on-leave {
          background: #fef3c7;
          color: #92400e;
        }

        .status-badge.status-dropped {
          background: #fee2e2;
          color: #7f1d1d;
        }
      `}</style>
    </div>
  )
}

export default StudentDashboard

