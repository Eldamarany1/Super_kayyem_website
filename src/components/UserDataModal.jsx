import { useState } from 'react';
import { useCart } from '../context/CartContext';

function UserDataModal({ onClose }) {
  const { cart, clearCart } = useCart();
  const [isProcessing, setIsProcessing] = useState(false);
  const [userName, setUserName] = useState('');

  const processOrder = () => {
    if (!userName) {
      alert("من فضلك أدخل اسمك واسم البطل الصغير!");
      return;
    }
    if (cart.length === 0) {
      alert("السلة فارغة!");
      return;
    }

    setIsProcessing(true);

    // Simulate payment and download after 2 seconds
    setTimeout(() => {
      // Create dummy download link
      const a = document.createElement('a');
      a.href = 'data:text/plain;charset=utf-8,' + encodeURIComponent('شكراً لشرائك من سوبر قيّم! هذا ملف تجريبي للكتاب.');
      a.download = 'Super_Qayim_Story.txt';
      a.click();

      clearCart();
      setIsProcessing(false);
      onClose();
      
      alert(`تم الدفع بنجاح يا ${userName}! تم تحميل القصة لجهازك 🎉`);
    }, 2000);
  };

  return (
    <div className="modal-overlay active" onClick={onClose}>
      <div className="modal-content" style={{ maxWidth: '500px' }} onClick={(e) => e.stopPropagation()}>
        <button className="close-btn" onClick={onClose}>&times;</button>
        <h2>بيانات استلام الكتاب 📧</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '20px' }}>
         سيتم إرسال نسخة الـ PDF للبريد أيضاً.
        </p>
        
        <div className="form-group">
          <input 
            type="text" 
            className="form-control" 
            placeholder="اسم ولي الأمر (أو البطل الصغير)" 
            id="userName"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
          />
        </div>
        <div className="form-group">
          <input type="email" className="form-control" placeholder="البريد الإلكتروني" id="userEmail" />
        </div>
        <div className="form-group">
          <input type="text" className="form-control" placeholder="رقم الهاتف (للتواصل في حالة فودافون/فوري)" />
        </div>
        
        <button className="btn-main" id="downloadBtn" onClick={processOrder} disabled={isProcessing}>
          {isProcessing ? (
            <>
              <i className="fa-solid fa-spinner fa-spin"></i> جاري تأكيد الدفع وتجهيز الكتاب...
            </>
          ) : (
            'تأكيد الدفع وتحميل الكتاب 📥'
          )}
        </button>
      </div>
    </div>
  );
}

export default UserDataModal;
