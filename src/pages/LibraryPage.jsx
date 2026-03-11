// Library Page Component - مكتبتي
import { useState } from 'react'

// Mock Data - should be moved to shared file
const MOCK_STORIES = [
  { id: 1, title: 'باسم ومسبار الأمل', category: 'التعاون', age: '٦-٨', progress: 100, cover: 'الفضاء', completed: true },
  { id: 2, title: 'سر اللؤلؤة الزرقاء', category: 'الشجاعة', age: '٤-٦', progress: 60, cover: 'المحيط', completed: false },
  { id: 3, title: 'خريطة الشجرة العتيقة', category: 'الصدق', age: '٨-١٠', progress: 0, cover: 'الغابة', completed: false },
  { id: 4, title: 'بطل المجرة', category: 'المسؤولية', age: '٦-٨', progress: 0, cover: 'الفضاء', completed: false },
  { id: 5, title: 'أصدقاء القمر', category: 'الصداقة', age: '٤-٦', progress: 0, cover: 'الفضاء', completed: false },
  { id: 6, title: 'سفينة الصحراء', category: 'الصبر', age: '٨-١٠', progress: 0, cover: 'الصحراء', completed: false },
]

const CATEGORIES = ['الكل', 'التعاون', 'الشجاعة', 'الصدق', 'المسؤولية', 'الصداقة', 'الصبر']

function LibraryPage({ setCurrentPage, setSelectedStoryId }) {
  const [filter, setFilter] = useState('الكل')
  const [searchTerm, setSearchTerm] = useState('')

  const handleReadStory = (storyId) => {
    if (setSelectedStoryId) {
      setSelectedStoryId(storyId)
    }
    setCurrentPage('reader')
  }

  const filteredStories = MOCK_STORIES.filter(story => {
    const matchesCategory = filter === 'الكل' || story.category === filter
    const matchesSearch = story.title.includes(searchTerm) || story.category.includes(searchTerm)
    return matchesCategory && matchesSearch
  })

  const readingStories = filteredStories.filter(s => s.progress > 0 && s.progress < 100)
  const completedStories = filteredStories.filter(s => s.progress === 100 || s.completed)
  const availableStories = filteredStories.filter(s => s.progress === 0 && !s.completed)

  return (
    <section className="library-section">
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
                  <button className="btn btn-primary" style={{ width: '100%', marginTop: '15px', padding: '8px' }} onClick={() => handleReadStory(story.id)}>
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
                  <button className="btn btn-yellow" style={{ width: '100%', padding: '8px' }} onClick={() => handleReadStory(story.id)}>
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

export default LibraryPage

