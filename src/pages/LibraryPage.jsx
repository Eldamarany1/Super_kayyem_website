// ============================================================
//  LibraryPage.jsx — مكتبتي الخاصة
// ============================================================
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import apiClient from '../api/client'

const CATEGORIES = ['الكل', 'التعاون', 'الشجاعة', 'الصدق', 'المسؤولية', 'الصداقة', 'الصبر']

function LibraryPage({ setCurrentPage, setSelectedStoryId }) {
  const navigate                          = useNavigate()
  const [filter,      setFilter]          = useState('الكل')
  const [searchTerm,  setSearchTerm]      = useState('')
  const [libraryData, setLibraryData]     = useState([])
  const [loading,     setLoading]         = useState(true)

  useEffect(() => {
    apiClient.get('/library')
      .then(res => { if (res.success && res.data) setLibraryData(res.data) })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  // Navigate to the Flipbook reader with the correct story id
  const handleReadStory = (storyId) => {
    navigate(`/reader/${storyId}`)
  }

  const filtered = libraryData.filter(story => {
    const matchSearch   = story.title?.includes(searchTerm) ?? true
    const matchCategory = filter === 'الكل' || story.valueLearned === filter
    return matchSearch && matchCategory
  })

  return (
    <section id="library">
      <div className="container">

        {/* Header */}
        <div className="dashboard-header">
          <h1>مكتبتي الخاصة</h1>
          <button className="btn btn-outline">تحميل كل القصص (PDF)</button>
        </div>

        {/* Search & Filters */}
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

        {/* Available Stories */}
        {loading ? <p>جاري تحميل المكتبة...</p> : filtered.length > 0 && (
          <>
            <h2 style={{ marginTop: '40px' }}>مجموعة قصصك</h2>
            <div className="grid">
              {filtered.map(story => (
                <div className="card" key={story.id}>
                  <div className="img-placeholder story-cover" style={{ 
                    height: '150px',
                    backgroundImage: `url(${story.coverImageUrl})`, 
                    backgroundSize: 'cover', 
                    backgroundPosition: 'center', 
                    color: story.coverImageUrl ? 'transparent' : 'inherit'
                  }}>غلاف</div>
                  <h3>{story.title}</h3>
                  <div style={{ display: 'flex', gap: '8px', marginBottom: '10px', flexWrap: 'wrap' }}>
                    {story.hasReviewed && <span className="tag" style={{ background: '#28a745', color: 'white' }}>تم التقييم</span>}
                  </div>
                  <button className="btn btn-primary" style={{ width: '100%', padding: '8px' }} onClick={() => handleReadStory(story.id)}>
                    ابدأ القراءة
                  </button>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Empty state */}
        {filtered.length === 0 && (
          <div className="empty-state">
            <p>🔍 لم يتم العثور على قصص مطابقة</p>
          </div>
        )}

      </div>
    </section>
  )
}

export default LibraryPage
