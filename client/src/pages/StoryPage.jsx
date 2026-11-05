import { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { STORIES as fallbackStories } from '../data/stories';
import StarRating from '../components/ui/StarRating';
import FlipbookReader from '../components/ui/FlipbookReader';
import '../styles/StoryPage.css';

export function StoryPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const storyId = useMemo(() => parseInt(id, 10), [id]);
  const [story, setStory] = useState(null);
  const [loading, setLoading] = useState(!isNaN(storyId));

  const loadStory = useCallback(async (sid) => {
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

  const category = story.category || story.valueLearned || '';
  const price = parseFloat(story.price ?? 0).toFixed(2);
  const cover = story.coverImage || story.coverImageUrl || story.CoverImage || story.CoverImageUrl || '';
  const pdf = story.pdfUrl || story.PdfUrl || '';
  const age = story.targetAge || story.targetAgeGroup;

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
              backgroundSize: 'cover',
              backgroundPosition: 'center',
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
              {age && (
                <span className="tag">العمر: {age} سنوات</span>
              )}
              {category && (
                <span className="tag tag-blue">القيمة: {category}</span>
              )}
              <span className="tag">
                ⭐ {story.rating != null ? `${Number(story.rating).toFixed(1)} / 5` : '—'}
              </span>
              <span className="tag tag-yellow">{price} EGP</span>
              {pdf && (
                <span className="tag tag-blue" style={{ background: '#fee2e2', color: '#991b1b', borderColor: '#fca5a5' }}>
                  📄 نسخة PDF متوفرة
                </span>
              )}
            </div>

            <p className="story-description">{story.description}</p>

            {/* Interactive User Rating System */}
            <StarRating
              storyId={story.id}
              currentRating={story.rating}
              onRatingUpdated={(newRating) =>
                setStory((prev) => (prev ? { ...prev, rating: newRating } : prev))
              }
            />

            {pdf && (
              <div style={{ marginTop: '16px' }}>
                <a
                  href={pdf}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-primary"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    textDecoration: 'none',
                    borderRadius: 'var(--border-radius-full)',
                    padding: '10px 20px',
                  }}
                >
                  <span>📄</span>
                  <span>قراءة أو تحميل ملف PDF</span>
                </a>
              </div>
            )}
          </div>
        </div>

        {/* 3D Interactive Flipbook Reader (Supports PDF & Fallback Pages) */}
        <div className="story-reader-container">
          <FlipbookReader story={story} />
        </div>
      </div>
    </section>
  );
}

export default StoryPage;
