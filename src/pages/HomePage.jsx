// ============================================================
//  HomePage.jsx — الصفحة الرئيسية
// ============================================================

import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import apiClient from '../api/client'

function HomePage({ setCurrentPage, setSelectedStoryId }) {
  const navigate          = useNavigate()
  const [stories, setStories] = useState([])
  const [banners, setBanners] = useState([])

  useEffect(() => {
    apiClient.get('/cms/banners').then(res => {
      if (res.success && res.data) setBanners(res.data)
    }).catch(console.error)

    apiClient.get('/stories').then(res => {
      if (res.success && res.data) setStories(res.data)
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
            className="btn btn-yellow"
            style={{ fontSize: '1.1rem', padding: '14px 32px' }}
            onClick={() => document.getElementById('stories')?.scrollIntoView({ behavior: 'smooth' })}
          >
            استكشف القصص
          </button>

          {/* Decorative floating elements */}
          <div className="hero-graphics">
            <div className="img-placeholder floating"
              style={{ width: '200px', height: '80px', borderRadius: '40px', position: 'absolute', top: '20px', left: '10%' }}>
              ☁️ جزيرة طافية
            </div>
            <div className="img-placeholder floating"
              style={{ width: '150px', height: '60px', borderRadius: '40px', position: 'absolute', top: '60px', right: '15%', animationDelay: '2s' }}>
              ☁️ غيوم ناعمة
            </div>
            <div className="img-placeholder floating"
              style={{ width: '300px', height: '120px', borderRadius: '60px', position: 'absolute', bottom: 0, left: '50%', transform: 'translateX(-50%)', animationDelay: '1s' }}>
              ✨ مدينة الخيال ✨
            </div>
          </div>
        </div>
      </div>

      <div className="container" id="stories">

        {/* Bassem Character Intro */}
        <div className="bassem-section">
          <div className="bassem-avatar img-placeholder floating">
            صورة باسم<br />(بطل المغامرات)
          </div>
          <div className="bassem-content">
            <h2>مرحباً! أنا باسم</h2>
            <p>
              أنا صديق أطفالكم الجديد. أحب استكشاف الفضاء، وحل الألغاز العلمية، والسفر عبر الجزر الطافية!
              في كل قصة نعيشها معاً، نتعلم قيمة جديدة تجعلنا أبطالاً حقيقيين في عالمنا.
            </p>
            <button className="btn btn-outline" onClick={() => setCurrentPage('story')}>
              اقرأ مغامرتي الأولى
            </button>
          </div>
        </div>

        {/* Featured Stories Grid */}
        <h2 className="section-title">مغامرات شيقة</h2>
        <div className="grid">
          {stories.map(story => (
            <div className="card" key={story.id} onClick={() => handleStoryClick(story)} style={{ cursor: 'pointer' }}>
              <div className="img-placeholder" style={{ 
                backgroundImage: `url(${story.coverImageUrl})`, 
                backgroundSize: 'cover', 
                backgroundPosition: 'center', 
                color: story.coverImageUrl ? 'transparent' : 'inherit' 
              }}>
                غلاف القصة
              </div>
              <h3>{story.title}</h3>
              <p>{story.description || 'قصة مشوقة وممتعة.'}</p>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '10px' }}>
                <span className="tag" style={{ background: 'var(--primary-blue)', color: 'white' }}>{story.valueLearned}</span>
                <span className="tag">{story.targetAgeGroup}</span>
                <span className="tag" style={{ background: 'var(--yellow)', color: 'black' }}>{story.price} EGP</span>
              </div>
            </div>
          ))}
          {stories.length === 0 && <p>جاري تحميل القصص...</p>}
        </div>

        {/* Parents Corner */}
        <h2 className="section-title">ركن الآباء والمربين</h2>
        <div className="grid" id="parents">
          <div className="card" style={{ background: 'var(--bg-secondary)' }}>
            <h3>كيف نغرس الصدق؟</h3>
            <p>مقال تربوي قصير عن أهمية القراءة في بناء الشخصية.</p>
            <a href="#" style={{ color: 'var(--primary-blue)', fontWeight: '600' }}>اقرأ المزيد ←</a>
          </div>
          <div className="card" style={{ background: 'var(--bg-secondary)' }}>
            <h3>وقت النوم الهادئ</h3>
            <p>نصائح لاختيار قصص ما قبل النوم المناسبة لطفلك.</p>
            <a href="#" style={{ color: 'var(--primary-blue)', fontWeight: '600' }}>اقرأ المزيد ←</a>
          </div>
        </div>

      </div>
    </section>
  )
}

export default HomePage
