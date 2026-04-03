import React from 'react'

// Story Page Component - Shows story details before reading
function StoryPage({ story, setCurrentPage, setShowModal, setSelectedStoryId }) {
  // Show loading state if story data is not yet available
  if (!story) {
    return (
      <div className="reader-error">
        <div className="loader"></div>
        <p>جاري تحميل تفاصيل القصة...</p>
        <button className="btn btn-outline" onClick={() => setCurrentPage('library')}>
          العودة للمكتبة
        </button>
      </div>
    )
  }

  return (
    <section className="story-details-page" dir="rtl">
      <div className="container">
        {/* Story Cover Image */}
        <div className="story-header-image">
          {story.cover ? (
            <img
              src={`http://127.0.0.1:8000${story.cover}`}
              alt={story.title}
            />
          ) : (
            <div style={{ height: '100%', background: '#eee' }}></div>
          )}
        </div>

        {/* Story Header Info */}
        <div className="story-header-info">
          <h1>{story.title}</h1>
          <div className="story-tags">
            <span className="tag tag-category">{story.category}</span>
            <span className="tag tag-age">{story.age || '٦-٨'} سنوات</span>
          </div>
        </div>

        {/* Story Preview Content */}
        <div className="story-card-large">
          <div className="preview-content">
            <h3>لمحة عن القصة:</h3>
            <p>
              {story.pages && story.pages.length > 0
                ? story.pages[0].content.substring(0, 250) + "..."
                : "هذه القصة جاهزة لتبدأ مغامرتك فيها الآن!"}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="action-buttons">
            <button
              className="btn btn-primary btn-read"
              onClick={() => setCurrentPage('reader')}
            >
              ابدأ القراءة الآن 📖
            </button>
            <button
              className="btn btn-outline btn-back"
              onClick={() => setCurrentPage('library')}
            >
              العودة للمكتبة
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}

export default StoryPage