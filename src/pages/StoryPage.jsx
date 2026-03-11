// Story Page Component - صفحة القصة
function StoryPage({ setCurrentPage, setShowModal, setSelectedStoryId }) {
  const handlePreview = () => {
    if (setSelectedStoryId) {
      setSelectedStoryId(1) // Default to first story for preview
    }
    setCurrentPage('reader')
  }
  return (
    <section id="story" className="page-view active">
      <div className="container">
        <div className="story-header">
          <div className="story-banner img-placeholder">
            تصميم سينمائي ناعم للمغامرة: باسم بملابس رائد فضاء يطفو بين النجوم المضيئة.
          </div>
          <div className="story-info">
            <h1>باسم ومسبار الأمل</h1>
            <div className="story-meta">
              <span className="tag">الفئة العمرية: ٦-٨ سنوات</span>
              <span className="tag">القيمة: التعاون</span>
              <span className="tag">مدة القراءة: ١٠ دقائق</span>
            </div>
            <div className="ratings">⭐⭐⭐⭐⭐ (٤.٨ / ٥)</div>
            <p style={{ fontSize: '1.1rem', marginBottom: '20px' }}>
              ينطلق باسم مع أصدقائه في رحلة خيالية لإنقاذ كوكب صغير فقد نوره. من خلال هذه القصة المليئة بالخيال والألوان الدافئة، يتعلم الأطفال أن العمل الجماعي يضيء حتى أظلم الأماكن.
            </p>
            <div className="story-actions">
              <button className="btn btn-primary" onClick={() => setShowModal(true)}>شراء القصة (١٥ ر.س)</button>
              <button className="btn btn-outline" onClick={() => setCurrentPage('reader')}>معاينة مجانية</button>
            </div>
          </div>
        </div>

        <h2 className="section-title" style={{ textAlign: 'right', marginTop: '60px' }}>قصص مشابهة قد تعجبك</h2>
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

