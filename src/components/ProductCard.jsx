import { useCart } from '../context/CartContext';

function ProductCard({ book, onOpenDetails }) {
  const { addToCart } = useCart();

  const handleAddToCart = (e) => {
    e.stopPropagation();
    addToCart(book);
  };

  return (
    <div className="product-card" onClick={() => onOpenDetails(book)}>
      <img src={book.images[0]} className="book-img" alt={book.title} />
      <h3 style={{ fontSize: '22px' }}>{book.title}</h3>
      <p style={{ color: 'var(--primary)', fontSize: '24px', fontWeight: 'bold', margin: '10px 0' }}>{book.price} $</p>
      <button 
        className="btn-main" 
        style={{ background: 'var(--blue)', width: 'auto', padding: '8px 20px' }}
        onClick={handleAddToCart}
      >
        أضف للسلة
      </button>
    </div>
  );
}

export default ProductCard;
