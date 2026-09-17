// ============================================================
//  StoryDetailsModal.jsx — تفاصيل القصة (عرض إعلامي فقط)
//  Presentation-only modal: Displays story details and "اقرأ القصة الآن"
//  Zero cart / purchase buttons.
// ============================================================
import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../styles/StoryDetailsModal.css';

export function StoryDetailsModal({ story, onClose }) {
  const navigate = useNavigate();
  const [visible, setVisible] = useState(false);

  // Animate in
  useEffect(() => {
    const frameId = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(frameId);
  }, []);

  const handleClose = useCallback(() => {
    setVisible(false);
    setTimeout(onClose, 250);
  }, [onClose]);

  // ESC key close
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        handleClose();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleClose]);

  // Scroll lock on body
  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, []);

  if (!story) return null;

  const handleRead = () => {
    handleClose();
    navigate(`/story/${story.id}`);
  };

  const price = parseFloat(story.price ?? 0).toFixed(2);
  const category = story.category || story.valueLearned || '';
  const cover = story.coverImage || story.coverImageUrl || '';

  return (
    <div
      dir="rtl"
      role="presentation"
      onClick={(e) => {
        if (e.target === e.currentTarget) handleClose();
      }}
      className={`sdm-backdrop${visible ? ' sdm-backdrop--visible' : ''}`}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="sdm-story-title"
        className={`sdm-panel${!visible ? ' sdm-panel--out' : ''}`}
      >
        {/* Cover Section */}
        <div className="sdm-cover">
          {cover ? (
            <img
              src={cover}
              alt={story.title}
              className="sdm-cover__img"
            />
          ) : (
            <div className="sdm-cover__placeholder">📖</div>
          )}

          {/* Gradient fade */}
          <div className="sdm-cover__gradient" />

          {/* Close button */}
          <button
            type="button"
            onClick={handleClose}
            aria-label="إغلاق النافذة"
            className="sdm-close-btn"
          >
            ✕
          </button>

          {/* Price badge in EGP */}
          <div className="sdm-cover-badge sdm-cover-badge--price">
            {price} EGP
          </div>
        </div>

        {/* Content Section */}
        <div className="sdm-content">
          <h2 id="sdm-story-title" className="sdm-title">{story.title}</h2>

          {/* Meta Chips */}
          <div className="sdm-meta">
            {story.targetAgeGroup && (
              <span className="sdm-chip sdm-chip--age">
                🧒 العمر: {story.targetAgeGroup} سنوات
              </span>
            )}
            {category && (
              <span className="sdm-chip sdm-chip--value">
                💡 القيمة: {category}
              </span>
            )}
            {story.rating && (
              <span className="sdm-chip sdm-chip--age">
                ⭐ {Number(story.rating).toFixed(1)} / 5
              </span>
            )}
            {story.pageCount && (
              <span className="sdm-chip sdm-chip--pages">
                📄 {story.pageCount} صفحة
              </span>
            )}
          </div>

          {story.description && (
            <p className="sdm-description">{story.description}</p>
          )}

          {/* Action: Informational "اقرأ القصة الآن" link only, NO cart or buy buttons */}
          <div className="sdm-actions">
            <button
              type="button"
              id="story-modal-read-btn"
              onClick={handleRead}
              className="sdm-btn-read-full"
            >
              <span className="sdm-btn-read-full__icon">📖</span>
              اقرأ القصة الآن
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default StoryDetailsModal;
