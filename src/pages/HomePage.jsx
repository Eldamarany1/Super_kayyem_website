// ============================================================
//  HomePage.jsx — الصفحة الرئيسية
// ============================================================

import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import apiClient from '../api/client'
import '../styles/HomePage.css'

function HomePage({ setCurrentPage, setSelectedStoryId }) {
  const navigate = useNavigate()
  const [stories, setStories] = useState([])
  const [banners, setBanners] = useState([])
  const [parentArticles, setParentArticles] = useState([])

  useEffect(() => {
    apiClient.get('/cms/banners').then(res => {
      if (res.success && res.data) setBanners(res.data)
    }).catch(console.error)

    apiClient.get('/stories').then(res => {
      if (res.success && res.data) setStories(res.data)
    }).catch(console.error)

    apiClient.get('/parent-articles').then(res => {
      if (res.success && res.data) {
        // Only get the top 3 latest published
        const published = res.data.filter(a => a.isPublished);
        setParentArticles(published.slice(0, 3));
      }
    }).catch(console.error)
  }, [])

  const handleStoryClick = (story) => {
    if (setSelectedStoryId) setSelectedStoryId(story.id)
    navigate('/story')
  }

  return (
    <section id="home">

      {/* Hero Section */}
      <div className="hero">
        <div className="container">
          <h1>مغامرات تصنع القيم</h1>
          <p>
            عالم رقمي آمن يجمع بين سحر القصص وتنمية القيم الأخلاقية لدى الأطفال،
            صُمم خصيصاً للآباء الباحثين عن محتوى راقي.
          </p>
          <button
            className="btn btn-yellow hero-btn"
            onClick={() => document.getElementById('stories')?.scrollIntoView({ behavior: 'smooth' })}
          >
            استكشف القصص
          </button>

          {/* Decorative floating elements */}
          <div className="hero-graphics">
            <div className="img-placeholder floating floating-cloud-1">
              ☁️ جزيرة طافية
            </div>
            <div className="img-placeholder floating floating-cloud-2">
              ☁️ غيوم ناعمة
            </div>
            <div className="img-placeholder floating floating-city">
              ✨ مدينة الخيال ✨
            </div>
          </div>
        </div>
      </div>

      <div className="container" id="stories">

        {/* Featured Stories Grid */}
        <h2 className="section-title">مغامرات شيقة</h2>
        <div className="grid">
          {stories.map(story => (
            <div className="card story-card" key={story.id} onClick={() => handleStoryClick(story)}>
              {story.coverImageUrl ? (
                <img 
                  src={story.coverImageUrl} 
                  alt={story.title} 
                  className="story-card__image" 
                />
              ) : (
                <div className="img-placeholder story-card__cover">
                  غلاف القصة
                </div>
              )}
              <h3>{story.title}</h3>
              <p>{story.description || 'قصة مشوقة وممتعة.'}</p>
              <div className="story-tags">
                <span className="tag tag-blue">{story.valueLearned}</span>
                <span className="tag">{story.targetAgeGroup}</span>
                <span className="tag tag-yellow">{story.price} EGP</span>
              </div>
            </div>
          ))}
          {stories.length === 0 && <p>جاري تحميل القصص...</p>}
        </div>

        {/* Parents Corner */}
        <h2 className="section-title">ركن الآباء والمربين</h2>
        <div className="parents-section" id="parents">
          <div className="grid">
            {parentArticles.length > 0 ? (
              parentArticles.map((article) => (
                <div key={article.id} className="card parent-card">
                  <h3>{article.title}</h3>
                  <p>{article.content.substring(0, 100)}...</p>
                  <Link to="/parents" className="parent-card__link">اقرأ المزيد ←</Link>
                </div>
              ))
            ) : (
              <p>جاري تحميل المقالات...</p>
            )}
          </div>
          <div className="parents-section__footer">
            <button 
              className="btn btn-outline parents-section__btn"
              onClick={() => navigate('/parents')}
            >
              رؤية المزيد
            </button>
          </div>
        </div>

      </div>
    </section>
  )
}

export default HomePage
