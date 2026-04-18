// ============================================================
//  AccountPage.jsx — إعدادات الحساب
//  Fully wired to the backend via /api/account/* endpoints.
// ============================================================
import { useState, useEffect, useCallback } from 'react'
import { fetchProfile, updateProfile, addChild, removeChild } from '../api/account'

// ── Decorative helpers ────────────────────────────────────────
const AVATARS = ['👦', '👧', '👶', '🧒', '🧑']
const COLORS = [
  'var(--primary-blue)',
  '#ec4899',
  '#8b5cf6',
  '#10b981',
  '#f59e0b',
]

// ── Toast component (local, no library needed) ────────────────
function Toast({ message, type = 'success', onClose }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 3500)
    return () => clearTimeout(timer)
  }, [onClose])

  const bg = type === 'success' ? '#10b981' : '#dc2626'
  return (
    <div
      role="status"
      aria-live="polite"
      style={{
        position: 'fixed',
        top: '90px',
        left: '50%',
        transform: 'translateX(-50%)',
        background: bg,
        color: '#fff',
        padding: '14px 28px',
        borderRadius: '50px',
        fontWeight: 700,
        fontSize: '0.95rem',
        boxShadow: '0 8px 30px rgba(0,0,0,0.2)',
        zIndex: 1000,
        animation: 'fadeIn 0.3s ease',
        whiteSpace: 'nowrap',
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
      }}
    >
      {type === 'success' ? '✓' : '✕'} {message}
    </div>
  )
}

