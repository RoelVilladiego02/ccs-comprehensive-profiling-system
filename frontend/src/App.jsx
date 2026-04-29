import './App.css'
import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { authAPI } from './services/api'
import StudentDashboard from './components/StudentDashboard'
import FacultyDashboard from './components/FacultyDashboard'
import FacultyStudentDashboard from './components/FacultyStudentDashboard'
import AdminDashboard from './components/AdminDashboard'
import StaffDashboard from './components/StaffDashboard'
import Login from './components/Login'
import InstructionModule from './components/InstructionModule'
import SchedulingModule from './components/SchedulingModule'
import EligibilityReports from './components/EligibilityReports'

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [userData, setUserData] = useState(null)
  const [loading, setLoading] = useState(true)

  // Get user role from userData
  const getUserRole = (data) => {
    if (!data) return null
    
    // Check if roles exist and have items
    if (!data.roles || data.roles.length === 0) {
      console.warn('No roles found in user data:', data)
      return null
    }
    
    // Extract role name from first role
    const roleName = data.roles[0]?.role_name
    if (!roleName) {
      console.warn('No role_name found in first role:', data.roles[0])
      return null
    }
    
    const lowerCaseRole = roleName.toLowerCase()
    console.log(`Detected user role: ${roleName} -> ${lowerCaseRole}`)
    return lowerCaseRole
  }

  // Check if user is already logged in on mount - validate with backend
  useEffect(() => {
    const validateSession = async () => {
      const token = localStorage.getItem('auth_token')
      if (token) {
        try {
          // Validate token with backend
          const response = await authAPI.getMe()
          if (response.data && response.data.data) {
            setUserData(response.data.data)
            setIsAuthenticated(true)
          } else {
            // Invalid response from backend
            clearSession()
          }
        } catch (error) {
          console.error('Session validation failed:', error)
          // Backend returned error (e.g., 401), clear session
          clearSession()
        }
      }
      setLoading(false)
    }

    const clearSession = () => {
      localStorage.removeItem('auth_token')
      localStorage.removeItem('user_data')
      localStorage.removeItem('student_session')
      setIsAuthenticated(false)
      setUserData(null)
    }

    validateSession()
  }, [])

  const handleLogin = (data) => {
    console.log('handleLogin called with data:', data)
    console.log('User roles:', data?.roles)
    setUserData(data)
    setIsAuthenticated(true)
  }

  const handleLogout = async () => {
    try {
      // Call backend logout endpoint
      await authAPI.logout()
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      // Clear all local session data
      localStorage.removeItem('auth_token')
      localStorage.removeItem('user_data')
      localStorage.removeItem('student_session')
      setUserData(null)
      setIsAuthenticated(false)
    }
  }

  // Get role-appropriate dashboard route
  const getDashboardRoute = () => {
    if (!isAuthenticated || !userData) {
      console.log('Cannot determine dashboard route: authenticated=', isAuthenticated, 'userData=', !!userData)
      return '/login'
    }
    
    const role = getUserRole(userData)
    console.log('Determining route for role:', role)
    
    switch(role) {
      case 'admin':
        console.log('Routing to admin dashboard')
        return '/admin'
      case 'faculty':
        console.log('Routing to faculty dashboard')
        return '/faculty'
      case 'staff':
        console.log('Routing to staff dashboard')
        return '/staff'
      case 'student':
        console.log('Routing to student dashboard')
        return '/student'
      default:
        console.warn('Unknown role:', role, '- defaulting to student dashboard')
        return '/student'
    }
  }

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        height: '100vh',
        background: '#f5f5f5'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '40px',
            height: '40px',
            border: '4px solid #ff8c00',
            borderTop: '4px solid transparent',
            borderRadius: '50%',
            animation: 'spin 0.8s linear infinite',
            margin: '0 auto 20px'
          }}></div>
          <p style={{ color: '#666', fontSize: '0.95rem' }}>Loading...</p>
          <style>{`
            @keyframes spin {
              to { transform: rotate(360deg); }
            }
          `}</style>
        </div>
      </div>
    )
  }

  return (
    <Router>
      <Routes>
        <Route path="/login" element={
          isAuthenticated ? <Navigate to={getDashboardRoute()} /> : <Login onLogin={handleLogin} />
        } />
        
        {/* Student Dashboard */}
        <Route path="/student" element={
          isAuthenticated && getUserRole(userData) === 'student' 
            ? <StudentDashboard userData={userData} onLogout={handleLogout} /> 
            : isAuthenticated ? <Navigate to={getDashboardRoute()} /> : <Navigate to="/login" />
        } />
        
        {/* Faculty Dashboard */}
        <Route path="/faculty" element={
          isAuthenticated && getUserRole(userData) === 'faculty' 
            ? <FacultyDashboard userData={userData} onLogout={handleLogout} /> 
            : isAuthenticated ? <Navigate to={getDashboardRoute()} /> : <Navigate to="/login" />
        } />
        
        {/* Admin Dashboard */}
        <Route path="/admin" element={
          isAuthenticated && getUserRole(userData) === 'admin' 
            ? <AdminDashboard userData={userData} onLogout={handleLogout} /> 
            : isAuthenticated ? <Navigate to={getDashboardRoute()} /> : <Navigate to="/login" />
        } />
        
        {/* Staff Dashboard */}
        <Route path="/staff" element={
          isAuthenticated && getUserRole(userData) === 'staff' 
            ? <StaffDashboard userData={userData} onLogout={handleLogout} /> 
            : isAuthenticated ? <Navigate to={getDashboardRoute()} /> : <Navigate to="/login" />
        } />
        
        {/* Modules */}
        <Route path="/instruction" element={
          isAuthenticated 
            ? <InstructionModule userData={userData} onLogout={handleLogout} /> 
            : <Navigate to="/login" />
        } />
        <Route path="/scheduling" element={
          isAuthenticated 
            ? <SchedulingModule userData={userData} onLogout={handleLogout} /> 
            : <Navigate to="/login" />
        } />
        <Route path="/eligibility-reports" element={
          isAuthenticated && (getUserRole(userData) === 'admin' || getUserRole(userData) === 'staff')
            ? <EligibilityReports userData={userData} onLogout={handleLogout} /> 
            : isAuthenticated ? <Navigate to={getDashboardRoute()} /> : <Navigate to="/login" />
        } />
        
        {/* Legacy dashboard route - redirect to role-appropriate dashboard */}
        <Route path="/dashboard" element={
          isAuthenticated ? <Navigate to={getDashboardRoute()} /> : <Navigate to="/login" />
        } />
        
        <Route path="/" element={<Navigate to={isAuthenticated ? getDashboardRoute() : "/login"} />} />
      </Routes>
    </Router>
  )
}

export default App
