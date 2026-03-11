// Reader Page Component - القارئ
import { useState } from 'react'
import { STORIES } from '../data/stories'

function ReaderPage({ setCurrentPage, storyId = 1 }) {
  // Get story from data (default to first story if not found)
  const story = STORIES.find(s => s.id === storyId) || STORIES[0]
  
  const [currentPage, setCurrentPageNum] = useState(0)
  const totalPages = story.pages.length
  const isFirstPage = currentPage === 0
  const isLastPage = currentPage === totalPages - 1
  
  const goToNextPage = () => {
    if (!isLastPage) setCurrentPageNum(currentPage + 1)
  }
  
  const goToPrevPage = () => {
    if (!isFirstPage) setCurrentPageNum(currentPage - 1)
  }

  const handleGoBack = () => {
    setCurrentPage('library')
  }

  return (
    <section id="reader" className="page-view active">
      <div className="container">
        <div className="reader-container">
          <div className="reader-toolbar">
            <button className="btn btn-outline" onClick={handleGoBack}>
              إغلاق وتخزين
            </button>
            <h3 style={{ margin: '0' }}>{story.title}</h3>
            <div>
              <button className="btn btn-outline" title="حفظ علامة">🔖</button>
              <button className="btn btn-primary" title="تحميل PDF">⬇️ PDF</button>
            </div>
          </div>
          
          <div className="book-spread">
            {/* Left Page - Current Page */}
            <div className="book-page">
              <div className="img-placeholder" style={{ height: '180px', marginBottom: '25px', borderRadius: '10px', background: 'linear-gradient(135deg, #e0f2fe 0%, #fef3c7 100%)' }}>
                {currentPage % 2 === 0 ? '🌟 باسم يواجه المهمة' : '🤝 الأصدقاء يتعاونون'}
              </div>
              <p className="page-text">
                {story.pages[currentPage].content}
              </p>
              <div style={{ marginTop: 'auto', textAlign: 'left', color: '#94a3b8', fontSize: '1.2rem' }}>
                {currentPage + 1}
              </div>
            </div>
            
            {/* Right Page - Next Page (if available) */}
            <div className="book-page">
              {!isLastPage ? (
                <>
                  <p className="page-text">
                    {story.pages[currentPage + 1].content}
                  </p>
                  <div className="img-placeholder" style={{ height: '120px', marginTop: '20px', borderRadius: '10px', background: 'linear-gradient(135deg, #fce7f3 0%, #e0f2fe 100%)' }}>
                    {currentPage % 2 === 0 ? '🚀 الرحلة تستمر' : '⭐ النور يعود'}
                  </div>
                  <div style={{ marginTop: 'auto', textAlign: 'right', color: '#94a3b8', fontSize: '1.2rem' }}>
                    {currentPage + 2}
                  </div>
                </>
              ) : (
                <div className="story-end">
                  <div style={{ textAlign: 'center', padding: '40px 20px' }}>
                    <div style={{ fontSize: '4rem', marginBottom: '20px' }}>🏆</div>
                    <h3 style={{ color: 'var(--primary-blue)', marginBottom: '15px' }}>أحسنت!</h3>
                    <p style={{ fontSize: '1.2rem', marginBottom: '20px' }}>لقد أنهيت قراءة القصة</p>
                    <p style={{ fontSize: '1rem', color: 'var(--text-secondary)' }}>القيمة المستفادة: {story.category}</p>
                    <button 
                      className="btn btn-yellow" 
                      style={{ marginTop: '25px' }}
                      onClick={() => setCurrentPage('library')}
                    >
                      العودة للمكتبة
                    </button>
                  </div>
                  <div style={{ marginTop: 'auto', textAlign: 'right', color: '#94a3b8', fontSize: '1.2rem' }}>
                    {currentPage + 2}
                  </div>
                </div>
              )}
            </div>
          </div>
          
          <div className="reader-toolbar" style={{ justifyContent: 'center', gap: '20px' }}>
            <button 
              className="btn btn-primary" 
              onClick={goToPrevPage}
              disabled={isFirstPage}
              style={{ opacity: isFirstPage ? 0.5 : 1 }}
            >
              ◀ الصفحة السابقة
            </button>
            <span style={{ fontWeight: '600', fontSize: '1.1rem' }}>
              {currentPage + 1} - {Math.min(currentPage + 2, totalPages)} من {totalPages}
            </span>
            <button 
              className="btn btn-primary" 
              onClick={goToNextPage}
              disabled={isLastPage}
              style={{ opacity: isLastPage ? 0.5 : 1 }}
            >
              الصفحة التالية ▶
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}

export default ReaderPage

