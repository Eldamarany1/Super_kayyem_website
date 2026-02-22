function RamadanModal({ onClose }) {
  return (
    <div className="modal-overlay active" onClick={onClose}>
      <div className="modal-content ramadan-modal" onClick={(e) => e.stopPropagation()}>
        <button className="close-btn" style={{ color: '#FFF' }} onClick={onClose}>&times;</button>
        <i className="fa-solid fa-mosque" style={{ fontSize: '60px', marginBottom: '20px' }}></i>
        <h2>أهلاً بك في خيمة سوبر قيّم الرمضانية! 🌙</h2>
        <p style={{ fontSize: '20px', marginBottom: '20px' }}>
          بمناسبة الشهر الكريم، استمتع بخصم 50% على جميع القصص الدينية لتنمية قيم toddler.
        </p>
        <p style={{ background: 'rgba(255,255,255,0.2)', padding: '10px', borderRadius: '15px', display: 'inline-block' }}>
          كود الخصم: <strong>RAMADAN50</strong>
        </p>
        <br /><br />
        <button className="btn-main" style={{ background: '#FF477E', width: 'auto' }} onClick={onClose}>
          تصفح القصص الآن!
        </button>
      </div>
    </div>
  );
}

export default RamadanModal;
