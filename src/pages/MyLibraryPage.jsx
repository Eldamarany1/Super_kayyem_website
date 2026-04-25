// ============================================================
//  MyLibraryPage.jsx — مكتبتي الشخصية
//  Route: /my-library  (auth-protected)
//  Fetches GET /api/user-library/me → shows owned stories.
//  Each card has "اقرأ الآن" (no ?sample=true) → /reader/:id
// ============================================================
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMyOwnedStories } from '../api/library';
import '../styles/MyLibraryPage.css';

const CATEGORIES = ['الكل', 'التعاون', 'الشجاعة', 'الصدق', 'المسؤولية', 'الصداقة', 'الصبر'];

// ── Skeleton card ─────────────────────────────────────────────
function SkeletonCard() {
  return (
    <div className="ml-skeleton">
      <div className="ml-skeleton__cover" />
      <div className="ml-skeleton__body">
        <div className="ml-skeleton__line ml-skeleton__line--title" />
        <div className="ml-skeleton__line ml-skeleton__line--sub" />
        <div className="ml-skeleton__line ml-skeleton__line--btn" />
      </div>
    </div>
  );
}

// ── Single owned story card ───────────────────────────────────
function OwnedStoryCard({ story, onRead }) {
  const progress = story.readingProgress ?? 0;

  const readLabel =
    progress === 0   ? 'ابدأ القراءة' :
    progress >= 100  ? 'قراءة مجددًا' :
                       'اكمل القراءة';

  const readIcon = progress >= 100 ? '🏆' : '📖';

  return (
    <div className="owned-card">
      {/* Cover */}
      <div className="owned-card__cover">
        {story.coverImageUrl ? (
          <img
            src={story.coverImageUrl}
            alt={story.title}
            className="owned-card__cover-img"
          />
        ) : (
          <div className="owned-card__cover-placeholder">📖</div>
        )}

        {/* Owned badge */}
        <div className="owned-card__owned-badge">✅ مملوكة</div>

        {/* Reviewed badge */}
        {story.hasReviewed && (
          <div className="owned-card__reviewed-badge">⭐ تم التقييم</div>
        )}
      </div>

      {/* Info */}
      <div className="owned-card__body">
        <h3 className="owned-card__title">{story.title}</h3>

        <div className="owned-card__chips">
          {story.valueLearned && (
            <span className="owned-card__chip owned-card__chip--value">
              💡 {story.valueLearned}
            </span>
          )}
          {story.purchaseDate && (
            <span className="owned-card__chip owned-card__chip--date">
              🛒 {new Date(story.purchaseDate).toLocaleDateString('ar-EG', {
                year: 'numeric', month: 'short', day: 'numeric',
              })}
            </span>
          )}
        </div>

        {/* Progress bar */}
        <div>
          <div className="owned-card__progress-header">
            <span>التقدم في القراءة</span>
            <span>{progress}%</span>
          </div>
          <div className="owned-card__progress-track">
            <div
              className={`owned-card__progress-fill${progress >= 100 ? ' owned-card__progress-fill--done' : ' owned-card__progress-fill--active'}`}
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Read Now button — NO ?sample=true */}
        <button
          id={`read-story-${story.storyId}`}
          onClick={() => onRead(story.storyId)}
          className={`owned-card__read-btn${progress >= 100 ? ' owned-card__read-btn--done' : ' owned-card__read-btn--active'}`}
        >
          <span>{readIcon}</span>
          {readLabel}
        </button>
      </div>
    </div>
  );
}

