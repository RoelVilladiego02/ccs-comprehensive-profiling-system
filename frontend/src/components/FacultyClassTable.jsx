import '../styles/FacultyClassTable.css'

function SortIcon({ direction }) {
  if (direction === 'asc') {
    return <span className="sort-icon">▲</span>
  } else if (direction === 'desc') {
    return <span className="sort-icon">▼</span>
  }
  return <span className="sort-icon">⇅</span>
}

function FacultyClassTable({ classes, sortConfig, onSort }) {
  const handleHeaderClick = (field) => {
    if (onSort) {
      onSort(field)
    }
  }

  // Display empty state if no classes
  if (!classes || classes.length === 0) {
    return (
      <div className="faculty-class-empty-state">
        <p>No classes assigned yet</p>
      </div>
    )
  }

  return (
    <div className="faculty-class-table-container">
      <table className="faculty-class-table">
        <colgroup>
          <col className="col-course-code" />
          <col className="col-course-title" />
          <col className="col-section" />
          <col className="col-schedule" />
          <col className="col-room" />
          <col className="col-semester" />
          <col className="col-students" />
          <col className="col-status" />
        </colgroup>
        <thead>
          <tr>
            <th onClick={() => handleHeaderClick('course_code')} className="sortable">
              Course Code
              {sortConfig && sortConfig.field === 'course_code' && <SortIcon direction={sortConfig.direction} />}
            </th>
            <th onClick={() => handleHeaderClick('course_title')} className="sortable">
              Course Title
              {sortConfig && sortConfig.field === 'course_title' && <SortIcon direction={sortConfig.direction} />}
            </th>
            <th onClick={() => handleHeaderClick('section')} className="sortable">
              Section
              {sortConfig && sortConfig.field === 'section' && <SortIcon direction={sortConfig.direction} />}
            </th>
            <th>Schedule</th>
            <th>Room</th>
            <th onClick={() => handleHeaderClick('semester')} className="sortable">
              Semester
              {sortConfig && sortConfig.field === 'semester' && <SortIcon direction={sortConfig.direction} />}
            </th>
            <th>Students</th>
            <th onClick={() => handleHeaderClick('class_status')} className="sortable">
              Status
              {sortConfig && sortConfig.field === 'class_status' && <SortIcon direction={sortConfig.direction} />}
            </th>
          </tr>
        </thead>
        <tbody>
          {classes.map(schoolClass => (
            <tr key={schoolClass.class_id}>
              <td className="course-code">
                {schoolClass.course?.course_code || 'N/A'}
              </td>
              <td className="course-title">
                {schoolClass.course?.course_title || 'Unknown Course'}
              </td>
              <td className="section">{schoolClass.section}</td>
              <td className="schedule">
                {schoolClass.schedule_day ? (
                  <>
                    {schoolClass.schedule_day}
                    {schoolClass.schedule_time && (
                      <>
                        {' '}
                        <span className="time-info">
                          {schoolClass.schedule_time}
                          {schoolClass.schedule_end_time && ` - ${schoolClass.schedule_end_time}`}
                        </span>
                      </>
                    )}
                  </>
                ) : (
                  'TBA'
                )}
              </td>
              <td className="room">{schoolClass.room || 'TBA'}</td>
              <td className="semester">Sem {schoolClass.semester}</td>
              <td className="students">
                <span className={schoolClass.enrolled_students >= schoolClass.max_students ? 'full' : ''}>
                  {schoolClass.enrolled_students}/{schoolClass.max_students}
                </span>
              </td>
              <td className="status">
                <span className={`status-badge status-${schoolClass.class_status.toLowerCase()}`}>
                  {schoolClass.class_status}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default FacultyClassTable
