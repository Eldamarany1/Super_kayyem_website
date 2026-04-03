// Account Page Component - User settings and children profiles
import { useState } from 'react'

function AccountPage() {
  // Parent profile state
  const [parentName, setParentName] = useState('أحمد عبدالله')
  const [parentEmail, setParentEmail] = useState('ahmed@example.com')

  // Children profiles state
  const [children, setChildren] = useState([
    { id: 1, name: 'عمر', age: 6, avatar: '👦', color: 'var(--primary-blue)' },
    { id: 2, name: 'لينا', age: 4, avatar: '👧', color: '#ec4899' },
  ])

  // UI state
  const [showAddChild, setShowAddChild] = useState(false)
  const [newChildName, setNewChildName] = useState('')
  const [newChildAge, setNewChildAge] = useState('')
  const [saved, setSaved] = useState(false)

  // Save profile changes
  const handleSave = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  // Add new child profile
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

  // Remove child profile
  const removeChild = (id) => {
    setChildren(children.filter(c => c.id !== id))
  }

  // Get age-appropriate recommendations
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
          <h1 className="section-title-centered">إعدادات الحساب</h1>

          {/* Parent Profile Card */}
          <div className="card card-margin">
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

          {/* Children Profiles Card */}
          <div className="card">
            <div className="card-header-row">
              <h2>ملفات الأطفال</h2>
              <button className="btn btn-yellow" onClick={() => setShowAddChild(true)}>
                + إضافة طفل
              </button>
            </div>

            {/* Add Child Form */}
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

            {/* Children Grid */}
            <div className="children-grid">
              {children.map(child => (
                <div key={child.id} className="child-profile-card">
                  <div className="child-avatar-colored" style={{ background: child.color }}>
                    {child.avatar}
                  </div>
                  <h3>{child.name}</h3>
                  <p>{child.age} سنوات</p>
                  <button
                    className="remove-child-btn"
                    onClick={() => removeChild(child.id)}
                  >
                    إزالة
                  </button>
                </div>
              ))}
            </div>

            {/* Recommendations Section */}
            <div className="recommendations-section">
              {children.map(child => (
                <div key={child.id} className="recommendation-item">
                  <h3>ترشيحات النظام لـ {child.name} ({child.age} سنوات):</h3>
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