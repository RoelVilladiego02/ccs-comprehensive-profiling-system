import { useState, useEffect } from 'react'
import '../styles/Module.css'
import { courseAPI } from '../services/api'

function InstructionModule({ userData, onLogout }) {
  const [activeTab, setActiveTab] = useState('syllabus')
  const [courses, setCourses] = useState([])
  const [lessons, setLessons] = useState([])
  const [curriculum, setCurriculum] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  
  // Modal states
  const [showLessonModal, setShowLessonModal] = useState(false)
  const [showCurriculumModal, setShowCurriculumModal] = useState(false)
  const [editingLesson, setEditingLesson] = useState(null)
  const [editingCurriculum, setEditingCurriculum] = useState(null)
  
  // Form states
  const [lessonForm, setLessonForm] = useState({
    syllabus_id: '',
    lesson_number: '',
    title: '',
    content: '',
    objectives: '',
    duration_hours: '',
    is_active: true,
  })
  
  const [curriculumForm, setCurriculumForm] = useState({
    curriculum_code: '',
    title: '',
    description: '',
    department: '',
    total_credits: '',
    is_active: true,
  })

  useEffect(() => {
    if (activeTab === 'syllabus') {
      fetchCourses()
    } else if (activeTab === 'lessons') {
      fetchLessons()
    } else if (activeTab === 'curriculum') {
      fetchCurriculum()
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

  const fetchLessons = async () => {
    try {
      setLoading(true)
      setError('')
      // Assuming you have a lessonAPI, otherwise create it
      const response = await fetch('/api/lessons', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      })
      const data = await response.json()
      if (data.success) {
        setLessons(data.data || [])
      } else {
        setError('Failed to load lessons')
      }
    } catch (err) {
      console.error('Failed to fetch lessons:', err)
      setError('Error loading lessons. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const fetchCurriculum = async () => {
    try {
      setLoading(true)
      setError('')
      const response = await fetch('/api/curriculum', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      })
      const data = await response.json()
      if (data.success) {
        setCurriculum(data.data || [])
      } else {
        setError('Failed to load curriculum')
      }
    } catch (err) {
      console.error('Failed to fetch curriculum:', err)
      setError('Error loading curriculum. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateLesson = async (e) => {
    e.preventDefault()
    if (!lessonForm.title || !lessonForm.lesson_number || !lessonForm.syllabus_id) {
      setError('Please fill in required fields')
      return
    }

    try {
      const response = await fetch('/api/lessons', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(lessonForm),
      })
      const data = await response.json()
      if (data.success) {
        setShowLessonModal(false)
        setLessonForm({
          syllabus_id: '',
          lesson_number: '',
          title: '',
          content: '',
          objectives: '',
          duration_hours: '',
          is_active: true,
        })
        fetchLessons()
      } else {
        setError(data.message || 'Failed to create lesson')
      }
    } catch (err) {
      setError('Error creating lesson: ' + err.message)
    }
  }

  const handleUpdateLesson = async (e) => {
    e.preventDefault()
    if (!lessonForm.title || !lessonForm.lesson_number) {
      setError('Please fill in required fields')
      return
    }

    try {
      const response = await fetch(`/api/lessons/${editingLesson.lesson_id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(lessonForm),
      })
      const data = await response.json()
      if (data.success) {
        setShowLessonModal(false)
        setEditingLesson(null)
        setLessonForm({
          syllabus_id: '',
          lesson_number: '',
          title: '',
          content: '',
          objectives: '',
          duration_hours: '',
          is_active: true,
        })
        fetchLessons()
      } else {
        setError(data.message || 'Failed to update lesson')
      }
    } catch (err) {
      setError('Error updating lesson: ' + err.message)
    }
  }

  const handleDeleteLesson = async (lessonId) => {
    if (!window.confirm('Are you sure you want to delete this lesson?')) return

    try {
      const response = await fetch(`/api/lessons/${lessonId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      })
      const data = await response.json()
      if (data.success) {
        fetchLessons()
      } else {
        setError(data.message || 'Failed to delete lesson')
      }
    } catch (err) {
      setError('Error deleting lesson: ' + err.message)
    }
  }

  const handleCreateCurriculum = async (e) => {
    e.preventDefault()
    if (!curriculumForm.curriculum_code || !curriculumForm.title) {
      setError('Please fill in required fields')
      return
    }

    try {
      const response = await fetch('/api/curriculum', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(curriculumForm),
      })
      const data = await response.json()
      if (data.success) {
        setShowCurriculumModal(false)
        setCurriculumForm({
          curriculum_code: '',
          title: '',
          description: '',
          department: '',
          total_credits: '',
          is_active: true,
        })
        fetchCurriculum()
      } else {
        setError(data.message || 'Failed to create curriculum')
      }
    } catch (err) {
      setError('Error creating curriculum: ' + err.message)
    }
  }

  const handleUpdateCurriculum = async (e) => {
    e.preventDefault()
    if (!curriculumForm.curriculum_code || !curriculumForm.title) {
      setError('Please fill in required fields')
      return
    }

    try {
      const response = await fetch(`/api/curriculum/${editingCurriculum.curriculum_id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(curriculumForm),
      })
      const data = await response.json()
      if (data.success) {
        setShowCurriculumModal(false)
        setEditingCurriculum(null)
        setCurriculumForm({
          curriculum_code: '',
          title: '',
          description: '',
          department: '',
          total_credits: '',
          is_active: true,
        })
        fetchCurriculum()
      } else {
        setError(data.message || 'Failed to update curriculum')
      }
    } catch (err) {
      setError('Error updating curriculum: ' + err.message)
    }
  }

  const handleDeleteCurriculum = async (curriculumId) => {
    if (!window.confirm('Are you sure you want to delete this curriculum?')) return

    try {
      const response = await fetch(`/api/curriculum/${curriculumId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      })
      const data = await response.json()
      if (data.success) {
        fetchCurriculum()
      } else {
        setError(data.message || 'Failed to delete curriculum')
      }
    } catch (err) {
      setError('Error deleting curriculum: ' + err.message)
    }
  }

  const openLessonModal = (lesson = null) => {
    if (lesson) {
      setEditingLesson(lesson)
      setLessonForm({
        syllabus_id: lesson.syllabus_id,
        lesson_number: lesson.lesson_number,
        title: lesson.title,
        content: lesson.content || '',
        objectives: lesson.objectives || '',
        duration_hours: lesson.duration_hours || '',
        is_active: lesson.is_active,
      })
    } else {
      setEditingLesson(null)
      setLessonForm({
        syllabus_id: '',
        lesson_number: '',
        title: '',
        content: '',
        objectives: '',
        duration_hours: '',
        is_active: true,
      })
    }
    setShowLessonModal(true)
    setError('')
  }

  const openCurriculumModal = (curr = null) => {
    if (curr) {
      setEditingCurriculum(curr)
      setCurriculumForm({
        curriculum_code: curr.curriculum_code,
        title: curr.title,
        description: curr.description || '',
        department: curr.department || '',
        total_credits: curr.total_credits || '',
        is_active: curr.is_active,
      })
    } else {
      setEditingCurriculum(null)
      setCurriculumForm({
        curriculum_code: '',
        title: '',
        description: '',
        department: '',
        total_credits: '',
        is_active: true,
      })
    }
    setShowCurriculumModal(true)
    setError('')
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
                      <th>Course Title</th>
                      <th>Department</th>
                      <th>Units (Lecture)</th>
                      <th>Units (Lab)</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {courses.map(course => (
                      <tr key={course.id || course.course_id}>
                        <td>{course.course_code}</td>
                        <td>{course.course_title}</td>
                        <td>{course.department || 'N/A'}</td>
                        <td>{course.units_lecture || '-'}</td>
                        <td>{course.units_lab || '-'}</td>
                        <td>
                          <span className="status-badge status-active">{course.is_active ? 'Active' : 'Inactive'}</span>
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
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2>Lesson Management</h2>
              <button
                onClick={() => openLessonModal()}
                style={{
                  background: '#007bff',
                  color: 'white',
                  border: 'none',
                  padding: '10px 20px',
                  borderRadius: '4px',
                  cursor: 'pointer',
                }}
              >
                ➕ Add Lesson
              </button>
            </div>
            {loading ? (
              <p style={{ textAlign: 'center', color: '#999' }}>Loading lessons...</p>
            ) : lessons.length === 0 ? (
              <div style={{ background: '#f5f5f5', padding: '20px', borderRadius: '8px' }}>
                <p style={{ color: '#999', textAlign: 'center' }}>No lessons created yet</p>
              </div>
            ) : (
              <div className="data-table">
                <table>
                  <thead>
                    <tr>
                      <th>Lesson #</th>
                      <th>Title</th>
                      <th>Duration (Hours)</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {lessons.map(lesson => (
                      <tr key={lesson.lesson_id}>
                        <td>{lesson.lesson_number}</td>
                        <td>{lesson.title}</td>
                        <td>{lesson.duration_hours || '-'}</td>
                        <td>
                          <span className={`status-badge ${lesson.is_active ? 'status-active' : 'status-inactive'}`}>
                            {lesson.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td>
                          <button
                            onClick={() => openLessonModal(lesson)}
                            style={{ marginRight: '5px', padding: '5px 10px', background: '#28a745', color: 'white', border: 'none', borderRadius: '3px', cursor: 'pointer' }}
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteLesson(lesson.lesson_id)}
                            style={{ padding: '5px 10px', background: '#dc3545', color: 'white', border: 'none', borderRadius: '3px', cursor: 'pointer' }}
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )
      case 'curriculum':
        return (
          <div className="module-content">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2>Curriculum Management</h2>
              <button
                onClick={() => openCurriculumModal()}
                style={{
                  background: '#007bff',
                  color: 'white',
                  border: 'none',
                  padding: '10px 20px',
                  borderRadius: '4px',
                  cursor: 'pointer',
                }}
              >
                ➕ Add Curriculum
              </button>
            </div>
            {loading ? (
              <p style={{ textAlign: 'center', color: '#999' }}>Loading curriculum...</p>
            ) : curriculum.length === 0 ? (
              <div style={{ background: '#f5f5f5', padding: '20px', borderRadius: '8px' }}>
                <p style={{ color: '#999', textAlign: 'center' }}>No curriculum created yet</p>
              </div>
            ) : (
              <div className="data-table">
                <table>
                  <thead>
                    <tr>
                      <th>Code</th>
                      <th>Title</th>
                      <th>Department</th>
                      <th>Credits</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {curriculum.map(curr => (
                      <tr key={curr.curriculum_id}>
                        <td>{curr.curriculum_code}</td>
                        <td>{curr.title}</td>
                        <td>{curr.department || '-'}</td>
                        <td>{curr.total_credits || '-'}</td>
                        <td>
                          <span className={`status-badge ${curr.is_active ? 'status-active' : 'status-inactive'}`}>
                            {curr.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td>
                          <button
                            onClick={() => openCurriculumModal(curr)}
                            style={{ marginRight: '5px', padding: '5px 10px', background: '#28a745', color: 'white', border: 'none', borderRadius: '3px', cursor: 'pointer' }}
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteCurriculum(curr.curriculum_id)}
                            style={{ padding: '5px 10px', background: '#dc3545', color: 'white', border: 'none', borderRadius: '3px', cursor: 'pointer' }}
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )
      default:
        return null
    }
  }

  return (
    <div className="student-dashboard">
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
          {error && activeTab !== 'syllabus' && (
            <div style={{ background: '#fee', color: '#c33', padding: '10px', borderRadius: '4px', marginBottom: '15px', border: '1px solid #fcc' }}>
              {error}
            </div>
          )}
          {renderContent()}
        </main>
      </div>

      {/* Lesson Modal */}
      {showLessonModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
        }}>
          <div style={{
            background: 'white',
            padding: '30px',
            borderRadius: '8px',
            width: '90%',
            maxWidth: '600px',
            maxHeight: '90vh',
            overflowY: 'auto',
          }}>
            <h2>{editingLesson ? 'Edit Lesson' : 'Create New Lesson'}</h2>
            <form onSubmit={editingLesson ? handleUpdateLesson : handleCreateLesson}>
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Syllabus *</label>
                <input
                  type="number"
                  value={lessonForm.syllabus_id}
                  onChange={(e) => setLessonForm({ ...lessonForm, syllabus_id: e.target.value })}
                  style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
                  placeholder="Enter Syllabus ID"
                  required
                />
              </div>
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Lesson Number *</label>
                <input
                  type="number"
                  value={lessonForm.lesson_number}
                  onChange={(e) => setLessonForm({ ...lessonForm, lesson_number: e.target.value })}
                  style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
                  placeholder="e.g., 1"
                  required
                />
              </div>
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Title *</label>
                <input
                  type="text"
                  value={lessonForm.title}
                  onChange={(e) => setLessonForm({ ...lessonForm, title: e.target.value })}
                  style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
                  placeholder="Lesson title"
                  required
                />
              </div>
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Content</label>
                <textarea
                  value={lessonForm.content}
                  onChange={(e) => setLessonForm({ ...lessonForm, content: e.target.value })}
                  style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px', minHeight: '100px' }}
                  placeholder="Lesson content"
                />
              </div>
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Objectives</label>
                <textarea
                  value={lessonForm.objectives}
                  onChange={(e) => setLessonForm({ ...lessonForm, objectives: e.target.value })}
                  style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px', minHeight: '80px' }}
                  placeholder="Learning objectives"
                />
              </div>
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Duration (Hours)</label>
                <input
                  type="number"
                  value={lessonForm.duration_hours}
                  onChange={(e) => setLessonForm({ ...lessonForm, duration_hours: e.target.value })}
                  style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
                  placeholder="e.g., 2"
                />
              </div>
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'flex', alignItems: 'center' }}>
                  <input
                    type="checkbox"
                    checked={lessonForm.is_active}
                    onChange={(e) => setLessonForm({ ...lessonForm, is_active: e.target.checked })}
                    style={{ marginRight: '10px' }}
                  />
                  Active
                </label>
              </div>
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => setShowLessonModal(false)}
                  style={{ padding: '10px 20px', background: '#6c757d', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{ padding: '10px 20px', background: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                >
                  {editingLesson ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Curriculum Modal */}
      {showCurriculumModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
        }}>
          <div style={{
            background: 'white',
            padding: '30px',
            borderRadius: '8px',
            width: '90%',
            maxWidth: '600px',
            maxHeight: '90vh',
            overflowY: 'auto',
          }}>
            <h2>{editingCurriculum ? 'Edit Curriculum' : 'Create New Curriculum'}</h2>
            <form onSubmit={editingCurriculum ? handleUpdateCurriculum : handleCreateCurriculum}>
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Code *</label>
                <input
                  type="text"
                  value={curriculumForm.curriculum_code}
                  onChange={(e) => setCurriculumForm({ ...curriculumForm, curriculum_code: e.target.value })}
                  style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
                  placeholder="e.g., CS101"
                  maxLength="20"
                  required
                />
              </div>
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Title *</label>
                <input
                  type="text"
                  value={curriculumForm.title}
                  onChange={(e) => setCurriculumForm({ ...curriculumForm, title: e.target.value })}
                  style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
                  placeholder="Curriculum title"
                  required
                />
              </div>
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Description</label>
                <textarea
                  value={curriculumForm.description}
                  onChange={(e) => setCurriculumForm({ ...curriculumForm, description: e.target.value })}
                  style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px', minHeight: '100px' }}
                  placeholder="Curriculum description"
                />
              </div>
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Department</label>
                <input
                  type="text"
                  value={curriculumForm.department}
                  onChange={(e) => setCurriculumForm({ ...curriculumForm, department: e.target.value })}
                  style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
                  placeholder="e.g., Computer Science"
                />
              </div>
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Total Credits</label>
                <input
                  type="number"
                  value={curriculumForm.total_credits}
                  onChange={(e) => setCurriculumForm({ ...curriculumForm, total_credits: e.target.value })}
                  style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
                  placeholder="e.g., 120"
                />
              </div>
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'flex', alignItems: 'center' }}>
                  <input
                    type="checkbox"
                    checked={curriculumForm.is_active}
                    onChange={(e) => setCurriculumForm({ ...curriculumForm, is_active: e.target.checked })}
                    style={{ marginRight: '10px' }}
                  />
                  Active
                </label>
              </div>
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => setShowCurriculumModal(false)}
                  style={{ padding: '10px 20px', background: '#6c757d', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{ padding: '10px 20px', background: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                >
                  {editingCurriculum ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default InstructionModule