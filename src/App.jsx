import { useState, useEffect } from 'react'
import './App.css'

// Mock Data
const MOCK_STORIES = [
  { id: 1, title: 'باسم ومسبار الأمل', category: 'التعاون', age: '٦-٨', progress: 100, cover: 'الفضاء', completed: true },
  { id: 2, title: 'سر اللؤلؤة الزرقاء', category: 'الشجاعة', age: '٤-٦', progress: 60, cover: 'المحيط', completed: false },
  { id: 3, title: 'خريطة الشجرة العتيقة', category: 'الصدق', age: '٨-١٠', progress: 0, cover: 'الغابة', completed: false },
  { id: 4, title: 'بطل المجرة', category: 'المسؤولية', age: '٦-٨', progress: 0, cover: 'الفضاء', completed: false },
  { id: 5, title: 'أصدقاء القمر', category: 'الصداقة', age: '٤-٦', progress: 0, cover: 'الفضاء', completed: false },
  { id: 6, title: 'سفينة الصحراء', category: 'الصبر', age: '٨-١٠', progress: 0, cover: 'الصحراء', completed: false },
]

const CATEGORIES = ['الكل', 'التعاون', 'الشجاعة', 'الصدق', 'المسؤولية', 'الصداقة', 'الصبر']

// Navigation Component
function Navbar({ currentPage, setCurrentPage, isDark, setIsDark, isLoggedIn, setIsLoggedIn }) {
  const handleLogout = () => {
    setIsLoggedIn(false)
    setCurrentPage('login')
  }

  return (
    <nav>
      <div className="container nav-container">
        <div className="logo" onClick={() => setCurrentPage('home')}>
          سوبر <span>قيم</span>
        </div>
        <ul className="nav-links">
          <li 
            onClick={() => setCurrentPage('home')} 
            id="nav-home" 
            className={currentPage === 'home' ? 'active' : ''}
          >
            الرئيسية
          </li>
          {isLoggedIn && (
            <>
              <li 
                onClick={() => setCurrentPage('library')} 
                id="nav-library"
                className={currentPage === 'library' ? 'active' : ''}
              >
                مكتبتي
              </li>
              <li 
                onClick={() => setCurrentPage('account')} 
                id="nav-account"
                className={currentPage === 'account' ? 'active' : ''}
              >
                حسابي
              </li>
            </>
          )}
        </ul>
        <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
          <button 
            className="theme-toggle" 
            onClick={() => setIsDark(!isDark)}
            title="تغيير المظهر"
          >
            {isDark ? '☀️' : '🌙'}
          </button>
          {isLoggedIn ? (
            <button className="btn btn-outline" onClick={handleLogout}>
              تسجيل خروج
            </button>
          ) : (
            <button className="btn btn-primary" onClick={() => setCurrentPage('login')}>
              تسجيل دخول
            </button>
          )}
        </div>
      </div>
    </nav>
  )
}

// Login Page Component
function LoginPage({ setCurrentPage, setIsLoggedIn }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const handleLogin = (e) => {
    e.preventDefault()
    if (email && password) {
      setIsLoggedIn(true)
      setCurrentPage('home')
    } else {
      setError('يرجى إدخال البريد الإلكتروني وكلمة المرور')
    }
  }

  return (
    <section id="login" className="page-view active">
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-header">
            <div className="logo" style={{ marginBottom: '10px' }}>سوبر <span>قيم</span></div>
            <h2>مرحباً بعودتك!</h2>
            <p>سجل دخولك للمتابعة في مغامرات باسم</p>
          </div>
          
          <form onSubmit={handleLogin}>
            {error && <div className="error-message">{error}</div>}
            
            <div className="form-group">
              <label>البريد الإلكتروني</label>
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="أدخل بريدك الإلكتروني"
              />
            </div>
            
            <div className="form-group">
              <label>كلمة المرور</label>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="أدخل كلمة المرور"
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                <input type="checkbox" /> تذكرني
              </label>
              <a href="#" style={{ color: 'var(--primary-blue)', fontWeight: '600' }}>نسيت كلمة المرور؟</a>
            </div>
            
            <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
              تسجيل دخول
            </button>
          </form>

          <div className="auth-footer">
            <p>ليس لديك حساب؟ <span onClick={() => setCurrentPage('signup')} style={{ color: 'var(--primary-blue)', fontWeight: '600', cursor: 'pointer' }}>أنشئ حساباً جديداً</span></p>
          </div>
        </div>
      </div>
    </section>
  )
}

