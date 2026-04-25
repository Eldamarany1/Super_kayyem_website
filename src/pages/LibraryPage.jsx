// ============================================================
//  LibraryPage.jsx — متجر القصص / مكتبة سوبر قيم
//  Fetches ALL stories (GET /api/stories) AND owned stories
//  (GET /api/user-library/me) in parallel. Cards show an
//  "تم الشراء" badge for owned stories and pass isOwned to
//  StoryDetailsModal so it can swap the action buttons.
// ============================================================
import { useState, useEffect, useMemo } from 'react';
import apiClient from '../api/client';
import { getMyOwnedStories } from '../api/library';
import StoryDetailsModal from '../components/StoryDetailsModal';
import '../styles/LibraryPage.css';

const CATEGORIES = ['الكل', 'التعاون', 'الشجاعة', 'الصدق', 'المسؤولية', 'الصداقة', 'الصبر'];

// ── Skeleton Card ─────────────────────────────────────────────
function SkeletonCard() {
  return (
    <div className="lib-skeleton">
      <div className="lib-skeleton__cover" />
      <div className="lib-skeleton__body">
        <div className="lib-skeleton__line lib-skeleton__line--title" />
        <div className="lib-skeleton__line lib-skeleton__line--sub" />
        <div className="lib-skeleton__line lib-skeleton__line--btn" />
      </div>
    </div>
  );
}

// ── Story Card ────────────────────────────────────────────────
function StoryCard({ story, isOwned, onClick }) {
  return (
    <div
      onClick={() => onClick(story, isOwned)}
      className={`story-card${isOwned ? ' story-card--owned' : ''}`}
      role="button"
      tabIndex={0}
      aria-label={`فتح تفاصيل قصة ${story.title}`}
      onKeyDown={(e) => e.key === 'Enter' && onClick(story, isOwned)}
    >
      {/* Cover */}
      <div className="story-card__cover">
        {story.coverImageUrl ? (
          <img
            src={story.coverImageUrl}
            alt={story.title}
            className="story-card__cover-img"
          />
        ) : (
          <div className="story-card__cover-placeholder">📖</div>
        )}

        {/* Price badge */}
        <div className="story-card__price-badge">
          {parseFloat(story.price ?? story.basePrice ?? 0).toFixed(2)} ج.م
        </div>

        {/* Owned badge */}
        {isOwned && (
          <div className="story-card__owned-badge">✔ تم الشراء</div>
        )}

        {/* Hover overlay */}
        <div className="story-card__hover-overlay">
          <span className="story-card__hover-label">
            {isOwned ? '📖 اقرأ الآن ←' : 'عرض التفاصيل ←'}
          </span>
        </div>
      </div>

      {/* Info */}
      <div className="story-card__info">
        <h3 className="story-card__title">{story.title}</h3>
        {story.valueLearned && (
          <span className="story-card__value-badge">{story.valueLearned}</span>
        )}
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────
function LibraryPage() {
  const [stories,         setStories]         = useState([]);
  const [ownedIds,        setOwnedIds]        = useState(new Set());
  const [loading,         setLoading]         = useState(true);
  const [error,           setError]           = useState('');
  const [filter,          setFilter]          = useState('الكل');
  const [searchTerm,      setSearchTerm]      = useState('');
  const [selectedStory,   setSelectedStory]   = useState(null);
  const [selectedIsOwned, setSelectedIsOwned] = useState(false);

  useEffect(() => {
    const fetchStories = apiClient.get('/stories');
    const fetchOwned   = getMyOwnedStories().catch(() => ({ success: false, data: [] }));

    Promise.all([fetchStories, fetchOwned])
      .then(([storiesRes, ownedRes]) => {
        if (Array.isArray(storiesRes?.data))              setStories(storiesRes.data);
        else if (Array.isArray(storiesRes?.data?.items))  setStories(storiesRes.data.items);

        if (ownedRes?.success && Array.isArray(ownedRes.data)) {
          setOwnedIds(new Set(ownedRes.data.map((o) => o.storyId)));
        }
      })
      .catch((err) => setError(err.message || 'تعذّر تحميل القصص.'))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() =>
    stories.filter((s) => {
      const matchSearch   = s.title?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchCategory = filter === 'الكل' || s.valueLearned === filter;
      return matchSearch && matchCategory;
    }),
  [stories, searchTerm, filter]);

  const handleCardClick = (story, isOwned) => {
    setSelectedStory(story);
    setSelectedIsOwned(isOwned);
  };

  return (
    <section id="library" className="library-page">
      {/* Hero */}
      <div className="library-hero">
        <div className="library-hero__glow" />
        <h1 className="library-hero__title">📚 مكتبة سوبر قيم</h1>
        <p className="library-hero__subtitle">
          اكتشف قصصًا تعلّم قيمًا رائعة — اختر واقرأ فورًا
        </p>
      </div>

      <div className="container">

        {/* Filters & Search */}
        <div className="library-filters">
          <div className="search-box">
            <input
              type="text"
              placeholder="ابحث في قصص سوبر قيم..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <span className="search-icon">🔍</span>
          </div>
          <div className="category-filters">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                className={`filter-btn ${filter === cat ? 'active' : ''}`}
                onClick={() => setFilter(cat)}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div className="error-message library-error">⚠️ {error}</div>
        )}

        {loading ? (
          <div className="library-grid">
            {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : filtered.length > 0 ? (
          <>
            <p className="library-results-count">
              {filtered.length} قصة متاحة
              {ownedIds.size > 0 && (
                <span className="library-results-count__owned">
                  ({ownedIds.size} مملوكة ✔)
                </span>
              )}
            </p>
            <div className="library-grid">
              {filtered.map((story) => (
                <StoryCard
                  key={story.id}
                  story={story}
                  isOwned={ownedIds.has(story.id)}
                  onClick={handleCardClick}
                />
              ))}
            </div>
          </>
        ) : (
          <div className="empty-state">
            <div style={{ fontSize: '4rem', marginBottom: 16 }}>🔍</div>
            <h3 style={{ color: 'var(--text-secondary)' }}>لم يتم العثور على قصص مطابقة</h3>
            <p>جرّب البحث بكلمة مختلفة أو اختر تصنيفًا آخر</p>
            <button
              className="btn btn-outline library-reset-btn"
              onClick={() => { setSearchTerm(''); setFilter('الكل'); }}
            >
              إعادة تعيين الفلاتر
            </button>
          </div>
        )}
      </div>

      {/* Story Details Modal */}
      {selectedStory && (
        <StoryDetailsModal
          story={selectedStory}
          isOwned={selectedIsOwned}
          onClose={() => { setSelectedStory(null); setSelectedIsOwned(false); }}
        />
      )}
    </section>
  );
}

export default LibraryPage;
