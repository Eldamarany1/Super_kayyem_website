// ============================================================
//  Footer.jsx — تذييل الصفحة
// ============================================================

function Footer() {
  return (
    <footer>
      <div className="container">
        <div className="logo" style={{ marginBottom: '15px' }}>
          سوبر <span>قيم</span>
        </div>
        <p>منصة رقمية آمنة تصنع القيم من خلال قصص تفاعلية ملهمة.</p>
        <p style={{ fontSize: '0.9rem', marginTop: '20px', marginBottom: 0, color: 'var(--text-secondary)' }}>
          © 2024 سوبر قيم. جميع الحقوق محفوظة.
        </p>
      </div>
    </footer>
  )
}

export default Footer
