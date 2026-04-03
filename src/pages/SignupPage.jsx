// Signup Page Component - User registration
import { useState } from 'react'

function SignupPage({ setCurrentPage, setIsLoggedIn }) {
  // Form state
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [children, setChildren] = useState([])
  const [showChildForm, setShowChildForm] = useState(false)
  const [childName, setChildName] = useState('')
  const [childAge, setChildAge] = useState('')
  const [error, setError] = useState('')

  // Handle form submission
  const handleSignup = (e) => {
    e.preventDefault()
    if (!name || !email || !password) {
      setError('يرجى ملء جميع الحقول المطلوبة')
      return
    }
    if (password !== confirmPassword) {
      setError('كلمات المرور غير متطابقة')
      return
    }
    setIsLoggedIn(true)
    setCurrentPage('home')
  }

  // Add child to list
  const addChild = () => {
    if (childName && childAge) {
      setChildren([...children, { name: childName, age: childAge }])
      setChildName('')
      setChildAge('')
      setShowChildForm(false)
    }
  }

  // Remove child from list
  const removeChild = (index) => {
    setChildren(children.filter((_, i) => i !== index))
  }

  return (
    <section id="signup" className="page-view active">
      <div className="auth-container">
        <div className="auth-card auth-card-wide">
          <div className="auth-header">
            <div className="logo auth-logo">سوبر <span>قيم</span></div>
            <h2>أنشئ حسابك!</h2>
            <p>انضم إلى عائلة سوبر قيم</p>
          </div>

          <form onSubmit={handleSignup}>
            {error && <div className="error-message">{error}</div>}

            {/* Parent Name */}
            <div className="form-group">
              <label>الاسم الكامل *</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="أدخل اسمك الكامل"
              />
            </div>

            {/* Email */}
            <div className="form-group">
              <label>البريد الإلكتروني *</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="أدخل بريدك الإلكتروني"
              />
            </div>

            {/* Password */}
            <div className="form-group">
              <label>كلمة المرور *</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="أدخل كلمة المرور"
              />
            </div>

            {/* Confirm Password */}
            <div className="form-group">
              <label>تأكيد كلمة المرور *</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="أعد إدخال كلمة المرور"
              />
            </div>

            {/* Children Section */}
            <div className="form-group form-divider">
              <label>أضف أطفالك (اختياري)</label>

              {/* Display added children */}
              {children.length > 0 && (
                <div className="children-tags">
                  {children.map((child, index) => (
                    <div key={index} className="child-tag">
                      <span>{child.name} ({child.age} سنوات)</span>
                      <span
                        onClick={() => removeChild(index)}
                        style={{ cursor: 'pointer', marginRight: '8px' }}
                      >
                        ×
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {/* Add child form */}
              {showChildForm ? (
                <div className="child-form-row">
                  <input
                    type="text"
                    value={childName}
                    onChange={(e) => setChildName(e.target.value)}
                    placeholder="اسم الطفل"
                  />
                  <select
                    value={childAge}
                    onChange={(e) => setChildAge(e.target.value)}
                  >
                    <option value="">العمر</option>
                    <option value="٣">٣ سنوات</option>
                    <option value="٤">٤ سنوات</option>
                    <option value="٥">٥ سنوات</option>
                    <option value="٦">٦ سنوات</option>
                    <option value="٧">٧ سنوات</option>
                    <option value="٨">٨ سنوات</option>
                    <option value="٩">٩ سنوات</option>
                    <option value="١٠">١٠ سنوات</option>
                  </select>
                  <button type="button" onClick={addChild} className="btn btn-primary">✓</button>
                </div>
              ) : (
                <button
                  type="button"
                  className="btn btn-outline btn-add-child"
                  onClick={() => setShowChildForm(true)}
                >
                  + إضافة طفل
                </button>
              )}
            </div>

            <button type="submit" className="btn btn-primary btn-add-child">
              إنشاء حساب
            </button>
          </form>

          <div className="auth-footer">
            <p>لديك حساب بالفعل؟ <span
              onClick={() => setCurrentPage('login')}
              className="link-primary"
              style={{ cursor: 'pointer' }}
            >سجل دخولك</span></p>
          </div>
        </div>
      </div>
    </section>
  )
}

export default SignupPage