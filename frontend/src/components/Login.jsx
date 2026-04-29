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

      const response = await authAPI.login(email, password)

      if (response.data.success) {
        const { user, token } = response.data.data
        console.log('Login successful. User data:', user)
        console.log('User roles:', user?.roles)
        localStorage.setItem('auth_token', token)
        onLogin({
          ...user,
          token,
          loginTime: new Date().toISOString(),
          isAuthenticated: true,
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
    handleDemoAuth('admin@ccs.edu', 'admin123456')
  }

  const handleDemoAuth = async (demoEmail, demoPassword) => {
    setError('')
    setLoading(true)
    try {
      const response = await authAPI.login(demoEmail, demoPassword)
      if (response.data.success) {
        const { user, token } = response.data.data
        console.log('Demo login successful. User data:', user)
        console.log('User roles:', user?.roles)
        localStorage.setItem('auth_token', token)
        onLogin({
          ...user,
          token,
          loginTime: new Date().toISOString(),
          isAuthenticated: true,
        })
      }
      // eslint-disable-next-line no-unused-vars
    } catch (_) {
      setError('Demo login failed. Make sure the backend is running.')
      setLoading(false)
    }
  }

  return (
    <div className="login-container">

      {/* ── LEFT PANEL ── */}
      <div className="login-left">
        <div className="left-content">

          {/* Brand */}
          <div className="left-brand">
            <span className="brand-dot" />
            <span className="brand-name">CCS Portal</span>
          </div>

          {/* Headline */}
          <h2 className="left-headline">
            Your campus,<br />
            <em>one login</em><br />
            away.
          </h2>

          {/* Feature highlights */}
          <ul className="left-features">
            <li>
              <span className="feature-icon">✦</span>
              Access grades, schedules &amp; resources
            </li>
            <li>
              <span className="feature-icon">◈</span>
              Real-time announcements &amp; notifications
            </li>
            <li>
              <span className="feature-icon">⬡</span>
              Secure single sign-on for all roles
            </li>
          </ul>

          {/* Decorative bar */}
          <div className="left-bar">
            <span />
            <span />
            <span />
          </div>

        </div>
      </div>

      {/* ── RIGHT PANEL — FORM ── */}
      <div className="login-box">
        <div className="login-inner">

          <div className="login-header">
            <h1>Sign <span>in</span></h1>
            <p>Enter your credentials to continue</p>
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

            <button type="submit" className="btn-login" disabled={loading}>
              {loading ? 'Signing in…' : 'Sign In'}
            </button>
          </form>

          <div className="login-divider">
            <span>or</span>
          </div>

          <button
            type="button"
            className="btn-demo"
            onClick={handleDemoLogin}
            disabled={loading}
          >
            Demo — Admin Access
          </button>

          <div className="login-footer">
            <p>
              <strong>admin@ccs.edu</strong> · admin123456
            </p>
            <p>faculty@ccs.edu · student@ccs.edu · staff@ccs.edu</p>
          </div>

        </div>
      </div>

    </div>
  )
}

export default Login