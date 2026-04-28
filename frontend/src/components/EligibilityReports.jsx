import { useState, useEffect } from 'react'
import { studentAPI, studentProfileAPI } from '../services/api'
import '../styles/EligibilityReports.css'

function EligibilityReports() {
  // ============================================================================
  // STATE MANAGEMENT
  // ============================================================================
  const [reportType, setReportType] = useState('skill') // 'skill', 'affiliation', 'combined', 'academic'
  const [selectedSkill, setSelectedSkill] = useState('')
  const [selectedAffiliation, setSelectedAffiliation] = useState('')
  const [minGPA, setMinGPA] = useState(0)
  const [enrollmentStatus, setEnrollmentStatus] = useState('Regular')
  const [maxViolations, setMaxViolations] = useState(10)

  const [availableSkills, setAvailableSkills] = useState([])
  const [availableAffiliations, setAvailableAffiliations] = useState([])
  const [reportResults, setReportResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [reportGenerated, setReportGenerated] = useState(false)

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  // Modal state
  const [showModal, setShowModal] = useState(false)
  const [selectedStudent, setSelectedStudent] = useState(null)

  // ============================================================================
  // LOAD AVAILABLE SKILLS AND AFFILIATIONS
  // ============================================================================
  useEffect(() => {
    const loadFiltersData = async () => {
      try {
        const [skillsRes, affiliationsRes] = await Promise.all([
          studentAPI.getAvailableSkills(),
          studentAPI.getAvailableAffiliations(),
        ])
        
        setAvailableSkills(skillsRes.data?.data || [])
        setAvailableAffiliations(affiliationsRes.data?.data || [])
      } catch (err) {
        console.error('Error loading filter data:', err)
        setError('Failed to load filter options')
      }
    }

    loadFiltersData()
  }, [])

  // ============================================================================
  // FETCH STUDENT PROFILE WITH ACADEMIC DETAILS
  // ============================================================================
  const fetchStudentDetails = async (studentId) => {
    try {
      const [profileRes, performanceRes] = await Promise.all([
        studentProfileAPI.getProfile(studentId),
        studentProfileAPI.getAcademicPerformance(studentId),
      ])

      return {
        profile: profileRes.data?.data,
        performance: performanceRes.data?.data,
      }
    } catch (err) {
      console.error(`Error fetching details for student ${studentId}:`, err)
      return null
    }
  }

  // ============================================================================
  // GENERATE REPORT
  // ============================================================================
  const generateReport = async () => {
    setLoading(true)
    setError(null)
    setReportResults([])
    setCurrentPage(1) // Reset to first page when generating new report

    try {
      let students = []

      // Get students based on report type
      if (reportType === 'skill' && selectedSkill) {
        const res = await studentAPI.getBySkill(selectedSkill)
        students = res.data?.data || []
      } else if (reportType === 'affiliation' && selectedAffiliation) {
        const res = await studentAPI.getByAffiliation(selectedAffiliation)
        students = res.data?.data || []
      } else if (reportType === 'combined' && (selectedSkill || selectedAffiliation)) {
        // Get students from both skill and affiliation
        const skillPromise = selectedSkill ? studentAPI.getBySkill(selectedSkill) : Promise.resolve({ data: { data: [] } })
        const affiliationPromise = selectedAffiliation ? studentAPI.getByAffiliation(selectedAffiliation) : Promise.resolve({ data: { data: [] } })

        const [skillRes, affiliationRes] = await Promise.all([skillPromise, affiliationPromise])

        const skillStudents = skillRes.data?.data || []
        const affiliationStudents = affiliationRes.data?.data || []

        // Combine and deduplicate
        const studentMap = new Map()
        skillStudents.forEach(s => studentMap.set(s.student_id, { ...s, hasSkill: true }))
        affiliationStudents.forEach(s => {
          if (studentMap.has(s.student_id)) {
            studentMap.get(s.student_id).hasAffiliation = true
          } else {
            studentMap.set(s.student_id, { ...s, hasAffiliation: true })
          }
        })

        students = Array.from(studentMap.values())
      } else if (reportType === 'academic') {
        // Get all enrolled students for academic filtering
        const res = await studentAPI.getByStatus(enrollmentStatus)
        students = res.data?.data || []
      } else {
        setError('Please select criteria for the report')
        setLoading(false)
        return
      }

      if (students.length === 0) {
        setError('No students found matching the selected criteria')
        setLoading(false)
        return
      }

      // Fetch detailed information for each student
      const detailedStudents = await Promise.all(
        students.map(async (student) => {
          const details = await fetchStudentDetails(student.student_id)
          return {
            ...student,
            ...details?.profile,
            gpa: details?.performance?.gpa || 0,
            violationsCount: details?.profile?.violations_summary?.unresolved_violations || 0,
          }
        })
      )

      // Apply additional filters (GPA, violations, status)
      let filtered = detailedStudents.filter(student => {
        const meetsGPA = student.gpa >= minGPA
        const meetsViolations = student.violationsCount <= maxViolations
        const meetsStatus = reportType === 'academic' ? student.student_identification === enrollmentStatus : true

        return meetsGPA && meetsViolations && meetsStatus
      })

      // Sort by GPA descending
      filtered.sort((a, b) => b.gpa - a.gpa)

      setReportResults(filtered)
      setReportGenerated(true)

      if (filtered.length === 0) {
        setError('No students matched all the criteria')
      }
    } catch (err) {
      console.error('Error generating report:', err)
      setError('Failed to generate report. Please try again.')
      setReportGenerated(false)
    } finally {
      setLoading(false)
    }
  }

  // ============================================================================
  // VIEW STUDENT PROFILE
  // ============================================================================
  const handleViewProfile = (student) => {
    console.log('=== STUDENT PROFILE DATA ===')
    console.log('Full student object:', student)
    console.log('Skills:', student?.skills)
    console.log('Affiliations:', student?.affiliations)
    console.log('=========================')
    setSelectedStudent(student)
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    setSelectedStudent(null)
  }

  // ============================================================================
  // PAGINATION LOGIC
  // ============================================================================
  const totalPages = Math.ceil(reportResults.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedResults = reportResults.slice(startIndex, endIndex)

  const goToPage = (pageNum) => {
    if (pageNum >= 1 && pageNum <= totalPages) {
      setCurrentPage(pageNum)
      // Scroll to table
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <div className="eligibility-reports">
      <div className="reports-container">
        <div className="reports-header">
          <h1>📊 Eligibility Reports</h1>
          <p>Generate custom eligibility reports based on skills, affiliations, GPA, and more</p>
        </div>

        <div className="reports-content">
          {/* ===== LEFT PANEL: FILTERS ===== */}
          <div className="filters-section">
            <h2>Report Criteria</h2>

            {/* Report Type Selection */}
            <div className="filter-group">
              <label>Report Type</label>
              <div className="report-type-options">
                <label className="radio-option">
                  <input
                    type="radio"
                    value="skill"
                    checked={reportType === 'skill'}
                    onChange={(e) => setReportType(e.target.value)}
                  />
                  <span>Skills Only</span>
                  <small>Find students with a specific skill</small>
                </label>

                <label className="radio-option">
                  <input
                    type="radio"
                    value="affiliation"
                    checked={reportType === 'affiliation'}
                    onChange={(e) => setReportType(e.target.value)}
                  />
                  <span>Affiliations Only</span>
                  <small>Find students in a specific organization</small>
                </label>

                <label className="radio-option">
                  <input
                    type="radio"
                    value="combined"
                    checked={reportType === 'combined'}
                    onChange={(e) => setReportType(e.target.value)}
                  />
                  <span>Combined (Skills + Affiliations)</span>
                  <small>Find students with skills and/or affiliations</small>
                </label>

                <label className="radio-option">
                  <input
                    type="radio"
                    value="academic"
                    checked={reportType === 'academic'}
                    onChange={(e) => setReportType(e.target.value)}
                  />
                  <span>Academic Performance</span>
                  <small>Find students by GPA and academic status</small>
                </label>
              </div>
            </div>

            {/* Skill Selection */}
            {(reportType === 'skill' || reportType === 'combined') && (
              <div className="filter-group">
                <label htmlFor="skill-select">Select Skill</label>
                <select
                  id="skill-select"
                  value={selectedSkill}
                  onChange={(e) => setSelectedSkill(e.target.value)}
                  className="filter-select"
                >
                  <option value="">-- Choose a skill --</option>
                  {availableSkills.map((skill) => (
                    <option key={skill} value={skill}>
                      {skill}
                    </option>
                  ))}
                </select>
                <small>Example skills: Basketball, Programming, Leadership</small>
              </div>
            )}

            {/* Affiliation Selection */}
            {(reportType === 'affiliation' || reportType === 'combined') && (
              <div className="filter-group">
                <label htmlFor="affiliation-select">Select Affiliation</label>
                <select
                  id="affiliation-select"
                  value={selectedAffiliation}
                  onChange={(e) => setSelectedAffiliation(e.target.value)}
                  className="filter-select"
                >
                  <option value="">-- Choose an affiliation --</option>
                  {availableAffiliations.map((affiliation) => (
                    <option key={affiliation} value={affiliation}>
                      {affiliation}
                    </option>
                  ))}
                </select>
                <small>Example affiliations: Basketball Club, Programming Club</small>
              </div>
            )}

            {/* GPA Threshold */}
            <div className="filter-group">
              <label htmlFor="min-gpa">
                Minimum GPA: <strong>{minGPA.toFixed(2)}</strong>
              </label>
              <input
                id="min-gpa"
                type="range"
                min="0"
                max="4"
                step="0.1"
                value={minGPA}
                onChange={(e) => setMinGPA(parseFloat(e.target.value))}
                className="slider"
              />
              <small>Range: 0.00 - 4.00</small>
            </div>

            {/* Max Violations */}
            <div className="filter-group">
              <label htmlFor="max-violations">
                Maximum Unresolved Violations: <strong>{maxViolations}</strong>
              </label>
              <input
                id="max-violations"
                type="range"
                min="0"
                max="10"
                step="1"
                value={maxViolations}
                onChange={(e) => setMaxViolations(parseInt(e.target.value))}
                className="slider"
              />
              <small>0 = No violations allowed, 10 = Up to 10 violations</small>
            </div>

            {/* Enrollment Status */}
            {reportType === 'academic' && (
              <div className="filter-group">
                <label htmlFor="enrollment-status">Student Identification Status</label>
                <select
                  id="enrollment-status"
                  value={enrollmentStatus}
                  onChange={(e) => setEnrollmentStatus(e.target.value)}
                  className="filter-select"
                >
                  <option value="Regular">Regular</option>
                  <option value="Irregular">Irregular</option>
                  <option value="Graduated">Graduated</option>
                  <option value="On Leave">On Leave</option>
                  <option value="Dropped">Dropped</option>
                </select>
              </div>
            )}

            {/* Generate Button */}
            <button
              onClick={generateReport}
              disabled={loading}
              className="btn-generate"
            >
              {loading ? '⏳ Generating...' : '🔍 Generate Report'}
            </button>

            {/* Example Queries */}
            <div className="example-queries">
              <h3>📋 Pre-built Queries</h3>
              <button
                className="example-btn"
                onClick={() => {
                  setReportType('skill')
                  setSelectedSkill('Basketball')
                  setMinGPA(0)
                  setMaxViolations(999)
                }}
              >
                Basketball Try-outs
              </button>
              <button
                className="example-btn"
                onClick={() => {
                  setReportType('skill')
                  setSelectedSkill('Programming')
                  setMinGPA(2.5)
                  setMaxViolations(2)
                }}
              >
                Programming Contest
              </button>
              <button
                className="example-btn"
                onClick={() => {
                  setReportType('academic')
                  setMinGPA(3.5)
                  setMaxViolations(0)
                  setEnrollmentStatus('Regular')
                }}
              >
                Dean's List
              </button>
            </div>
          </div>

          {/* ===== RIGHT PANEL: RESULTS ===== */}
          <div className="results-section">
            {error && (
              <div className="alert alert-error">
                ⚠️ {error}
              </div>
            )}

            {reportGenerated && reportResults.length > 0 && (
              <div className="results-header">
                <h2>
                  📈 Results: <strong>{reportResults.length}</strong> students
                </h2>
                <p>
                  {reportType === 'skill' && `Skill: ${selectedSkill}`}
                  {reportType === 'affiliation' && `Affiliation: ${selectedAffiliation}`}
                  {reportType === 'combined' && `Skill/Affiliation + GPA ≥ ${minGPA}`}
                  {reportType === 'academic' && `Academic Status: ${enrollmentStatus} | GPA ≥ ${minGPA}`}
                </p>
                <p className="pagination-info">
                  Showing {startIndex + 1} to {Math.min(endIndex, reportResults.length)} of {reportResults.length} students
                </p>
              </div>
            )}

            {reportGenerated && reportResults.length > 0 && (
              <div className="results-table-wrapper">
                <table className="results-table">
                  <thead>
                    <tr>
                      <th>Student #</th>
                      <th>Name</th>
                      <th>Email</th>
                      <th>GPA</th>
                      <th>Status</th>
                      <th>Violations</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedResults.map((student, idx) => (
                      <tr key={student.student_id} className={idx % 2 === 0 ? 'even' : 'odd'}>
                        <td className="student-number">
                          <span className="badge">{student.student_number}</span>
                        </td>
                        <td className="student-name">
                          {student.first_name} {student.middle_name ? `${student.middle_name[0]}.` : ''} {student.last_name}
                        </td>
                        <td className="email">{student.email}</td>
                        <td className="gpa">
                          <span className={`gpa-badge gpa-${Math.floor(student.gpa)}`}>
                            {student.gpa.toFixed(2)}
                          </span>
                        </td>
                        <td className="status">
                          <span className="status-badge">
                            {student.student_identification || 'Active'}
                          </span>
                        </td>
                        <td className="violations">
                          <span className={`violations-badge ${student.violationsCount > 0 ? 'has-violations' : 'clean'}`}>
                            {student.violationsCount}
                          </span>
                        </td>
                        <td className="action">
                          <button
                            className="btn-view"
                            onClick={() => handleViewProfile(student)}
                          >
                            View Profile
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Pagination Controls */}
            {reportGenerated && reportResults.length > 0 && totalPages > 1 && (
              <div className="pagination-container">
                <button
                  onClick={() => goToPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="pagination-btn"
                >
                  ← Previous
                </button>

                <div className="pagination-pages">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                    <button
                      key={pageNum}
                      onClick={() => goToPage(pageNum)}
                      className={`pagination-page ${pageNum === currentPage ? 'active' : ''}`}
                    >
                      {pageNum}
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => goToPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="pagination-btn"
                >
                  Next →
                </button>
              </div>
            )}

            {!reportGenerated && (
              <div className="welcome-message">
                <h3>👋 Welcome to Eligibility Reports</h3>
                <p>Select your criteria and click "Generate Report" to find eligible students.</p>
                <div className="examples">
                  <h4>Common Use Cases:</h4>
                  <ul>
                    <li>🏀 <strong>Basketball Try-outs:</strong> Students with Basketball skill</li>
                    <li>💻 <strong>Programming Contest:</strong> Students with Programming skill and GPA ≥ 2.5</li>
                    <li>🎓 <strong>Dean's List:</strong> Students with GPA ≥ 3.5 and no violations</li>
                    <li>🏆 <strong>Scholarships:</strong> High-GPA students in good academic standing</li>
                    <li>🤝 <strong>Mentorship Programs:</strong> Students by affiliation/organization</li>
                  </ul>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ===== PROFILE MODAL ===== */}
        {showModal && selectedStudent && (
          <div className="modal-overlay" onClick={closeModal}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>Student Profile</h2>
                <button className="modal-close-btn" onClick={closeModal}>
                  ✕
                </button>
              </div>

              <div className="modal-body">
                {/* Personal Information */}
                <div className="profile-section">
                  <h3>👤 Personal Information</h3>
                  <div className="profile-grid">
                    <div className="profile-item">
                      <label>Student Number:</label>
                      <span>{selectedStudent?.student_number || 'N/A'}</span>
                    </div>
                    <div className="profile-item">
                      <label>Full Name:</label>
                      <span>
                        {selectedStudent?.first_name || ''} {selectedStudent?.middle_name ? `${selectedStudent.middle_name} ` : ''} {selectedStudent?.last_name || ''}
                      </span>
                    </div>
                    <div className="profile-item">
                      <label>Email:</label>
                      <span>{selectedStudent?.email || 'N/A'}</span>
                    </div>
                    <div className="profile-item">
                      <label>Status:</label>
                      <span className="status-badge">{selectedStudent?.student_identification || 'Active'}</span>
                    </div>
                  </div>
                </div>

                {/* Academic Information */}
                <div className="profile-section">
                  <h3>🎓 Academic Information</h3>
                  <div className="profile-grid">
                    <div className="profile-item">
                      <label>GPA:</label>
                      <span className={`gpa-badge gpa-${Math.floor((selectedStudent?.gpa ?? 0) * 10) / 10}`}>
                        {((selectedStudent?.gpa ?? 0) * 100 / 100).toFixed(2)}
                      </span>
                    </div>
                    <div className="profile-item">
                      <label>Violations:</label>
                      <span className={`violations-badge ${((selectedStudent?.violationsCount ?? 0) > 0) ? 'has-violations' : 'clean'}`}>
                        {(selectedStudent?.violationsCount ?? 0)} unresolved
                      </span>
                    </div>
                  </div>
                </div>

                {/* Skills */}
                {(selectedStudent?.skills?.length > 0) && (
                  <div className="profile-section">
                    <h3>🎯 Skills</h3>
                    <div className="skills-list">
                      {selectedStudent.skills.map((skill, idx) => (
                        <span key={idx} className="skill-tag">
                          {typeof skill === 'string' ? skill : (skill?.skill_name || skill?.name || 'Unknown')}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Affiliations */}
                {(selectedStudent?.affiliations?.length > 0) && (
                  <div className="profile-section">
                    <h3>🏢 Affiliations</h3>
                    <div className="affiliations-list">
                      {selectedStudent.affiliations.map((affiliation, idx) => (
                        <div key={idx} className="affiliation-item">
                          {typeof affiliation === 'string' ? affiliation : (affiliation?.affiliation_name || affiliation?.name || 'Unknown')}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="modal-footer">
                <button className="modal-btn-close" onClick={closeModal}>
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default EligibilityReports
