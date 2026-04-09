import './App.css'
import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import StudentDashboard from './components/StudentDashboard'
import FacultyDashboard from './components/FacultyDashboard'
import Login from './components/Login'
import InstructionModule from './components/InstructionModule'
import SchedulingModule from './components/SchedulingModule'

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [studentData, setStudentData] = useState(null)
  const [facultyData, setFacultyData] = useState(null)
  const [loading, setLoading] = useState(true)

  // Check if user is already logged in on mount - validate with backend
  useEffect(() => {
    const validateSession = async () => {
      const token = localStorage.getItem('auth_token')
      if (token) {
        try {
          // Validate token with backend
          const response = await import('./services/api').then(module => module.authAPI.getMe())
          if (response.data && response.data.data) {
            setStudentData(response.data.data)
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
      setStudentData(null)
    }

    validateSession()
  }, [])

  const handleLogin = (data) => {
    setStudentData(data)
    setIsAuthenticated(true)
  }

  const handleLogout = async () => {
    try {
      // Call backend logout endpoint
      await import('./services/api').then(module => module.authAPI.logout())
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      // Clear all local session data
      localStorage.removeItem('auth_token')
      localStorage.removeItem('user_data')
      localStorage.removeItem('student_session')
      setStudentData(null)
      setIsAuthenticated(false)
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
          isAuthenticated ? <Navigate to="/dashboard" /> : <Login onLogin={handleLogin} />
        } />
        <Route path="/dashboard" element={
          isAuthenticated ? <StudentDashboard studentData={studentData} onLogout={handleLogout} /> : <Navigate to="/login" />
        } />
        <Route path="/faculty" element={
          isAuthenticated ? <FacultyDashboard facultyData={facultyData} onLogout={handleLogout} /> : <Navigate to="/login" />
        } />
        <Route path="/instruction" element={
          isAuthenticated ? <InstructionModule studentData={studentData} onLogout={handleLogout} /> : <Navigate to="/login" />
        } />
        <Route path="/scheduling" element={
          isAuthenticated ? <SchedulingModule studentData={studentData} onLogout={handleLogout} /> : <Navigate to="/login" />
        } />
        <Route path="/" element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} />} />
      </Routes>
    </Router>
  )
}

export default App