// Signup Page Component
function SignupPage({ setCurrentPage, setIsLoggedIn }) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [children, setChildren] = useState([])
  const [showChildForm, setShowChildForm] = useState(false)
  const [childName, setChildName] = useState('')
  const [childAge, setChildAge] = useState('')
  const [error, setError] = useState('')

  const handleSignup = (e) => {
    e.preventDefault()
    if (!name || !email || !password) {
      setError('يرجى ملء جميع الحقول المطلوبة')
      return
    }
    if (password !== confirmPassword) {
      setError('كلمات المرور غير متطابقة')
      return
    }
    setIsLoggedIn(true)
    setCurrentPage('home')
  }

  const addChild = () => {
    if (childName && childAge) {
      setChildren([...children, { name: childName, age: childAge }])
      setChildName('')
      setChildAge('')
      setShowChildForm(false)
    }
  }

  const removeChild = (index) => {
    setChildren(children.filter((_, i) => i !== index))
  }

  return (
    <section id="signup" className="page-view active">
      <div className="auth-container">
        <div className="auth-card" style={{ maxWidth: '500px' }}>
          <div className="auth-header">
            <div className="logo" style={{ marginBottom: '10px' }}>سوبر <span>قيم</span></div>
            <h2>أنشئ حسابك!</h2>
            <p>انضم إلى عائلة سوبر قيم</p>
          </div>
          
          <form onSubmit={handleSignup}>
            {error && <div className="error-message">{error}</div>}
            
            <div className="form-group">
              <label>الاسم الكامل *</label>
              <input 
                type="text" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="أدخل اسمك الكامل"
              />
            </div>
            
            <div className="form-group">
              <label>البريد الإلكتروني *</label>
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="أدخل بريدك الإلكتروني"
              />
            </div>

            <div className="form-group">
              <label>كلمة المرور *</label>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="أدخل كلمة المرور"
              />
            </div>

            <div className="form-group">
              <label>تأكيد كلمة المرور *</label>
              <input 
                type="password" 
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="أعد إدخال كلمة المرور"
              />
            </div>

            <div className="form-group" style={{ borderTop: '1px solid var(--border-color)', paddingTop: '15px' }}>
              <label>أضف أطفالك (اختياري)</label>
              
              {children.length > 0 && (
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '10px' }}>
                  {children.map((child, index) => (
                    <div key={index} className="child-tag">
                      <span>{child.name} ({child.age} سنوات)</span>
                      <span onClick={() => removeChild(index)} style={{ cursor: 'pointer', marginRight: '8px' }}>×</span>
                    </div>
                  ))}
                </div>
              )}

              {showChildForm ? (
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <input 
                    type="text" 
                    value={childName}
                    onChange={(e) => setChildName(e.target.value)}
                    placeholder="اسم الطفل"
                    style={{ flex: 1 }}
                  />
                  <select 
                    value={childAge}
                    onChange={(e) => setChildAge(e.target.value)}
                    style={{ flex: 1, padding: '12px', border: '2px solid var(--border-color)', borderRadius: '10px', background: 'var(--bg-color)', color: 'var(--text-primary)' }}
                  >
                    <option value="">العمر</option>
                    <option value="٣">٣ سنوات</option>
                    <option value="٤">٤ سنوات</option>
                    <option value="٥">٥ سنوات</option>
                    <option value="٦">٦ سنوات</option>
                    <option value="٧">٧ سنوات</option>
                    <option value="٨">٨ سنوات</option>
                    <option value="٩">٩ سنوات</option>
                    <option value="١٠">١٠ سنوات</option>
                  </select>
                  <button type="button" onClick={addChild} className="btn btn-primary" style={{ padding: '10px 20px' }}>✓</button>
                </div>
              ) : (
                <button 
                  type="button" 
                  className="btn btn-outline" 
                  onClick={() => setShowChildForm(true)}
                  style={{ width: '100%' }}
                >
                  + إضافة طفل
                </button>
              )}
            </div>
            
            <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '10px' }}>
              إنشاء حساب
            </button>
          </form>

          <div className="auth-footer">
            <p>لديك حساب بالفعل؟ <span onClick={() => setCurrentPage('login')} style={{ color: 'var(--primary-blue)', fontWeight: '600', cursor: 'pointer' }}>سجل دخولك</span></p>
          </div>
        </div>
      </div>
    </section>
  )
}

