import React, { useState } from 'react'

// Reader Page Component - Displays story pages for reading
function ReaderPage({ story, setCurrentPage }) {
  const [currentPageIndex, setCurrentPageIndex] = useState(0)

  // Handle case when story data is not available
  if (!story || !story.pages || story.pages.length === 0) {
    return (
      <div className="reader-error">
        <h2>عذراً، لا توجد صفحات لهذه القصة حالياً</h2>
        <p>تأكد من إضافة صفحات للقصة في لوحة تحكم Django</p>
        <button className="btn btn-primary" onClick={() => setCurrentPage('library')}>
          العودة للمكتبة
        </button>
      </div>
    )
  }

  const currentPage = story.pages[currentPageIndex]

  // Navigate to previous page
  const goToPreviousPage = () => {
    setCurrentPageIndex(prev => prev - 1)
    window.scrollTo(0, 0)
  }

  // Navigate to next page
  const goToNextPage = () => {
    setCurrentPageIndex(prev => prev + 1)
    window.scrollTo(0, 0)
  }

  return (
    <div className="reader-page-container">
      <div className="reader-card">
        {/* Page Content from Database */}
        <div className="reader-page-content">
          <p>{currentPage.content}</p>
        </div>

        <hr className="reader-divider" />

        {/* Reading Controls */}
        <div className="reader-controls">
          <button
            className="btn btn-outline"
            disabled={currentPageIndex === 0}
            onClick={goToPreviousPage}
          >
            السابق
          </button>

          <span className="page-indicator">
            صفحة {currentPageIndex + 1} من {story.pages.length}
          </span>

          <button
            className="btn btn-primary"
            disabled={currentPageIndex === story.pages.length - 1}
            onClick={goToNextPage}
          >
            التالي
          </button>
        </div>

        {/* Finish Reading Button */}
        <button
          className="btn btn-yellow btn-finish"
          onClick={() => setCurrentPage('library')}
        >
          إنهاء القراءة والعودة للمكتبة
        </button>
      </div>
    </div>
  )
}

export default ReaderPage