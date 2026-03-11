// Account Page Component - حسابي
import { useState } from 'react'

function AccountPage() {
  const [parentName, setParentName] = useState('أحمد عبدالله')
  const [parentEmail, setParentEmail] = useState('ahmed@example.com')
  const [children, setChildren] = useState([
    { id: 1, name: 'عمر', age: 6, avatar: '👦', color: 'var(--primary-blue)' },
    { id: 2, name: 'لينا', age: 4, avatar: '👧', color: '#ec4899' },
  ])
  const [showAddChild, setShowAddChild] = useState(false)
  const [newChildName, setNewChildName] = useState('')
  const [newChildAge, setNewChildAge] = useState('')
  const [saved, setSaved] = useState(false)

  const handleSave = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const addChild = () => {
    if (newChildName && newChildAge) {
      const avatars = ['👦', '👧', '👶', '🧒']
      const colors = ['var(--primary-blue)', '#ec4899', '#8b5cf6', '#10b981']
      const newChild = {
        id: Date.now(),
        name: newChildName,
        age: parseInt(newChildAge),
        avatar: avatars[children.length % avatars.length],
        color: colors[children.length % colors.length]
      }
      setChildren([...children, newChild])
      setNewChildName('')
      setNewChildAge('')
      setShowAddChild(false)
    }
  }

  const removeChild = (id) => {
    setChildren(children.filter(c => c.id !== id))
  }

  const getRecommendations = (age) => {
    if (age <= 4) return 'قصص قصيرة مصورة مع رسومات ملونة، تعلم الأساسيات'
    if (age <= 6) return 'قصص مغامرات بسيطة مع قيم بسيطة'
    if (age <= 8) return 'قصص أطول مع ألغاز وتحديات'
    return 'قصص معقدة مع دروس أخلاقية عميقة'
  }

  return (
    <section className="account-section">
      <div className="container">
        <div className="profile-container">
          <h1 style={{ textAlign: 'center', marginBottom: '40px' }}>إعدادات الحساب</h1>
          
          <div className="card" style={{ marginBottom: '30px' }}>
            <h2>ملف ولي الأمر</h2>
            <div className="form-group">
              <label>الاسم الكامل</label>
              <input 
                type="text" 
                value={parentName}
                onChange={(e) => setParentName(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>البريد الإلكتروني</label>
              <input 
                type="email" 
                value={parentEmail}
                onChange={(e) => setParentEmail(e.target.value)}
              />
            </div>
            <button className="btn btn-primary" onClick={handleSave}>
              {saved ? '✓ تم الحفظ' : 'حفظ التعديلات'}
            </button>
          </div>

          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2>ملفات الأطفال</h2>
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
                <select 
                  value={newChildAge}
                  onChange={(e) => setNewChildAge(e.target.value)}
                >
                  <option value="">اختر العمر</option>
                  <option value="3">٣ سنوات</option>
                  <option value="4">٤ سنوات</option>
                  <option value="5">٥ سنوات</option>
                  <option value="6">٦ سنوات</option>
                  <option value="7">٧ سنوات</option>
                  <option value="8">٨ سنوات</option>
                  <option value="9">٩ سنوات</option>
                  <option value="10">١٠ سنوات</option>
                </select>
                <button className="btn btn-primary" onClick={addChild}>إضافة</button>
                <button className="btn btn-outline" onClick={() => setShowAddChild(false)}>إلغاء</button>
              </div>
            )}
            
            <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
              {children.map(child => (
                <div key={child.id} className="child-profile-card">
                  <div className="child-avatar" style={{ background: child.color }}>
                    {child.avatar}
                  </div>
                  <h3>{child.name}</h3>
                  <p style={{ margin: '0' }}>{child.age} سنوات</p>
                  <button 
                    className="remove-child-btn"
                    onClick={() => removeChild(child.id)}
                  >
                    إزالة
                  </button>
                </div>
              ))}
            </div>

            <div style={{ marginTop: '30px', paddingTop: '20px', borderTop: '1px solid var(--border-color)' }}>
              {children.map(child => (
                <div key={child.id} style={{ marginBottom: '20px' }}>
                  <h3 style={{ color: 'var(--primary-blue)' }}>ترشيحات النظام لـ {child.name} ({child.age} سنوات):</h3>
                  <p>{getRecommendations(child.age)}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default AccountPage

