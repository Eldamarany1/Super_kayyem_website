import { useState } from 'react';
import './AuthPages.css';

function Login({ onSwitchToSignup, onClose }) {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Login:', formData);
    // Add login logic here
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
          <h1>مرحباً بعودتك</h1>
          <p>سجل دخولك للمتابعة</p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
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

          <div className="form-options">
            <label className="checkbox-label">
              <input
                type="checkbox"
                name="rememberMe"
                checked={formData.rememberMe}
                onChange={handleChange}
              />
              <span className="checkmark"></span>
              تذكرني
            </label>
            <a href="#" className="forgot-link">نسيت كلمة المرور؟</a>
          </div>

          <button type="submit" className="btn-auth">
            تسجيل الدخول
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
          ليس لديك حساب؟{' '}
          <button type="button" onClick={onSwitchToSignup}>
            إنشاء حساب جديد
          </button>
        </p>
      </div>
    </div>
  );
}

export default Login;