// Homepage Component
function HomePage({ setCurrentPage }) {
  return (
    <section id="home" className="page-view active">
      <div className="hero">
        <div className="container">
          <h1>مغامرات تصنع القيم</h1>
          <p>عالم رقمي آمن يجمع بين سحر القصص وتنمية القيم الأخلاقية لدى الأطفال، صُمم خصيصاً للآباء الباحثين عن محتوى راقي.</p>
          <button 
            className="btn btn-yellow" 
            style={{ fontSize: '1.2rem', padding: '15px 35px' }}
            onClick={() => document.getElementById('stories')?.scrollIntoView({ behavior: 'smooth' })}
          >
            استكشف القصص
          </button>
          
          <div className="hero-graphics">
            <div className="img-placeholder floating" style={{ width: '200px', height: '80px', borderRadius: '40px', position: 'absolute', top: '20px', left: '10%' }}>
              ☁️ جزيرة طافية
            </div>
            <div className="img-placeholder floating" style={{ width: '150px', height: '60px', borderRadius: '40px', position: 'absolute', top: '60px', right: '15%', animationDelay: '2s' }}>
              ☁️ غيوم ناعمة
            </div>
            <div className="img-placeholder floating" style={{ width: '300px', height: '120px', borderRadius: '60px', position: 'absolute', bottom: '0', left: '50%', transform: 'translateX(-50%)', animationDelay: '1s' }}>
              ✨ مدينة الخيال ✨
            </div>
          </div>
        </div>
      </div>

      <div className="container" id="stories">
        <div className="bassem-section">
          <div className="bassem-avatar img-placeholder floating">
            صورة باسم<br/>(بطل المغامرات)
          </div>
          <div className="bassem-content">
            <h2>مرحباً! أنا باسم</h2>
            <p>أنا صديق أطفالكم الجديد. أحب استكشاف الفضاء، وحل الألغاز العلمية، والسفر عبر الجزر الطافية! في كل قصة نعيشها معاً، نتعلم قيمة جديدة تجعلنا أبطالاً حقيقيين في عالمنا.</p>
            <button className="btn btn-outline" onClick={() => setCurrentPage('story')}>
              اقرأ مغامرتي الأولى
            </button>
          </div>
        </div>

        <h2 className="section-title">مغامرات شيقة</h2>
        <div className="grid">
          <div className="card" onClick={() => setCurrentPage('story')}>
            <div className="img-placeholder">غلاف القصة: الفضاء</div>
            <h3>باسم ومسبار الأمل</h3>
            <p>رحلة فضائية مذهلة لاكتشاف الكواكب.</p>
            <span className="tag">التعاون</span> <span className="tag">٦-٨ سنوات</span>
          </div>
          <div className="card" onClick={() => setCurrentPage('story')}>
            <div className="img-placeholder">غلاف القصة: المحيط</div>
            <h3>سر اللؤلؤة الزرقاء</h3>
            <p>مغامرة في أعماق البحر مع الكائنات البحرية.</p>
            <span className="tag">الشجاعة</span> <span className="tag">٤-٦ سنوات</span>
          </div>
          <div className="card" onClick={() => setCurrentPage('story')}>
            <div className="img-placeholder">غلاف القصة: الغابة</div>
            <h3>خريطة الشجرة العتيقة</h3>
            <p>لغز مثير داخل الغابة السحرية.</p>
            <span className="tag">الصدق</span> <span className="tag">٨-١٠ سنوات</span>
          </div>
        </div>

        <h2 className="section-title">ركن الآباء والمربين</h2>
        <div className="grid">
          <div className="card" style={{ background: 'var(--bg-secondary)' }}>
            <h3>كيف نغرس الصدق؟</h3>
            <p>مقال تربوي قصير عن أهمية القراءة في بناء الشخصية.</p>
            <a href="#" style={{ color: 'var(--primary-blue)', fontWeight: '600' }}>اقرأ المزيد ←</a>
          </div>
          <div className="card" style={{ background: 'var(--bg-secondary)' }}>
            <h3>وقت النوم الهادئ</h3>
            <p>نصائح لاختيار قصص ما قبل النوم المناسبة لطفلك.</p>
            <a href="#" style={{ color: 'var(--primary-blue)', fontWeight: '600' }}>اقرأ المزيد ←</a>
          </div>
        </div>
      </div>
    </section>
  )
}

