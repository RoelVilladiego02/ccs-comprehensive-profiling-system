import { useState } from 'react'
import '../styles/Login.css'
import { authAPI } from '../services/api'

function Login({ onLogin }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      if (!email.trim()) {
        setError('Email is required')
        setLoading(false)
        return
      }

      if (!password.trim()) {
        setError('Password is required')
        setLoading(false)
        return
      }

      // Call the real backend API
      const response = await authAPI.login(email, password)
      
      if (response.data.success) {
        const { user, token } = response.data.data
        
        // Only store token - user data should come from backend
        localStorage.setItem('auth_token', token)
        
        // Notify parent component with user data
        onLogin({
          ...user,
          token,
          loginTime: new Date().toISOString(),
          isAuthenticated: true
        })
      } else {
        setError(response.data.message || 'Login failed')
        setLoading(false)
      }
    } catch (err) {
      if (err.response?.data?.message) {
        setError(err.response.data.message)
      } else if (err.message === 'Network Error') {
        setError('Cannot connect to server. Make sure the backend is running on http://localhost:8000')
      } else {
        setError('Login failed. Please check your credentials and try again.')
      }
      setLoading(false)
    }
  }

  const handleDemoLogin = () => {
    // Demo login using admin credentials
    handleDemoAuth('admin@ccs.edu', 'admin123456')
  }

  const handleDemoAuth = async (demoEmail, demoPassword) => {
    setError('')
    setLoading(true)
    try {
      const response = await authAPI.login(demoEmail, demoPassword)
      if (response.data.success) {
        const { user, token } = response.data.data
        // Only store token - user data should come from backend
        localStorage.setItem('auth_token', token)
        
        onLogin({
          ...user,
          token,
          loginTime: new Date().toISOString(),
          isAuthenticated: true
        })
      }
    } catch (err) {
      setError('Demo login failed. Make sure the backend is running.')
      setLoading(false)
    }
  }

  return (
    <div className="login-container">
      <div className="login-box">
        <div className="login-header">
          <h1>Student Portal</h1>
          <p>Login to access your dashboard</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="student@ccs.edu"
              disabled={loading}
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              disabled={loading}
              className="form-input"
            />
          </div>

          {error && <div className="error-message">{error}</div>}

          <button 
            type="submit" 
            className="btn-login"
            disabled={loading}
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <div className="login-divider">
          <span>Demo</span>
        </div>

        <button 
          type="button"
          className="btn-demo"
          onClick={handleDemoLogin}
          disabled={loading}
        >
          Try Demo Account (Admin)
        </button>

        <div className="login-footer">
          <p><strong>Demo Credentials:</strong></p>
          <p>Email: <strong>admin@ccs.edu</strong></p>
          <p>Password: <strong>admin123456</strong></p>
          <p style={{ marginTop: '12px', fontSize: '0.85rem' }}>
            Other test accounts:
          </p>
          <p style={{ fontSize: '0.80rem' }}>
            faculty@ccs.edu / faculty123456<br/>
            student@ccs.edu / student123456<br/>
            staff@ccs.edu / staff123456
          </p>
          <p className="login-note">
            This authenticates with the backend API.
          </p>
        </div>
      </div>
    </div>
  )
}

export default Login
