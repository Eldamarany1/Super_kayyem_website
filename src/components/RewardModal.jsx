// ============================================================
//  RewardModal.jsx — نافذة المكافأة بعد الشراء
// ============================================================

import { useState } from 'react'
import apiClient from '../api/client'

function RewardModal({ showModal, setShowModal, setCurrentPage }) {
  const [receiptUrl, setReceiptUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  if (!showModal) return null

  // `showModal` is now expected to be an object: { type: 'payment', storyId, price }
  const isPayment = showModal?.type === 'payment'

  const handleClose = () => {
    setShowModal(false)
    if (success) setCurrentPage('library')
  }

  const handleSubmitTransaction = async () => {
    if (!receiptUrl) return alert("يرجى إرفاق رابط أو مسار الإيصال")
    setLoading(true)
    try {
      await apiClient.post('/transactions', {
        itemId: showModal.storyId,
        itemType: 'Story', // Assuming story for now
        amount: showModal.price,
        receiptImageUrl: receiptUrl
      })
      setSuccess(true)
    } catch (e) {
      alert("حدث خطأ أثناء الإرسال")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="modal-overlay active"
      onClick={(e) => e.target === e.currentTarget && handleClose()}
    >
      <div className="modal">
        {success ? (
          <>
            <div className="modal-mascot">⏳</div>
            <h2>طلبك قيد المراجعة!</h2>
            <p style={{ fontSize: '1.1rem', margin: '15px 0 25px' }}>
              تم استلام إيصال الدفع بنجاح. سيقوم فريق الإدارة بمراجعة العملية في أقرب وقت.
            </p>
            <button className="btn btn-yellow" style={{ width: '100%', fontSize: '1.05rem' }} onClick={handleClose}>
              حسناً (الذهاب للمكتبة)
            </button>
          </>
        ) : isPayment ? (
          <>
            <div className="modal-mascot">🧾</div>
            <h2>الدفع اليدوي</h2>
            <p style={{ fontSize: '1rem', margin: '15px 0 25px' }}>
              يرجى تحويل {showModal.price} EGP إلى فودافون كاش أو إنستا باي على الرقم: 01092257192
            </p>
            <input 
               type="text" 
               placeholder="رابط رفع صورة الإيصال المحول" 
               style={{ width: '100%', padding: '10px', marginBottom: '15px', borderRadius: '10px', border: '2px solid var(--border-color)', background: 'var(--bg-color)', color: 'var(--text-primary)' }}
               value={receiptUrl}
               onChange={(e) => setReceiptUrl(e.target.value)}
            />
            <button className="btn btn-primary" style={{ width: '100%', fontSize: '1.05rem' }} onClick={handleSubmitTransaction} disabled={loading}>
              {loading ? 'جاري الإرسال...' : 'تأكيد ودفع'}
            </button>
          </>
        ) : (
          <button className="btn btn-outline" onClick={handleClose}>إغلاق</button>
        )}
      </div>
    </div>
  )
}

export default RewardModal