// ── Main page component ───────────────────────────────────────
function AccountPage() {
  // ── Server-synced profile state ──
  const [profile, setProfile] = useState(null)

  // ── Local editable fields (parent profile card) ──
  const [fullName, setFullName] = useState('')
  const [whatsApp, setWhatsApp] = useState('')

  // ── Add-child form state ──
  const [showAddForm, setShowAddForm] = useState(false)
  const [newChildName, setNewChildName] = useState('')
  const [newChildAge, setNewChildAge] = useState('')
  const [newChildGender, setNewChildGender] = useState('')

  // ── UI states ──
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [addingChild, setAddingChild] = useState(false)
  const [removingId, setRemovingId] = useState(null) // "name-age" key of child being removed
  const [fetchError, setFetchError] = useState(null)
  const [toast, setToast] = useState(null)  // { message, type }

  // ── Helper: apply server profile to local state ──────────────
  const applyProfile = useCallback((data) => {
    setProfile(data)
    setFullName(data.fullName ?? '')
    setWhatsApp(data.whatsAppNumber ?? '')
  }, [])

  // ── Helper: show toast ───────────────────────────────────────
  const showToast = (message, type = 'success') => setToast({ message, type })
  const clearToast = useCallback(() => setToast(null), [])

  // ── Fetch on mount ───────────────────────────────────────────
  useEffect(() => {
    let cancelled = false
      ; (async () => {
        setLoading(true)
        setFetchError(null)
        try {
          // client.js interceptor unwraps ApiResponse → returns response.data
          const res = await fetchProfile()
          if (!cancelled && res.success && res.data) applyProfile(res.data)
          else if (!cancelled) setFetchError(res.message || 'تعذّر تحميل الملف الشخصي.')
        } catch (err) {
          if (!cancelled) setFetchError(err.message || 'خطأ في الشبكة.')
        } finally {
          if (!cancelled) setLoading(false)
        }
      })()
    return () => { cancelled = true }
  }, [applyProfile])

  // ── Save parent profile ──────────────────────────────────────
  const handleSave = async () => {
    if (!fullName.trim()) return
    setSaving(true)
    try {
      const res = await updateProfile({ fullName: fullName.trim(), whatsAppNumber: whatsApp.trim() || null })
      if (res.success && res.data) {
        applyProfile(res.data)
        showToast('تم حفظ التعديلات بنجاح ✓')
      } else {
        showToast(res.message || 'فشل الحفظ.', 'error')
      }
    } catch (err) {
      showToast(err.message || 'خطأ في الشبكة.', 'error')
    } finally {
      setSaving(false)
    }
  }

  // ── Add child ────────────────────────────────────────────────
  const handleAddChild = async () => {
    const trimmedName = newChildName.trim()
    if (!trimmedName || !newChildAge || !newChildGender) return
    setAddingChild(true)
    try {
      const res = await addChild({ name: trimmedName, age: parseInt(newChildAge, 10), gender: newChildGender })
      if (res.success && res.data) {
        applyProfile(res.data)
        setNewChildName('')
        setNewChildAge('')
        setNewChildGender('')
        setShowAddForm(false)
        showToast('تمت إضافة الطفل بنجاح ✓')
      } else {
        showToast(res.message || 'فشلت الإضافة.', 'error')
      }
    } catch (err) {
      showToast(err.message || 'خطأ في الشبكة.', 'error')
    } finally {
      setAddingChild(false)
    }
  }

  // ── Remove child ─────────────────────────────────────────────
  const handleRemoveChild = async (child) => {
    const key = `${child.name}-${child.age}`
    setRemovingId(key)
    try {
      const res = await removeChild({ name: child.name, age: child.age })
      if (res.success && res.data) {
        applyProfile(res.data)
        showToast('تمت إزالة الطفل.')
      } else {
        showToast(res.message || 'فشلت الإزالة.', 'error')
      }
    } catch (err) {
      showToast(err.message || 'خطأ في الشبكة.', 'error')
    } finally {
      setRemovingId(null)
    }
  }

  // ── Loading skeleton ─────────────────────────────────────────
  if (loading) {
    return (
      <section id="account">
        <div className="container">
          <div className="profile-container">
            <div style={{ textAlign: 'center', padding: '80px 20px', color: 'var(--text-secondary)' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '16px' }}>⏳</div>
              <p>جاري تحميل الملف الشخصي…</p>
            </div>
          </div>
        </div>
      </section>
    )
  }

  // ── Fetch error ───────────────────────────────────────────────
  if (fetchError) {
    return (
      <section id="account">
        <div className="container">
          <div className="profile-container">
            <div className="error-message" style={{ textAlign: 'center', padding: '30px' }}>
              <div style={{ fontSize: '2rem', marginBottom: '12px' }}>⚠️</div>
              {fetchError}
            </div>
          </div>
        </div>
      </section>
    )
  }

  const children = profile?.children ?? []

  return (
    <section id="account">
      {/* Toast notification */}
      {toast && <Toast message={toast.message} type={toast.type} onClose={clearToast} />}

      <div className="container">
        <div className="profile-container">

          <h1 style={{ textAlign: 'center', marginBottom: '40px' }}>إعدادات الحساب</h1>

          {/* ── Parent Profile Card ─────────────────────────────── */}
          <div className="card" style={{ marginBottom: '30px' }}>
            <h2>ملف ولي الأمر</h2>

            {/* Full name */}
            <div className="form-group">
              <label htmlFor="acc-fullname">الاسم الكامل</label>
              <input
                id="acc-fullname"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="الاسم الكامل"
              />
            </div>

            {/* Email — read-only, explicitly non-editable */}
            <div className="form-group">
              <label
                htmlFor="acc-email"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px'
                }}
              >
                <span>البريد الإلكتروني</span>

                <span style={{
                  fontSize: '0.75rem',
                  fontWeight: 400,
                  color: 'var(--text-secondary)',
                  background: 'var(--bg-secondary)',
                  padding: '2px 10px',
                  borderRadius: '20px',
                }}>
                  لا يمكن تعديله
                </span>
              </label>
              <input
                id="acc-email"
                type="email"
                value={profile?.email ?? ''}
                readOnly
                disabled
                aria-readonly="true"
                aria-label="البريد الإلكتروني — لا يمكن تعديله"
                style={{
                  background: 'var(--bg-secondary)',
                  color: 'var(--text-secondary)',
                  cursor: 'not-allowed',
                  opacity: 0.75,
                  borderStyle: 'dashed',
                }}
              />
            </div>

            {/* WhatsApp number */}
            <div className="form-group">
              <label htmlFor="acc-whatsapp">رقم واتساب (اختياري)</label>
              <input
                id="acc-whatsapp"
                type="tel"
                value={whatsApp}
                onChange={(e) => setWhatsApp(e.target.value)}
                placeholder="مثال: 966501234567+"
                dir="ltr"
              />
            </div>

            <button
              id="btn-save-profile"
              className="btn btn-primary"
              onClick={handleSave}
              disabled={saving || !fullName.trim()}
              aria-busy={saving}
            >
              {saving ? '⏳ جاري الحفظ…' : 'حفظ التعديلات'}
            </button>
          </div>

          {/* ── Children Profiles Card ──────────────────────────── */}
          <div className="card">
            {/* Card header */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '20px',
              flexWrap: 'wrap',
              gap: '10px',
            }}>
              <h2 style={{ margin: 0 }}>ملفات الأطفال</h2>
              <button
                id="btn-show-add-child"
                className="btn btn-yellow"
                onClick={() => setShowAddForm(true)}
                disabled={showAddForm}
              >
                + إضافة طفل
              </button>
            </div>

            {/* Add-child inline form */}
            {showAddForm && (
              <div className="add-child-form" role="form" aria-label="نموذج إضافة طفل">
                <input
                  id="new-child-name"
                  type="text"
                  placeholder="اسم الطفل"
                  value={newChildName}
                  onChange={(e) => setNewChildName(e.target.value)}
                  autoFocus
                />
                <select
                  id="new-child-age"
                  value={newChildAge}
                  onChange={(e) => setNewChildAge(e.target.value)}
                >
                  <option value="">اختر العمر</option>
                  {[3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((n) => (
                    <option key={n} value={n}>{n} سنوات</option>
                  ))}
                </select>
                <select
                  id="new-child-gender"
                  value={newChildGender}
                  onChange={(e) => setNewChildGender(e.target.value)}
                >
                  <option value="">اختر الجنس</option>
                  <option value="Boy">ولد</option>
                  <option value="Girl">بنت</option>
                </select>
                <button
                  id="btn-confirm-add-child"
                  className="btn btn-primary"
                  onClick={handleAddChild}
                  disabled={addingChild || !newChildName.trim() || !newChildAge || !newChildGender}
                  aria-busy={addingChild}
                >
                  {addingChild ? '⏳ جاري الإضافة…' : 'إضافة'}
                </button>
                <button
                  id="btn-cancel-add-child"
                  className="btn btn-outline"
                  onClick={() => { setShowAddForm(false); setNewChildName(''); setNewChildAge(''); setNewChildGender(''); }}
                  disabled={addingChild}
                >
                  إلغاء
                </button>
              </div>
            )}

            {/* Children grid */}
            {children.length === 0 ? (
              <div className="empty-state" style={{ padding: '30px 0' }}>
                <p>لا يوجد أطفال مضافون بعد. أضف طفلك الأول!</p>
              </div>
            ) : (
              <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
                {children.map((child, idx) => {
                  const key = `${child.name}-${child.age}`
                  const isRemoving = removingId === key
                  return (
                    <div
                      key={key}
                      className="child-profile-card"
                      style={{ opacity: isRemoving ? 0.5 : 1, transition: 'opacity 0.3s' }}
                    >
                      <div
                        className="child-avatar"
                        style={{ background: COLORS[idx % COLORS.length] }}
                        aria-hidden="true"
                      >
                        {child.gender === 'Girl' ? '👧' : '👦'}
                      </div>
                      <h3>{child.name}</h3>
                      <p style={{ margin: 0, fontSize: '0.9rem' }}>{child.age} سنوات</p>
                      <button
                        id={`btn-remove-child-${idx}`}
                        className="remove-child-btn"
                        onClick={() => handleRemoveChild(child)}
                        disabled={isRemoving}
                        aria-label={`إزالة ${child.name}`}
                        aria-busy={isRemoving}
                      >
                        {isRemoving ? '⏳' : 'إزالة'}
                      </button>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

        </div>
      </div>
    </section>
  )
}

export default AccountPage
