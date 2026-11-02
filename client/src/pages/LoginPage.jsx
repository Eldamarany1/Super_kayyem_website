import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import '../styles/Auth.css';

export function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle login logic here
    console.log('Login attempt', { email, password });
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1 className="auth-title">تسجيل الدخول</h1>
        <p className="auth-subtitle">مرحباً بعودتك إلى سوبر قيم!</p>
        
        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="mb-3">
            <label htmlFor="email" className="form-label">البريد الإلكتروني</label>
            <input
              type="email"
              className="form-control"
              id="email"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              dir="ltr"
            />
          </div>
          <div className="mb-4">
            <label htmlFor="password" className="form-label">كلمة المرور</label>
            <input
              type="password"
              className="form-control"
              id="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              dir="ltr"
            />
          </div>
          <button type="submit" className="btn btn-primary w-100">
            دخول
          </button>
        </form>

        <div className="auth-footer">
          <p>ليس لديك حساب؟ <Link to="/signup">أنشئ حساباً جديداً</Link></p>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;

