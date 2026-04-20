import { useState, useEffect } from 'react'
import { facultyAPI } from '../services/api'

function AdminFacultyManagement() {
  const [faculty, setFaculty] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [selectedFaculty, setSelectedFaculty] = useState(null)
  const [showFacultyForm, setShowFacultyForm] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [facultyToDelete, setFacultyToDelete] = useState(null)

  const [formData, setFormData] = useState({
    faculty_number: '',
    first_name: '',
    middle_name: '',
    last_name: '',
    suffix: '',
    gender: 'Male',
    email: '',
    phone_number: '',
    employment_status: 'Full-Time',
    department: ''
  })

  useEffect(() => {
    fetchFaculty()
  }, [])

  const fetchFaculty = async () => {
    try {
      setLoading(true)
      const response = await facultyAPI.getAll()
      if (response.data.success) {
        setFaculty(response.data.data || [])
      }
    } catch (err) {
      setError('Failed to load faculty')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleOpenAddForm = () => {
    setSelectedFaculty(null)
    setFormData({
      faculty_number: '',
      first_name: '',
      middle_name: '',
      last_name: '',
      suffix: '',
      gender: 'Male',
      email: '',
      phone_number: '',
      employment_status: 'Full-Time',
      department: ''
    })
    setShowFacultyForm(true)
  }

  const handleEditFaculty = (member) => {
    setSelectedFaculty(member)
    setFormData({
      faculty_number: member.faculty_number,
      first_name: member.first_name,
      middle_name: member.middle_name || '',
      last_name: member.last_name,
      suffix: member.suffix || '',
      gender: member.gender,
      email: member.email,
      phone_number: member.phone_number || '',
      employment_status: member.employment_status,
      department: member.department || ''
    })
    setShowFacultyForm(true)
  }

  const handleDeleteFaculty = (member) => {
    setFacultyToDelete(member)
    setShowDeleteConfirm(true)
  }

  const handleConfirmDelete = async () => {
    if (!facultyToDelete) return

    try {
      await facultyAPI.delete(facultyToDelete.faculty_id || facultyToDelete.id)
      setSuccessMessage(`Faculty ${facultyToDelete.first_name} ${facultyToDelete.last_name} deleted successfully`)
      setShowDeleteConfirm(false)
      setFacultyToDelete(null)
      fetchFaculty()

      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(''), 3000)
    } catch (err) {
      setError('Failed to delete faculty')
      console.error(err)
    }
  }

  const handleSaveFaculty = async () => {
    try {
      if (!formData.faculty_number || !formData.first_name || !formData.last_name || !formData.email) {
        setError('Faculty number, first name, last name, and email are required')
        return
      }

      if (selectedFaculty) {
        // Edit existing faculty
        await facultyAPI.update(selectedFaculty.faculty_id || selectedFaculty.id, formData)
        setSuccessMessage('Faculty updated successfully')
      } else {
        // Create new faculty
        await facultyAPI.create(formData)
        setSuccessMessage('Faculty created successfully')
      }

      setShowFacultyForm(false)
      setSelectedFaculty(null)
      fetchFaculty()

      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(''), 3000)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save faculty')
      console.error(err)
    }
  }

  return (
    <div className="section-content">
      <div className="content-header">
        <h2>Faculty Management</h2>
        <button
          className="add-btn"
          onClick={handleOpenAddForm}
          style={{
            background: '#28a745',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            padding: '8px 16px',
            cursor: 'pointer',
            fontSize: '0.95rem',
            fontWeight: '500'
          }}
        >
          + Add Faculty
        </button>
      </div>

      <div className="results-info">
        <span className="result-count">
          Total Faculty: <strong>{faculty.length}</strong>
        </span>
      </div>

      {successMessage && (
        <div style={{
          margin: '20px 0',
          padding: '12px',
          background: '#d4edda',
          border: '1px solid #c3e6cb',
          borderRadius: '4px',
          color: '#155724',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <span>✓ {successMessage}</span>
          <button
            onClick={() => setSuccessMessage('')}
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              fontSize: '1.2rem',
              color: '#155724'
            }}
          >
            ✕
          </button>
        </div>
      )}

      {error && (
        <div style={{
          margin: '20px 0',
          padding: '12px',
          background: '#fee',
          border: '1px solid #fcc',
          borderRadius: '4px',
          color: '#c00',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <span>{error}</span>
          <button
            onClick={() => setError('')}
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              fontSize: '1.2rem',
              color: '#c00'
            }}
          >
            ✕
          </button>
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
          <p>Loading faculty...</p>
        </div>
      ) : faculty.length > 0 ? (
        <div className="faculty-table-container" style={{
          overflowX: 'auto',
          marginTop: '20px',
          borderRadius: '4px',
          border: '1px solid #dee2e6',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          width: '100%'
        }}>
          <table style={{
            width: 'auto',
            minWidth: '100%',
            borderCollapse: 'collapse',
            tableLayout: 'fixed'
          }}>
            <thead>
              <tr style={{ background: '#f8f9fa', borderBottom: '2px solid #dee2e6' }}>
                <th style={{ padding: '14px 12px', textAlign: 'left', fontWeight: '700', width: '120px', fontSize: '0.92rem' }}>Faculty #</th>
                <th style={{ padding: '14px 12px', textAlign: 'left', fontWeight: '700', width: '200px', fontSize: '0.92rem' }}>Full Name</th>
                <th style={{ padding: '14px 12px', textAlign: 'left', fontWeight: '700', width: '180px', fontSize: '0.92rem' }}>Email</th>
                <th style={{ padding: '14px 12px', textAlign: 'left', fontWeight: '700', width: '150px', fontSize: '0.92rem' }}>Department</th>
                <th style={{ padding: '14px 12px', textAlign: 'center', fontWeight: '700', width: '150px', fontSize: '0.92rem' }}>Employment</th>
                <th style={{ padding: '14px 12px', textAlign: 'center', fontWeight: '700', width: '180px', fontSize: '0.92rem' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {faculty.map((member, index) => (
                <tr
                  key={member.faculty_id || index}
                  style={{
                    borderBottom: '1px solid #e9ecef',
                    background: index % 2 === 0 ? '#fff' : '#f8f9fa',
                    transition: 'background-color 0.15s ease'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#e7f3ff'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = index % 2 === 0 ? '#fff' : '#f8f9fa'}
                >
                  <td style={{ padding: '14px 12px', fontWeight: '700', color: '#0056b3', fontSize: '0.94rem', width: '120px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {member.faculty_number}
                  </td>
                  <td style={{ padding: '14px 12px', fontSize: '0.94rem', color: '#333333', width: '200px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {member.first_name} {member.middle_name ? `${member.middle_name.charAt(0)}.` : ''} {member.last_name}
                  </td>
                  <td style={{ padding: '14px 12px', fontSize: '0.94rem', color: '#666666', width: '180px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {member.email}
                  </td>
                  <td style={{ padding: '14px 12px', fontSize: '0.94rem', color: '#666666', width: '150px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {member.department || '-'}
                  </td>
                  <td style={{ padding: '14px 12px', textAlign: 'center', fontSize: '0.94rem', fontWeight: '500', color: '#333333', width: '150px' }}>
                    <span style={{
                      padding: '6px 11px',
                      borderRadius: '16px',
                      fontSize: '0.80rem',
                      fontWeight: '600',
                      display: 'inline-block',
                      background: member.employment_status === 'Full-Time' ? '#d4edda' : '#fff3cd',
                      color: member.employment_status === 'Full-Time' ? '#155724' : '#856404',
                      whiteSpace: 'nowrap'
                    }}>
                      {member.employment_status}
                    </span>
                  </td>
                  <td style={{ padding: '14px 12px', textAlign: 'center', width: '180px' }}>
                    <div style={{ display: 'flex', gap: '5px', justifyContent: 'center', flexWrap: 'wrap' }}>
                      <button
                        onClick={() => handleEditFaculty(member)}
                        style={{
                          background: '#007bff',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          padding: '6px 10px',
                          cursor: 'pointer',
                          fontSize: '0.80rem',
                          fontWeight: '500',
                          transition: 'all 0.15s ease',
                          whiteSpace: 'nowrap'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = '#0056b3'
                          e.currentTarget.style.transform = 'translateY(-1px)'
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = '#007bff'
                          e.currentTarget.style.transform = 'translateY(0)'
                        }}
                      >
                        ✎ Edit
                      </button>
                      <button
                        onClick={() => handleDeleteFaculty(member)}
                        style={{
                          background: '#dc3545',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          padding: '6px 10px',
                          cursor: 'pointer',
                          fontSize: '0.80rem',
                          fontWeight: '500',
                          transition: 'all 0.15s ease',
                          whiteSpace: 'nowrap'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = '#c82333'
                          e.currentTarget.style.transform = 'translateY(-1px)'
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = '#dc3545'
                          e.currentTarget.style.transform = 'translateY(0)'
                        }}
                      >
                        🗑 Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="empty-state" style={{ textAlign: 'center', padding: '40px' }}>
          <p>No faculty found</p>
          <button
            onClick={handleOpenAddForm}
            style={{
              background: '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              padding: '8px 16px',
              cursor: 'pointer',
              marginTop: '10px'
            }}
          >
            Add First Faculty
          </button>
        </div>
      )}

      {/* Faculty Form Modal */}
      {showFacultyForm && (
        <div className="modal-overlay" onClick={() => setShowFacultyForm(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{selectedFaculty ? 'Edit Faculty' : 'Add New Faculty'}</h2>
              <button
                className="modal-close"
                onClick={() => setShowFacultyForm(false)}
              >
                ✕
              </button>
            </div>
            <div className="modal-body" style={{ padding: '20px', maxHeight: '70vh', overflowY: 'auto' }}>
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>
                  Faculty Number {selectedFaculty ? '(Read-only)' : '*'}
                </label>
                <input
                  type="text"
                  value={formData.faculty_number}
                  onChange={(e) => setFormData({ ...formData, faculty_number: e.target.value })}
                  disabled={selectedFaculty !== null}
                  style={{
                    width: '100%',
                    padding: '8px',
                    border: '1px solid #ccc',
                    borderRadius: '4px',
                    fontSize: '0.95rem',
                    boxSizing: 'border-box',
                    backgroundColor: selectedFaculty ? '#f5f5f5' : 'white',
                    cursor: selectedFaculty ? 'not-allowed' : 'text'
                  }}
                  placeholder="Auto-generated"
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>
                    First Name *
                  </label>
                  <input
                    type="text"
                    value={formData.first_name}
                    onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '8px',
                      border: '1px solid #ccc',
                      borderRadius: '4px',
                      fontSize: '0.95rem',
                      boxSizing: 'border-box'
                    }}
                    placeholder="First name"
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>
                    Middle Name
                  </label>
                  <input
                    type="text"
                    value={formData.middle_name}
                    onChange={(e) => setFormData({ ...formData, middle_name: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '8px',
                      border: '1px solid #ccc',
                      borderRadius: '4px',
                      fontSize: '0.95rem',
                      boxSizing: 'border-box'
                    }}
                    placeholder="Middle name"
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>
                    Last Name *
                  </label>
                  <input
                    type="text"
                    value={formData.last_name}
                    onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '8px',
                      border: '1px solid #ccc',
                      borderRadius: '4px',
                      fontSize: '0.95rem',
                      boxSizing: 'border-box'
                    }}
                    placeholder="Last name"
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>
                    Suffix
                  </label>
                  <input
                    type="text"
                    value={formData.suffix}
                    onChange={(e) => setFormData({ ...formData, suffix: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '8px',
                      border: '1px solid #ccc',
                      borderRadius: '4px',
                      fontSize: '0.95rem',
                      boxSizing: 'border-box'
                    }}
                    placeholder="Jr., Sr., Ph.D., etc."
                  />
                </div>
              </div>

              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>
                  Email *
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '8px',
                    border: '1px solid #ccc',
                    borderRadius: '4px',
                    fontSize: '0.95rem',
                    boxSizing: 'border-box'
                  }}
                  placeholder="faculty@example.com"
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>
                    Gender *
                  </label>
                  <select
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '8px',
                      border: '1px solid #ccc',
                      borderRadius: '4px',
                      fontSize: '0.95rem',
                      boxSizing: 'border-box'
                    }}
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Prefer not to say">Prefer not to say</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>
                    Phone Number
                  </label>
                  <input
                    type="text"
                    value={formData.phone_number}
                    onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '8px',
                      border: '1px solid #ccc',
                      borderRadius: '4px',
                      fontSize: '0.95rem',
                      boxSizing: 'border-box'
                    }}
                    placeholder="Contact number"
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>
                    Employment Status *
                  </label>
                  <select
                    value={formData.employment_status}
                    onChange={(e) => setFormData({ ...formData, employment_status: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '8px',
                      border: '1px solid #ccc',
                      borderRadius: '4px',
                      fontSize: '0.95rem',
                      boxSizing: 'border-box'
                    }}
                  >
                    <option value="Full-Time">Full-Time</option>
                    <option value="Part-Time">Part-Time</option>
                    <option value="Probationary">Probationary</option>
                    <option value="Contractual">Contractual</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>
                    Department
                  </label>
                  <input
                    type="text"
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '8px',
                      border: '1px solid #ccc',
                      borderRadius: '4px',
                      fontSize: '0.95rem',
                      boxSizing: 'border-box'
                    }}
                    placeholder="e.g., Computer Science"
                  />
                </div>
              </div>
            </div>
            <div className="modal-footer" style={{ padding: '20px', borderTop: '1px solid #eee', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                onClick={() => setShowFacultyForm(false)}
                style={{
                  background: '#6c757d',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  padding: '8px 16px',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleSaveFaculty}
                style={{
                  background: '#28a745',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  padding: '8px 16px',
                  cursor: 'pointer'
                }}
              >
                {selectedFaculty ? 'Update' : 'Create'} Faculty
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && facultyToDelete && (
        <div className="modal-overlay" onClick={() => setShowDeleteConfirm(false)}>
          <div className="modal-content" style={{ maxWidth: '400px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Delete Faculty</h2>
              <button
                className="modal-close"
                onClick={() => setShowDeleteConfirm(false)}
              >
                ✕
              </button>
            </div>
            <div className="modal-body" style={{ padding: '20px' }}>
              <p>Are you sure you want to delete <strong>{facultyToDelete.first_name} {facultyToDelete.last_name}</strong>?</p>
              <p style={{ color: '#666', fontSize: '0.9rem' }}>This action cannot be undone.</p>
            </div>
            <div className="modal-footer" style={{ padding: '20px', borderTop: '1px solid #eee', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                style={{
                  background: '#6c757d',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  padding: '8px 16px',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                style={{
                  background: '#dc3545',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  padding: '8px 16px',
                  cursor: 'pointer'
                }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminFacultyManagement
