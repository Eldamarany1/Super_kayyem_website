import { useCart } from '../context/CartContext';

function Toast() {
  const { toast } = useCart();

  return (
    <div className={`toast ${toast.show ? 'show' : ''}`}>
      <i className="fa-solid fa-circle-check" style={{ fontSize: '24px' }}></i>
      <span>{toast.message}</span>
    </div>
  );
}

export default Toast;
