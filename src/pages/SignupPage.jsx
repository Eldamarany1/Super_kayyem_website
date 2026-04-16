// ============================================================
//  SignupPage.jsx — إنشاء حساب جديد
// ============================================================
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

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
      await register(name, email, password, '') // WhatsApp number empty for now
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
      <div className="auth-card" style={{ maxWidth: '500px' }}>

        <div className="auth-header">
          <div className="logo" style={{ marginBottom: '10px' }}>سوبر <span>قيم</span></div>
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
          <div className="form-group" style={{ borderTop: '1px solid var(--border-color)', paddingTop: '15px' }}>
            <label>أضف أطفالك (اختياري)</label>

            {children.length > 0 && (
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '10px' }}>
                {children.map((child, index) => (
                  <div key={index} className="child-tag">
                    <span>{child.name} ({child.age} سنوات)</span>
                    <span onClick={() => removeChild(index)} style={{ cursor: 'pointer', marginRight: '6px' }}>×</span>
                  </div>
                ))}
              </div>
            )}

            {showChildForm ? (
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
                <input
                  type="text"
                  value={childName}
                  onChange={(e) => setChildName(e.target.value)}
                  placeholder="اسم الطفل"
                  style={{ flex: 1, minWidth: '120px', padding: '10px', border: '2px solid var(--border-color)', borderRadius: '10px', background: 'var(--bg-color)', color: 'var(--text-primary)', fontFamily: 'Cairo, sans-serif' }}
                />
                <select
                  value={childAge}
                  onChange={(e) => setChildAge(e.target.value)}
                  style={{ flex: 1, minWidth: '110px', padding: '10px', border: '2px solid var(--border-color)', borderRadius: '10px', background: 'var(--bg-color)', color: 'var(--text-primary)', fontFamily: 'Cairo, sans-serif' }}
                >
                  <option value="">العمر</option>
                  {['٣','٤','٥','٦','٧','٨','٩','١٠'].map(age => (
                    <option key={age} value={age}>{age} سنوات</option>
                  ))}
                </select>
                <button type="button" onClick={addChild} className="btn btn-primary" style={{ padding: '10px 20px' }}>✓</button>
              </div>
            ) : (
              <button
                type="button"
                className="btn btn-outline"
                onClick={() => setShowChildForm(true)}
                style={{ width: '100%', marginTop: '8px' }}
              >
                + إضافة طفل
              </button>
            )}
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '10px' }} disabled={loading}>
            {loading ? 'جاري التحميل...' : 'إنشاء حساب'}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            لديك حساب بالفعل؟{' '}
            <Link to="/login" style={{ color: 'var(--primary-blue)', fontWeight: '600' }}>
              سجل دخولك
            </Link>
          </p>
        </div>

      </div>
    </div>
  )
}

export default SignupPage
