// About Page Component - Information about the platform
function AboutPage() {
  return (
    <section id="about" className="page-view active">
      <div className="container">
        {/* Hero Section */}
        <div className="about-hero">
          <h1>من نحن</h1>
          <p>نحن رواد في مجال تعليم القيم للأطفال من خلال القصص التفاعلية الملهمة</p>
        </div>

        {/* Vision Section */}
        <div className="about-section">
          <h2 className="section-title">رؤيتنا</h2>
          <div className="card about-card-centered">
            <div className="about-icon-lg">🌟</div>
            <h3 style={{ color: 'var(--primary-blue)', marginBottom: '15px' }}>نحو جيلٍ صالح</h3>
            <p style={{ fontSize: '1.1rem', lineHeight: '1.8' }}>
              نؤمن بأن القيم الأخلاقية تُبنى من خلال القصص الملهمة التي تتجاوز التعليم التقليدي.
              نسعى لخلق تجربة تفاعلية تجمع بين الترفيه والتعلم، مما يساعد الأطفال على استيعاب القيم الأساسية بطريقة طبيعية وممتعة.
            </p>
          </div>
        </div>

        {/* What We Offer Section */}
        <div className="about-section">
          <h2 className="section-title">ماذا نقدم؟</h2>
          <div className="grid">
            <div className="card about-card-centered">
              <div className="about-icon-md">📚</div>
              <h3>قصص تفاعلية</h3>
              <p>قصص مصورة تجمع بين الخيال والقيم الأخلاقية، مصممة خصيصاً لأعمار مختلفة.</p>
            </div>
            <div className="card about-card-centered">
              <div className="about-icon-md">👨‍👩‍👧‍👦</div>
              <h3>تجربة آمنة</h3>
              <p>منصة آمنة للآباء والأمهات لمتابعة تطور أطفالهم وتنمية مهاراتهم.</p>
            </div>
            <div className="card about-card-centered">
              <div className="about-icon-md">🎯</div>
              <h3>تعلم ممتع</h3>
              <p>نحول التعليم إلى مغامرة ممتعة تساعد الأطفال على حب التعلم والاستكشاف.</p>
            </div>
          </div>
        </div>

        {/* Bassem Character Section */}
        <div className="about-section">
          <h2 className="section-title">شخصيتنا: باسم</h2>
          <div className="bassem-section about-bassem-row">
            <div className="bassem-avatar-about img-placeholder floating">
              🚀
            </div>
            <div className="bassem-content-about">
              <h2>باسم .. صديقكم في كل مغامرة</h2>
              <p>
                باسم هو بطل قصصنا الخيالية الذي يأخذ الأطفال في رحلات حول العالم وفي الفضاء.
                من خلال مغامراته، يتعلم الأطفال قيماً أساسية كالصدق والشجاعة والتعاون والمسؤولية.
                باسم ليس مجرد شخصية خيالية، بل هو مرشد يعلم الأطفال كيفية أن يكونوا أبطالاً في حياتهم اليومية.
              </p>
            </div>
          </div>
        </div>

        {/* Values Section */}
        <div className="about-section">
          <h2 className="section-title">القيم التي نعلمها</h2>
          <div className="grid">
            <div className="card value-card">
              <h3>🤝 التعاون</h3>
              <p>تعلم أهمية العمل الجماعي ومساعدة الآخرين.</p>
            </div>
            <div className="card value-card">
              <h3>💪 الشجاعة</h3>
              <p>التغلب على المخاوف ومواجهة التحديات بثقة.</p>
            </div>
            <div className="card value-card">
              <h3>✋ الصدق</h3>
              <p>أهمية الصدق والأمانة في كل صغيرة وكبيرة.</p>
            </div>
            <div className="card value-card">
              <h3>🎯 المسؤولية</h3>
              <p>تحمل المسؤولية والالتزام بوعودنا.</p>
            </div>
            <div className="card value-card">
              <h3>❤️ الصداقة</h3>
              <p>بناء علاقات طيبة واحترام الآخرين.</p>
            </div>
            <div className="card value-card">
              <h3>🧘‍♂️ الصبر</h3>
              <p>التأني والتفكير قبل التصرف.</p>
            </div>
          </div>
        </div>

        {/* Contact Section */}
        <div className="about-section">
          <h2 className="section-title">تواصل معنا</h2>
          <div className="grid about-contact-grid">
            <div className="card about-card-centered">
              <div className="about-icon-md">📧</div>
              <h3>البريد الإلكتروني</h3>
              <p>للاستفسارات العامة والشكاوى</p>
              <a href="mailto:info@superqiyam.com" className="contact-link">info@superqiyam.com</a>
            </div>
            <div className="card about-card-centered">
              <div className="about-icon-md">📞</div>
              <h3>الهاتف</h3>
              <p>السبت - الخميس: 9ص - 6م</p>
              <a href="tel:+966501234567" className="contact-link">+966 50 123 4567</a>
            </div>
            <div className="card about-card-centered">
              <div className="about-icon-md">💬</div>
              <h3>واتساب</h3>
              <p>تواصل سريع معنا</p>
              <a href="https://wa.me/966501234567" className="contact-link">+966 50 123 4567</a>
            </div>
            <div className="card about-card-centered">
              <div className="about-icon-md">📱</div>
              <h3>وسائل التواصل</h3>
              <p>تابعنا على:</p>
              <div className="social-links">
                <a href="#">📘</a>
                <a href="#">📸</a>
                <a href="#">🐦</a>
                <a href="#">📺</a>
              </div>
            </div>
          </div>
        </div>

        {/* Location Section */}
        <div className="about-section about-location">
          <h2 className="section-title">موقعنا</h2>
          <div className="card about-card-centered about-location-card">
            <p style={{ fontSize: '1.1rem', marginBottom: '20px' }}>
              تقع مكاتبنا في مدينة الرياض، المملكة العربية السعودية
            </p>
            <div className="location-box">
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