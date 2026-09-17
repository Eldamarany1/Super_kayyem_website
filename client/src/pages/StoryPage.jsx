import { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { STORIES as fallbackStories } from '../data/stories';
import '../styles/StoryPage.css';

export function StoryPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const storyId = useMemo(() => parseInt(id, 10), [id]);
  const [story, setStory] = useState(null);
  const [pageIndex, setPageIndex] = useState(0);
  const [loading, setLoading] = useState(!isNaN(storyId));

  const loadStory = useCallback(async (sid) => {
    setPageIndex(0);
    try {
      const res = await fetch(`/api/stories/${sid}`);
      if (!res.ok) throw new Error('Story not found');
      const data = await res.json();
      if (data && data.id) {
        const fallback = fallbackStories.find((s) => s.id === sid);
        setStory({
          ...fallback,
          ...data,
          pages: (data.pages && data.pages.length > 0) ? data.pages : (fallback?.pages || []),
        });
      } else {
        setStory(fallbackStories.find((s) => s.id === sid) || null);
      }
    } catch {
      setStory(fallbackStories.find((s) => s.id === sid) || null);
    } finally {
      setLoading(false);
    }
  }, []);

  // Data-fetching effect — setState in async callback is the standard pattern
  useEffect(() => {
    if (isNaN(storyId)) return;
    loadStory(storyId); // eslint-disable-line react-hooks/set-state-in-effect
  }, [storyId, loadStory]);

  if (loading) {
    return (
      <section id="story" className="story-page-section">
        <div className="container" style={{ textAlign: 'center', padding: '80px 0' }}>
          <p style={{ fontSize: '1.2rem', color: 'var(--text-secondary)' }}>جاري تحميل القصة...</p>
        </div>
      </section>
    );
  }

  if (!story) {
    return (
      <section id="story" className="story-page-section">
        <div className="container" style={{ textAlign: 'center', padding: '80px 0' }}>
          <h2 style={{ marginBottom: '16px' }}>عذراً، لم يتم العثور على القصة</h2>
          <p style={{ marginBottom: '24px' }}>ربما تم تغيير الرابط أو أن القصة غير متوفرة حالياً.</p>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => navigate('/library')}
          >
            العودة إلى المكتبة
          </button>
        </div>
      </section>
    );
  }

  const pages = story.pages || [];
  const totalPages = pages.length;
  const currentPage = pages[pageIndex];
  const category = story.category || story.valueLearned || '';
  const price = parseFloat(story.price ?? 0).toFixed(2);
  const cover = story.coverImage || story.coverImageUrl || '';

  return (
    <section id="story" className="story-page-section">
      <div className="container">
        {/* Story Header & Details */}
        <div className="story-header story-header-layout">
          <div
            className={`story-banner img-placeholder story-cover-banner${
              cover ? ' story-cover-banner--has-image' : ''
            }`}
            style={{
              backgroundImage: cover ? `url(${cover})` : undefined,
            }}
          >
            {!cover && 'غلاف القصة'}
          </div>

          <div className="story-info story-info-col">
            <div className="story-nav-back">
              <button
                type="button"
                className="btn btn-outline"
                onClick={() => navigate('/library')}
              >
                ← العودة إلى قصصنا
              </button>
            </div>

            <h1>{story.title}</h1>

            <div className="story-meta">
              {story.targetAgeGroup && (
                <span className="tag">العمر: {story.targetAgeGroup} سنوات</span>
              )}
              {category && (
                <span className="tag tag-blue">القيمة: {category}</span>
              )}
              {story.rating && (
                <span className="tag">⭐ {Number(story.rating).toFixed(1)} / 5</span>
              )}
              <span className="tag tag-yellow">{price} EGP</span>
            </div>

            <p className="story-description">{story.description}</p>
          </div>
        </div>

        {/* Story Reader Content */}
        {totalPages > 0 ? (
          <div className="story-reader-container">
            <article className="story-page-card" aria-label={`صفحة ${pageIndex + 1} من ${totalPages}`}>
              <div className="story-page-indicator">
                صفحة {pageIndex + 1} من {totalPages}
              </div>

              <div className="story-page-text">
                <p>{currentPage?.content || currentPage?.Content}</p>
              </div>

              <div className="story-page-controls">
                <button
                  type="button"
                  className="btn btn-outline"
                  disabled={pageIndex === 0}
                  onClick={() => setPageIndex((prev) => Math.max(0, prev - 1))}
                  aria-label="الصفحة السابقة"
                >
                  السابق
                </button>

                <button
                  type="button"
                  className="btn btn-primary"
                  disabled={pageIndex >= totalPages - 1}
                  onClick={() => setPageIndex((prev) => Math.min(totalPages - 1, prev + 1))}
                  aria-label="الصفحة التالية"
                >
                  التالي
                </button>
              </div>
            </article>
          </div>
        ) : (
          <div className="story-reader-empty" style={{ textAlign: 'center', padding: '40px 0' }}>
            <p>محتوى القصة متاح قريباً!</p>
          </div>
        )}
      </div>
    </section>
  );
}

export default StoryPage;
