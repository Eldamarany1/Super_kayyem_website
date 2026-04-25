// ============================================================
//  StoryPage.jsx — صفحة تفاصيل القصة
// ============================================================
import { useState, useEffect } from 'react'
import apiClient from '../api/client'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import '../styles/StoryPage.css'

function StoryPage({ setCurrentPage, setShowModal, selectedStoryId, setSelectedStoryId }) {
  const navigate = useNavigate()
  const { isLoggedIn } = useAuth()
  const [story,   setStory]   = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!selectedStoryId) return;
    setLoading(true);
    apiClient.get(`/stories/${selectedStoryId}`)
      .then(res => { if (res.success && res.data) setStory(res.data) })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [selectedStoryId])

  // Navigate to the flipbook reader with the story's real ID
  const handlePreview = () => {
    if (story?.id) navigate(`/reader/${story.id}`)
  }

  // Open payment modal — user must be logged in
  const handleBuy = () => {
    if (!isLoggedIn) { navigate('/login'); return; }
    setShowModal({ type: 'payment', storyId: story.id, price: story.price })
  }

  if (loading) return <section id="story"><div className="container">جاري التحميل...</div></section>
  if (!story)  return <section id="story"><div className="container">القصة غير موجودة</div></section>

  return (
    <section id="story">
      <div className="container">

        {/* Story Header — banner + info */}
        <div className="story-header story-header-layout">

          {/* Cover banner — dynamic backgroundImage stays inline since it's a runtime URL */}
          <div
            className={`story-banner img-placeholder story-cover-banner${story.coverImageUrl ? ' story-cover-banner--has-image' : ''}`}
            style={{
              backgroundImage: story.coverImageUrl ? `url(${story.coverImageUrl})` : undefined,
            }}
          >
            غلاف القصة
          </div>

          <div className="story-info story-info-col">
            <h1>{story.title}</h1>

            <div className="story-meta">
              <span className="tag">الفئة العمرية: {story.targetAgeGroup}</span>
              <span className="tag">القيمة: {story.valueLearned}</span>
              <span className={`tag status-badge status-badge--${story.publicationStatus?.toLowerCase()}`}>
                {{ Draft: 'مسودة', Published: 'منشور', Cancelled: 'ملغي' }[story.publicationStatus] ?? story.publicationStatus}
              </span>
            </div>

            <div className="ratings">
              {'⭐'.repeat(Math.round(story.averageRating || 0))} ({story.reviewCount ?? 0} تقييم)
            </div>

            <p className="story-description">{story.description}</p>

            <div className="story-actions">
              <button className="btn btn-primary" onClick={handleBuy}>
                شراء القصة ({story.price} ريال)
              </button>
              <button className="btn btn-outline" onClick={handlePreview}>
                معاينة القصة 📖
              </button>
            </div>
          </div>
        </div>

      </div>
    </section>
  )
}

export default StoryPage
