// ============================================================
//  Footer.jsx — Clean Footer with dynamic year
// ============================================================
import { Link } from 'react-router-dom';
import '../../styles/Footer.css';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="site-footer">
      <div className="container">
        <Link to="/" className="footer-logo" aria-label="الصفحة الرئيسية">
          سوبر <span>قيم</span>
        </Link>
        <p className="footer-desc">
          منصة رقمية آمنة وذكية تقدم قصصاً تفاعلية للأطفال تنمّي القيم الأخلاقية والمهارات الحياتية بأسلوب ممتع وشيق.
        </p>

        <nav className="footer-links" aria-label="روابط سريعة">
          <Link to="/">الرئيسية</Link>
          <Link to="/library">قصصنا</Link>
        </nav>

        <p className="footer-copyright">
          © {currentYear} سوبر قيم. جميع الحقوق محفوظة.
        </p>
      </div>
    </footer>
  );
}

export default Footer;
