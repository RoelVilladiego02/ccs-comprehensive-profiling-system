import '../styles/StudentTable.css'

// Sort icon component - defined outside to avoid re-creation on render
const SortIcon = ({ field, sortConfig }) => {
  if (sortConfig.field !== field) return <span className="sort-icon">⇅</span>
  return sortConfig.direction === 'asc' ? 
    <span className="sort-icon active">▲</span> : 
    <span className="sort-icon active">▼</span>
}

function AdminStudentTable({ students, sortConfig, onSort, onViewStudent, onEditStudent, onDeleteStudent }) {

  const handleHeaderClick = (field) => {
    onSort(field)
  }

  const handleViewClick = (student) => {
    if (onViewStudent) {
      onViewStudent(student)
    }
  }

  const handleEditClick = (e, student) => {
    e.stopPropagation()
    if (onEditStudent) {
      onEditStudent(student)
    }
  }

  const handleDeleteClick = (e, student) => {
    e.stopPropagation()
    if (onDeleteStudent) {
      onDeleteStudent(student)
    }
  }

  return (
    <div className="table-wrapper">
      <table className="students-table">
        <colgroup>
          <col className="col-student-number" />
          <col className="col-name" />
          <col className="col-email" />
          <col className="col-gender" />
          <col className="col-identification" />
          <col className="col-status" />
          <col className="col-actions-admin" />
        </colgroup>
        <thead>
          <tr>
            <th onClick={() => handleHeaderClick('student_number')} className="sortable">
              Student # <SortIcon field="student_number" sortConfig={sortConfig} />
            </th>
            <th>Name</th>
            <th>Email</th>
            <th>Gender</th>
            <th>Identification</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {students.map(student => {
            const status = student.status ?? 'Active'
            
            return (
            <tr key={student.student_id || student.id}>
              <td className="student-number">
                <span className="badge">{student.student_number}</span>
              </td>
              <td className="student-name">
                {student.first_name} {student.middle_name ? `${student.middle_name[0]}.` : ''} {student.last_name}
              </td>
              <td className="email">{student.email}</td>
              <td className="gender">{student.gender}</td>
              <td className="identification">{student.student_identification}</td>
              <td className="status">
                <span className={`status-badge status-${status.toLowerCase().replace(' ', '-')}`}>
                  {status}
                </span>
              </td>
              <td className="actions-admin">
                <button 
                  className="action-btn view-btn" 
                  title="View Profile"
                  onClick={() => handleViewClick(student)}
                >
                  👁 View
                </button>
                <button 
                  className="action-btn edit-btn" 
                  title="Edit Student"
                  onClick={(e) => handleEditClick(e, student)}
                >
                  ✏️ Edit
                </button>
                <button 
                  className="action-btn delete-btn" 
                  title="Delete Student"
                  onClick={(e) => handleDeleteClick(e, student)}
                >
                  🗑 Delete
                </button>
              </td>
            </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

export default AdminStudentTable
