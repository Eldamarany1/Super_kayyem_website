// ============================================================
//  StoryPage.jsx — صفحة تفاصيل القصة
// ============================================================

import { useState, useEffect } from 'react'
import apiClient from '../api/client'
import { useNavigate } from 'react-router-dom'

function StoryPage({ setCurrentPage, setShowModal, selectedStoryId, setSelectedStoryId }) {
  const navigate = useNavigate()
  const [story, setStory] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!selectedStoryId) return;
    setLoading(true);
    apiClient.get(`/stories/${selectedStoryId}`)
      .then(res => {
        if (res.success && res.data) setStory(res.data)
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [selectedStoryId])

  const handlePreview = () => {
    if (setSelectedStoryId && story?.id) setSelectedStoryId(story.id)
    navigate('/reader')
  }

  if (loading) return <section id="story"><div className="container">جاري التحميل...</div></section>
  if (!story) return <section id="story"><div className="container">القصة غير موجودة</div></section>

  return (
    <section id="story">
      <div className="container">

        {/* Story Header — banner + info */}
        <div className="story-header" style={{ display: 'flex', gap: '40px', flexWrap: 'wrap' }}>
          <div className="story-banner img-placeholder" style={{ 
            flex: '1 1 300px', 
            minHeight: '350px',
            backgroundImage: `url(${story.coverImageUrl})`, 
            backgroundSize: 'cover', 
            backgroundPosition: 'center', 
            color: story.coverImageUrl ? 'transparent' : 'inherit'
          }}>
            غلاف القصة
          </div>

          <div className="story-info" style={{ flex: '2 1 400px' }}>
            <h1>{story.title}</h1>

            <div className="story-meta">
              <span className="tag">الفئة العمرية: {story.targetAgeGroup}</span>
              <span className="tag">القيمة: {story.valueLearned}</span>
            </div>

            {/* In a real app we'd fetch actual reviews to aggregate rating */}
            <div className="ratings">⭐⭐⭐⭐⭐ (٤.٨ / ٥)</div>

            <p style={{ fontSize: '1.05rem', margin: '20px 0' }}>
              {story.description}
            </p>

            <div className="story-actions">
              <button className="btn btn-primary" onClick={() => setShowModal({ type: 'payment', storyId: story.id, price: story.price })}>
                شراء القصة ({story.price} EGP)
              </button>
              <button className="btn btn-outline" onClick={handlePreview}>
                الذهاب للغلاف (معاينة)
              </button>
            </div>
          </div>
        </div>

        {/* Related Stories */}
        <h2 className="section-title" style={{ textAlign: 'right', marginTop: '60px' }}>
          قصص مشابهة قد تعجبك
        </h2>
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

export default StoryPage