// Story Page Component
function StoryPage({ setCurrentPage, setShowModal }) {
  return (
    <section id="story" className="page-view">
      <div className="container">
        <div className="story-header">
          <div className="story-banner img-placeholder">
            تصميم سينمائي ناعم للمغامرة: باسم بملابس رائد فضاء يطفو بين النجوم المضيئة.
          </div>
          <div className="story-info">
            <h1>باسم ومسبار الأمل</h1>
            <div className="story-meta">
              <span className="tag">الفئة العمرية: ٦-٨ سنوات</span>
              <span className="tag">القيمة: التعاون</span>
              <span className="tag">مدة القراءة: ١٠ دقائق</span>
            </div>
            <div className="ratings">⭐⭐⭐⭐⭐ (٤.٨ / ٥)</div>
            <p style={{ fontSize: '1.1rem', marginBottom: '20px' }}>
              ينطلق باسم مع أصدقائه في رحلة خيالية لإنقاذ كوكب صغير فقد نوره. من خلال هذه القصة المليئة بالخيال والألوان الدافئة، يتعلم الأطفال أن العمل الجماعي يضيء حتى أظلم الأماكن.
            </p>
            <div className="story-actions">
              <button className="btn btn-primary" onClick={() => setShowModal(true)}>شراء القصة (١٥ ر.س)</button>
              <button className="btn btn-outline" onClick={() => setCurrentPage('reader')}>معاينة مجانية</button>
            </div>
          </div>
        </div>

        <h2 className="section-title" style={{ textAlign: 'right', marginTop: '60px' }}>قصص مشابهة قد تعجبك</h2>
        <div className="grid">
          <div className="card" onClick={() => setCurrentPage('story')}>
            <div className="img-placeholder" style={{ height: '120px' }}>غلاف</div>
            <h3>بطل المجرة</h3>
            <span className="tag">المسؤولية</span>
          </div>
          <div className="card" onClick={() => setCurrentPage('story')}>
            <div className="img-placeholder" style={{ height: '120px' }}>غلاف</div>
            <h3>أصدقاء القمر</h3>
            <span className="tag">الصداقة</span>
          </div>
        </div>
      </div>
    </section>
  )
}

