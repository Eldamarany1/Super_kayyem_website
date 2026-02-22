function Footer() {
  return (
    <footer>
      <div className="footer-content">
        <div className="footer-col">
          <h3>سوبر قيّم 🚀</h3>
          <p>متجرك الأول لقصص الأطفال الرقمية الهادفة والممتعة.</p>
        </div>
        <div className="footer-col">
          <h3>تواصل معنا 📞</h3>
          <p><i className="fa-solid fa-envelope"></i> support@superqayim.com</p>
          <p><i className="fa-brands fa-whatsapp"></i> +20 100 000 0000</p>
        </div>
        <div className="footer-col">
          <h3>روابط هامة 🔗</h3>
          <a href="#">سياسة الخصوصية</a>
          <a href="#">تقديم شكوى</a>
          <a href="#">الأسئلة الشائعة</a>
        </div>
      </div>
      <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
        © 2024 جميع الحقوق محفوظة لمتجر سوبر قيّم
      </p>
    </footer>
  );
}

export default Footer;
