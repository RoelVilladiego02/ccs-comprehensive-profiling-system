import { useState, useEffect } from 'react'
import '../styles/modal-styles.css'

function StudentForm({ student, isOpen, onClose, onSubmit, availableIdentifications = [] }) {
  const [formData, setFormData] = useState({
    student_number: '',
    first_name: '',
    middle_name: '',
    last_name: '',
    suffix: '',
    email: '',
    gender: '',
    student_identification: '',
    curriculum: '',
    phone_number: ''
  })

  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Populate form when student is provided (edit mode)
  useEffect(() => {
    if (student) {
      setFormData({
        student_number: student.student_number || '',
        first_name: student.first_name || '',
        middle_name: student.middle_name || '',
        last_name: student.last_name || '',
        suffix: student.suffix || '',
        email: student.email || '',
        gender: student.gender || '',
        student_identification: student.student_identification || '',
        curriculum: student.curriculum || '',
        phone_number: student.phone_number || ''
      })
      setErrors({})
    } else {
      // Reset form for add mode
      setFormData({
        student_number: '',
        first_name: '',
        middle_name: '',
        last_name: '',
        suffix: '',
        email: '',
        gender: '',
        student_identification: '',
        curriculum: '',
        phone_number: ''
      })
      setErrors({})
    }
  }, [student, isOpen])

  const validateForm = () => {
    const newErrors = {}

    if (!formData.student_number.trim()) {
      newErrors.student_number = 'Student number is required'
    }
    if (!formData.first_name.trim()) {
      newErrors.first_name = 'First name is required'
    }
    if (!formData.last_name.trim()) {
      newErrors.last_name = 'Last name is required'
    }
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email is invalid'
    }
    if (!formData.gender) {
      newErrors.gender = 'Gender is required'
    }
    if (!formData.student_identification) {
      newErrors.student_identification = 'Student identification is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)
    try {
      await onSubmit(formData)
      onClose()
    } catch (err) {
      setErrors({ submit: err.message || 'Failed to submit form' })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{student ? 'Edit Student' : 'Add New Student'}</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <form onSubmit={handleSubmit} className="student-form">
          <div className="modal-body">
            {errors.submit && (
              <div style={{ 
                padding: '12px', 
                marginBottom: '16px', 
                background: '#fee', 
                border: '1px solid #fcc', 
                borderRadius: '4px', 
                color: '#c00' 
              }}>
                {errors.submit}
              </div>
            )}

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="student_number">Student Number *</label>
                <input
                  type="text"
                  id="student_number"
                  name="student_number"
                  value={formData.student_number}
                  onChange={handleChange}
                  disabled={student ? true : false}
                  className={errors.student_number ? 'input-error' : ''}
                />
                {errors.student_number && <span className="error-text">{errors.student_number}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="email">Email *</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={errors.email ? 'input-error' : ''}
                />
                {errors.email && <span className="error-text">{errors.email}</span>}
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="first_name">First Name *</label>
                <input
                  type="text"
                  id="first_name"
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleChange}
                  className={errors.first_name ? 'input-error' : ''}
                />
                {errors.first_name && <span className="error-text">{errors.first_name}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="middle_name">Middle Name</label>
                <input
                  type="text"
                  id="middle_name"
                  name="middle_name"
                  value={formData.middle_name}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label htmlFor="last_name">Last Name *</label>
                <input
                  type="text"
                  id="last_name"
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleChange}
                  className={errors.last_name ? 'input-error' : ''}
                />
                {errors.last_name && <span className="error-text">{errors.last_name}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="suffix">Suffix</label>
                <input
                  type="text"
                  id="suffix"
                  name="suffix"
                  placeholder="Jr., Sr., III, etc."
                  value={formData.suffix}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="gender">Gender *</label>
                <select
                  id="gender"
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  className={errors.gender ? 'input-error' : ''}
                >
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                  <option value="Prefer not to say">Prefer not to say</option>
                </select>
                {errors.gender && <span className="error-text">{errors.gender}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="student_identification">Student Identification *</label>
                <select
                  id="student_identification"
                  name="student_identification"
                  value={formData.student_identification}
                  onChange={handleChange}
                  className={errors.student_identification ? 'input-error' : ''}
                >
                  <option value="">Select Identification</option>
                  {availableIdentifications.map(id => (
                    <option key={id} value={id}>{id}</option>
                  ))}
                </select>
                {errors.student_identification && <span className="error-text">{errors.student_identification}</span>}
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="curriculum">Curriculum</label>
                <input
                  type="text"
                  id="curriculum"
                  name="curriculum"
                  value={formData.curriculum}
                  onChange={handleChange}
                  placeholder="e.g., Bachelor of Science in Computer Science"
                />
              </div>

              <div className="form-group">
                <label htmlFor="phone_number">Phone Number</label>
                <input
                  type="tel"
                  id="phone_number"
                  name="phone_number"
                  value={formData.phone_number}
                  onChange={handleChange}
                  placeholder="+1 (555) 123-4567"
                />
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : student ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default StudentForm
