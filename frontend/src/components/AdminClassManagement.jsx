import { useState, useEffect } from 'react'
import '../styles/AdminDashboard.css'
import { classAPI, facultyAPI, courseAPI } from '../services/api'
import ClassEnrollmentModal from './ClassEnrollmentModal'

function AdminClassManagement({ userData, onLogout }) {
  const [activeSection, setActiveSection] = useState('list')
  const [classes, setClasses] = useState([])
  const [courses, setCourses] = useState([])
  const [faculty, setFaculty] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // Enrollment modal state
  const [showEnrollmentModal, setShowEnrollmentModal] = useState(false)
  const [selectedClass, setSelectedClass] = useState(null)

  // Form state
  const [formData, setFormData] = useState({
    course_id: '',
    faculty_id: '',
    section: '',
    academic_year: new Date().getFullYear().toString(),
    semester: '1',
    schedule_day: '',
    schedule_time: '',
    schedule_end_time: '',
    room: '',
    max_students: '40',
    class_status: 'Open'
  })

  const [editingId, setEditingId] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [sortConfig, setSortConfig] = useState({ field: 'course_id', direction: 'asc' })

  // Fetch data on component mount
  useEffect(() => {
    fetchInitialData()
  }, [])

  // Fetch updated list when section changes
  useEffect(() => {
    if (activeSection === 'list') {
      fetchClasses()
    }
  }, [activeSection])

  const fetchInitialData = async () => {
    try {
      setLoading(true)
      const [classesRes, coursesRes, facultyRes] = await Promise.all([
        classAPI.getAll(100),
        courseAPI.getAll(100),
        facultyAPI.getAll()
      ])

      if (classesRes.data.success) setClasses(classesRes.data.data || [])
      if (coursesRes.data.success) setCourses(coursesRes.data.data || [])
      if (facultyRes.data.success) setFaculty(facultyRes.data.data || [])
    } catch (err) {
      console.error('Error fetching data:', err)
      setError('Failed to load data')
    } finally {
      setLoading(false)
    }
  }

  const fetchClasses = async () => {
    try {
      setLoading(true)
      const response = await classAPI.getAll(100)
      if (response.data.success) {
        setClasses(response.data.data || [])
        setError('')
      }
    } catch (err) {
      console.error('Error fetching classes:', err)
      setError('Failed to load classes')
    } finally {
      setLoading(false)
    }
  }

  const handleFormChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    // Validation
    if (!formData.course_id || !formData.faculty_id || !formData.section || !formData.max_students) {
      setError('Please fill in all required fields')
      return
    }

    try {
      setLoading(true)
      let response

      if (editingId) {
        // Update existing class
        response = await classAPI.update(editingId, formData)
        if (response.data.success) {
          setSuccess('Class updated successfully!')
          setEditingId(null)
        }
      } else {
        // Create new class
        response = await classAPI.create(formData)
        if (response.data.success) {
          setSuccess('Class created successfully!')
        }
      }

      // Reset form
      setFormData({
        course_id: '',
        faculty_id: '',
        section: '',
        academic_year: new Date().getFullYear().toString(),
        semester: '1',
        schedule_day: '',
        schedule_time: '',
        schedule_end_time: '',
        room: '',
        max_students: '40',
        class_status: 'Open'
      })

      // Refresh list
      await fetchClasses()
      setTimeout(() => setActiveSection('list'), 1500)
    } catch (err) {
      console.error('Error saving class:', err)
      setError(err.response?.data?.message || 'Failed to save class')
    } finally {
      setLoading(false)
    }
  }

  const handleOpenEnrollment = (schoolClass) => {
    setSelectedClass(schoolClass)
    setShowEnrollmentModal(true)
  }

  const handleCloseEnrollment = () => {
    setShowEnrollmentModal(false)
    setSelectedClass(null)
  }

  const handleEnrollmentUpdated = () => {
    fetchClasses()
  }

  const handleEdit = (schoolClass) => {
    setFormData({
      course_id: schoolClass.course_id?.toString(),
      faculty_id: schoolClass.faculty_id?.toString(),
      section: schoolClass.section,
      academic_year: schoolClass.academic_year,
      semester: schoolClass.semester?.toString(),
      schedule_day: schoolClass.schedule_day || '',
      schedule_time: schoolClass.schedule_time || '',
      schedule_end_time: schoolClass.schedule_end_time || '',
      room: schoolClass.room || '',
      max_students: schoolClass.max_students?.toString(),
      class_status: schoolClass.class_status
    })
    setEditingId(schoolClass.class_id)
    setActiveSection('form')
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this class?')) return

    try {
      setLoading(true)
      const response = await classAPI.delete(id)
      if (response.data.success) {
        setSuccess('Class deleted successfully!')
        await fetchClasses()
      }
    } catch (err) {
      console.error('Error deleting class:', err)
      setError('Failed to delete class')
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    setEditingId(null)
    setFormData({
      course_id: '',
      faculty_id: '',
      section: '',
      academic_year: new Date().getFullYear().toString(),
      semester: '1',
      schedule_day: '',
      schedule_time: '',
      schedule_end_time: '',
      room: '',
      max_students: '40',
      class_status: 'Open'
    })
    setError('')
  }

  // Filtering and sorting
  const filteredClasses = classes
    .filter(schoolClass => {
      const course = courses.find(c => c.course_id === schoolClass.course_id)
      const fac = faculty.find(f => f.faculty_id === schoolClass.faculty_id)
      const searchLower = searchTerm.toLowerCase()

      return (
        (course?.course_code?.toLowerCase().includes(searchLower) ||
          course?.course_title?.toLowerCase().includes(searchLower) ||
          schoolClass.section?.toLowerCase().includes(searchLower) ||
          fac?.first_name?.toLowerCase().includes(searchLower) ||
          fac?.last_name?.toLowerCase().includes(searchLower)) ??
        true
      )
    })
    .sort((a, b) => {
      let aVal, bVal

      switch (sortConfig.field) {
        case 'course_code':
          aVal = courses.find(c => c.course_id === a.course_id)?.course_code || ''
          bVal = courses.find(c => c.course_id === b.course_id)?.course_code || ''
          break
        case 'faculty':
          aVal = (faculty.find(f => f.faculty_id === a.faculty_id)?.first_name || '') + 
                 (faculty.find(f => f.faculty_id === a.faculty_id)?.last_name || '')
          bVal = (faculty.find(f => f.faculty_id === b.faculty_id)?.first_name || '') + 
                 (faculty.find(f => f.faculty_id === b.faculty_id)?.last_name || '')
          break
        case 'semester':
          aVal = a.semester
          bVal = b.semester
          break
        case 'status':
          aVal = a.class_status
          bVal = b.class_status
          break
        default:
          aVal = a.section
          bVal = b.section
      }

      if (typeof aVal === 'string') {
        return sortConfig.direction === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal)
      } else {
        return sortConfig.direction === 'asc' ? aVal - bVal : bVal - aVal
      }
    })

  const renderList = () => (
    <div className="admin-section">
      <div className="section-header">
        <h2>Class Management</h2>
        <button className="btn btn-primary" onClick={() => setActiveSection('form')}>
          + Add New Class
        </button>
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <div className="search-bar">
        <input
          type="text"
          placeholder="Search by course code, course name, section, or faculty name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
      </div>

      {loading ? (
        <div className="loading">Loading classes...</div>
      ) : filteredClasses.length === 0 ? (
        <div className="empty-state">
          <p>No classes found</p>
        </div>
      ) : (
        <div className="table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th
                  onClick={() => setSortConfig({ field: 'course_code', direction: sortConfig.direction === 'asc' ? 'desc' : 'asc' })}
                  style={{ cursor: 'pointer' }}
                >
                  Course Code {sortConfig.field === 'course_code' && (sortConfig.direction === 'asc' ? '▲' : '▼')}
                </th>
                <th>Course Name</th>
                <th>Section</th>
                <th
                  onClick={() => setSortConfig({ field: 'faculty', direction: sortConfig.direction === 'asc' ? 'desc' : 'asc' })}
                  style={{ cursor: 'pointer' }}
                >
                  Faculty {sortConfig.field === 'faculty' && (sortConfig.direction === 'asc' ? '▲' : '▼')}
                </th>
                <th>Academic Year</th>
                <th
                  onClick={() => setSortConfig({ field: 'semester', direction: sortConfig.direction === 'asc' ? 'desc' : 'asc' })}
                  style={{ cursor: 'pointer' }}
                >
                  Semester {sortConfig.field === 'semester' && (sortConfig.direction === 'asc' ? '▲' : '▼')}
                </th>
                <th>Schedule</th>
                <th>Room</th>
                <th>Students</th>
                <th
                  onClick={() => setSortConfig({ field: 'status', direction: sortConfig.direction === 'asc' ? 'desc' : 'asc' })}
                  style={{ cursor: 'pointer' }}
                >
                  Status {sortConfig.field === 'status' && (sortConfig.direction === 'asc' ? '▲' : '▼')}
                </th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredClasses.map((schoolClass) => {
                const course = courses.find(c => c.course_id === schoolClass.course_id)
                const fac = faculty.find(f => f.faculty_id === schoolClass.faculty_id)
                const schedule = schoolClass.schedule_day
                  ? `${schoolClass.schedule_day} ${schoolClass.schedule_time || ''}`.trim()
                  : 'TBA'

                return (
                  <tr key={schoolClass.class_id}>
                    <td>{course?.course_code || 'N/A'}</td>
                    <td>{course?.course_name || 'Unknown'}</td>
                    <td>{schoolClass.section}</td>
                    <td>
                      {fac
                        ? `${fac.first_name} ${fac.last_name}`
                        : 'Unassigned'}
                    </td>
                    <td>{schoolClass.academic_year}</td>
                    <td>Sem {schoolClass.semester}</td>
                    <td>{schedule}</td>
                    <td>{schoolClass.room || 'TBA'}</td>
                    <td>
                      {schoolClass.enrolled_students}/{schoolClass.max_students}
                    </td>
                    <td>
                      <span className={`badge badge-${schoolClass.class_status?.toLowerCase()}`}>
                        {schoolClass.class_status}
                      </span>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button
                          className="btn btn-small btn-edit"
                          onClick={() => handleEdit(schoolClass)}
                          title="Edit class"
                        >
                          Edit
                        </button>
                        <button
                          className="btn btn-small btn-info"
                          onClick={() => handleOpenEnrollment(schoolClass)}
                          title="Manage student enrollment"
                        >
                          Enroll
                        </button>
                        <button
                          className="btn btn-small btn-delete"
                          onClick={() => handleDelete(schoolClass.class_id)}
                          title="Delete class"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )

  const renderForm = () => (
    <div className="admin-section">
      <div className="section-header">
        <h2>{editingId ? 'Edit Class' : 'Create New Class'}</h2>
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <form onSubmit={handleSubmit} className="admin-form">
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="course_id">
              Course <span style={{ color: 'red' }}>*</span>
            </label>
            <select
              id="course_id"
              name="course_id"
              value={formData.course_id}
              onChange={handleFormChange}
              required
            >
              <option value="">Select a course</option>
              {courses.map(course => (
                <option key={course.course_id} value={course.course_id}>
                  {course.course_code} - {course.course_name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="faculty_id">
              Faculty <span style={{ color: 'red' }}>*</span>
            </label>
            <select
              id="faculty_id"
              name="faculty_id"
              value={formData.faculty_id}
              onChange={handleFormChange}
              required
            >
              <option value="">Select a faculty member</option>
              {faculty.map(fac => (
                <option key={fac.faculty_id} value={fac.faculty_id}>
                  {fac.first_name} {fac.last_name} ({fac.faculty_number})
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="section">
              Section <span style={{ color: 'red' }}>*</span>
            </label>
            <input
              type="text"
              id="section"
              name="section"
              value={formData.section}
              onChange={handleFormChange}
              placeholder="e.g., A, B, C"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="academic_year">Academic Year</label>
            <input
              type="text"
              id="academic_year"
              name="academic_year"
              value={formData.academic_year}
              onChange={handleFormChange}
              placeholder="e.g., 2024-2025"
            />
          </div>

          <div className="form-group">
            <label htmlFor="semester">Semester</label>
            <select
              id="semester"
              name="semester"
              value={formData.semester}
              onChange={handleFormChange}
            >
              <option value="1">1st Semester</option>
              <option value="2">2nd Semester</option>
              <option value="3">Summer</option>
            </select>
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="schedule_day">Schedule Day</label>
            <input
              type="text"
              id="schedule_day"
              name="schedule_day"
              value={formData.schedule_day}
              onChange={handleFormChange}
              placeholder="e.g., Monday, Wednesday"
            />
          </div>

          <div className="form-group">
            <label htmlFor="schedule_time">Start Time</label>
            <input
              type="time"
              id="schedule_time"
              name="schedule_time"
              value={formData.schedule_time}
              onChange={handleFormChange}
            />
          </div>

          <div className="form-group">
            <label htmlFor="schedule_end_time">End Time</label>
            <input
              type="time"
              id="schedule_end_time"
              name="schedule_end_time"
              value={formData.schedule_end_time}
              onChange={handleFormChange}
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="room">Room</label>
            <input
              type="text"
              id="room"
              name="room"
              value={formData.room}
              onChange={handleFormChange}
              placeholder="e.g., Room 101"
            />
          </div>

          <div className="form-group">
            <label htmlFor="max_students">
              Max Students <span style={{ color: 'red' }}>*</span>
            </label>
            <input
              type="number"
              id="max_students"
              name="max_students"
              value={formData.max_students}
              onChange={handleFormChange}
              min="1"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="class_status">Status</label>
            <select
              id="class_status"
              name="class_status"
              value={formData.class_status}
              onChange={handleFormChange}
            >
              <option value="Open">Open</option>
              <option value="Closed">Closed</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        <div className="form-actions">
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Saving...' : editingId ? 'Update Class' : 'Create Class'}
          </button>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={handleCancel}
            disabled={loading}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  )

  return (
    <div className="admin-dashboard">
      <div className="dashboard-header">
        <div className="header-left">
          <h1>Class Management</h1>
          <p className="subtitle">Manage classes and assign faculty to sections</p>
        </div>
        <div className="header-right">
          {userData && (
            <div className="user-info">
              <span className="user-label">Logged in as:</span>
              <span className="user-id">{userData.name}</span>
              <button className="logout-btn" onClick={onLogout} title="Logout">
                Logout
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="admin-container">
        {activeSection === 'list' && renderList()}
        {activeSection === 'form' && renderForm()}
      </div>

      {showEnrollmentModal && selectedClass && (
        <ClassEnrollmentModal
          classId={selectedClass.class_id}
          courseName={courses.find(c => c.course_id === selectedClass.course_id)?.course_name || 'Unknown Course'}
          section={selectedClass.section}
          maxStudents={selectedClass.max_students}
          onClose={handleCloseEnrollment}
          onEnrollmentUpdated={handleEnrollmentUpdated}
        />
      )}
    </div>
  )
}

export default AdminClassManagement
