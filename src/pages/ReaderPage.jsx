import { useState, useEffect } from 'react'
import { STORIES } from '../data/stories'

function ReaderPage({ setCurrentPage, storyId = 1 }) {
  const story = STORIES.find(s => s.id === storyId) || STORIES[0]
  const [currentSheet, setCurrentSheet] = useState(0)
  
  // Touch states
  const [touchStartX, setTouchStartX] = useState(null)
  const [touchEndX, setTouchEndX] = useState(null)

  const handleGoBack = () => setCurrentPage('library')

  // --- بناء أوجه الصفحات بالترتيب الصحيح ---
  const faces = []

  // 1. الغلاف الأمامي (ورقة 1 - وجه)
  faces.push(
    <div className="page-content cover-front">
      <h1 style={{ fontSize: '3rem', marginBottom: '20px' }}>{story.title}</h1>
      <div style={{ backgroundColor: 'white', color: 'var(--primary-blue)', padding: '5px 20px', borderRadius: '20px', fontWeight: 'bold', fontSize: '1.2rem' }}>
        {story.category}
      </div>
    </div>
  )

  // 2. باطن الغلاف الأمامي (ورقة 1 - ظهر)
  faces.push(<div className="page-content cover-back"></div>)

  // 3. صفحات القصة
  story.pages.forEach((page, index) => {
    faces.push(
      <div className="page-content">
        <div className="img-placeholder" style={{ height: '180px', marginBottom: '20px', borderRadius: '10px' }}>
          {index % 4 === 0 ? '🌟 باسم يواجه المهمة' : (index % 4 === 1 ? '🚀 الرحلة تستمر' : (index % 4 === 2 ? '🤝 الأصدقاء يتعاونون' : '⭐ النور يعود'))}
        </div>
        <p style={{ fontSize: '1.4rem', lineHeight: '1.8', textAlign: 'justify' }}>{page.content}</p>
        <div style={{ marginTop: 'auto', textAlign: index % 2 === 0 ? 'right' : 'left', color: '#94a3b8', fontSize: '1.2rem' }}>
          {index + 1}
        </div>
      </div>
    )
  })

  // 4. شاشة النهاية (أحسنت)
  faces.push(
    <div className="page-content">
      <div style={{ textAlign: 'center', margin: 'auto' }}>
        <div style={{ fontSize: '5rem', marginBottom: '20px' }}>🏆</div>
        <h3 style={{ color: 'var(--primary-blue)', fontSize: '2.5rem', marginBottom: '15px' }}>أحسنت!</h3>
        <p style={{ fontSize: '1.3rem' }}>لقد أنهيت قراءة القصة بنجاح</p>
        <button className="btn btn-yellow" onClick={handleGoBack} style={{ marginTop: '30px', fontSize: '1.2rem' }}>
          العودة للمكتبة
        </button>
      </div>
    </div>
  )

  // --- الحل الجذري لمشكلة الغلاف الخلفي ---
  // يجب أن يكون عدد الأوجه زوجياً قبل إضافة الغلاف الخلفي
  // لضمان أن الغلاف الخلفي سيطبع على ورقة مستقلة تماماً
  if (faces.length % 2 !== 0) {
    faces.push(<div className="page-content"></div>)
  }

  // 5. الغلاف الخلفي الخارجي (ورقة أخيرة)
  faces.push(<div className="page-content cover-back"></div>) // باطن الغلاف الخلفي
  
  faces.push(
    <div className="page-content cover-front">
      <div style={{ textAlign: 'center', margin: 'auto' }}>
        <h2 style={{ fontSize: '3rem', marginBottom: '15px' }}>النهاية</h2>
        <p style={{ fontSize: '1.5rem', opacity: '0.9' }}>سوبر قيّم</p>
      </div>
    </div>
  )

  // --- تجميع الأوجه في أوراق (Sheets) ---
  const sheets = []
  for (let i = 0; i < faces.length; i += 2) {
    sheets.push({
      id: `sheet-${i / 2}`,
      front: faces[i],      
      back: faces[i + 1]    
    })
  }

  const totalSheets = sheets.length

  // --- دوال التنقل ---
  const flipNext = () => {
    if (currentSheet < totalSheets) setCurrentSheet(prev => prev + 1)
  }

  const flipPrev = () => {
    if (currentSheet > 0) setCurrentSheet(prev => prev - 1)
  }

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowLeft') flipNext()   
      if (e.key === 'ArrowRight') flipPrev()  
      if (e.key === 'Escape') handleGoBack()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [currentSheet, totalSheets])

  const onTouchEnd = () => {
    if (!touchStartX || !touchEndX) return
    const distance = touchStartX - touchEndX
    
    // في الكتاب العربي: السحب لليمين يقلب الصفحة التالية (نمسك اليسار ونسحبه لليمين)
    if (distance < -40) flipNext()   // سحب لليمين
    if (distance > 40) flipPrev()    // سحب لليسار
  }

  let bookTranslate = 'translateX(0)'
  if (currentSheet > 0 && currentSheet < totalSheets) {
    bookTranslate = 'translateX(-50%)' 
  } else if (currentSheet === totalSheets) {
    bookTranslate = 'translateX(-100%)' 
  }

  return (
    <section id="reader" className="page-view active" dir="rtl">
      <div className="container">
        <div className="reader-toolbar" style={{ marginBottom: '20px', borderRadius: '15px' }}>
          <button className="btn btn-outline" onClick={handleGoBack}>إغلاق وتخزين</button>
          <h3 style={{ margin: '0' }}>{story.title}</h3>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button className="btn btn-outline" title="حفظ علامة">🔖</button>
          </div>
        </div>

        <div 
          className="book-scene"
          onTouchStart={e => { setTouchEndX(null); setTouchStartX(e.targetTouches[0].clientX) }}
          onTouchMove={e => setTouchEndX(e.targetTouches[0].clientX)}
          onTouchEnd={onTouchEnd}
        >
          {/* الحاوية الجديدة الخاصة بالتصغير على الجوال */}
          <div className="book-scaler">
            <div className="book-3d" style={{ transform: bookTranslate }}>
              {sheets.map((sheet, index) => {
                const isFlipped = index < currentSheet
                const zIndex = isFlipped ? index : totalSheets - index

                return (
                  <div
                    key={sheet.id}
                    className={`sheet-3d ${isFlipped ? 'flipped' : ''}`}
                    style={{ zIndex }}
                    onClick={() => isFlipped ? flipPrev() : flipNext()}
                  >
                    <div className="face-3d front">{sheet.front}</div>
                    <div className="face-3d back">{sheet.back}</div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        <div className="reader-toolbar" style={{ justifyContent: 'center', gap: '20px', borderRadius: '15px' }}>
          <button 
            className="btn btn-primary" 
            onClick={flipPrev}
            disabled={currentSheet === 0}
            style={{ opacity: currentSheet === 0 ? 0.5 : 1 }}
          >
            ◀ السابق
          </button>
          
          <span style={{ fontWeight: '600', fontSize: '1.1rem' }}>
             {currentSheet === 0 ? 'الغلاف' : (currentSheet === totalSheets ? 'النهاية' : `ورقة ${currentSheet} من ${totalSheets - 1}`)}
          </span>
          
          <button 
            className="btn btn-primary" 
            onClick={flipNext}
            disabled={currentSheet === totalSheets}
            style={{ opacity: currentSheet === totalSheets ? 0.5 : 1 }}
          >
            التالي ▶
          </button>
        </div>
      </div>
    </section>
  )
}

export default ReaderPage