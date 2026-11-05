import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/Auth.css';
import '../styles/StoryCard.css';

const PRESET_AVATARS = [
  'https://api.dicebear.com/7.x/adventurer/svg?seed=Felix',
  'https://api.dicebear.com/7.x/adventurer/svg?seed=Luna',
  'https://api.dicebear.com/7.x/bottts/svg?seed=SuperKayyem',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Ahmed',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Sara',
  'https://api.dicebear.com/7.x/fun-emoji/svg?seed=Hero',
];

export function ProfilePage() {
  const { user, updateUser, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  const [firstName, setFirstName] = useState(user?.firstName || '');
  const [lastName, setLastName] = useState(user?.lastName || '');
  const [email, setEmail] = useState(user?.email || '');
  const [dateOfBirth, setDateOfBirth] = useState(
    user?.dateOfBirth ? user.dateOfBirth.substring(0, 10) : ''
  );
  const [gender, setGender] = useState(user?.gender || 'ذكر');
  const [children, setChildren] = useState(user?.children || []);

  const [avatarPreview, setAvatarPreview] = useState(
    user?.profilePictureUrl || user?.avatarUrl || ''
  );
  const [avatarFile, setAvatarFile] = useState(null);
  const [selectedPreset, setSelectedPreset] = useState('');

  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const [ownedStories, setOwnedStories] = useState([]);
  const [loadingStories, setLoadingStories] = useState(true);

  // Sync state if user changes
  useEffect(() => {
    if (user) {
      setFirstName(user.firstName || '');
      setLastName(user.lastName || '');
      setEmail(user.email || '');
      setDateOfBirth(user.dateOfBirth ? user.dateOfBirth.substring(0, 10) : '');
      setGender(user.gender || 'ذكر');
      setChildren(user.children || []);
      setAvatarPreview(user.profilePictureUrl || user.avatarUrl || '');
    }
  }, [user]);

  // Fetch owned stories to display in profile
  useEffect(() => {
    if (!user) return;
    const fetchStories = async () => {
      try {
        const res = await fetch('/api/stories');
        if (res.ok) {
          const allStories = await res.json();
          const userOwnedIds = user.ownedStoryIds || user.OwnedStoryIds || [];
          const userStories = allStories.filter((s) => userOwnedIds.includes(s.id));
          setOwnedStories(userStories);
        }
      } catch (err) {
        console.warn('Could not load owned stories:', err);
      } finally {
        setLoadingStories(false);
      }
    };
    fetchStories();
  }, [user]);

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

  const handleAddChild = () => {
    setChildren([...children, { name: '', age: 6, gender: 'ذكر' }]);
  };

  const handleRemoveChild = (index) => {
    setChildren(children.filter((_, i) => i !== index));
  };

  const handleChildChange = (index, field, value) => {
    const updated = [...children];
    updated[index][field] = field === 'age' ? parseInt(value, 10) : value;
    setChildren(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user?.id) return;
    setSaving(true);
    setSuccessMsg('');
    setErrorMsg('');

    try {
      const formData = new FormData();
      formData.append('firstName', firstName);
      formData.append('lastName', lastName);
      formData.append('email', email);
      if (dateOfBirth) formData.append('dateOfBirth', dateOfBirth);
      formData.append('gender', gender);
      formData.append('childrenJson', JSON.stringify(children));

      if (avatarFile) {
        formData.append('avatarFile', avatarFile);
      } else if (selectedPreset) {
        formData.append('avatarUrl', selectedPreset);
      }

      const res = await fetch(`/api/accounts/${user.id}`, {
        method: 'PUT',
        body: formData,
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'فشل حفظ التعديلات');
      }

      const updatedAccount = await res.json();
      updateUser(updatedAccount);
      setSuccessMsg('تم حفظ التعديلات وتحديث ملفك الشخصي بنجاح!');
    } catch (err) {
      setErrorMsg(err.message || 'حدث خطأ أثناء حفظ التعديلات');
    } finally {
      setSaving(false);
    }
  };

  if (!user) return null;

  return (
    <div className="container py-5" dir="rtl" style={{ maxWidth: '900px' }}>
      {/* Page Header */}
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
        <div>
          <h1 className="h3 fw-bold mb-1">إعدادات الحساب والملف الشخصي</h1>
          <p className="text-secondary small mb-0">
            عدّل بياناتك، صورة حسابك، وأطفالك، وشاهد قصصك الممتلكة
          </p>
        </div>
        <button
          type="button"
          className="btn btn-outline-danger btn-sm rounded-pill px-3"
          onClick={() => {
            logout();
            navigate('/');
          }}
        >
          تسجيل الخروج
        </button>
      </div>

      {successMsg && (
        <div className="alert alert-success alert-dismissible fade show rounded-3" role="alert">
          {successMsg}
          <button type="button" className="btn-close" onClick={() => setSuccessMsg('')} />
        </div>
      )}

      {errorMsg && (
        <div className="alert alert-danger alert-dismissible fade show rounded-3" role="alert">
          {errorMsg}
          <button type="button" className="btn-close" onClick={() => setErrorMsg('')} />
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {/* 1. Avatar Section */}
        <div className="card shadow-sm border-0 rounded-4 p-4 mb-4" style={{ backgroundColor: 'var(--card-bg, #fff)' }}>
          <h2 className="h5 fw-bold mb-3">الصورة الشخصية</h2>
          <div className="d-flex flex-wrap align-items-center gap-4 mb-3">
            <div
              className="rounded-circle border border-2 border-primary d-flex align-items-center justify-content-center overflow-hidden"
              style={{ width: '90px', height: '90px', backgroundColor: '#f0f3ff' }}
            >
              {avatarPreview ? (
                <img
                  src={avatarPreview}
                  alt="Avatar"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              ) : (
                <span className="fs-2 text-primary">
                  {firstName ? firstName.charAt(0) : '👤'}
                </span>
              )}
            </div>

            <div className="flex-grow-1">
              <label className="btn btn-outline-primary btn-sm rounded-pill px-3 mb-2 cursor-pointer">
                <span>📷 رفع صورة جديدة (Cloudinary)</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarFileChange}
                  style={{ display: 'none' }}
                />
              </label>
              <p className="text-secondary small mb-0">أو اختر إحدى الشخصيات الكرتونية الجاهزة أدناه:</p>
            </div>
          </div>

          {/* Preset Avatars */}
          <div className="d-flex flex-wrap gap-2">
            {PRESET_AVATARS.map((preset, idx) => (
              <button
                type="button"
                key={idx}
                className={`btn p-1 rounded-circle border ${
                  selectedPreset === preset ? 'border-primary border-3' : 'border-light-subtle'
                }`}
                style={{ width: '48px', height: '48px' }}
                onClick={() => handleSelectPreset(preset)}
                title="اختر هذه الصورة"
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

        {/* 2. Personal Information */}
        <div className="card shadow-sm border-0 rounded-4 p-4 mb-4" style={{ backgroundColor: 'var(--card-bg, #fff)' }}>
          <h2 className="h5 fw-bold mb-3">البيانات الأساسية</h2>
          <div className="row g-3">
            <div className="col-md-6">
              <label className="form-label small fw-semibold">الاسم الأول</label>
              <input
                type="text"
                className="form-control"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
              />
            </div>
            <div className="col-md-6">
              <label className="form-label small fw-semibold">اسم العائلة</label>
              <input
                type="text"
                className="form-control"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
              />
            </div>
            <div className="col-md-6">
              <label className="form-label small fw-semibold">البريد الإلكتروني</label>
              <input
                type="email"
                className="form-control"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                dir="ltr"
              />
            </div>
            <div className="col-md-3">
              <label className="form-label small fw-semibold">تاريخ الميلاد</label>
              <input
                type="date"
                className="form-control"
                value={dateOfBirth}
                onChange={(e) => setDateOfBirth(e.target.value)}
              />
            </div>
            <div className="col-md-3">
              <label className="form-label small fw-semibold">النوع</label>
              <select
                className="form-select"
                value={gender}
                onChange={(e) => setGender(e.target.value)}
              >
                <option value="ذكر">ذكر</option>
                <option value="أنثى">أنثى</option>
              </select>
            </div>
          </div>
        </div>

        {/* 3. Children Management */}
        <div className="card shadow-sm border-0 rounded-4 p-4 mb-4" style={{ backgroundColor: 'var(--card-bg, #fff)' }}>
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h2 className="h5 fw-bold mb-0">بيانات الأطفال</h2>
            <button
              type="button"
              className="btn btn-outline-primary btn-sm rounded-pill px-3"
              onClick={handleAddChild}
            >
              + إضافة طفل
            </button>
          </div>

          {children.length === 0 ? (
            <p className="text-secondary small mb-0">لم تسجل أي أطفال بعد. يمكنك إضافتهم لاقتراح قصص مناسبة لأعمارهم.</p>
          ) : (
            <div className="d-flex flex-column gap-3">
              {children.map((child, idx) => (
                <div key={idx} className="p-3 rounded-3 border d-flex flex-wrap gap-2 align-items-center">
                  <div className="flex-grow-1" style={{ minWidth: '150px' }}>
                    <label className="form-label small text-secondary mb-1">اسم الطفل</label>
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      placeholder="اسم الطفل"
                      value={child.name || ''}
                      onChange={(e) => handleChildChange(idx, 'name', e.target.value)}
                      required
                    />
                  </div>
                  <div style={{ width: '120px' }}>
                    <label className="form-label small text-secondary mb-1">العمر</label>
                    <select
                      className="form-select form-select-sm"
                      value={child.age || 6}
                      onChange={(e) => handleChildChange(idx, 'age', e.target.value)}
                    >
                      {[4, 5, 6, 7, 8, 9, 10, 11, 12].map((age) => (
                        <option key={age} value={age}>
                          {age} سنوات
                        </option>
                      ))}
                    </select>
                  </div>
                  <div style={{ width: '100px' }}>
                    <label className="form-label small text-secondary mb-1">النوع</label>
                    <select
                      className="form-select form-select-sm"
                      value={child.gender || 'ذكر'}
                      onChange={(e) => handleChildChange(idx, 'gender', e.target.value)}
                    >
                      <option value="ذكر">ذكر</option>
                      <option value="أنثى">أنثى</option>
                    </select>
                  </div>
                  <div className="pt-4">
                    <button
                      type="button"
                      className="btn btn-outline-danger btn-sm rounded-pill px-2"
                      onClick={() => handleRemoveChild(idx)}
                      title="حذف هذا الطفل"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Save Button */}
        <div className="d-flex justify-content-end mb-5">
          <button
            type="submit"
            className="btn btn-primary px-4 py-2 rounded-pill fw-semibold shadow-sm"
            disabled={saving}
          >
            {saving ? 'جارٍ الحفظ...' : 'حفظ التعديلات'}
          </button>
        </div>
      </form>

      {/* 4. Owned Stories Section */}
      <div className="card shadow-sm border-0 rounded-4 p-4" style={{ backgroundColor: 'var(--card-bg, #fff)' }}>
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h2 className="h5 fw-bold mb-0">📚 قصصي الممتلكة ({ownedStories.length})</h2>
          <Link to="/library" className="btn btn-outline-primary btn-sm rounded-pill px-3">
            تصفح المزيد من القصص
          </Link>
        </div>

        {loadingStories ? (
          <p className="text-secondary small">جارٍ تحميل قصصك...</p>
        ) : ownedStories.length === 0 ? (
          <div className="text-center py-4 text-secondary">
            <p className="mb-2">ليس لديك أي قصص ممتلكة حالياً.</p>
            <Link to="/library" className="btn btn-primary btn-sm rounded-pill px-3">
              استكشف مكتبة سوبر قيم
            </Link>
          </div>
        ) : (
          <div className="row g-3">
            {ownedStories.map((story) => (
              <div key={story.id} className="col-12 col-md-6 col-lg-4">
                <div className="card h-100 border rounded-3 overflow-hidden shadow-sm">
                  {story.coverImage && (
                    <img
                      src={story.coverImage}
                      alt={story.title}
                      style={{ height: '150px', objectFit: 'cover' }}
                    />
                  )}
                  <div className="card-body p-3 d-flex flex-column justify-content-between">
                    <div>
                      <h3 className="h6 fw-bold mb-1">{story.title}</h3>
                      <div className="d-flex justify-content-between text-secondary small mb-2">
                        <span>العمر: {story.targetAge || story.targetAgeGroup} سنوات</span>
                        <span>⭐ {story.rating != null ? Number(story.rating).toFixed(1) : '—'}</span>
                      </div>
                    </div>
                    <Link
                      to={`/story/${story.id}`}
                      className="btn btn-sm btn-primary w-100 rounded-pill"
                    >
                      اقرأ القصة الآن ←
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default ProfilePage;

