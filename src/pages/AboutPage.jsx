// About Page Component - من نحن
function AboutPage() {
  return (
    <section id="about" className="page-view active">
      <div className="container">
        <div className="about-hero" style={{ textAlign: 'center', padding: '60px 20px', background: 'var(--gradient-hero)', borderRadius: '30px', marginBottom: '40px' }}>
          <h1 style={{ fontSize: '2.5rem', color: 'var(--primary-blue)', marginBottom: '20px' }}>من نحن</h1>
          <p style={{ fontSize: '1.2rem', maxWidth: '700px', margin: '0 auto' }}>
            نحن رواد في مجال تعليم القيم للأطفال من خلال القصص التفاعلية الملهمة
          </p>
        </div>

        <div className="about-section" style={{ marginBottom: '60px' }}>
          <h2 className="section-title">رؤيتنا</h2>
          <div className="card" style={{ textAlign: 'center', padding: '40px' }}>
            <div style={{ fontSize: '4rem', marginBottom: '20px' }}>🌟</div>
            <h3 style={{ color: 'var(--primary-blue)', marginBottom: '15px' }}>نحو جيلٍ صالح</h3>
            <p style={{ fontSize: '1.1rem', lineHeight: '1.8' }}>
              نؤمن بأن القيم الأخلاقية تُبنى من خلال القصص الملهمة التي تتجاوز التعليم التقليدي. 
              نسعى لخلق تجربة تفاعلية تجمع بين الترفيه والتعلم، مما يساعد الأطفال على استيعاب القيم الأساسية بطريقة طبيعية وممتعة.
            </p>
          </div>
        </div>

        <div className="about-section" style={{ marginBottom: '60px' }}>
          <h2 className="section-title">ماذا نقدم؟</h2>
          <div className="grid">
            <div className="card" style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '3rem', marginBottom: '15px' }}>📚</div>
              <h3>قصص تفاعلية</h3>
              <p>قصص مصورة تجمع بين الخيال والقيم الأخلاقية، مصممة خصيصاً لأعمار مختلفة.</p>
            </div>
            <div className="card" style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '3rem', marginBottom: '15px' }}>👨‍👩‍👧‍👦</div>
              <h3>تجربة آمنة</h3>
              <p>منصة آمنة للآباء والأمهات لمتابعة تطور أطفالهم وتنمية مهاراتهم.</p>
            </div>
            <div className="card" style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '3rem', marginBottom: '15px' }}>🎯</div>
              <h3>تعلم ممتع</h3>
              <p>نحول التعليم إلى مغامرة ممتعة تساعد الأطفال علىحب التعلم والاستكشاف.</p>
            </div>
          </div>
        </div>

        <div className="about-section" style={{ marginBottom: '60px' }}>
          <h2 className="section-title">شخصيتنا: باسم</h2>
          <div className="bassem-section" style={{ background: 'var(--bg-secondary)', padding: '60px 20px', borderRadius: '30px', display: 'flex', alignItems: 'center', gap: '40px', flexWrap: 'wrap', justifyContent: 'center' }}>
            <div className="bassem-avatar img-placeholder floating" style={{ width: '200px', height: '200px', borderRadius: '50%', background: 'var(--primary-yellow)', flexShrink: 0, boxShadow: 'var(--shadow)', border: '8px solid var(--card-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '4rem' }}>
              🚀
            </div>
            <div style={{ maxWidth: '600px', textAlign: 'center' }}>
              <h2 style={{ color: 'var(--primary-blue)', marginBottom: '15px' }}>باسم .. صديقكم في كل مغامرة</h2>
              <p style={{ fontSize: '1.1rem', lineHeight: '1.8' }}>
                باسم هو بطل قصصنا الخيالية الذي يأخذ الأطفال في رحلات حول العالم وفي الفضاء. 
                من خلال مغامراته، يتعلم الأطفال قيماً أساسية كالصدق والشجاعة والتعاون والمسؤولية.
                باسم ليس مجرد شخصية خيالية، بل هو مرشد يعلم الأطفال كيفية أن يكونوا أبطالاً في حياتهم اليومية.
              </p>
            </div>
          </div>
        </div>

        <div className="about-section" style={{ marginBottom: '60px' }}>
          <h2 className="section-title">القيم التي نعلمها</h2>
          <div className="grid">
            <div className="card">
              <h3 style={{ color: 'var(--primary-blue)' }}>🤝 التعاون</h3>
              <p>تعلم أهمية العمل الجماعي ومساعدة الآخرين.</p>
            </div>
            <div className="card">
              <h3 style={{ color: 'var(--primary-blue)' }}>💪 الشجاعة</h3>
              <p>التغلب على المخاوف ومواجهة التحديات بثقة.</p>
            </div>
            <div className="card">
              <h3 style={{ color: 'var(--primary-blue)' }}>✋ الصدق</h3>
              <p>أهمية الصدق وأمانة في كل صغيرة وكبيرة.</p>
            </div>
            <div className="card">
              <h3 style={{ color: 'var(--primary-blue)' }}>🎯 المسؤولية</h3>
              <p>تحمل المسؤولية والالتزام بوعودنا.</p>
            </div>
            <div className="card">
              <h3 style={{ color: 'var(--primary-blue)' }}>❤️ الصداقة</h3>
              <p>بناء علاقات طيبة واحترام الآخرين.</p>
            </div>
            <div className="card">
              <h3 style={{ color: 'var(--primary-blue)' }}>🧘‍♂️ الصبر</h3>
              <p>التأني والتفكير قبل التصرف.</p>
            </div>
          </div>
        </div>

        <div className="about-section" style={{ marginBottom: '60px' }}>
          <h2 className="section-title">تواصل معنا</h2>
          <div className="grid" style={{ maxWidth: '800px', margin: '0 auto' }}>
            <div className="card" style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '3rem', marginBottom: '15px' }}>📧</div>
              <h3>البريد الإلكتروني</h3>
              <p>للاستفسارات العامة والشكاوى</p>
              <a href="mailto:info@superqiyam.com" style={{ color: 'var(--primary-blue)', fontWeight: '600', fontSize: '1.1rem' }}>info@superqiyam.com</a>
            </div>
            <div className="card" style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '3rem', marginBottom: '15px' }}>📞</div>
              <h3>الهاتف</h3>
              <p>السبت - الخميس: 9ص - 6م</p>
              <a href="tel:+966501234567" style={{ color: 'var(--primary-blue)', fontWeight: '600', fontSize: '1.1rem' }}>+966 50 123 4567</a>
            </div>
            <div className="card" style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '3rem', marginBottom: '15px' }}>💬</div>
              <h3>واتساب</h3>
              <p>تواصل سريع معنا</p>
              <a href="https://wa.me/966501234567" style={{ color: 'var(--primary-blue)', fontWeight: '600', fontSize: '1.1rem' }}>+966 50 123 4567</a>
            </div>
            <div className="card" style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '3rem', marginBottom: '15px' }}>📱</div>
              <h3>وسائل التواصل</h3>
              <p>تابعنا على:</p>
              <div style={{ display: 'flex', gap: '15px', justifyContent: 'center', marginTop: '10px' }}>
                <a href="#" style={{ fontSize: '1.5rem' }}>📘</a>
                <a href="#" style={{ fontSize: '1.5rem' }}>📸</a>
                <a href="#" style={{ fontSize: '1.5rem' }}>🐦</a>
                <a href="#" style={{ fontSize: '1.5rem' }}>📺</a>
              </div>
            </div>
          </div>
        </div>

        <div className="about-section" style={{ marginBottom: '60px', textAlign: 'center' }}>
          <h2 className="section-title">موقعنا</h2>
          <div className="card" style={{ maxWidth: '800px', margin: '0 auto', padding: '30px' }}>
            <p style={{ fontSize: '1.1rem', marginBottom: '20px' }}>
              تقع مكاتبنا في مدينة الرياض، المملكة العربية السعودية
            </p>
            <div style={{ background: 'var(--bg-secondary)', padding: '20px', borderRadius: '15px', display: 'inline-block' }}>
              <p style={{ margin: 0, fontSize: '1rem' }}>🏢 حي الملقا، شارع العليا</p>
              <p style={{ margin: '10px 0 0', fontSize: '1rem' }}>الرياض، المملكة العربية السعودية</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default AboutPage

