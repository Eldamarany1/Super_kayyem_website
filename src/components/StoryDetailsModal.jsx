// ============================================================
//  StoryDetailsModal.jsx — قصة تفاصيل نافذة منبثقة
//  Props:
//    story    — story object
//    isOwned  — boolean: user already purchased this story
//    onClose  — close callback
//
//  IF NOT OWNED: shows 3 buttons (شراء الآن / إضافة للسلة / تصفح عينة)
//  IF OWNED:     shows single "ابدأ القراءة" → /reader/:id  (no ?sample)
// ============================================================
import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import CheckoutModal from './CheckoutModal';
import '../styles/StoryDetailsModal.css';

function StoryDetailsModal({ story, isOwned = false, onClose }) {
  const navigate = useNavigate();
  const { addToCart } = useCart();

  const [addedFeedback, setAddedFeedback] = useState(false);
  const [showCheckout,  setShowCheckout]  = useState(false);
  const [visible,       setVisible]       = useState(false);

  // Animate in
  useEffect(() => { requestAnimationFrame(() => setVisible(true)); }, []);

  // ESC close
  useEffect(() => {
    const fn = (e) => { if (e.key === 'Escape') handleClose(); };
    document.addEventListener('keydown', fn);
    return () => document.removeEventListener('keydown', fn);
  }, []);

  // Scroll lock
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  const handleClose = useCallback(() => {
    setVisible(false);
    setTimeout(onClose, 300);
  }, [onClose]);

  const handleAddToCart = () => {
    addToCart(story);
    setAddedFeedback(true);
    setTimeout(() => setAddedFeedback(false), 2000);
  };

  const handleBuyNow  = () => setShowCheckout(true);

  const handleSample  = () => {
    handleClose();
    navigate(`/reader/${story.id}?sample=true`);
  };

  const handleReadFull = () => {
    handleClose();
    navigate(`/reader/${story.id}`);
  };

  const price = parseFloat(story.price ?? story.basePrice ?? 0).toFixed(2);

  if (showCheckout) {
    return (
      <CheckoutModal
        items={[{
          id:       story.id,
          title:    story.title,
          price:    story.price ?? story.basePrice ?? 0,
          coverUrl: story.coverUrl ?? story.coverImageUrl ?? '',
        }]}
        onClose={() => { setShowCheckout(false); handleClose(); }}
      />
    );
  }

  return (
    <div
      dir="rtl"
      onClick={(e) => { if (e.target === e.currentTarget) handleClose(); }}
      className={`sdm-backdrop${visible ? ' sdm-backdrop--visible' : ''}`}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={`تفاصيل قصة ${story.title}`}
        className={`sdm-panel${!visible ? ' sdm-panel--out' : ''}`}
      >
        {/* Cover */}
        <div className="sdm-cover">
          {story.coverImageUrl ? (
            <img
              src={story.coverImageUrl}
              alt={story.title}
              className="sdm-cover__img"
            />
          ) : (
            <div className={`sdm-cover__placeholder${isOwned ? ' sdm-cover__placeholder--owned' : ''}`}>
              📖
            </div>
          )}

          {/* Gradient fade */}
          <div className="sdm-cover__gradient" />

          {/* Close button */}
          <button onClick={handleClose} aria-label="إغلاق" className="sdm-close-btn">
            ✕
          </button>

          {/* Price / owned badge */}
          {isOwned ? (
            <div className="sdm-cover-badge sdm-cover-badge--owned">✔ مملوكة</div>
          ) : (
            <div className="sdm-cover-badge sdm-cover-badge--price">{price} ج.م</div>
          )}
        </div>

        {/* Content */}
        <div className="sdm-content">
          <h2 className="sdm-title">{story.title}</h2>

          {/* Meta chips */}
          <div className="sdm-meta">
            {story.targetAgeGroup && (
              <span className="sdm-chip sdm-chip--age">🧒 {story.targetAgeGroup}</span>
            )}
            {story.valueLearned && (
              <span className="sdm-chip sdm-chip--value">💡 {story.valueLearned}</span>
            )}
            {story.pageCount && (
              <span className="sdm-chip sdm-chip--pages">📄 {story.pageCount} صفحة</span>
            )}
          </div>

          {story.description && (
            <p className="sdm-description">{story.description}</p>
          )}

          {/* ── Action buttons ── */}
          {isOwned ? (
            // Single "ابدأ القراءة" for owned stories
            <button
              id="story-modal-read-full"
              onClick={handleReadFull}
              className="sdm-btn-read-full"
            >
              <span className="sdm-btn-read-full__icon">📖</span>
              ابدأ القراءة
            </button>

          ) : (
            // 3-button grid for unowned stories
            <div className="sdm-actions-grid">

              {/* شراء الآن */}
              <button
                id="story-modal-buy-now"
                onClick={handleBuyNow}
                className="sdm-action-btn sdm-action-btn--buy"
              >
                <span className="sdm-action-btn__icon">💳</span>
                <span>شراء الآن</span>
              </button>

              {/* إضافة للسلة */}
              <button
                id="story-modal-add-to-cart"
                onClick={handleAddToCart}
                className={`sdm-action-btn${addedFeedback ? ' sdm-action-btn--cart-added' : ' sdm-action-btn--cart'}`}
              >
                <span className="sdm-action-btn__icon">{addedFeedback ? '✅' : '🛒'}</span>
                <span>{addedFeedback ? 'تمت الإضافة' : 'إضافة للسلة'}</span>
              </button>

              {/* تصفح عينة */}
              <button
                id="story-modal-sample"
                onClick={handleSample}
                className="sdm-action-btn sdm-action-btn--sample"
              >
                <span className="sdm-action-btn__icon">👁️</span>
                <span>تصفح عينة</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default StoryDetailsModal;
