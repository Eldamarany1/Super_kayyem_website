// ============================================================
//  LibraryPage.jsx — متجر ومكتبة سوبر قيم (عامة للجميع)
// ============================================================
import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { STORIES as fallbackStories } from '../data/stories';
import StoryCard from '../components/ui/StoryCard';
import SkeletonCard from '../components/ui/SkeletonCard';
import StoryDetailsModal from '../components/ui/StoryDetailsModal';
import '../styles/LibraryPage.css';

const CATEGORIES = ['الكل', 'التعاون', 'الشجاعة', 'الصدق', 'المسؤولية', 'الصداقة', 'الصبر'];

export function LibraryPage() {
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('الكل');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStory, setSelectedStory] = useState(null);

  useEffect(() => {
    fetch('/api/stories')
      .then((res) => {
        if (!res.ok) throw new Error('تعذر تحميل القصص من الخادم');
        return res.json();
      })
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setStories(data);
        } else {
          setStories(fallbackStories);
        }
      })
      .catch((err) => {
        // Fallback to local static stories if API server is offline
        setError(err.message || 'حدث خطأ في الاتصال');
        setStories(fallbackStories);
      })
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    return stories.filter((s) => {
      const term = searchTerm.trim().toLowerCase();
      const matchSearch =
        !term ||
        (s.title && s.title.toLowerCase().includes(term)) ||
        (s.description && s.description.toLowerCase().includes(term));

      const cat = s.category || s.valueLearned || '';
      const matchCategory = filter === 'الكل' || cat === filter;

      return matchSearch && matchCategory;
    });
  }, [stories, searchTerm, filter]);

  const handleCardClick = (story) => {
    setSelectedStory(story);
  };

  const handleResetFilters = () => {
    setSearchTerm('');
    setFilter('الكل');
  };

  return (
    <section id="library" className="library-page">
      {/* Hero Header */}
      <div className="library-hero">
        <div className="library-hero__glow" aria-hidden="true" />
        <h1 className="library-hero__title">📚 مكتبة سوبر قيم</h1>
        <p className="library-hero__subtitle">
          اكتشف قصصاً تغرس أسمى القيم والأخلاق — اختر قصتك واقرأ فوراً
        </p>
        <div style={{ marginTop: '20px', display: 'flex', gap: '10px', justifyContent: 'center' }}>
          <Link to="/login" className="btn btn-outline" style={{ borderColor: 'white', color: 'white', borderRadius: 'var(--border-radius-full)' }}>دخول</Link>
          <Link to="/signup" className="btn btn-primary" style={{ background: 'var(--primary-yellow)', color: '#1e293b', border: 'none', borderRadius: 'var(--border-radius-full)' }}>حساب جديد</Link>
        </div>
      </div>

      <div className="container">
        {/* Filters & Search Box */}
        <div className="library-filters">
          <div className="search-box">
            <input
              type="text"
              placeholder="ابحث بالعنوان أو وصف القصة..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              aria-label="البحث في القصص"
            />
            <span className="search-icon" aria-hidden="true">🔍</span>
          </div>

          <div className="category-filters" role="group" aria-label="تصفية حسب القيمة الأخلاقية">
            {CATEGORIES.map((cat) => (
              <button
                type="button"
                key={cat}
                className={`filter-btn ${filter === cat ? 'active' : ''}`}
                onClick={() => setFilter(cat)}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {error && stories.length === 0 && (
          <div className="error-message library-error" role="alert">
            ⚠️ {error}
          </div>
        )}

        {loading ? (
          <div className="library-grid">
            {Array.from({ length: 6 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : filtered.length > 0 ? (
          <>
            <p className="library-results-count">
              يتم عرض {filtered.length} قصة من أصل {stories.length}
            </p>
            <div className="library-grid">
              {filtered.map((story) => (
                <StoryCard
                  key={story.id}
                  story={story}
                  onClick={handleCardClick}
                />
              ))}
            </div>
          </>
        ) : (
          <div className="empty-state">
            <div style={{ fontSize: '4rem', marginBottom: 16 }} aria-hidden="true">🔍</div>
            <h3 style={{ color: 'var(--text-secondary)' }}>لم يتم العثور على قصص مطابقة</h3>
            <p>جرّب البحث بكلمة أخرى أو اختر تصنيفاً مختلفاً</p>
            <button
              type="button"
              className="btn btn-outline library-reset-btn"
              onClick={handleResetFilters}
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
          onClose={() => setSelectedStory(null)}
        />
      )}
    </section>
  );
}

export default LibraryPage;
