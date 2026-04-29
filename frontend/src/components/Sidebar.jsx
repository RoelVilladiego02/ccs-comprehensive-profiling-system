import '../styles/Sidebar.css'
import { useState } from 'react'

function Sidebar({ userRole, userData, onLogout, activeSection, onSectionChange }) {
  const [isOpen, setIsOpen] = useState(true)
  // Define navigation items for each role
  const navigationItems = {
    student: [
      { id: 'profile', label: 'My Profile', icon: '👤' },
      { id: 'courses', label: 'My Courses', icon: '📚' },
      { id: 'grades', label: 'Grades', icon: '📊' },
      { id: 'academic-history', label: 'Academic History', icon: '📖' },
      { id: 'activities', label: 'Non-Academic Activities', icon: '🎯' },
      { id: 'violations', label: 'Violations', icon: '⚠️' },
      { id: 'skills', label: 'Skills', icon: '✨' },
      { id: 'affiliations', label: 'Affiliations', icon: '🏛️' },
      { id: 'medical-records', label: 'Medical Records', icon: '🏥' },
    ],
    faculty: [
      { id: 'dashboard', label: 'Dashboard', icon: '📱' },
      { id: 'students', label: 'Students', icon: '👤', description: 'View & Filter Students' },
      { id: 'classes', label: 'My Classes', icon: '👥' },
      { id: 'grades', label: 'Grades', icon: '✏️' },
      { id: 'attendance', label: 'Attendance', icon: '✓' },
    ],
    admin: [
      { id: 'dashboard', label: 'Dashboard', icon: '⚙️' },
      { id: 'students', label: 'Students', icon: '👤' },
      { id: 'faculty', label: 'Faculty', icon: '🎓' },
      { id: 'courses', label: 'Courses', icon: '📚' },
      { id: 'scheduling', label: 'Scheduling', icon: '📅' },
      { id: 'eligibility-reports', label: 'Eligibility Reports', icon: '📊' },
    ],
    staff: [
      { id: 'dashboard', label: 'Dashboard', icon: '📱' },
      { id: 'students', label: 'Students', icon: '👤' },
      { id: 'attendance', label: 'Attendance', icon: '✓' },
      { id: 'eligibility-reports', label: 'Eligibility Reports', icon: '📊' },
      { id: 'reports', label: 'Reports', icon: '📋' },
    ],
  }

  const items = navigationItems[userRole] || []

  const handleSectionClick = (sectionId) => {
    if (onSectionChange) {
      onSectionChange(sectionId)
    }
  }

  // Update CSS variable when sidebar state changes
  if (typeof window !== 'undefined') {
    document.documentElement.style.setProperty(
      '--sidebar-current-width',
      isOpen ? '260px' : '70px'
    )
  }

  return (
    <div className={`sidebar ${isOpen ? 'open' : 'collapsed'}`}>
      <div className="sidebar-header">
        <h2 className="sidebar-title">CCS Portal</h2>
        <button 
          className="sidebar-toggle" 
          onClick={() => setIsOpen(!isOpen)}
          title={isOpen ? 'Collapse sidebar' : 'Expand sidebar'}
          aria-label="Toggle sidebar"
        >
          {isOpen ? '◀' : '▶'}
        </button>
      </div>

      <nav className="sidebar-nav">
        {items.map((item) => (
          <button
            key={item.id}
            onClick={() => handleSectionClick(item.id)}
            className={`nav-item ${activeSection === item.id ? 'active' : ''}`}
            title={!isOpen ? item.label : ''}
          >
            <span className="nav-icon">{item.icon}</span>
            <span className="nav-label">{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="user-section">
          <div className="user-avatar">
            {userData?.name?.charAt(0).toUpperCase() || '?'}
          </div>
          <div className="user-details">
            <div className="user-name">{userData?.name || 'User'}</div>
            <div className="user-role">
              {userRole.charAt(0).toUpperCase() + userRole.slice(1)}
            </div>
          </div>
        </div>
        <button className="logout-btn" onClick={onLogout} title="Logout">
          ◄
        </button>
      </div>
    </div>
  )
}

export default Sidebar
