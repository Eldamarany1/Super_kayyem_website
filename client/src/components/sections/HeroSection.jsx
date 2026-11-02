import { Link } from 'react-router-dom';
import '../../styles/HeroSection.css';

const VALUES = ['التعاون', 'الشجاعة', 'الصدق', 'المسؤولية', 'الصداقة', 'الصبر'];

export function HeroSection({ onExploreClick }) {
  return (
    <section className="hero-section">
      <div className="hero-section__glow" aria-hidden="true" />
      <div className="container">
        <div className="hero-section__badge">
          <span>✨</span>
          <span>منصة القصص التربوية التفاعلية الأولى</span>
        </div>

        <h1 className="hero-section__title">
          مغامرات <span>تصنع القيم</span>
        </h1>

        <p className="hero-section__subtitle">
          عالم رقمي آمن يجمع بين سحر الحكايات وتنمية القيم الأخلاقية لدى الأطفال،
          صُمم خصيصاً ليمنح أطفالنا أوقاتاً ممتعة وقيمية ملهمة.
        </p>

        <div className="hero-section__cta-group">
          <Link
            to="/library"
            className="hero-section__btn-main"
          >
            <span>📚</span>
            <span>استكشف جميع القصص</span>
          </Link>

          <Link
            to="/signup"
            className="hero-section__btn-sec"
          >
            أنشئ حساباً مجانياً
          </Link>

          <button
            type="button"
            className="hero-section__btn-sec"
            style={{ border: 'none', background: 'transparent' }}
            onClick={onExploreClick}
          >
            قصص مختارة أدناه ↓
          </button>
        </div>

        <div className="hero-section__values" aria-label="القيم المستهدفة">
          {VALUES.map((val) => (
            <span key={val} className="hero-section__value-chip">
              #{val}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

export default HeroSection;
