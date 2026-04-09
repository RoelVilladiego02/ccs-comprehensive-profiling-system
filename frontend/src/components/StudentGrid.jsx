import '../styles/StudentGrid.css'

function StudentGrid({ students, onViewStudent }) {
  const handleViewClick = (student) => {
    if (onViewStudent) {
      onViewStudent(student)
    }
  }

  return (
    <div className="grid-wrapper">
      <div className="students-grid">
        {students.map(student => (
          <div key={student.id} className="student-card">
            <div className="card-header">
              <h3 className="student-name">
                {student.first_name} {student.last_name}
              </h3>
              <div className="card-meta">
                <span className="student-number">ID: {student.student_number}</span>
              </div>
            </div>
            
            <div className="card-body">
              <div className="info-block">
                <label>Email:</label>
                <p>{student.email}</p>
              </div>
              
              <div className="info-row">
                <div className="info-col">
                  <label>Gender:</label>
                  <p>{student.gender || 'N/A'}</p>
                </div>
                <div className="info-col">
                  <label>Identification:</label>
                  <p>{student.student_identification || 'N/A'}</p>
                </div>
              </div>

              {student.curriculum && (
                <div className="info-block">
                  <label>Curriculum:</label>
                  <p>{student.curriculum}</p>
                </div>
              )}

              <div className="info-row">
                {student.gpa !== undefined && (
                  <div className="info-col">
                    <label>GPA:</label>
                    <p className={`gpa-value ${student.gpa < 2.0 ? 'at-risk' : ''}`}>
                      {student.gpa.toFixed(2)}
                    </p>
                  </div>
                )}
                {student.attendance_rate !== undefined && (
                  <div className="info-col">
                    <label>Attendance:</label>
                    <p>{student.attendance_rate.toFixed(1)}%</p>
                  </div>
                )}
              </div>

              {student.violations_count !== undefined && (
                <div className="info-block">
                  <label>Violations:</label>
                  <p>{student.violations_count}</p>
                </div>
              )}
            </div>

            <div className="card-footer">
              <button 
                className="view-btn"
                onClick={() => handleViewClick(student)}
              >
                View Profile
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default StudentGrid
