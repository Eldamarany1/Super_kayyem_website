// ============================================================
//  SignupPage.jsx — إنشاء حساب جديد
// ============================================================
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import '../styles/SignupPage.css'

function SignupPage() {
  const navigate = useNavigate()
  const { register } = useAuth()
  const [name,            setName]            = useState('')
  const [email,           setEmail]           = useState('')
  const [password,        setPassword]        = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [children,        setChildren]        = useState([])
  const [showChildForm,   setShowChildForm]   = useState(false)
  const [childName,       setChildName]       = useState('')
  const [childAge,        setChildAge]        = useState('')
  const [error,           setError]           = useState('')
  const [loading,         setLoading]         = useState(false)

  const handleSignup = async (e) => {
    e.preventDefault()
    if (!name || !email || !password) {
      setError('يرجى ملء جميع الحقول المطلوبة')
      return
    }
    if (password !== confirmPassword) {
      setError('كلمات المرور غير متطابقة')
      return
    }
    setLoading(true)
    setError('')
    try {
      await register(name, email, password, '')
      navigate('/')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const addChild = () => {
    if (childName && childAge) {
      setChildren([...children, { name: childName, age: childAge }])
      setChildName('')
      setChildAge('')
      setShowChildForm(false)
    }
  }

  const removeChild = (index) => {
    setChildren(children.filter((_, i) => i !== index))
  }

  return (
    <div className="auth-container">
      <div className="auth-card signup-card">

        <div className="auth-header">
          <div className="logo signup-logo">سوبر <span>قيم</span></div>
          <h2>أنشئ حسابك!</h2>
          <p>انضم إلى عائلة سوبر قيم</p>
        </div>

        <form onSubmit={handleSignup}>
          {error && <div className="error-message">{error}</div>}

          <div className="form-group">
            <label>الاسم الكامل *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="أدخل اسمك الكامل"
            />
          </div>

          <div className="form-group">
            <label>البريد الإلكتروني *</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="أدخل بريدك الإلكتروني"
            />
          </div>

          <div className="form-group">
            <label>كلمة المرور *</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="أدخل كلمة المرور"
            />
          </div>

          <div className="form-group">
            <label>تأكيد كلمة المرور *</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="أعد إدخال كلمة المرور"
            />
          </div>

          {/* Optional: add children */}
          <div className="form-group signup-children-section">
            <label>أضف أطفالك (اختياري)</label>

            {children.length > 0 && (
              <div className="signup-children-tags">
                {children.map((child, index) => (
                  <div key={index} className="child-tag">
                    <span>{child.name} ({child.age} سنوات)</span>
                    <span
                      onClick={() => removeChild(index)}
                      className="signup-child-remove"
                    >
                      ×
                    </span>
                  </div>
                ))}
              </div>
            )}

            {showChildForm ? (
              <div className="signup-child-form-row">
                <input
                  type="text"
                  value={childName}
                  onChange={(e) => setChildName(e.target.value)}
                  placeholder="اسم الطفل"
                  className="signup-child-input"
                />
                <select
                  value={childAge}
                  onChange={(e) => setChildAge(e.target.value)}
                  className="signup-child-select"
                >
                  <option value="">العمر</option>
                  {['٣','٤','٥','٦','٧','٨','٩','١٠'].map(age => (
                    <option key={age} value={age}>{age} سنوات</option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={addChild}
                  className="btn btn-primary signup-child-confirm-btn"
                >
                  ✓
                </button>
              </div>
            ) : (
              <button
                type="button"
                className="btn btn-outline signup-add-child-btn"
                onClick={() => setShowChildForm(true)}
              >
                + إضافة طفل
              </button>
            )}
          </div>

          <button
            type="submit"
            className="btn btn-primary signup-submit-btn"
            disabled={loading}
          >
            {loading ? 'جاري التحميل...' : 'إنشاء حساب'}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            لديك حساب بالفعل؟{' '}
            <Link to="/login" className="auth-footer-link">
              سجل دخولك
            </Link>
          </p>
        </div>

      </div>
    </div>
  )
}

export default SignupPage
