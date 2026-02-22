import { useState } from 'react';
import { useCart } from '../context/CartContext';

function BookModal({ book, onClose, onOpenCart }) {
  const [mainImage, setMainImage] = useState(book.images[0]);
  const { addToCart } = useCart();

  const handleAddToCart = () => {
    addToCart(book);
    onOpenCart();
  };

  return (
    <div className="modal-overlay active" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="close-btn" onClick={onClose}>&times;</button>
        <div className="book-details-layout">
          <div className="book-gallery">
            <img src={mainImage} id="mainImage" className="main-img" alt={book.title} />
            <div className="thumbnails">
              {book.images.map((img, index) => (
                <img 
                  key={index} 
                  src={img} 
                  className="thumb" 
                  alt={`${book.title} ${index + 1}`}
                  onClick={() => setMainImage(img)} 
                />
              ))}
            </div>
          </div>
          <div className="book-info">
            <span style={{ background: 'var(--secondary)', padding: '3px 10px', borderRadius: '10px', fontSize: '12px' }}>
              كتاب ديجيتال PDF
            </span>
            <h2 style={{ fontSize: '30px', marginTop: '10px' }}>{book.title}</h2>
            <h3 style={{ color: 'var(--primary)', fontSize: '28px' }}>{book.price} $</h3>
            
            <div className="payment-icons">
              <i className="fa-brands fa-cc-visa" title="فيزا"></i>
              <i className="fa-brands fa-cc-mastercard" title="ماستركارد"></i>
              <span style={{ fontSize: '14px', fontWeight: 'bold', color: '#555' }}>+ محافظ إلكترونية</span>
            </div>

            <p style={{ color: 'var(--text-muted)', fontSize: '18px', lineHeight: '1.8', marginBottom: '20px' }}>
              {book.desc}
            </p>
            
            <button className="btn-main" onClick={handleAddToCart}>
              شراء الآن 🛒
            </button>

            <div className="reviews-section">
              <h4>آراء الأبطال وأولياء الأمور:</h4>
              {book.reviews.map((review, index) => (
                <div key={index} className="review">{review}</div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default BookModal;
