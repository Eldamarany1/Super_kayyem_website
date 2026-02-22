import { useState } from 'react';
import './AuthPages.css';

function Signup({ onSwitchToLogin, onClose }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    agreeTerms: false
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      alert('كلمات المرور غير متطابقة');
      return;
    }
    console.log('Signup:', formData);
    // Add signup logic here
  };

  return (

    <div className="auth-page">
      <div className="auth-container">
        <button className="auth-close-btn" onClick={onClose}>
          <i className="fas fa-times"></i>
        </button>
        
        <div className="auth-header">
          <div className="auth-logo">
          <i className="fa-solid fa-wand-magic-sparkles"></i> سوبر <span>قيّم</span>
          </div>
          <h1>إنشاء حساب جديد</h1>
          <p>انضم إلى عائلة سوبر قيم</p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label>الاسم الكامل</label>
            <div className="input-wrapper">
              <i className="fas fa-user"></i>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="أدخل اسمك الكامل"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label>البريد الإلكتروني</label>
            <div className="input-wrapper">
              <i className="fas fa-envelope"></i>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="أدخل بريدك الإلكتروني"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label>رقم الهاتف</label>
            <div className="input-wrapper">
              <i className="fas fa-phone"></i>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="أدخل رقم هاتفك"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label>كلمة المرور</label>
            <div className="input-wrapper">
              <i className="fas fa-lock"></i>
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="أدخل كلمة المرور"
                required
                minLength={6}
              />
              <button
                type="button"
                className="toggle-password"
                onClick={() => setShowPassword(!showPassword)}
              >
                <i className={`fas fa-${showPassword ? 'eye-slash' : 'eye'}`}></i>
              </button>
            </div>
          </div>

          <div className="form-group">
            <label>تأكيد كلمة المرور</label>
            <div className="input-wrapper">
              <i className="fas fa-lock"></i>
              <input
                type={showConfirmPassword ? "text" : "password"}
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="أعد إدخال كلمة المرور"
                required
              />
              <button
                type="button"
                className="toggle-password"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                <i className={`fas fa-${showConfirmPassword ? 'eye-slash' : 'eye'}`}></i>
              </button>
            </div>
          </div>

          <div className="form-options">
            <label className="checkbox-label terms">
              <input
                type="checkbox"
                name="agreeTerms"
                checked={formData.agreeTerms}
                onChange={handleChange}
                required
              />
              <span className="checkmark"></span>
              أوافق على{' '}
              <a href="#">الشروط والأحكام</a>
              {' '}و{' '}
              <a href="#">سياسة الخصوصية</a>
            </label>
          </div>

          <button type="submit" className="btn-auth">
            إنشاء حساب
          </button>
        </form>

        <div className="auth-divider">
          <span>أو</span>
        </div>

        <div className="social-login">
          <button className="social-btn google">
            <i className="fab fa-google"></i>
            تسجيل بواسطة جوجل
          </button>
          <button className="social-btn facebook">
            <i className="fab fa-facebook-f"></i>
            تسجيل بواسطة فيسبوك
          </button>
        </div>

        <p className="auth-switch">
          لديك حساب بالفعل؟{' '}
          <button type="button" onClick={onSwitchToLogin}>
            تسجيل الدخول
          </button>
        </p>
      </div>
    </div>
  );
}

export default Signup;
