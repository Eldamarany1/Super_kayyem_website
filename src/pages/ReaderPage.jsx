// ============================================================
//  ReaderPage.jsx — قارئ الكتاب التفاعلي (3D Flipbook)
// ============================================================
import { useState, useEffect, useCallback } from 'react'
import { STORIES } from '../data/stories'
import '../styles/ReaderPage.css'

function ReaderPage({ setCurrentPage, storyId = 1 }) {
  const story = STORIES.find(s => s.id === storyId) || STORIES[0]

  const [currentSheet, setCurrentSheet] = useState(0)
  const [touchStartX,  setTouchStartX]  = useState(null)
  const [touchEndX,    setTouchEndX]    = useState(null)

  const handleGoBack = () => setCurrentPage('library')

  // ── Build page faces ──────────────────────────────────────
  const faces = []

  // Front cover
  faces.push(
    <div className="page-content cover-front">
      <h1 className="reader-cover-title">{story.title}</h1>
      <div className="reader-cover-category">{story.category}</div>
    </div>
  )

  // Inside front cover (blank)
  faces.push(<div className="page-content cover-back" />)

  // Story pages
  const ILLUSTRATIONS = ['🌟 باسم يواجه المهمة', '🚀 الرحلة تستمر', '🤝 الأصدقاء يتعاونون', '⭐ النور يعود']
  story.pages.forEach((page, index) => {
    faces.push(
      <div className="page-content">
        <div className={`img-placeholder reader-illustration`}>
          {ILLUSTRATIONS[index % ILLUSTRATIONS.length]}
        </div>
        <p className="reader-page-text">{page.content}</p>
        <div className={`reader-page-number ${index % 2 === 0 ? 'reader-page-number--right' : 'reader-page-number--left'}`}>
          {index + 1}
        </div>
      </div>
    )
  })

  // Completion screen
  faces.push(
    <div className="page-content">
      <div className="reader-completion">
        <div className="reader-completion__trophy">🏆</div>
        <h3 className="reader-completion__title">أحسنت!</h3>
        <p className="reader-completion__subtitle">لقد أنهيت قراءة القصة بنجاح</p>
        <button
          className="btn btn-yellow reader-completion__back-btn"
          onClick={handleGoBack}
        >
          العودة للمكتبة
        </button>
      </div>
    </div>
  )

  // Ensure even count before back cover
  if (faces.length % 2 !== 0) {
    faces.push(<div className="page-content" />)
  }

  // Back cover (inside + outside)
  faces.push(<div className="page-content cover-back" />)
  faces.push(
    <div className="page-content cover-front">
      <div className="reader-back-cover">
        <h2 className="reader-back-cover__title">النهاية</h2>
        <p className="reader-back-cover__brand">سوبر قيّم</p>
      </div>
    </div>
  )

  // ── Group faces into sheets ───────────────────────────────
  const sheets = []
  for (let i = 0; i < faces.length; i += 2) {
    sheets.push({ id: `sheet-${i / 2}`, front: faces[i], back: faces[i + 1] })
  }
  const totalSheets = sheets.length

  // ── Navigation ───────────────────────────────────────────────
  const flipNext = useCallback(() => { if (currentSheet < totalSheets)  setCurrentSheet(p => p + 1) }, [currentSheet, totalSheets])
  const flipPrev = useCallback(() => { if (currentSheet > 0)            setCurrentSheet(p => p - 1) }, [currentSheet])

  // Keyboard navigation
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'ArrowLeft')  flipNext()
      if (e.key === 'ArrowRight') flipPrev()
      if (e.key === 'Escape')     handleGoBack()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [flipNext, flipPrev])

  // Touch swipe
  const onTouchEnd = () => {
    if (!touchStartX || !touchEndX) return
    const dist = touchStartX - touchEndX
    if (dist < -40) flipNext()
    if (dist >  40) flipPrev()
  }

  // Book translate based on sheet position — dynamic value, stays inline
  const bookTranslate =
    currentSheet === 0            ? 'translateX(0)'
    : currentSheet === totalSheets ? 'translateX(-100%)'
    :                                'translateX(-50%)'

  // Page counter label
  const pageLabel =
    currentSheet === 0            ? 'الغلاف'
    : currentSheet === totalSheets ? 'النهاية'
    : `ورقة ${currentSheet} من ${totalSheets - 1}`

  // Sheet z-index — dynamic value, stays inline
  return (
    <section id="reader" dir="rtl">
      <div className="container">

        {/* Top toolbar */}
        <div className="reader-toolbar">
          <button className="btn btn-outline" onClick={handleGoBack}>إغلاق وتخزين</button>
          <h3>{story.title}</h3>
          <button className="btn btn-outline" title="حفظ علامة">🔖</button>
        </div>

        {/* 3D Book */}
        <div
          className="book-scene"
          onTouchStart={e => { setTouchEndX(null); setTouchStartX(e.targetTouches[0].clientX) }}
          onTouchMove={e  => setTouchEndX(e.targetTouches[0].clientX)}
          onTouchEnd={onTouchEnd}
        >
          <div className="book-scaler">
            <div className="book-3d" style={{ transform: bookTranslate }}>
              {sheets.map((sheet, index) => {
                const isFlipped = index < currentSheet
                const zIndex    = isFlipped ? index : totalSheets - index
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

        {/* Bottom navigation toolbar */}
        <div className="reader-toolbar reader-toolbar--bottom">
          <button
            className="btn btn-primary"
            onClick={flipPrev}
            disabled={currentSheet === 0}
          >
            ◀ السابق
          </button>

          <span className="reader-page-label">{pageLabel}</span>

          <button
            className="btn btn-primary"
            onClick={flipNext}
            disabled={currentSheet === totalSheets}
          >
            التالي ▶
          </button>
        </div>

      </div>
    </section>
  )
}

export default ReaderPage