// Library Page Component
function LibraryPage({ setCurrentPage }) {
  const [filter, setFilter] = useState('الكل')
  const [searchTerm, setSearchTerm] = useState('')

  const filteredStories = MOCK_STORIES.filter(story => {
    const matchesCategory = filter === 'الكل' || story.category === filter
    const matchesSearch = story.title.includes(searchTerm) || story.category.includes(searchTerm)
    return matchesCategory && matchesSearch
  })

  const readingStories = filteredStories.filter(s => s.progress > 0 && s.progress < 100)
  const completedStories = filteredStories.filter(s => s.progress === 100 || s.completed)
  const availableStories = filteredStories.filter(s => s.progress === 0 && !s.completed)

  return (
    <section id="library" className="page-view">
      <div className="container">
        <div className="dashboard-header">
          <h1>مكتبتي الخاصة</h1>
          <button className="btn btn-outline">تحميل كل القصص (PDF)</button>
        </div>

        <div className="library-controls">
          <div className="search-box">
            <input 
              type="text" 
              placeholder="ابحث في مكتبتك..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <span className="search-icon">🔍</span>
          </div>
          <div className="category-filters">
            {CATEGORIES.map(cat => (
              <button 
                key={cat}
                className={`filter-btn ${filter === cat ? 'active' : ''}`}
                onClick={() => setFilter(cat)}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
        
        {readingStories.length > 0 && (
          <>
            <h2 style={{ marginTop: '30px' }}>متابعة القراءة</h2>
            <div className="grid">
              {readingStories.map(story => (
                <div className="card" key={story.id}>
                  <div style={{ display: 'flex', gap: '15px' }}>
                    <div className="img-placeholder story-cover" style={{ width: '80px', height: '80px', borderRadius: '10px' }}>
                      {story.cover}
                    </div>
                    <div style={{ flex: '1' }}>
                      <h3 style={{ marginBottom: '5px', fontSize: '1.1rem' }}>{story.title}</h3>
                      <p style={{ marginBottom: '0', fontSize: '0.85rem' }}>الصفحة {Math.floor(story.progress * 1.5)} من ١٥</p>
                      <div className="progress-bar"><div className="progress-fill" style={{ width: `${story.progress}%` }}></div></div>
                    </div>
                  </div>
                  <button className="btn btn-primary" style={{ width: '100%', marginTop: '15px', padding: '8px' }} onClick={() => setCurrentPage('reader')}>
                    أكمل القراءة
                  </button>
                </div>
              ))}
            </div>
          </>
        )}

        {completedStories.length > 0 && (
          <>
            <h2 style={{ marginTop: '40px' }}>القصص المكتملة والمفضلة</h2>
            <div className="grid">
              {completedStories.map(story => (
                <div className="card" key={story.id}>
                  <div className="img-placeholder story-cover" style={{ height: '150px' }}>{story.cover}</div>
                  <h3>{story.title}</h3>
                  <div style={{ display: 'flex', gap: '8px', marginBottom: '10px' }}>
                    <span className="tag">{story.category}</span>
                    <span className="tag">{story.age} سنوات</span>
                  </div>
                  <button className="btn btn-yellow" style={{ width: '100%', padding: '8px' }} onClick={() => setCurrentPage('reader')}>
                    اقرأ مرة أخرى
                  </button>
                </div>
              ))}
            </div>
          </>
        )}

        {availableStories.length > 0 && (
          <>
            <h2 style={{ marginTop: '40px' }}>قصص جديدة متاحة</h2>
            <div className="grid">
              {availableStories.map(story => (
                <div className="card" key={story.id}>
                  <div className="img-placeholder story-cover" style={{ height: '150px' }}>{story.cover}</div>
                  <h3>{story.title}</h3>
                  <div style={{ display: 'flex', gap: '8px', marginBottom: '10px' }}>
                    <span className="tag">{story.category}</span>
                    <span className="tag">{story.age} سنوات</span>
                  </div>
                  <button className="btn btn-primary" style={{ width: '100%', padding: '8px' }} onClick={() => setCurrentPage('story')}>
                    ابدأ القراءة
                  </button>
                </div>
              ))}
            </div>
          </>
        )}

        {filteredStories.length === 0 && (
          <div className="empty-state">
            <p>لم يتم العثور على قصص مطابقة</p>
          </div>
        )}
      </div>
    </section>
  )
}

// Reader Page Component
function ReaderPage({ setCurrentPage }) {
  return (
    <section id="reader" className="page-view">
      <div className="container">
        <div className="reader-container">
          <div className="reader-toolbar">
            <button className="btn btn-outline" onClick={() => setCurrentPage('library')}>
              إغلاق وتخزين
            </button>
            <h3 style={{ margin: '0' }}>باسم ومسبار الأمل</h3>
            <div>
              <button className="btn btn-outline" title="حفظ علامة">🔖</button>
              <button className="btn btn-primary" title="تحميل PDF">⬇️ PDF</button>
            </div>
          </div>
          
          <div className="book-spread">
            <div className="book-page">
              <div className="img-placeholder" style={{ height: '200px', marginBottom: '30px', borderRadius: '10px', background: '#e0f2fe' }}>
                رسمة ناعمة للسماء والنجوم
              </div>
              <p className="page-text">
                في ليلة هادئة، وتحت ضوء قمر فضي ناعم، كان باسم يجلس في غرفته متأملاً السماء من نافذته الصنبورة. كان يحلم دائماً بأن يصبح رائد فضاء يكتشف الكواكب البعيدة والمجرات المجهولة.
              </p>
              <p className="page-text">
                فجأة، لمح شهاباً لامعاً يهبط ببطء نحو حديقة منزله. ارتدى باسم خوذته البلاستيكية وخرج بشجاعة ليستكشف الأمر.
              </p>
              <div style={{ marginTop: 'auto', textAlign: 'left', color: '#94a3b8' }}>١</div>
            </div>
            <div className="book-page">
              <p className="page-text">
                عندما اقترب من الحديقة، وجد مركبة صغيرة تلمع بلون أزرق دافئ. انفتح باب المركبة، وخرج منها كائن لطيف يشبه النجمة الساطعة.
              </p>
              <p className="page-text">
                قال الكائن بصوت يشبه جرس الموسيقى: "مرحباً يا باسم، أنا 'نور'. كوكبي فقد طاقته، وأحتاج إلى بطل شجاع ومتعاون مثلك لمساعدتي!"
              </p>
              <div className="img-placeholder" style={{ height: '150px', marginTop: '20px', borderRadius: '10px', background: '#fef3c7' }}>
                رسمة باسم والنجمة المضيئة
              </div>
              <div style={{ marginTop: 'auto', textAlign: 'right', color: '#94a3b8' }}>٢</div>
            </div>
          </div>
          
          <div className="reader-toolbar" style={{ justifyContent: 'center', gap: '20px' }}>
            <button className="btn btn-primary">الصفحة السابقة</button>
            <span style={{ fontWeight: '600' }}>١ / ١٠</span>
            <button className="btn btn-primary">الصفحة التالية</button>
          </div>
        </div>
      </div>
    </section>
  )
}

// Account Page Component
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
    <section id="account" className="page-view">
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

// Reward Modal Component
function RewardModal({ showModal, setShowModal, setCurrentPage }) {
  if (!showModal) return null

  return (
    <div className="modal-overlay active" onClick={(e) => {
      if (e.target.className.includes('modal-overlay')) {
        setShowModal(false)
        setCurrentPage('library')
      }
    }}>
      <div className="modal">
        <div className="modal-mascot">🎁</div>
        <h2>مفاجأة باسم!</h2>
        <p style={{ fontSize: '1.2rem', margin: '15px 0 25px' }}>
          رائع! لقد أتممت عملية الشراء بنجاح. بمناسبة انضمامك لمغامراتنا، أهداك باسم كود خصم ٥٠٪ على قصتك القادمة!
        </p>
        <div style={{ background: 'var(--bg-secondary)', padding: '15px', borderRadius: '10px', fontWeight: '800', fontSize: '1.5rem', letterSpacing: '2px', color: 'var(--primary-blue)', marginBottom: '20px' }}>
          BASSEM50
        </div>
        <button 
          className="btn btn-yellow" 
          style={{ width: '100%', fontSize: '1.1rem' }} 
          onClick={() => {
            setShowModal(false)
            setCurrentPage('library')
          }}
        >
          شكراً باسم! (الذهاب للمكتبة)
        </button>
      </div>
    </div>
  )
}

// Footer Component
function Footer() {
  return (
    <footer>
      <div className="container">
        <div className="logo" style={{ marginBottom: '20px' }}>سوبر <span>قيم</span></div>
        <p>منصة رقمية آمنة تصنع القيم من خلال قصص تفاعلية ملهمة.</p>
        <p style={{ fontSize: '0.9rem', marginTop: '30px', color: 'var(--text-secondary)' }}>© 2024 سوبر قيم. جميع الحقوق محفوظة.</p>
      </div>
    </footer>
  )
}

// Main App Component
function App() {
  const [currentPage, setCurrentPage] = useState('home')
  const [isDark, setIsDark] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  useEffect(() => {
    if (isDark) {
      document.body.setAttribute('data-theme', 'dark')
    } else {
      document.body.removeAttribute('data-theme')
    }
  }, [isDark])

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [currentPage])

  return (
    <div className="app" dir="rtl">
      <Navbar 
        currentPage={currentPage} 
        setCurrentPage={setCurrentPage} 
        isDark={isDark} 
        setIsDark={setIsDark}
        isLoggedIn={isLoggedIn}
        setIsLoggedIn={setIsLoggedIn}
      />

      <main id="app">
        {!isLoggedIn && currentPage === 'login' && (
          <LoginPage setCurrentPage={setCurrentPage} setIsLoggedIn={setIsLoggedIn} />
        )}
        {!isLoggedIn && currentPage === 'signup' && (
          <SignupPage setCurrentPage={setCurrentPage} setIsLoggedIn={setIsLoggedIn} />
        )}
        {(!isLoggedIn || currentPage === 'home') && currentPage !== 'login' && currentPage !== 'signup' && (
          <HomePage setCurrentPage={setCurrentPage} />
        )}
        {isLoggedIn && currentPage === 'story' && <StoryPage setCurrentPage={setCurrentPage} setShowModal={setShowModal} />}
        {isLoggedIn && currentPage === 'library' && <LibraryPage setCurrentPage={setCurrentPage} />}
        {isLoggedIn && currentPage === 'reader' && <ReaderPage setCurrentPage={setCurrentPage} />}
        {isLoggedIn && currentPage === 'account' && <AccountPage />}
      </main>

      <Footer />

      <RewardModal 
        showModal={showModal} 
        setShowModal={setShowModal} 
        setCurrentPage={setCurrentPage} 
      />
    </div>
  )
}

export default App

