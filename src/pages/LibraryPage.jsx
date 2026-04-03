// Library Page Component - Story collection with filters
import { useState } from 'react'

// Available story categories
const CATEGORIES = ['الكل', 'التعاون', 'الشجاعة', 'الصدق', 'المسؤولية', 'الصداقة', 'الصبر']

function LibraryPage({ stories = [], setCurrentPage, setSelectedStoryId }) {
  // Filter states
  const [filter, setFilter] = useState('الكل')
  const [searchTerm, setSearchTerm] = useState('')

  // Handle story selection for reading
  const handleReadStory = (storyId) => {
    if (setSelectedStoryId) {
      setSelectedStoryId(storyId)
    }
    setCurrentPage('reader')
  }

  // Filter stories based on category and search term
  const filteredStories = stories.filter(story => {
    const matchesCategory = filter === 'الكل' || story.category === filter
    const matchesSearch = story.title.includes(searchTerm) || (story.category && story.category.includes(searchTerm))
    return matchesCategory && matchesSearch
  })

  // Separate stories by reading progress
  const readingStories = filteredStories.filter(s => (s.progress || 0) > 0 && (s.progress || 0) < 100)
  const availableStories = filteredStories.filter(s => (s.progress || 0) === 0)

  return (
    <section className="library-section">
      <div className="container">
        <div className="dashboard-header">
          <h1>مكتبتي الخاصة</h1>
        </div>

        {/* Search and Filter Controls */}
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

        {/* Available Stories Grid */}
        {availableStories.length > 0 && (
          <div className="grid">
            {availableStories.map(story => (
              <div className="card" key={story.id}>
                {/* Story Cover */}
                <div className="story-cover-img">
                  {story.cover ? (
                    <img
                      src={story.cover.startsWith('http') ? story.cover : `http://127.0.0.1:8000${story.cover}`}
                      alt={story.title}
                      onError={(e) => {
                        e.target.parentElement.innerHTML = '<div class="story-cover-placeholder">📚</div>'
                      }}
                    />
                  ) : (
                    <div className="story-cover-placeholder">📚</div>
                  )}
                </div>

                {/* Story Info */}
                <h3 className="story-title">{story.title}</h3>
                <div className="story-tags-row">
                  <span className="tag">{story.category}</span>
                  <span className="tag">{story.age || '٦-٨'} سنوات</span>
                </div>
                <button
                  className="btn btn-primary btn-story"
                  onClick={() => {
                    setSelectedStoryId(story.id)
                    setCurrentPage('story')
                  }}
                >
                  ابدأ القراءة
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {filteredStories.length === 0 && (
          <div className="empty-state">
            <p>لا توجد قصص في قاعدة البيانات حالياً.</p>
          </div>
        )}
      </div>
    </section>
  )
}

export default LibraryPage