// ── Stats pill ────────────────────────────────────────────────
function StatPill({ icon, label, value }) {
  return (
    <div className="stat-pill">
      <span className="stat-pill__icon">{icon}</span>
      <div>
        <div className="stat-pill__value">{value}</div>
        <div className="stat-pill__label">{label}</div>
      </div>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────
function MyLibraryPage() {
  const navigate = useNavigate();

  const [owned,      setOwned]      = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState('');
  const [filter,     setFilter]     = useState('الكل');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    getMyOwnedStories()
      .then((res) => {
        if (res.success && Array.isArray(res.data)) {
          setOwned(res.data);
        } else if (Array.isArray(res.data?.items)) {
          setOwned(res.data.items);
        } else {
          setOwned([]);
        }
      })
      .catch((err) => setError(err.message || 'تعذّر تحميل مكتبتك.'))
      .finally(() => setLoading(false));
  }, []);

  // Navigate to the FULL reader — no sample flag
  const handleRead = (storyId) => navigate(`/reader/${storyId}`);

  const filtered = owned.filter((s) => {
    const matchSearch   = s.title?.toLowerCase().includes(searchTerm.toLowerCase()) ?? true;
    const matchCategory = filter === 'الكل' || s.valueLearned === filter;
    return matchSearch && matchCategory;
  });

  const completedCount  = owned.filter((s) => (s.readingProgress ?? 0) >= 100).length;
  const inProgressCount = owned.filter((s) => (s.readingProgress ?? 0) > 0 && (s.readingProgress ?? 0) < 100).length;

  return (
    <section id="my-library" className="my-library-page">

      {/* ── Hero */}
      <div className="my-library-hero">
        <div className="my-library-hero__glow" />
        <h1 className="my-library-hero__title">📚 مكتبتي الشخصية</h1>
        <p className="my-library-hero__subtitle">
          قصصك المشتراة — تابع القراءة من حيث توقفت في أي وقت
        </p>
      </div>

      <div className="container">

        {/* ── Filter strip */}
        <div className="my-library-filters">
          <div className="search-box">
            <input
              type="text"
              placeholder="ابحث في مكتبتك..."
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

        {/* ── Stats (only when data loaded) */}
        {!loading && !error && owned.length > 0 && (
          <div className="my-library-stats">
            <StatPill icon="📚" label="إجمالي القصص" value={owned.length} />
            <StatPill icon="✅" label="تم قراءتها"   value={completedCount} />
            <StatPill icon="📖" label="جارٍ القراءة" value={inProgressCount} />
          </div>
        )}

        {/* ── Error */}
        {error && (
          <div className="error-message my-library-error">⚠️ {error}</div>
        )}

        {/* ── Skeleton */}
        {loading ? (
          <div className="my-library-grid">
            {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>

        ) : filtered.length > 0 ? (
          <>
            <p className="my-library-results-count">
              عرض {filtered.length} من {owned.length} قصة
            </p>
            <div className="my-library-grid">
              {filtered.map((story) => (
                <OwnedStoryCard
                  key={story.storyId ?? story.libraryItemId}
                  story={story}
                  onRead={handleRead}
                />
              ))}
            </div>
          </>

        ) : (
          <div className="empty-state my-library-empty">
            {owned.length === 0 ? (
              <>
                <div className="my-library-empty__icon-lg">📭</div>
                <h3 className="my-library-empty__title">مكتبتك فارغة حالياً</h3>
                <p className="my-library-empty__body">
                  مكتبتك فارغة حالياً. تصفح قصصنا لاكتشاف مغامرات جديدة!
                </p>
                <button
                  className="btn btn-primary my-library-empty__cta"
                  onClick={() => navigate('/library')}
                >
                  تصفح قصصنا 🛒
                </button>
              </>
            ) : (
              <>
                <div className="my-library-empty__icon-sm">🔍</div>
                <h3 className="my-library-empty__title">لا توجد نتائج مطابقة</h3>
                <p>جرّب بحثًا مختلفًا أو غيّر الفلتر</p>
                <button
                  className="btn btn-outline my-library-empty__reset-btn"
                  onClick={() => { setSearchTerm(''); setFilter('الكل'); }}
                >
                  إعادة تعيين الفلاتر
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </section>
  );
}

export default MyLibraryPage;
