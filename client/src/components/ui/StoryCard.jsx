import { useState } from 'react';
import '../../styles/StoryCard.css';

export function StoryCard({ story, onClick }) {
  if (!story) return null;

  const [imgError, setImgError] = useState(false);

  const category = story.category || story.valueLearned || '';
  const priceFormatted = parseFloat(story.price ?? 0).toFixed(2);
  const cover = story.coverImage || story.coverImageUrl || story.CoverImage || story.CoverImageUrl || '';
  const hasPdf = Boolean(story.pdfUrl || story.PdfUrl);
  const age = story.targetAge || story.targetAgeGroup;

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      if (onClick) onClick(story);
    }
  };

  return (
    <article
      className="story-card"
      role="button"
      tabIndex={0}
      onClick={() => onClick && onClick(story)}
      onKeyDown={handleKeyDown}
      aria-label={`عرض تفاصيل قصة ${story.title}`}
    >
      <div className="story-card__cover">
        {cover && !imgError ? (
          <img
            src={cover}
            alt={story.title}
            className="story-card__cover-img"
            loading="lazy"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="story-card__cover-placeholder">📖</div>
        )}

        <span className="story-card__price-badge">
          {priceFormatted} EGP
        </span>

        {category && (
          <span className="story-card__category-badge">
            {category}
          </span>
        )}

        {hasPdf && (
          <span className="story-card__pdf-badge" title="متوفر نسخة PDF إلكترونية">
            📄 PDF
          </span>
        )}

        <div className="story-card__hover-overlay">
          <span className="story-card__hover-label">
            عرض التفاصيل ←
          </span>
        </div>
      </div>

      <div className="story-card__info">
        <h3 className="story-card__title">{story.title}</h3>
        {story.description && (
          <p className="story-card__description">{story.description}</p>
        )}

        <div className="story-card__meta">
          <span className="story-card__age">
            {age ? `العمر: ${age} سنوات` : ''}
          </span>
          <span className="story-card__rating">
            ⭐ {story.rating != null ? Number(story.rating).toFixed(1) : '—'}
          </span>
        </div>
      </div>
    </article>
  );
}

export default StoryCard;
