import { useState, useEffect, useCallback } from 'react'
import '../styles/FacultyGradeManagement.css'
import { enrollmentAPI, gradeAPI } from '../services/api'

function FacultyGradeManagement({ classes }) {
  const [selectedClassId, setSelectedClassId] = useState(null)
  const [students, setStudents] = useState([])
  const [grades, setGrades] = useState({})
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [editingGrade, setEditingGrade] = useState(null)
  const [gradeType, setGradeType] = useState('midterm') // midterm or final

  const fetchClassData = useCallback(async () => {
    try {
      setLoading(true)
      setError('')
      const response = await enrollmentAPI.getClassEnrollments(selectedClassId)
      if (response.data.success) {
        setStudents(response.data.data || [])
        
        // Fetch grades for all students in this class
        const gradesResponse = await gradeAPI.getClassGrades(selectedClassId)
        if (gradesResponse.data.success) {
          const gradesMap = {}
          gradesResponse.data.data.forEach(grade => {
            gradesMap[grade.student_id] = grade
          })
          setGrades(gradesMap)
        }
      } else {
        setError('Failed to load class data')
      }
    } catch (err) {
      console.error('Failed to fetch class data:', err)
      setError('Error loading class data')
    } finally {
      setLoading(false)
    }
  }, [selectedClassId])

  useEffect(() => {
    if (selectedClassId) {
      fetchClassData()
    } else {
      setStudents([])
      setGrades({})
    }
  }, [selectedClassId, fetchClassData])

  const handleGradeChange = (enrollmentId, studentId, type, value) => {
    // Convert value to number, handling empty strings
    let numValue = value === '' ? 0 : parseFloat(value)
    
    // If parseFloat fails (NaN), default to 0
    if (isNaN(numValue)) {
      numValue = 0
    }
    
    setEditingGrade({
      enrollmentId,
      studentId,
      type,
      value: numValue
    })
  }

  const saveGrade = async () => {
    if (!editingGrade) return

    // Validate grade value
    if (!isValidGrade(editingGrade.value)) {
      setError('Grade must be a number between 0 and 100')
      return
    }

    try {
      setError('')
      setSuccess('')

      const response = await gradeAPI.updateGrade(
        editingGrade.studentId,
        selectedClassId,
        editingGrade.type,
        editingGrade.value
      )

      if (response.data.success) {
        // Update local grades
        setGrades(prev => ({
          ...prev,
          [editingGrade.studentId]: {
            ...prev[editingGrade.studentId],
            [editingGrade.type + '_grade']: editingGrade.value
          }
        }))
        setSuccess('Grade saved successfully!')
        setEditingGrade(null)
        setTimeout(() => setSuccess(''), 2000)
      } else {
        setError('Failed to save grade')
      }
    } catch (err) {
      console.error('Failed to save grade:', err)
      setError(err.response?.data?.message || 'Error saving grade')
    }
  }

  const selectedClass = classes.find(c => c.class_id === selectedClassId)

  const getGrade = (studentId, type) => {
    const grade = grades[studentId]
    return grade ? grade[type + '_grade'] || '' : ''
  }

  const isValidGrade = (value) => {
    const num = parseFloat(value)
    return num >= 0 && num <= 100
  }

  const calculateAverageGrade = (studentId) => {
    const grade = grades[studentId]
    if (!grade) return '-'
    const midterm = parseFloat(grade.midterm_grade)
    const final = parseFloat(grade.final_grade)
    if (!isNaN(midterm) && !isNaN(final)) {
      const avg = ((midterm + final) / 2).toFixed(2)
      return avg
    }
    return '-'
  }

  return (
    <div className="faculty-grade-management">
      <div className="grades-container">
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

        {/* Grades Section */}
        {selectedClassId && (
          <div className="grades-section">
            {selectedClass && (
              <div className="class-header">
                <h2>{selectedClass.course?.course_code}: {selectedClass.course?.course_title}</h2>
                <p className="section-label">Section {selectedClass.section}</p>
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
              <div className="loading">Loading grades...</div>
            ) : students.length === 0 ? (
              <div className="no-students">No students enrolled in this class</div>
            ) : (
              <div className="grades-table-container">
                <table className="grades-table">
                  <thead>
                    <tr>
                      <th>Student Number</th>
                      <th>Name</th>
                      <th>Email</th>
                      <th className="grade-column">Midterm Grade</th>
                      <th className="grade-column">Final Grade</th>
                      <th className="grade-column">Average</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {students.map((enrollment) => {
                      const isEditing = editingGrade?.studentId === enrollment.student.student_id
                      return (
                        <tr key={enrollment.enrollment_id}>
                          <td className="student-number">
                            {enrollment.student?.student_number}
                          </td>
                          <td className="student-name">
                            {enrollment.student?.first_name} {enrollment.student?.last_name}
                          </td>
                          <td className="student-email">
                            {enrollment.student?.email}
                          </td>
                          <td className="grade-column">
                            <input
                              type="number"
                              min="0"
                              max="100"
                              value={
                                isEditing && editingGrade.type === 'midterm'
                                  ? editingGrade.value
                                  : getGrade(enrollment.student.student_id, 'midterm')
                              }
                              disabled={!isEditing || editingGrade.type !== 'midterm'}
                              onChange={(e) => handleGradeChange(enrollment.enrollment_id, enrollment.student.student_id, 'midterm', e.target.value)}
                              className="grade-input"
                              placeholder="0-100"
                            />
                          </td>
                          <td className="grade-column">
                            <input
                              type="number"
                              min="0"
                              max="100"
                              value={
                                isEditing && editingGrade.type === 'final'
                                  ? editingGrade.value
                                  : getGrade(enrollment.student.student_id, 'final')
                              }
                              disabled={!isEditing || editingGrade.type !== 'final'}
                              onChange={(e) => handleGradeChange(enrollment.enrollment_id, enrollment.student.student_id, 'final', e.target.value)}
                              className="grade-input"
                              placeholder="0-100"
                            />
                          </td>
                          <td className="grade-column average-grade">
                            {calculateAverageGrade(enrollment.student.student_id)}
                          </td>
                          <td className="actions-cell">
                            {isEditing ? (
                              <div className="action-buttons">
                                <button
                                  className="btn-save"
                                  onClick={saveGrade}
                                  disabled={!isValidGrade(editingGrade.value)}
                                >
                                  Save
                                </button>
                                <button
                                  className="btn-cancel"
                                  onClick={() => setEditingGrade(null)}
                                >
                                  Cancel
                                </button>
                              </div>
                            ) : (
                              <div className="edit-buttons">
                                <button
                                  className="btn-edit-midterm"
                                  onClick={() => handleGradeChange(enrollment.enrollment_id, enrollment.student.student_id, 'midterm', getGrade(enrollment.student.student_id, 'midterm'))}
                                  title="Edit midterm grade"
                                >
                                  Edit Mid
                                </button>
                                <button
                                  className="btn-edit-final"
                                  onClick={() => handleGradeChange(enrollment.enrollment_id, enrollment.student.student_id, 'final', getGrade(enrollment.student.student_id, 'final'))}
                                  title="Edit final grade"
                                >
                                  Edit Final
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                      )
                    })}
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

export default FacultyGradeManagement
