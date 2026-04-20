import { useState, useEffect, useCallback } from 'react'
import '../styles/FacultyStudentsView.css'
import { enrollmentAPI } from '../services/api'

function FacultyStudentsView({ classes }) {
  const [selectedClassId, setSelectedClassId] = useState(null)
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')

  const fetchClassStudents = useCallback(async () => {
    try {
      setLoading(true)
      setError('')
      const response = await enrollmentAPI.getClassEnrollments(selectedClassId)
      if (response.data.success) {
        setStudents(response.data.data || [])
      } else {
        setError('Failed to load students')
      }
    } catch (err) {
      console.error('Failed to fetch students:', err)
      setError('Error loading student list')
    } finally {
      setLoading(false)
    }
  }, [selectedClassId])

  // Fetch students when class is selected
  useEffect(() => {
    if (selectedClassId) {
      fetchClassStudents()
    } else {
      setStudents([])
    }
  }, [selectedClassId, fetchClassStudents])

  const selectedClass = classes.find(c => c.class_id === selectedClassId)

  // Filter students by search term
  const filteredStudents = students.filter(enrollment => {
    const student = enrollment.student
    const searchLower = searchTerm.toLowerCase()
    return (
      student.first_name.toLowerCase().includes(searchLower) ||
      student.last_name.toLowerCase().includes(searchLower) ||
      student.email.toLowerCase().includes(searchLower) ||
      student.student_number.includes(searchLower)
    )
  })

  return (
    <div className="faculty-students-view">
      <div className="students-container">
        {/* Class Selection */}
        <div className="class-selector">
          <h3>Select a Class</h3>
          {classes.length === 0 ? (
            <p className="no-classes">No classes assigned</p>
          ) : (
            <div className="classes-list">
              {classes.map(cls => (
                <button
                  key={cls.class_id}
                  className={`class-card ${selectedClassId === cls.class_id ? 'active' : ''}`}
                  onClick={() => setSelectedClassId(cls.class_id)}
                >
                  <div className="class-info">
                    <p className="course-code">{cls.course?.course_code}</p>
                    <p className="course-title">{cls.course?.course_title}</p>
                    <p className="section-info">Section {cls.section} • {cls.enrolled_students}/{cls.max_students}</p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Students List */}
        {selectedClassId && (
          <div className="students-section">
            {selectedClass && (
              <div className="class-header">
                <h2>{selectedClass.course?.course_code}: {selectedClass.course?.course_title}</h2>
                <p className="section-label">Section {selectedClass.section}</p>
                <p className="enrollment-stats">Total Enrolled: {selectedClass.enrolled_students}/{selectedClass.max_students}</p>
              </div>
            )}

            {error && (
              <div className="error-message">
                {error}
              </div>
            )}

            {/* Search Bar */}
            <div className="search-bar">
              <input
                type="text"
                placeholder="Search by name, email, or student number..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
              <span className="search-icon">🔍</span>
            </div>

            {loading ? (
              <div className="loading">Loading students...</div>
            ) : filteredStudents.length === 0 ? (
              <div className="no-students">
                {searchTerm ? 'No students match your search' : 'No students enrolled in this class'}
              </div>
            ) : (
              <div className="students-table-container">
                <table className="students-table">
                  <thead>
                    <tr>
                      <th>Student Number</th>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Status</th>
                      <th>Enrollment Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredStudents.map((enrollment) => (
                      <tr key={enrollment.enrollment_id}>
                        <td className="student-number">
                          {enrollment.student?.student_number}
                        </td>
                        <td className="student-name">
                          <span className="name">{enrollment.student?.first_name} {enrollment.student?.last_name}</span>
                        </td>
                        <td className="student-email">
                          {enrollment.student?.email}
                        </td>
                        <td className="enrollment-status">
                          <span className={`status-badge ${enrollment.enrollment_status?.toLowerCase()}`}>
                            {enrollment.enrollment_status}
                          </span>
                        </td>
                        <td className="enrollment-date">
                          {new Date(enrollment.enrollment_date).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default FacultyStudentsView
