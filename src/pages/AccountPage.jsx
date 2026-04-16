// ============================================================
//  AccountPage.jsx — إعدادات الحساب
// ============================================================
import { useState } from 'react'

const AVATARS = ['👦', '👧', '👶', '🧒']
const COLORS  = ['var(--primary-blue)', '#ec4899', '#8b5cf6', '#10b981']

const getRecommendations = (age) => {
  if (age <= 4) return 'قصص قصيرة مصورة مع رسومات ملونة، تعلم الأساسيات'
  if (age <= 6) return 'قصص مغامرات بسيطة مع قيم بسيطة'
  if (age <= 8) return 'قصص أطول مع ألغاز وتحديات'
  return 'قصص معقدة مع دروس أخلاقية عميقة'
}

function AccountPage() {
  const [parentName,   setParentName]   = useState('أحمد عبدالله')
  const [parentEmail,  setParentEmail]  = useState('ahmed@example.com')
  const [children,     setChildren]     = useState([
    { id: 1, name: 'عمر',  age: 6, avatar: '👦', color: 'var(--primary-blue)' },
    { id: 2, name: 'لينا', age: 4, avatar: '👧', color: '#ec4899'             },
  ])
  const [showAddChild,  setShowAddChild]  = useState(false)
  const [newChildName,  setNewChildName]  = useState('')
  const [newChildAge,   setNewChildAge]   = useState('')
  const [saved,         setSaved]         = useState(false)

  const handleSave = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const addChild = () => {
    if (newChildName && newChildAge) {
      const newChild = {
        id:     Date.now(),
        name:   newChildName,
        age:    parseInt(newChildAge),
        avatar: AVATARS[children.length % AVATARS.length],
        color:  COLORS[children.length % COLORS.length],
      }
      setChildren([...children, newChild])
      setNewChildName('')
      setNewChildAge('')
      setShowAddChild(false)
    }
  }

  const removeChild = (id) => setChildren(children.filter(c => c.id !== id))

  return (
    <section id="account">
      <div className="container">
        <div className="profile-container">

          <h1 style={{ textAlign: 'center', marginBottom: '40px' }}>إعدادات الحساب</h1>

          {/* Parent Profile */}
          <div className="card" style={{ marginBottom: '30px' }}>
            <h2>ملف ولي الأمر</h2>
            <div className="form-group">
              <label>الاسم الكامل</label>
              <input type="text" value={parentName} onChange={(e) => setParentName(e.target.value)} />
            </div>
            <div className="form-group">
              <label>البريد الإلكتروني</label>
              <input type="email" value={parentEmail} onChange={(e) => setParentEmail(e.target.value)} />
            </div>
            <button className="btn btn-primary" onClick={handleSave}>
              {saved ? '✓ تم الحفظ' : 'حفظ التعديلات'}
            </button>
          </div>

          {/* Children Profiles */}
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' }}>
              <h2 style={{ margin: 0 }}>ملفات الأطفال</h2>
              <button className="btn btn-yellow" onClick={() => setShowAddChild(true)}>+ إضافة طفل</button>
            </div>

            {showAddChild && (
              <div className="add-child-form">
                <input
                  type="text"
                  placeholder="اسم الطفل"
                  value={newChildName}
                  onChange={(e) => setNewChildName(e.target.value)}
                />
                <select value={newChildAge} onChange={(e) => setNewChildAge(e.target.value)}>
                  <option value="">اختر العمر</option>
                  {[3,4,5,6,7,8,9,10].map(n => (
                    <option key={n} value={n}>{n} سنوات</option>
                  ))}
                </select>
                <button className="btn btn-primary" onClick={addChild}>إضافة</button>
                <button className="btn btn-outline" onClick={() => setShowAddChild(false)}>إلغاء</button>
              </div>
            )}

            {/* Children grid */}
            <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
              {children.map(child => (
                <div key={child.id} className="child-profile-card">
                  <div className="child-avatar" style={{ background: child.color }}>
                    {child.avatar}
                  </div>
                  <h3>{child.name}</h3>
                  <p style={{ margin: 0, fontSize: '0.9rem' }}>{child.age} سنوات</p>
                  <button className="remove-child-btn" onClick={() => removeChild(child.id)}>إزالة</button>
                </div>
              ))}
            </div>

            {/* Per-child recommendations */}
            {children.length > 0 && (
              <div style={{ marginTop: '30px', paddingTop: '20px', borderTop: '1px solid var(--border-color)' }}>
                {children.map(child => (
                  <div key={child.id} style={{ marginBottom: '20px' }}>
                    <h3 style={{ color: 'var(--primary-blue)' }}>
                      ترشيحات النظام لـ {child.name} ({child.age} سنوات):
                    </h3>
                    <p>{getRecommendations(child.age)}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>
    </section>
  )
}

export default AccountPage
