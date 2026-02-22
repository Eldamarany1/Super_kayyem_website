import { useCart } from '../context/CartContext';

function CartModal({ onClose, onOpenPayment }) {
  const { cart, getCartTotal } = useCart();

  return (
    <div className="modal-overlay active" onClick={onClose}>
      <div className="modal-content" style={{ maxWidth: '500px' }} onClick={(e) => e.stopPropagation()}>
        <button className="close-btn" onClick={onClose}>&times;</button>
        <h2 style={{ marginBottom: '20px' }}>سلة الحكايات 🛒</h2>
        <div id="cartItems" style={{ marginBottom: '20px', maxHeight: '200px', overflowY: 'auto' }}>
          {cart.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '20px' }}>
              السلة فارغة! أضف بعض القصص الممتعة 🎉
            </p>
          ) : (
            cart.map((item, index) => (
              <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px', borderBottom: '1px solid #eee' }}>
                <span>{item.title}</span>
                <span style={{ color: 'var(--primary)', fontWeight: 'bold' }}>{item.price} $</span>
              </div>
            ))
          )}
        </div>
        <h3 style={{ textAlign: 'left', color: 'var(--primary)' }}>
          الإجمالي: <span>{getCartTotal()}</span> $
        </h3>
        <button 
          className="btn-main" 
          style={{ marginTop: '20px' }} 
          onClick={onOpenPayment}
          disabled={cart.length === 0}
        >
          إتمام الطلب 💳
        </button>
      </div>
    </div>
  );
}

export default CartModal;
