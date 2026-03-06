import './App.css'
import { useState, useEffect } from 'react'
import StudentDashboard from './components/StudentDashboard'
import Login from './components/Login'

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [studentData, setStudentData] = useState(null)
  const [loading, setLoading] = useState(true)

  // Check if user is already logged in on mount
  useEffect(() => {
    const session = localStorage.getItem('student_session')
    if (session) {
      try {
        const data = JSON.parse(session)
        setStudentData(data)
        setIsAuthenticated(true)
      } catch (error) {
        console.error('Failed to parse session:', error)
        localStorage.removeItem('student_session')
      }
    }
    setLoading(false)
  }, [])

  const handleLogin = (data) => {
    setStudentData(data)
    setIsAuthenticated(true)
  }

  const handleLogout = () => {
    localStorage.removeItem('student_session')
    setStudentData(null)
    setIsAuthenticated(false)
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

  return isAuthenticated ? (
    <StudentDashboard 
      studentData={studentData} 
      onLogout={handleLogout} 
    />
  ) : (
    <Login onLogin={handleLogin} />
  )
}

export default App
