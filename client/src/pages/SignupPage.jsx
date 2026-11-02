import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../styles/Auth.css';

export function SignupPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  
  // Account Information
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [gender, setGender] = useState('');

  // Children Information
  const [children, setChildren] = useState([]);

  const handleNextStep = (e) => {
    e.preventDefault();
    setStep(2);
  };

  const handleAddChild = () => {
    setChildren([...children, { name: '', age: '', gender: '' }]);
  };

  const handleRemoveChild = (index) => {
    const newChildren = children.filter((_, i) => i !== index);
    setChildren(newChildren);
  };

  const handleChildChange = (index, field, value) => {
    const newChildren = [...children];
    newChildren[index][field] = value;
    setChildren(newChildren);
  };

  const handleSubmit = (e) => {
    e?.preventDefault();
    const payload = {
      firstName,
      lastName,
      email,
      password,
      dateOfBirth,
      gender,
      children
    };
    console.log('Signup payload:', payload);
    // Handle API call here, then navigate
    navigate('/');
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1 className="auth-title">إنشاء حساب</h1>
        <p className="auth-subtitle">
          {step === 1 ? 'الخطوة 1: بيانات الحساب الأساسية' : 'الخطوة 2: بيانات الأطفال (اختياري)'}
        </p>

        {step === 1 ? (
          <form className="auth-form form-step" onSubmit={handleNextStep}>
            <div className="row">
              <div className="col-md-6 mb-3">
                <label htmlFor="firstName" className="form-label">الاسم الأول</label>
                <input type="text" className="form-control" id="firstName" value={firstName} onChange={(e) => setFirstName(e.target.value)} required />
              </div>
              <div className="col-md-6 mb-3">
                <label htmlFor="lastName" className="form-label">الاسم الأخير</label>
                <input type="text" className="form-control" id="lastName" value={lastName} onChange={(e) => setLastName(e.target.value)} required />
              </div>
            </div>

            <div className="mb-3">
              <label htmlFor="email" className="form-label">البريد الإلكتروني</label>
              <input type="email" className="form-control" id="email" value={email} onChange={(e) => setEmail(e.target.value)} required dir="ltr" />
            </div>

            <div className="mb-3">
              <label htmlFor="password" className="form-label">كلمة المرور</label>
              <input type="password" className="form-control" id="password" value={password} onChange={(e) => setPassword(e.target.value)} required dir="ltr" />
            </div>

            <div className="row">
              <div className="col-md-6 mb-4">
                <label htmlFor="dob" className="form-label">تاريخ الميلاد</label>
                <input type="date" className="form-control" id="dob" value={dateOfBirth} onChange={(e) => setDateOfBirth(e.target.value)} required />
              </div>
              <div className="col-md-6 mb-4">
                <label htmlFor="gender" className="form-label">الجنس</label>
                <select className="form-control" id="gender" value={gender} onChange={(e) => setGender(e.target.value)} required>
                  <option value="" disabled>اختر...</option>
                  <option value="Male">ذكر</option>
                  <option value="Female">أنثى</option>
                </select>
              </div>
            </div>

            <button type="submit" className="btn btn-primary w-100">
              التالي
            </button>
            <div className="auth-footer">
              <p>لديك حساب بالفعل؟ <Link to="/login">تسجيل الدخول</Link></p>
            </div>
          </form>
        ) : (
          <form className="auth-form form-step" onSubmit={handleSubmit}>
            {children.length === 0 ? (
              <div className="text-center mb-4 text-muted">
                <p>يمكنك إضافة بيانات أطفالك الآن لتخصيص تجربتهم، أو تخطي هذه الخطوة وإضافتهم لاحقاً من لوحة التحكم.</p>
              </div>
            ) : (
              children.map((child, index) => (
                <div key={index} className="child-card mb-3 p-3 border rounded">
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <h5 className="m-0" style={{ color: 'var(--text-primary)', fontSize: '1rem', fontWeight: 'bold' }}>الطفل {index + 1}</h5>
                    <button type="button" className="btn btn-sm btn-outline-danger" onClick={() => handleRemoveChild(index)} style={{ padding: '2px 8px', fontSize: '0.8rem' }}>حذف</button>
                  </div>
                  <div className="row g-2">
                    <div className="col-md-5">
                      <input type="text" className="form-control" placeholder="الاسم" value={child.name} onChange={(e) => handleChildChange(index, 'name', e.target.value)} required />
                    </div>
                    <div className="col-md-3">
                      <select className="form-control" value={child.age} onChange={(e) => handleChildChange(index, 'age', e.target.value ? parseInt(e.target.value, 10) : '')} required>
                        <option value="" disabled>العمر</option>
                        {[4, 5, 6, 7, 8, 9, 10, 11, 12].map((a) => (
                          <option key={a} value={a}>{a} سنوات</option>
                        ))}
                      </select>
                    </div>
                    <div className="col-md-4">
                      <select className="form-control" value={child.gender} onChange={(e) => handleChildChange(index, 'gender', e.target.value)} required>
                        <option value="" disabled>الجنس</option>
                        <option value="Male">ذكر</option>
                        <option value="Female">أنثى</option>
                      </select>
                    </div>
                  </div>
                </div>
              ))
            )}

            <button type="button" className="btn btn-outline-primary w-100 mb-4 child-add-btn" onClick={handleAddChild}>
              + إضافة طفل
            </button>

            <div className="d-flex gap-3">
              {children.length === 0 ? (
                <button type="button" className="btn btn-sec w-100" onClick={handleSubmit}>
                  تخطي وإتمام التسجيل
                </button>
              ) : (
                <>
                  <button type="button" className="btn btn-sec w-50" onClick={handleSubmit}>
                    تخطي
                  </button>
                  <button type="submit" className="btn btn-primary w-50 m-0">
                    إتمام التسجيل
                  </button>
                </>
              )}
            </div>
            
            <div className="text-center mt-4">
              <button type="button" className="btn btn-link text-muted text-decoration-none" onClick={() => setStep(1)}>
                العودة للخطوة السابقة
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

export default SignupPage;

