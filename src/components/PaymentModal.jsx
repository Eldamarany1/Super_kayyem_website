import { useState } from 'react';

function PaymentModal({ onClose, onOpenUserData }) {
  const [selectedMethod, setSelectedMethod] = useState(null);

  const selectPay = (method) => {
    setSelectedMethod(method);
  };

  const handleNext = () => {
    if (selectedMethod) {
      onOpenUserData();
    }
  };

  return (
    <div className="modal-overlay active" onClick={onClose}>
      <div className="modal-content" style={{ maxWidth: '500px' }} onClick={(e) => e.stopPropagation()}>
        <button className="close-btn" onClick={onClose}>&times;</button>
        <h2>اختر طريقة الدفع 🇪🇬</h2>
        <div className="payment-methods">
          <div 
            className={`pay-method ${selectedMethod === 'vodafone' ? 'selected' : ''}`} 
            onClick={() => selectPay('vodafone')}
          >
            <i className="fa-solid fa-wallet" style={{ color: 'red' }}></i> فودافون كاش
          </div>
          <div 
            className={`pay-method ${selectedMethod === 'instapay' ? 'selected' : ''}`} 
            onClick={() => selectPay('instapay')}
          >
            <i className="fa-solid fa-bolt" style={{ color: 'purple' }}></i> إنستا باي (InstaPay)
          </div>
          <div 
            className={`pay-method ${selectedMethod === 'fawry' ? 'selected' : ''}`} 
            onClick={() => selectPay('fawry')}
          >
            <i className="fa-solid fa-building-columns" style={{ color: 'orange' }}></i> فوري (Fawry)
          </div>
          <div 
            className={`pay-method ${selectedMethod === 'card' ? 'selected' : ''}`} 
            onClick={() => selectPay('card')}
          >
            <i className="fa-regular fa-credit-card" style={{ color: 'blue' }}></i> بطاقة بنكية
          </div>
        </div>
        <button className="btn-main" onClick={handleNext} disabled={!selectedMethod}>
          التالي ➡️
        </button>
      </div>
    </div>
  );
}

export default PaymentModal;
