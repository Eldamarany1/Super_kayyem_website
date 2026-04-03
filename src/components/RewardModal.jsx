// Reward Modal Component - Popup for rewards
function RewardModal({ showModal, setShowModal, setCurrentPage }) {
  // Don't render if modal is not visible
  if (!showModal) return null

  // Close modal and navigate to library
  const handleClose = () => {
    setShowModal(false)
    setCurrentPage('library')
  }

  return (
    <div
      className="modal-overlay active"
      onClick={(e) => {
        if (e.target.className.includes('modal-overlay')) {
          handleClose()
        }
      }}
    >
      <div className="modal">
        <div className="modal-mascot">🎁</div>
        <h2>مفاجأة باسم!</h2>
        <p style={{ fontSize: '1.2rem', margin: '15px 0 25px' }}>
          رائع! لقد أتممت عملية الشراء بنجاح. بمناسبة انضمامك لمغامراتنا، أهداك باسم كود خصم ٥٠٪ على قصتك القادمة!
        </p>
        <div className="modal-code">
          BASSEM50
        </div>
        <button className="btn btn-yellow btn-modal" onClick={handleClose}>
          شكراً باسم! (الذهاب للمكتبة)
        </button>
      </div>
    </div>
  )
}

export default RewardModal