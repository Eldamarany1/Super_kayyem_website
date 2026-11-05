import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/Auth.css';

const PRESET_AVATARS = [
  'https://api.dicebear.com/7.x/adventurer/svg?seed=Felix',
  'https://api.dicebear.com/7.x/adventurer/svg?seed=Luna',
  'https://api.dicebear.com/7.x/bottts/svg?seed=SuperKayyem',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Ahmed',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Sara',
  'https://api.dicebear.com/7.x/fun-emoji/svg?seed=Hero',
];

export function SignupPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [step, setStep] = useState(1);
  
  // Step 1: Account Information
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [gender, setGender] = useState('ذكر');

  // Step 2: Children Information
  const [children, setChildren] = useState([]);

  // Step 3: Profile Picture (upload or preset)
  const [avatarFile, setAvatarFile] = useState(null);
  const [selectedPreset, setSelectedPreset] = useState('');
  const [avatarPreview, setAvatarPreview] = useState('');

  // Status
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleStep1Next = (e) => {
    e.preventDefault();
    setErrorMessage('');
    setStep(2);
  };

  const handleStep2Next = (e) => {
    if (e) e.preventDefault();
    setErrorMessage('');
    setStep(3);
  };

  const handleAddChild = () => {
    setChildren([...children, { name: '', age: 6, gender: 'ذكر' }]);
  };

  const handleRemoveChild = (index) => {
    const newChildren = children.filter((_, i) => i !== index);
    setChildren(newChildren);
  };

  const handleChildChange = (index, field, value) => {
    const newChildren = [...children];
    newChildren[index][field] = field === 'age' ? parseInt(value, 10) : value;
    setChildren(newChildren);
  };

  const handleAvatarFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      setSelectedPreset('');
      const reader = new FileReader();
      reader.onload = () => setAvatarPreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSelectPreset = (url) => {
    setSelectedPreset(url);
    setAvatarFile(null);
    setAvatarPreview(url);
  };

  const executeRegistration = async (skipAvatar = false) => {
    setLoading(true);
    setErrorMessage('');

    try {
      const formData = new FormData();
      formData.append('firstName', firstName);
      formData.append('lastName', lastName);
      formData.append('email', email);
      formData.append('password', password);
      if (dateOfBirth) formData.append('dateOfBirth', dateOfBirth);
      formData.append('gender', gender);
      formData.append('childrenJson', JSON.stringify(children));

      if (!skipAvatar) {
        if (avatarFile) {
          formData.append('avatarFile', avatarFile);
        } else if (selectedPreset) {
          formData.append('avatarUrl', selectedPreset);
        }
      }

      const res = await fetch('/api/accounts/register', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'حدث خطأ أثناء إنشاء الحساب');
      }

      // Immediately log in user and sync navbar
      if (data.account) {
        login(data.account);
      }

      navigate('/');
    } catch (err) {
      setErrorMessage(err.message || 'فشل الاتصال بالخادم');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitStep3 = (e) => {
    e.preventDefault();
    executeRegistration(false);
  };

  return (
    <div className="auth-page">
      <div className="auth-card" style={{ maxWidth: step === 3 ? '540px' : undefined }}>
        <h1 className="auth-title">إنشاء حساب</h1>
        <p className="auth-subtitle">
          {step === 1 && 'الخطوة 1: بيانات الحساب الأساسية'}
          {step === 2 && 'الخطوة 2: بيانات الأطفال (اختياري)'}
          {step === 3 && 'الخطوة 3: اختيار أو رفع الصورة الشخصية'}
        </p>

        {errorMessage && (
          <div className="alert alert-danger py-2 mb-3 small rounded-3" role="alert">
            {errorMessage}
          </div>
        )}

        {step === 1 && (
          <form className="auth-form form-step" onSubmit={handleStep1Next}>
            <div className="row">
              <div className="col-md-6 mb-3">
                <label htmlFor="firstName" className="form-label">الاسم الأول</label>
                <input
                  type="text"
                  className="form-control"
                  id="firstName"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="مثال: أحمد"
                  required
                />
              </div>
              <div className="col-md-6 mb-3">
                <label htmlFor="lastName" className="form-label">اسم العائلة</label>
                <input
                  type="text"
                  className="form-control"
                  id="lastName"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="مثال: الشناوي"
                  required
                />
              </div>
            </div>

            <div className="mb-3">
              <label htmlFor="email" className="form-label">البريد الإلكتروني</label>
              <input
                type="email"
                className="form-control"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                required
                dir="ltr"
              />
            </div>

            <div className="mb-3">
              <label htmlFor="password" className="form-label">كلمة المرور</label>
              <input
                type="password"
                className="form-control"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                dir="ltr"
              />
            </div>

            <div className="row">
              <div className="col-md-6 mb-4">
                <label htmlFor="dob" className="form-label">تاريخ الميلاد</label>
                <input
                  type="date"
                  className="form-control"
                  id="dob"
                  value={dateOfBirth}
                  onChange={(e) => setDateOfBirth(e.target.value)}
                  required
                />
              </div>
              <div className="col-md-6 mb-4">
                <label htmlFor="gender" className="form-label">الجنس</label>
                <select
                  className="form-control"
                  id="gender"
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  required
                >
                  <option value="ذكر">ذكر</option>
                  <option value="أنثى">أنثى</option>
                </select>
              </div>
            </div>

            <button type="submit" className="btn btn-primary w-100">
              التالي (بيانات الأطفال) ←
            </button>
            <div className="auth-footer">
              <p>لديك حساب بالفعل؟ <Link to="/login">تسجيل الدخول</Link></p>
            </div>
          </form>
        )}

        {step === 2 && (
          <form className="auth-form form-step" onSubmit={handleStep2Next}>
            {children.length === 0 ? (
              <div className="text-center mb-4 text-muted">
                <p>يمكنك إضافة بيانات أطفالك الآن لتخصيص تجربتهم واقتراح قصص تناسب أعمارهم، أو تخطي هذه الخطوة.</p>
              </div>
            ) : (
              children.map((child, index) => (
                <div key={index} className="child-card mb-3 p-3 border rounded">
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <h5 className="m-0" style={{ color: 'var(--text-primary)', fontSize: '1rem', fontWeight: 'bold' }}>
                      الطفل {index + 1}
                    </h5>
                    <button
                      type="button"
                      className="btn btn-sm btn-outline-danger"
                      onClick={() => handleRemoveChild(index)}
                      style={{ padding: '2px 8px', fontSize: '0.8rem' }}
                    >
                      حذف
                    </button>
                  </div>
                  <div className="row g-2">
                    <div className="col-md-5">
                      <input
                        type="text"
                        className="form-control"
                        placeholder="اسم الطفل"
                        value={child.name}
                        onChange={(e) => handleChildChange(index, 'name', e.target.value)}
                        required
                      />
                    </div>
                    <div className="col-md-3">
                      <select
                        className="form-control"
                        value={child.age || 6}
                        onChange={(e) => handleChildChange(index, 'age', e.target.value)}
                        required
                      >
                        {[4, 5, 6, 7, 8, 9, 10, 11, 12].map((a) => (
                          <option key={a} value={a}>{a} سنوات</option>
                        ))}
                      </select>
                    </div>
                    <div className="col-md-4">
                      <select
                        className="form-control"
                        value={child.gender || 'ذكر'}
                        onChange={(e) => handleChildChange(index, 'gender', e.target.value)}
                        required
                      >
                        <option value="ذكر">ذكر</option>
                        <option value="أنثى">أنثى</option>
                      </select>
                    </div>
                  </div>
                </div>
              ))
            )}

            <button
              type="button"
              className="btn btn-outline-primary w-100 mb-4 child-add-btn"
              onClick={handleAddChild}
            >
              + إضافة طفل
            </button>

            <div className="d-flex gap-3">
              <button
                type="button"
                className="btn btn-sec w-50"
                onClick={() => setStep(3)}
              >
                تخطي الخطوة
              </button>
              <button type="submit" className="btn btn-primary w-50 m-0">
                التالي (الصورة الشخصية) ←
              </button>
            </div>
            
            <div className="text-center mt-4">
              <button
                type="button"
                className="btn btn-link text-muted text-decoration-none"
                onClick={() => setStep(1)}
              >
                ← العودة للخطوة السابقة
              </button>
            </div>
          </form>
        )}

        {step === 3 && (
          <form className="auth-form form-step" onSubmit={handleSubmitStep3}>
            <div className="text-center mb-4">
              {/* Avatar Preview */}
              <div
                className="rounded-circle border border-3 border-primary mx-auto mb-3 d-flex align-items-center justify-content-center overflow-hidden shadow-sm"
                style={{ width: '100px', height: '100px', backgroundColor: 'var(--bg-hover, #f0f4ff)' }}
              >
                {avatarPreview ? (
                  <img
                    src={avatarPreview}
                    alt="Preview"
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                ) : (
                  <span className="fs-1 text-primary">
                    {firstName ? firstName.charAt(0) : '👤'}
                  </span>
                )}
              </div>
              <p className="text-secondary small mb-0">
                اختر صورة لحسابك تظهر في الشريط العلوي وقصصك
              </p>
            </div>

            {/* Custom file upload */}
            <div className="mb-4">
              <label className="form-label small fw-semibold">📷 رفع صورة من جهازك (Cloudinary):</label>
              <input
                type="file"
                className="form-control"
                accept="image/*"
                onChange={handleAvatarFileChange}
              />
            </div>

            {/* Presets */}
            <div className="mb-4">
              <label className="form-label small fw-semibold d-block mb-2">أو اختر شخصية جاهزة:</label>
              <div className="d-flex flex-wrap justify-content-center gap-2">
                {PRESET_AVATARS.map((preset, idx) => (
                  <button
                    type="button"
                    key={idx}
                    className={`btn p-1 rounded-circle border ${
                      selectedPreset === preset ? 'border-primary border-3' : 'border-light-subtle'
                    }`}
                    style={{ width: '52px', height: '52px' }}
                    onClick={() => handleSelectPreset(preset)}
                  >
                    <img
                      src={preset}
                      alt={`preset-${idx}`}
                      style={{ width: '100%', height: '100%', borderRadius: '50%' }}
                    />
                  </button>
                ))}
              </div>
            </div>

            <div className="d-flex gap-3">
              <button
                type="button"
                className="btn btn-sec w-50"
                onClick={() => executeRegistration(true)}
                disabled={loading}
              >
                تخطي بدون صورة
              </button>
              <button
                type="submit"
                className="btn btn-primary w-50 m-0"
                disabled={loading}
              >
                {loading ? 'جارٍ الإنشاء...' : 'إتمام التسجيل والدخول ✓'}
              </button>
            </div>

            <div className="text-center mt-4">
              <button
                type="button"
                className="btn btn-link text-muted text-decoration-none"
                onClick={() => setStep(2)}
                disabled={loading}
              >
                ← العودة لبيانات الأطفال
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

export default SignupPage;
