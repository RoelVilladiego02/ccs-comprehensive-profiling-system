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
    // Guard: only fetch if we have a valid student_id
    if (!userData || !userData.student_id) {
      setError('Student ID not found. Please log in again.')
      setLoading(false)
      return
    }

    const shouldFetch = activeSection === 'profile' || activeSection === 'courses' || activeSection === 'grades' || 
        activeSection === 'academic-history' || activeSection === 'activities' || 
        activeSection === 'violations' || activeSection === 'skills' || activeSection === 'affiliations'
    
    if (shouldFetch) {
      fetchStudentProfile()
    }
  }, [userData?.student_id, activeSection])

  const fetchStudentProfile = async () => {
    // Guard: ensure student_id exists
    if (!userData?.student_id) {
      setError('Student ID is required. Please log in again.')
      setLoading(false)
      return
    }

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
      setError('Failed to load student profile. ' + (err.response?.data?.message || err.message))
      console.error('Profile fetch error:', err)
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
                  <section className="profile-section">
                    <h2>My Courses</h2>
                    {currentCourses && currentCourses.length > 0 ? (
                      <div className="courses-table">
                        <table>
                          <thead>
                            <tr>
                              <th>Course Code</th>
                              <th>Course Title</th>
                              <th>Instructor</th>
                              <th>Schedule</th>
                              <th>Room</th>
                            </tr>
                          </thead>
                          <tbody>
                            {currentCourses.map(course => (
                              <tr key={course.class_id}>
                                <td>{course.course_code}</td>
                                <td>{course.course_title}</td>
                                <td>{course.faculty || 'N/A'}</td>
                                <td>
                                  {course.schedule_day ? (
                                    <>
                                      {course.schedule_day}
                                      {course.schedule_time && ` - ${course.schedule_time}`}
                                    </>
                                  ) : (
                                    'TBA'
                                  )}
                                </td>
                                <td>{course.room || 'TBA'}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div style={{ 
                        background: '#f5f5f5', 
                        padding: '40px 20px', 
                        borderRadius: '8px', 
                        textAlign: 'center',
                        color: '#666',
                        border: '1px dashed #ddd'
                      }}>
                        <p>You are not currently enrolled in any courses.</p>
                        <p style={{ fontSize: '0.9rem', color: '#999' }}>
                          Contact your academic advisor to enroll in courses for this semester.
                        </p>
                      </div>
                    )}
                  </section>
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

              {activeSection === 'academic-history' && (
                <div className="profile-content">
                  <section className="profile-section">
                    <h2>Academic History</h2>
                    {profileData?.academic_history && profileData.academic_history.length > 0 ? (
                      <div className="history-list">
                        {profileData.academic_history.map(history => (
                          <div key={history.academic_id} className="history-item">
                            <div className="history-header">
                              <h3>{history.school_name || 'School Name N/A'}</h3>
                              <span className="graduation-year">Level: {history.academic_level || 'N/A'}</span>
                            </div>
                            <div className="history-details">
                              <div className="detail-row">
                                <span className="label">Program/Course:</span>
                                <span className="value">{history.program_course || 'N/A'}</span>
                              </div>
                              <div className="detail-row">
                                <span className="label">GPA:</span>
                                <span className="value">{history.gpa ? history.gpa.toFixed(2) : 'N/A'}</span>
                              </div>
                              <div className="detail-row">
                                <span className="label">Honors/Awards:</span>
                                <span className="value">{history.honors_awards || 'None'}</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="empty-message">No academic history records found.</p>
                    )}
                  </section>
                </div>
              )}

              {activeSection === 'activities' && (
                <div className="profile-content">
                  <section className="profile-section">
                    <h2>Non-Academic Activities</h2>
                    {profileData?.non_academic_history && profileData.non_academic_history.length > 0 ? (
                      <div className="activities-list">
                        {profileData.non_academic_history.map(activity => (
                          <div key={activity.nonacad_id} className="activity-item">
                            <div className="activity-header">
                              <h3>{activity.activity_name}</h3>
                              <span className={`activity-type activity-type-${activity.activity_type?.toLowerCase()}`}>
                                {activity.activity_type}
                              </span>
                            </div>
                            <div className="activity-details">
                              <div className="detail-row">
                                <span className="label">Organization:</span>
                                <span className="value">{activity.organization || 'N/A'}</span>
                              </div>
                              <div className="detail-row">
                                <span className="label">Role/Position:</span>
                                <span className="value">{activity.role_position || 'N/A'}</span>
                              </div>
                              <div className="detail-row">
                                <span className="label">Description:</span>
                                <span className="value">{activity.description || 'N/A'}</span>
                              </div>
                              <div className="detail-row">
                                <span className="label">Achievement:</span>
                                <span className="value">{activity.achievement || 'None'}</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="empty-message">No non-academic activities recorded.</p>
                    )}
                  </section>
                </div>
              )}

              {activeSection === 'violations' && (
                <div className="profile-content">
                  <section className="profile-section">
                    <h2>Violations</h2>
                    {profileData?.violations && profileData.violations.length > 0 ? (
                      <div className="violations-list">
                        {profileData.violations.map(violation => (
                          <div key={violation.violation_id} className={`violation-item violation-status-${violation.status?.toLowerCase()?.replace(/\s+/g, '-')}`}>
                            <div className="violation-header">
                              <h3>{violation.violation_type}</h3>
                              <span className={`violation-status violation-${violation.status?.toLowerCase()?.replace(/\s+/g, '-')}`}>
                                {violation.status}
                              </span>
                            </div>
                            <div className="violation-details">
                              <div className="detail-row">
                                <span className="label">Date:</span>
                                <span className="value">{violation.violation_date || 'N/A'}</span>
                              </div>
                              <div className="detail-row">
                                <span className="label">Offense Level:</span>
                                <span className="value">{violation.offense_level || 'N/A'}</span>
                              </div>
                              <div className="detail-row">
                                <span className="label">Description:</span>
                                <span className="value">{violation.violation_description || 'N/A'}</span>
                              </div>
                              {violation.reported_by && (
                                <div className="detail-row">
                                  <span className="label">Reported By:</span>
                                  <span className="value">{violation.reported_by}</span>
                                </div>
                              )}
                              {violation.action_taken && (
                                <div className="detail-row">
                                  <span className="label">Action Taken:</span>
                                  <span className="value">{violation.action_taken}</span>
                                </div>
                              )}
                              {violation.penalty && (
                                <div className="detail-row">
                                  <span className="label">Penalty:</span>
                                  <span className="value">{violation.penalty}</span>
                                </div>
                              )}
                              {violation.resolution_date && (
                                <div className="detail-row">
                                  <span className="label">Resolution Date:</span>
                                  <span className="value">{violation.resolution_date}</span>
                                </div>
                              )}
                              {violation.remarks && (
                                <div className="detail-row">
                                  <span className="label">Remarks:</span>
                                  <span className="value">{violation.remarks}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="empty-message">No violations on record.</p>
                    )}
                  </section>
                </div>
              )}

              {activeSection === 'skills' && (
                <div className="profile-content">
                  <section className="profile-section">
                    <h2>Skills</h2>
                    {profileData?.skills && profileData.skills.length > 0 ? (
                      <div className="skills-grid">
                        {profileData.skills.map(skill => (
                          <div key={skill.skill_id} className="skill-card">
                            <div className="skill-header">
                              <h3>{skill.skill_name}</h3>
                              <span className="skill-category">{skill.skill_category}</span>
                            </div>
                            <div className="skill-details">
                              <div className="detail-row">
                                <span className="label">Proficiency:</span>
                                <span className={`proficiency-badge proficiency-${skill.proficiency_level?.toLowerCase()}`}>
                                  {skill.proficiency_level}
                                </span>
                              </div>
                              <div className="detail-row">
                                <span className="label">Years of Experience:</span>
                                <span className="value">{skill.years_experience || '0'}</span>
                              </div>
                              {skill.description && (
                                <div className="detail-row">
                                  <span className="label">Description:</span>
                                  <span className="value">{skill.description}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="empty-message">No skills listed.</p>
                    )}
                  </section>
                </div>
              )}

              {activeSection === 'affiliations' && (
                <div className="profile-content">
                  <section className="profile-section">
                    <h2>Affiliations (Organizations & Sports)</h2>
                    {profileData?.affiliations && profileData.affiliations.length > 0 ? (
                      <div className="affiliations-list">
                        {profileData.affiliations.map(affiliation => (
                          <div key={affiliation.affiliation_id} className="affiliation-item">
                            <div className="affiliation-header">
                              <h3>{affiliation.organization_name}</h3>
                              <span className={`org-type org-type-${affiliation.organization_type?.toLowerCase()?.replace(/\s+/g, '-')}`}>
                                {affiliation.organization_type}
                              </span>
                            </div>
                            <div className="affiliation-details">
                              <div className="detail-row">
                                <span className="label">Position/Role:</span>
                                <span className="value">{affiliation.position_role || 'Member'}</span>
                              </div>
                              {affiliation.achievements && (
                                <div className="detail-row">
                                  <span className="label">Achievements:</span>
                                  <span className="value">{affiliation.achievements}</span>
                                </div>
                              )}
                              {affiliation.description && (
                                <div className="detail-row">
                                  <span className="label">Description:</span>
                                  <span className="value">{affiliation.description}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="empty-message">No affiliations recorded.</p>
                    )}
                  </section>
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

        /* Academic History Styles */
        .history-list {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .history-item {
          background: var(--color-gray-50);
          border-left: 4px solid #3b82f6;
          padding: 16px;
          border-radius: 4px;
        }

        .history-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
        }

        .history-header h3 {
          font-size: 1rem;
          font-weight: 600;
          color: var(--color-gray-900);
          margin: 0;
        }

        .graduation-year {
          background: #dbeafe;
          color: #1e40af;
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 0.85rem;
          font-weight: 600;
        }

        .history-details {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 12px;
        }

        /* Activities Styles */
        .activities-list {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .activity-item {
          background: var(--color-gray-50);
          border-left: 4px solid #10b981;
          padding: 16px;
          border-radius: 4px;
        }

        .activity-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
        }

        .activity-header h3 {
          font-size: 1rem;
          font-weight: 600;
          color: var(--color-gray-900);
          margin: 0;
        }

        .activity-type {
          display: inline-block;
          padding: 4px 12px;
          border-radius: 4px;
          font-size: 0.8rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .activity-type-award {
          background: #fef3c7;
          color: #92400e;
        }

        .activity-type-competition {
          background: #dbeafe;
          color: #1e40af;
        }

        .activity-type-volunteer {
          background: #dcfce7;
          color: #166534;
        }

        .activity-type-leadership {
          background: #fad5e4;
          color: #831843;
        }

        .activity-details {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 12px;
        }

        /* Violations Styles */
        .violations-list {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .violation-item {
          background: var(--color-gray-50);
          border-left: 4px solid #ef4444;
          padding: 16px;
          border-radius: 4px;
        }

        .violation-item.violation-status-resolved {
          border-left-color: #10b981;
          background: #f0fdf4;
        }

        .violation-item.violation-status-pending {
          border-left-color: #f59e0b;
          background: #fffbeb;
        }

        .violation-item.violation-status-under-investigation {
          border-left-color: #8b5cf6;
          background: #faf5ff;
        }

        .violation-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
        }

        .violation-header h3 {
          font-size: 1rem;
          font-weight: 600;
          color: var(--color-gray-900);
          margin: 0;
        }

        .violation-status {
          display: inline-block;
          padding: 4px 12px;
          border-radius: 4px;
          font-size: 0.8rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .violation-status.violation-resolved {
          background: #dcfce7;
          color: #166534;
        }

        .violation-status.violation-pending {
          background: #fef3c7;
          color: #92400e;
        }

        .violation-status.violation-under-investigation {
          background: #f3e8ff;
          color: #6b21a8;
        }

        .violation-details {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 12px;
        }

        /* Skills Styles */
        .skills-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 16px;
        }

        .skill-card {
          background: var(--color-gray-50);
          border: 1px solid var(--color-gray-200);
          border-radius: 8px;
          padding: 16px;
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }

        .skill-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }

        .skill-header {
          margin-bottom: 12px;
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 8px;
        }

        .skill-header h3 {
          font-size: 1rem;
          font-weight: 600;
          color: var(--color-gray-900);
          margin: 0;
          flex: 1;
        }

        .skill-category {
          background: #e0e7ff;
          color: #3730a3;
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 0.75rem;
          font-weight: 600;
          white-space: nowrap;
          text-transform: uppercase;
          letter-spacing: 0.3px;
        }

        .skill-details {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .proficiency-badge {
          display: inline-block;
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 0.8rem;
          font-weight: 600;
          text-transform: uppercase;
          width: fit-content;
        }

        .proficiency-badge.proficiency-beginner {
          background: #fed7aa;
          color: #7c2d12;
        }

        .proficiency-badge.proficiency-intermediate {
          background: #fbbf24;
          color: #78350f;
        }

        .proficiency-badge.proficiency-advanced {
          background: #86efac;
          color: #15803d;
        }

        .proficiency-badge.proficiency-expert {
          background: #60a5fa;
          color: #1e3a8a;
        }

        /* Affiliations Styles */
        .affiliations-list {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .affiliation-item {
          background: var(--color-gray-50);
          border-left: 4px solid #8b5cf6;
          padding: 16px;
          border-radius: 4px;
        }

        .affiliation-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
        }

        .affiliation-header h3 {
          font-size: 1rem;
          font-weight: 600;
          color: var(--color-gray-900);
          margin: 0;
        }

        .org-type {
          display: inline-block;
          padding: 4px 12px;
          border-radius: 4px;
          font-size: 0.8rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .org-type-organization {
          background: #dbeafe;
          color: #1e40af;
        }

        .org-type-sports {
          background: #dcfce7;
          color: #166534;
        }

        .org-type-club {
          background: #fad5e4;
          color: #831843;
        }

        .org-type-fraternity {
          background: #fed7aa;
          color: #7c2d12;
        }

        .affiliation-details {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 12px;
        }

        /* Common Detail Row Styles */
        .detail-row {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .detail-row .label {
          font-size: 0.8rem;
          font-weight: 600;
          color: var(--color-gray-600);
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .detail-row .value {
          font-size: 0.9rem;
          color: var(--color-gray-900);
          font-weight: 500;
        }

        /* Empty Message */
        .empty-message {
          text-align: center;
          padding: 40px 20px;
          color: var(--color-gray-500);
          font-style: italic;
          font-size: 1rem;
        }
      `}

    </style>
    </div>
  )
}

export default StudentDashboard
