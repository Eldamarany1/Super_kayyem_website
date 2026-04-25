// ============================================================
//  LoginPage.jsx — تسجيل الدخول
// ============================================================
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import '../styles/LoginPage.css'

function LoginPage() {
  const navigate = useNavigate()
  const { login } = useAuth()

  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [error,    setError]    = useState('')
  const [loading,  setLoading]  = useState(false)

  const handleLogin = async (e) => {
    e.preventDefault()
    if (!email || !password) { setError('يرجى إدخال البريد الإلكتروني وكلمة المرور'); return }
    setLoading(true)
    setError('')
    try {
      const loggedInUser = await login(email, password)
      if (loggedInUser?.role === 'Admin') {
        navigate('/admin')
      } else {
        navigate('/')
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-container">
      <div className="auth-card">

        <div className="auth-header">
          <div className="logo auth-logo">سوبر <span>قيم</span></div>
          <h2>مرحباً بعودتك!</h2>
          <p>سجل دخولك للمتابعة في مغامرات باسم</p>
        </div>

        <form onSubmit={handleLogin}>
          {error && <div className="error-message">{error}</div>}

          <div className="form-group">
            <label>البريد الإلكتروني</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="أدخل بريدك الإلكتروني"
            />
          </div>

          <div className="form-group">
            <label>كلمة المرور</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="أدخل كلمة المرور"
            />
          </div>

          <div className="login-meta-row">
            <label className="login-remember-label">
              <input type="checkbox" /> تذكرني
            </label>
            <a href="#" className="login-forgot-link">نسيت كلمة المرور؟</a>
          </div>

          <button
            type="submit"
            className="btn btn-primary login-submit-btn"
            disabled={loading}
          >
            {loading ? 'جاري التحميل...' : 'تسجيل دخول'}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            ليس لديك حساب؟{' '}
            <Link to="/signup" className="auth-footer-link">
              أنشئ حساباً جديداً
            </Link>
          </p>
        </div>

      </div>
    </div>
  )
}

export default LoginPage
