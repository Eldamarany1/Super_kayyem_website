// Reward Modal Component - نافذة المكافأة
function RewardModal({ showModal, setShowModal, setCurrentPage }) {
  if (!showModal) return null

  return (
    <div className="modal-overlay active" onClick={(e) => {
      if (e.target.className.includes('modal-overlay')) {
        setShowModal(false)
        setCurrentPage('library')
      }
    }}>
      <div className="modal">
        <div className="modal-mascot">🎁</div>
        <h2>مفاجأة باسم!</h2>
        <p style={{ fontSize: '1.2rem', margin: '15px 0 25px' }}>
          رائع! لقد أتممت عملية الشراء بنجاح. بمناسبة انضمامك لمغامراتنا، أهداك باسم كود خصم ٥٠٪ على قصتك القادمة!
        </p>
        <div style={{ background: 'var(--bg-secondary)', padding: '15px', borderRadius: '10px', fontWeight: '800', fontSize: '1.5rem', letterSpacing: '2px', color: 'var(--primary-blue)', marginBottom: '20px' }}>
          BASSEM50
        </div>
        <button 
          className="btn btn-yellow" 
          style={{ width: '100%', fontSize: '1.1rem' }} 
          onClick={() => {
            setShowModal(false)
            setCurrentPage('library')
          }}
        >
          شكراً باسم! (الذهاب للمكتبة)
        </button>
      </div>
    </div>
  )
}

export default RewardModal

