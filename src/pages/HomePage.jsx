// Homepage Component - Main landing page
function HomePage({ setCurrentPage }) {
  // Scroll to stories section smoothly
  const scrollToStories = () => {
    document.getElementById('stories')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <section id="home" className="page-view active">
      {/* Hero Section */}
      <div className="hero">
        <div className="container">
          <h1>مغامرات تصنع القيم</h1>
          <p>عالم رقمي آمن يجمع بين سحر القصص وتنمية القيم الأخلاقية لدى الأطفال، صُمم خصيصاً للآباء الباحثين عن محتوى راقي.</p>
          <button className="btn btn-yellow btn-hero" onClick={scrollToStories}>
            استكشف القصص
          </button>

          {/* Hero Graphics - Decorative Elements */}
          <div className="hero-graphics">
            <div className="img-placeholder floating hero-graphics-placeholder">
              ☁️ جزيرة طافية
            </div>
            <div className="img-placeholder floating hero-graphics-cloud">
              ☁️ غيوم ناعمة
            </div>
            <div className="img-placeholder floating hero-graphics-city">
              ✨ مدينة الخيال ✨
            </div>
          </div>
        </div>
      </div>

      <div className="container" id="stories">
        {/* Bassem Character Section */}
        <div className="bassem-section">
          <div className="bassem-avatar img-placeholder floating">
            صورة باسم<br/>(بطل المغامرات)
          </div>
          <div className="bassem-content">
            <h2>مرحباً! أنا باسم</h2>
            <p>أنا صديق أطفالكم الجديد. أحب استكشاف الفضاء، وحل الألغاز العلمية، والسفر عبر الجزر الطافية! في كل قصة نعيشها معاً، نتعلم قيمة جديدة تجعلنا أبطالاً حقيقيين في عالمنا.</p>
            <button className="btn btn-outline" onClick={() => setCurrentPage('story')}>
              اقرأ مغامرتي الأولى
            </button>
          </div>
        </div>

        {/* Featured Stories Section */}
        <h2 className="section-title">مغامرات شيقة</h2>
        <div className="grid">
          <div className="card" onClick={() => setCurrentPage('story')}>
            <div className="img-placeholder">غلاف القصة: الفضاء</div>
            <h3>باسم ومسبار الأمل</h3>
            <p>رحلة فضائية مذهلة لاكتشاف الكواكب.</p>
            <span className="tag">التعاون</span> <span className="tag">٦-٨ سنوات</span>
          </div>
          <div className="card" onClick={() => setCurrentPage('story')}>
            <div className="img-placeholder">غلاف القصة: المحيط</div>
            <h3>سر اللؤلؤة الزرقاء</h3>
            <p>مغامرة في أعماق البحر مع الكائنات البحرية.</p>
            <span className="tag">الشجاعة</span> <span className="tag">٤-٦ سنوات</span>
          </div>
          <div className="card" onClick={() => setCurrentPage('story')}>
            <div className="img-placeholder">غلاف القصة: الغابة</div>
            <h3>خريطة الشجرة العتيقة</h3>
            <p>لغز مثير داخل الغابة السحرية.</p>
            <span className="tag">الصدق</span> <span className="tag">٨-١٠ سنوات</span>
          </div>
        </div>

        {/* Parents Section */}
        <h2 className="section-title">ركن الآباء والمربين</h2>
        <div className="grid" id="parents">
          <div className="card card-secondary">
            <h3>كيف نغرس الصدق؟</h3>
            <p>مقال تربوي قصير عن أهمية القراءة في بناء الشخصية.</p>
            <a href="#" className="link-primary">اقرأ المزيد ←</a>
          </div>
          <div className="card card-secondary">
            <h3>وقت النوم الهادئ</h3>
            <p>نصائح لاختيار قصص ما قبل النوم المناسبة لطفلك.</p>
            <a href="#" className="link-primary">اقرأ المزيد ←</a>
          </div>
        </div>
      </div>
    </section>
  )
}

export default HomePage