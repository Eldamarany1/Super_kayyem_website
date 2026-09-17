import '../../styles/StoryCard.css';

export function StoryCard({ story, onClick }) {
  if (!story) return null;

  const category = story.category || story.valueLearned || '';
  const priceFormatted = parseFloat(story.price ?? 0).toFixed(2);
  const cover = story.coverImage || story.coverImageUrl || '';

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
        {cover ? (
          <img
            src={cover}
            alt={story.title}
            className="story-card__cover-img"
            loading="lazy"
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
            {story.targetAgeGroup ? `العمر: ${story.targetAgeGroup} سنوات` : ''}
          </span>
          <span className="story-card__rating">
            ⭐ {story.rating ? Number(story.rating).toFixed(1) : '4.8'}
          </span>
        </div>
      </div>
    </article>
  );
}

export default StoryCard;
