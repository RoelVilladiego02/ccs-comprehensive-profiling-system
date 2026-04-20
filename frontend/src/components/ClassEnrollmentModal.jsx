import { useState, useEffect } from 'react'
import { studentAPI, enrollmentAPI } from '../services/api'
import '../styles/ClassEnrollmentModal.css'

function ClassEnrollmentModal({ classId, courseName, section, maxStudents, onClose, onEnrollmentUpdated }) {
  const [students, setStudents] = useState([])
  const [enrolledStudents, setEnrolledStudents] = useState([])
  const [filteredStudents, setFilteredStudents] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [activeTab, setActiveTab] = useState('available') // 'available' or 'enrolled'
  const [selectedStudents, setSelectedStudents] = useState(new Set()) // For bulk operations
  const [bulkOperationInProgress, setBulkOperationInProgress] = useState(false)

  useEffect(() => {
    fetchData()
  }, [classId])

  const fetchData = async () => {
    try {
      setLoading(true)
      const [studentsRes, enrollmentsRes] = await Promise.all([
        studentAPI.getAll(1000),
        enrollmentAPI.getClassEnrollments(classId)
      ])

      const allStudents = studentsRes.data.data || []
      const enrolled = enrollmentsRes.data.data || []

      setEnrolledStudents(enrolled)
      setStudents(allStudents)
      setFilteredStudents(allStudents)
      setSelectedStudents(new Set())
      setError('')
    } catch (err) {
      console.error('Error fetching data:', err)
      setError('Failed to load data')
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (term) => {
    setSearchTerm(term)
    const filtered = students.filter(student => {
      const isEnrolled = enrolledStudents.some(e => e.student_id === student.student_id)
      
      // If viewing enrolled tab, only show enrolled students
      if (activeTab === 'enrolled') {
        if (!isEnrolled) return false
      }
      // If viewing available tab, only show non-enrolled students
      else if (isEnrolled) {
        return false
      }

      const fullName = `${student.first_name} ${student.last_name}`.toLowerCase()
      const studentId = student.student_id?.toString()
      
      return fullName.includes(term.toLowerCase()) || 
             (studentId && studentId.includes(term))
    })
    setFilteredStudents(filtered)
  }

  const handleSelectStudent = (studentId) => {
    const newSelected = new Set(selectedStudents)
    if (newSelected.has(studentId)) {
      newSelected.delete(studentId)
    } else {
      newSelected.add(studentId)
    }
    setSelectedStudents(newSelected)
  }

  const handleSelectAll = () => {
    if (selectedStudents.size === filteredStudents.length && filteredStudents.length > 0) {
      setSelectedStudents(new Set())
    } else {
      const allIds = new Set(filteredStudents.map(s => s.student_id))
      setSelectedStudents(allIds)
    }
  }

  const handleBulkEnroll = async () => {
    if (selectedStudents.size === 0) {
      setError('Please select at least one student')
      return
    }

    try {
      setBulkOperationInProgress(true)
      setError('')
      let successCount = 0
      let failureCount = 0

      for (const studentId of selectedStudents) {
        try {
          const response = await enrollmentAPI.enrollStudent({
            student_id: studentId,
            class_id: classId,
            enrollment_date: new Date().toISOString().split('T')[0]
          })
          if (response.data.success) {
            successCount++
          } else {
            failureCount++
          }
        } catch (err) {
          failureCount++
        }
      }

      setSuccess(`${successCount} student${successCount !== 1 ? 's' : ''} enrolled successfully${failureCount > 0 ? `, ${failureCount} failed` : ''}`)
      setSelectedStudents(new Set())
      await fetchData()
      if (onEnrollmentUpdated) onEnrollmentUpdated()
      setTimeout(() => setSuccess(''), 4000)
    } catch (err) {
      console.error('Error in bulk enroll:', err)
      setError('Bulk enrollment failed')
    } finally {
      setBulkOperationInProgress(false)
    }
  }

  const handleBulkUnenroll = async () => {
    if (selectedStudents.size === 0) {
      setError('Please select at least one student')
      return
    }

    if (!window.confirm(`Unenroll ${selectedStudents.size} student${selectedStudents.size !== 1 ? 's' : ''}?`)) {
      return
    }

    try {
      setBulkOperationInProgress(true)
      setError('')
      let successCount = 0
      let failureCount = 0

      for (const studentId of selectedStudents) {
        try {
          const enrollmentRecord = enrolledStudents.find(e => e.student_id === studentId)
          if (enrollmentRecord) {
            const response = await enrollmentAPI.deleteEnrollment(enrollmentRecord.id)
            if (response.data.success) {
              successCount++
            } else {
              failureCount++
            }
          }
        } catch (err) {
          failureCount++
        }
      }

      setSuccess(`${successCount} student${successCount !== 1 ? 's' : ''} unenrolled successfully${failureCount > 0 ? `, ${failureCount} failed` : ''}`)
      setSelectedStudents(new Set())
      await fetchData()
      if (onEnrollmentUpdated) onEnrollmentUpdated()
      setTimeout(() => setSuccess(''), 4000)
    } catch (err) {
      console.error('Error in bulk unenroll:', err)
      setError('Bulk unenrollment failed')
    } finally {
      setBulkOperationInProgress(false)
    }
  }

  const handleEnroll = async (studentId) => {
    try {
      setError('')
      const response = await enrollmentAPI.enrollStudent({
        student_id: studentId,
        class_id: classId,
        enrollment_date: new Date().toISOString().split('T')[0]
      })

      if (response.data.success) {
        setSuccess('Student enrolled successfully!')
        await fetchData()
        if (onEnrollmentUpdated) onEnrollmentUpdated()
        setTimeout(() => setSuccess(''), 3000)
      }
    } catch (err) {
      console.error('Error enrolling student:', err)
      setError(err.response?.data?.message || 'Failed to enroll student')
    }
  }

  const handleUnenroll = async (enrollmentId, studentId) => {
    if (!window.confirm('Are you sure you want to unenroll this student?')) {
      return
    }

    try {
      setError('')
      const response = await enrollmentAPI.deleteEnrollment(enrollmentId)

      if (response.data.success) {
        setSuccess('Student unenrolled successfully!')
        await fetchData()
        if (onEnrollmentUpdated) onEnrollmentUpdated()
        setTimeout(() => setSuccess(''), 3000)
      }
    } catch (err) {
      console.error('Error unenrolling student:', err)
      setError(err.response?.data?.message || 'Failed to unenroll student')
    }
  }

  const isClassFull = enrolledStudents.length >= maxStudents

  return (
    <div className="enrollment-modal-overlay" onClick={onClose}>
      <div className="enrollment-modal" onClick={e => e.stopPropagation()}>
        <div className="enrollment-modal-header">
          <h2>Manage Enrollments</h2>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>

        <div className="enrollment-modal-info">
          <p className="course-info">
            <strong>{courseName}</strong> - Section {section}
          </p>
          <p className="capacity-info">
            Current: <span className={isClassFull ? 'full' : ''}>{enrolledStudents.length}/{maxStudents}</span>
            {isClassFull && <span className="status-full"> (FULL)</span>}
          </p>
        </div>

        {error && <div className="alert alert-error">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        <div className="enrollment-tabs">
          <button
            className={`tab-btn ${activeTab === 'available' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('available')
              setSelectedStudents(new Set())
              handleSearch(searchTerm)
            }}
          >
            Available Students
          </button>
          <button
            className={`tab-btn ${activeTab === 'enrolled' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('enrolled')
              setSelectedStudents(new Set())
              handleSearch(searchTerm)
            }}
          >
            Enrolled ({enrolledStudents.length})
          </button>
        </div>

        <div className="enrollment-toolbar">
          <div className="enrollment-search">
            <input
              type="text"
              placeholder={activeTab === 'available' ? 'Search by name or ID...' : 'Search enrolled students...'}
              value={searchTerm}
              onChange={e => handleSearch(e.target.value)}
              className="search-input"
            />
          </div>
          
          {filteredStudents.length > 0 && (
            <div className="bulk-actions">
              <label className="select-all-label">
                <input
                  type="checkbox"
                  checked={selectedStudents.size === filteredStudents.length && filteredStudents.length > 0}
                  onChange={handleSelectAll}
                  disabled={bulkOperationInProgress}
                />
                Select All ({selectedStudents.size})
              </label>
              
              {selectedStudents.size > 0 && (
                <div className="bulk-buttons">
                  {activeTab === 'available' ? (
                    <button
                      className="btn btn-success"
                      onClick={handleBulkEnroll}
                      disabled={bulkOperationInProgress || isClassFull}
                    >
                      {bulkOperationInProgress ? 'Enrolling...' : `Enroll ${selectedStudents.size}`}
                    </button>
                  ) : (
                    <button
                      className="btn btn-danger"
                      onClick={handleBulkUnenroll}
                      disabled={bulkOperationInProgress}
                    >
                      {bulkOperationInProgress ? 'Unenrolling...' : `Unenroll ${selectedStudents.size}`}
                    </button>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="enrollment-list">
          {loading ? (
            <p className="loading">Loading...</p>
          ) : filteredStudents.length === 0 ? (
            <p className="empty-state">
              {activeTab === 'available' 
                ? 'No available students' 
                : 'No enrolled students'}
            </p>
          ) : (
            <div className="students-grid">
              {filteredStudents.map(student => {
                const isEnrolled = enrolledStudents.some(e => e.student_id === student.student_id)
                const enrollmentRecord = enrolledStudents.find(e => e.student_id === student.student_id)
                const isSelected = selectedStudents.has(student.student_id)

                return (
                  <div key={student.student_id} className={`student-item ${isSelected ? 'selected' : ''}`}>
                    <div className="student-checkbox">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleSelectStudent(student.student_id)}
                        disabled={bulkOperationInProgress}
                      />
                    </div>
                    <div className="student-info">
                      <div className="student-name">
                        {student.first_name} {student.last_name}
                      </div>
                      <div className="student-id">ID: {student.student_id}</div>
                      {enrollmentRecord && (
                        <div className="enrollment-date">
                          Enrolled: {new Date(enrollmentRecord.enrollment_date).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                    <div className="student-action">
                      {isEnrolled ? (
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => handleUnenroll(enrollmentRecord.id, student.student_id)}
                          disabled={bulkOperationInProgress}
                        >
                          Unenroll
                        </button>
                      ) : (
                        <button
                          className="btn btn-success btn-sm"
                          onClick={() => handleEnroll(student.student_id)}
                          disabled={isClassFull || bulkOperationInProgress}
                        >
                          {isClassFull ? 'Full' : 'Enroll'}
                        </button>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        <div className="enrollment-modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  )
}

export default ClassEnrollmentModal
