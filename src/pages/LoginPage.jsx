// ============================================================
//  LoginPage.jsx — تسجيل الدخول
// ============================================================
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

import { useAuth } from '../context/AuthContext'

function LoginPage() {
  const navigate = useNavigate()
  const { login } = useAuth()

  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [error,    setError]    = useState('')
  const [loading,  setLoading]  = useState(false)

  const handleLogin = async (e) => {
    e.preventDefault()
    if (email && password) {
      setLoading(true)
      setError('')
      try {
        await login(email, password)
        navigate('/')
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    } else {
      setError('يرجى إدخال البريد الإلكتروني وكلمة المرور')
    }
  }

  return (
    <div className="auth-container">
      <div className="auth-card">

        <div className="auth-header">
          <div className="logo" style={{ marginBottom: '10px' }}>سوبر <span>قيم</span></div>
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

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
              <input type="checkbox" /> تذكرني
            </label>
            <a href="#" style={{ color: 'var(--primary-blue)', fontWeight: '600' }}>نسيت كلمة المرور؟</a>
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
            {loading ? 'جاري التحميل...' : 'تسجيل دخول'}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            ليس لديك حساب؟{' '}
            <Link to="/signup" style={{ color: 'var(--primary-blue)', fontWeight: '600' }}>
              أنشئ حساباً جديداً
            </Link>
          </p>
        </div>

      </div>
    </div>
  )
}

export default LoginPage
