import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import '../../styles/StarRating.css';

export function StarRating({ storyId, currentRating, onRatingUpdated }) {
  const { user, isAuthenticated, ownsStory, ownStory } = useAuth();
  const [hoverRating, setHoverRating] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [userRating, setUserRating] = useState(null);
  const [message, setMessage] = useState('');
  const [owningLoading, setOwningLoading] = useState(false);

  const isOwned = isAuthenticated && ownsStory(storyId);

  // Load existing user rating if already rated previously
  useEffect(() => {
    let cancelled = false;
    async function fetchExistingRating() {
      if (!user?.id || !storyId) return;
      try {
        const res = await fetch(`/api/stories/${storyId}`);
        if (!res.ok) return;
        const data = await res.json();
        if (cancelled) return;
        const ratings = data.ratings || data.Ratings || [];
        const existing = ratings.find((r) => (r.accountId ?? r.AccountId) === user.id);
        if (existing) {
          const score = existing.score ?? existing.Score;
          if (score != null) {
            setUserRating(score);
          }
        }
      } catch {
        // Ignore background fetch error
      }
    }
    fetchExistingRating();
    return () => {
      cancelled = true;
    };
  }, [user?.id, storyId]);

  const handleRate = async (score) => {
    if (!isAuthenticated || !user?.id) return;
    setSubmitting(true);
    setMessage('');

    try {
      const res = await fetch(`/api/stories/${storyId}/rate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          accountId: user.id,
          accountName: `${user.firstName || user.name || ''} ${user.lastName || ''}`.trim() || 'قارئ سوبر قيم',
          rating: score,
          score: score,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'فشل تسجيل التقييم');
      }

      setUserRating(score);
      setMessage(data.message || 'تم تسجيل تقييمك بنجاح! ⭐');

      if (!isOwned && ownStory) {
        ownStory(storyId);
      }

      if (onRatingUpdated && data.rating != null) {
        onRatingUpdated(data.rating);
      }
    } catch (err) {
      setMessage(err.message || 'حدث خطأ أثناء حفظ التقييم');
    } finally {
      setSubmitting(false);
    }
  };

  const handleClaimOwnership = async () => {
    setOwningLoading(true);
    setMessage('');
    const res = await ownStory(storyId);
    setOwningLoading(false);
    if (res.success) {
      setMessage('تمت إضافة القصة إلى مكتبتك بنجاح! يمكنك الآن تقييمها 🌟');
    } else {
      setMessage(res.error || 'حدث خطأ أثناء إضافة القصة');
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="star-rating-box star-rating-box--guest">
        <span className="star-rating-hint">هل أعجبتك القصة؟</span>
        <Link to="/login" className="btn btn-sm btn-outline-primary rounded-pill">
          سجل دخولك لتقييمها ⭐
        </Link>
      </div>
    );
  }

  return (
    <div className="star-rating-box star-rating-box--owned">
      <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 w-100">
        <div>
          <span className="star-rating-label fw-bold d-block">
            {userRating ? 'تقييمك لهذه القصة:' : 'قيّم هذه القصة (1 - 5 نجوم):'}
          </span>
          <small className="text-secondary">
            المتوسط الحالي: ⭐ {currentRating != null ? Number(currentRating).toFixed(1) : '—'} / 5
          </small>
        </div>

        {/* 5 Stars */}
        <div
          className="star-rating-stars"
          onMouseLeave={() => setHoverRating(0)}
          dir="ltr"
        >
          {[1, 2, 3, 4, 5].map((star) => {
            const active = hoverRating ? star <= hoverRating : userRating ? star <= userRating : false;
            return (
              <button
                key={star}
                type="button"
                className={`star-btn ${active ? 'star-btn--active' : ''}`}
                onClick={() => handleRate(star)}
                onMouseEnter={() => setHoverRating(star)}
                disabled={submitting}
                aria-label={`${star} من 5`}
              >
                ★
              </button>
            );
          })}
        </div>
      </div>

      {!isOwned && (
        <div className="d-flex align-items-center justify-content-between gap-2 mt-2 pt-2 border-top border-secondary border-opacity-25 w-100">
          <small className="text-secondary">القصة ليست في مكتبتك بعد:</small>
          <button
            type="button"
            className="btn btn-sm btn-outline-success rounded-pill px-3"
            onClick={handleClaimOwnership}
            disabled={owningLoading}
          >
            {owningLoading ? 'جارٍ الإضافة...' : '🎁 أضف إلى مكتبتي'}
          </button>
        </div>
      )}

      {submitting && <div className="star-rating-feedback text-secondary mt-1">جارٍ تسجيل التقييم...</div>}
      {message && <div className="star-rating-feedback text-success mt-1 fw-bold">{message}</div>}
    </div>
  );
}

export default StarRating;

