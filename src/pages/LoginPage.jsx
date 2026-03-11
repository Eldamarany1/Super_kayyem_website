// Login Page Component - تسجيل دخول
import { useState } from 'react'

function LoginPage({ setCurrentPage, setIsLoggedIn }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const handleLogin = (e) => {
    e.preventDefault()
    if (email && password) {
      setIsLoggedIn(true)
      setCurrentPage('home')
    } else {
      setError('يرجى إدخال البريد الإلكتروني وكلمة المرور')
    }
  }

  return (
    <section id="login" className="page-view active">
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
            
            <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
              تسجيل دخول
            </button>
          </form>

          <div className="auth-footer">
            <p>ليس لديك حساب؟ <span onClick={() => setCurrentPage('signup')} style={{ color: 'var(--primary-blue)', fontWeight: '600', cursor: 'pointer' }}>أنشئ حساباً جديداً</span></p>
          </div>
        </div>
      </div>
    </section>
  )
}

export default LoginPage

