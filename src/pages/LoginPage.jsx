import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'

// Login Page Component - User authentication
function LoginPage({ setIsLoggedIn, setIsAdmin }) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  // Handle form submission
  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const res = await fetch('http://127.0.0.1:8000/api/token/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: username.trim(), password: password })
      });
      const response = await res.json();

      if (response.access) {

        // Save tokens to localStorage
        localStorage.setItem('access_token', response.access)
        localStorage.setItem('refresh_token', response.refresh)

        // Update login state
        setIsLoggedIn(true)

        // Check if user is admin
        const isAdminUser = username.trim().toLowerCase() === 'admin'
        localStorage.setItem('is_admin', isAdminUser ? 'true' : 'false')
        setIsAdmin(isAdminUser)

        // Navigate to library
        navigate('/library')
      } else {
        setError('بيانات الدخول غير صحيحة')
      }
    } catch (err) {
      setError('خطأ في الاتصال بالخادم')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card auth-card-wide">
        {/* Header */}
        <div className="auth-header">
          <div className="logo auth-logo">سوبر <span>قيم</span></div>
          <h2>مرحباً بك مجدداً 👋</h2>
          <p>سجل دخولك للوصول إلى قصصك المفضلة</p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleLogin}>
          {error && <div className="auth-error">{error}</div>}

          <div className="form-group">
            <label className="form-label">اسم المستخدم</label>
            <input
              type="text"
              placeholder="مثلاً: admin"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="form-input"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">كلمة المرور</label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="form-input"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-submit"
          >
            {loading ? 'جاري التحقق...' : 'دخول للمنصة'}
          </button>
        </form>

        {/* Footer */}
        <div className="auth-footer-text">
          <span>ليس لديك حساب؟</span>
          <button
            onClick={() => navigate('/signup')}
            className="auth-link-btn"
          >
            إنشاء حساب جديد
          </button>
        </div>
      </div>
    </div>
  )
}

export default LoginPage