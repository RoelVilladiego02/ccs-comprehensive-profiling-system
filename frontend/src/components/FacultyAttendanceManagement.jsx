import { useState, useEffect, useCallback } from 'react'
import '../styles/FacultyAttendanceManagement.css'
import { enrollmentAPI, attendanceAPI } from '../services/api'

function FacultyAttendanceManagement({ classes }) {
  const [selectedClassId, setSelectedClassId] = useState(null)
  const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().split('T')[0])
  const [students, setStudents] = useState([])
  const [attendance, setAttendance] = useState({})
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [changedStudents, setChangedStudents] = useState(new Set())

  const fetchClassData = useCallback(async () => {
    try {
      setLoading(true)
      setError('')
      const response = await enrollmentAPI.getClassEnrollments(selectedClassId)
      if (response.data.success) {
        setStudents(response.data.data || [])
        
        // Fetch attendance for this date
        const attendanceResponse = await attendanceAPI.getClassAttendanceByDate(selectedClassId, attendanceDate)
        if (attendanceResponse.data.success) {
          const attendanceMap = {}
          attendanceResponse.data.data.forEach(record => {
            attendanceMap[record.student_id] = record.status
          })
          setAttendance(attendanceMap)
        }
        setChangedStudents(new Set())
      } else {
        setError('Failed to load class data')
      }
    } catch (err) {
      console.error('Failed to fetch class data:', err)
      setError('Error loading class data')
    } finally {
      setLoading(false)
    }
  }, [selectedClassId, attendanceDate])

  useEffect(() => {
    if (selectedClassId) {
      fetchClassData()
    } else {
      setStudents([])
      setAttendance({})
      setChangedStudents(new Set())
    }
  }, [selectedClassId, attendanceDate, fetchClassData])

  const handleAttendanceChange = (studentId, status) => {
    setAttendance(prev => ({
      ...prev,
      [studentId]: status
    }))
    setChangedStudents(prev => new Set(prev).add(studentId))
  }

  const saveAttendance = async () => {
    if (changedStudents.size === 0) {
      setError('No changes to save')
      return
    }

    try {
      setError('')
      setSuccess('')

      const attendanceRecords = Array.from(changedStudents).map(studentId => ({
        student_id: studentId,
        class_id: selectedClassId,
        attendance_date: attendanceDate,
        status: attendance[studentId] || 'Absent'
      }))

      const response = await attendanceAPI.bulkRecord({
        records: attendanceRecords
      })

      if (response.data.success) {
        setSuccess(`Attendance saved for ${changedStudents.size} student(s)!`)
        setChangedStudents(new Set())
        setTimeout(() => setSuccess(''), 2000)
      } else {
        setError('Failed to save attendance')
      }
    } catch (err) {
      console.error('Failed to save attendance:', err)
      setError('Error saving attendance')
    }
  }

  const getAttendanceStatus = (studentId) => {
    return attendance[studentId] || 'Absent'
  }

  const selectedClass = classes.find(c => c.class_id === selectedClassId)

  const attendanceOptions = [
    { value: 'Present', label: '✓ Present', color: '#4caf50' },
    { value: 'Absent', label: '✗ Absent', color: '#f44336' },
    { value: 'Late', label: '⏱ Late', color: '#ff9800' },
    { value: 'Excused', label: '✓ Excused', color: '#2196f3' }
  ]

  const countByStatus = (status) => {
    return Object.values(attendance).filter(s => s === status).length
  }

  return (
    <div className="faculty-attendance-management">
      <div className="attendance-container">
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
                    <p className="section-info">Section {cls.section} • {cls.enrolled_students} students</p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Attendance Section */}
        {selectedClassId && (
          <div className="attendance-section">
            {selectedClass && (
              <div className="class-header">
                <h2>{selectedClass.course?.course_code}: {selectedClass.course?.course_title}</h2>
                <p className="section-label">Section {selectedClass.section}</p>
              </div>
            )}

            {/* Date Selector */}
            <div className="date-selector">
              <label htmlFor="attendance-date">Select Date:</label>
              <input
                id="attendance-date"
                type="date"
                value={attendanceDate}
                onChange={(e) => setAttendanceDate(e.target.value)}
                className="date-input"
              />
            </div>

            {/* Statistics */}
            {students.length > 0 && (
              <div className="attendance-stats">
                {attendanceOptions.map(option => (
                  <div key={option.value} className="stat-badge" style={{ borderLeftColor: option.color }}>
                    <span className="stat-label">{option.label}</span>
                    <span className="stat-count">{countByStatus(option.value)}</span>
                  </div>
                ))}
              </div>
            )}

            {error && (
              <div className="error-message">
                {error}
              </div>
            )}

            {success && (
              <div className="success-message">
                {success}
              </div>
            )}

            {loading ? (
              <div className="loading">Loading attendance...</div>
            ) : students.length === 0 ? (
              <div className="no-students">No students enrolled in this class</div>
            ) : (
              <div className="attendance-table-container">
                <table className="attendance-table">
                  <thead>
                    <tr>
                      <th>Student Number</th>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {students.map((enrollment) => (
                      <tr key={enrollment.enrollment_id} className={changedStudents.has(enrollment.student.student_id) ? 'changed' : ''}>
                        <td className="student-number">
                          {enrollment.student?.student_number}
                        </td>
                        <td className="student-name">
                          {enrollment.student?.first_name} {enrollment.student?.last_name}
                        </td>
                        <td className="student-email">
                          {enrollment.student?.email}
                        </td>
                        <td className="status-cell">
                          <select
                            value={getAttendanceStatus(enrollment.student.student_id)}
                            onChange={(e) => handleAttendanceChange(enrollment.student.student_id, e.target.value)}
                            className="status-select"
                          >
                            {attendanceOptions.map(option => (
                              <option key={option.value} value={option.value}>
                                {option.label}
                              </option>
                            ))}
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {changedStudents.size > 0 && (
                  <div className="save-section">
                    <p className="changed-count">{changedStudents.size} changes pending</p>
                    <button className="btn-save-attendance" onClick={saveAttendance}>
                      Save Attendance
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default FacultyAttendanceManagement
