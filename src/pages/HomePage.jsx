// Homepage Component - الرئيسية
function HomePage({ setCurrentPage }) {
  return (
    <section id="home" className="page-view active">
      <div className="hero">
        <div className="container">
          <h1>مغامرات تصنع القيم</h1>
          <p>عالم رقمي آمن يجمع بين سحر القصص وتنمية القيم الأخلاقية لدى الأطفال، صُمم خصيصاً للآباء الباحثين عن محتوى راقي.</p>
          <button 
            className="btn btn-yellow" 
            style={{ fontSize: '1.2rem', padding: '15px 35px' }}
            onClick={() => document.getElementById('stories')?.scrollIntoView({ behavior: 'smooth' })}
          >
            استكشف القصص
          </button>
          
          <div className="hero-graphics">
            <div className="img-placeholder floating" style={{ width: '200px', height: '80px', borderRadius: '40px', position: 'absolute', top: '20px', left: '10%' }}>
              ☁️ جزيرة طافية
            </div>
            <div className="img-placeholder floating" style={{ width: '150px', height: '60px', borderRadius: '40px', position: 'absolute', top: '60px', right: '15%', animationDelay: '2s' }}>
              ☁️ غيوم ناعمة
            </div>
            <div className="img-placeholder floating" style={{ width: '300px', height: '120px', borderRadius: '60px', position: 'absolute', bottom: '0', left: '50%', transform: 'translateX(-50%)', animationDelay: '1s' }}>
              ✨ مدينة الخيال ✨
            </div>
          </div>
        </div>
      </div>

      <div className="container" id="stories">
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

