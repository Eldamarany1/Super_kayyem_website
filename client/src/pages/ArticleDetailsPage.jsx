// ============================================================
// ArticleDetailsPage.jsx — Single Article Reading Page
// Clean editorial reading layout with formatted HTML and story recommendations
// ============================================================

import { useState, useEffect, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ARTICLES as fallbackArticles } from '../data/articles';
import { STORIES as fallbackStories } from '../data/stories';
import { stripHtml, formatArabicDate } from '../utils/articleUtils';
import '../styles/Articles.css';

export function ArticleDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [recommendedStories, setRecommendedStories] = useState([]);

  // Fetch article by ID
  useEffect(() => {
    let isMounted = true;
    fetch(`/api/articles/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error('Article not found');
        return res.json();
      })
      .then((data) => {
        if (isMounted) setArticle(data);
      })
      .catch(() => {
        if (isMounted) {
          const found = fallbackArticles.find((a) => String(a.id) === String(id));
          setArticle(found || null);
        }
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [id]);

  // Fetch recommended stories for the bottom section
  useEffect(() => {
    let isMounted = true;
    fetch('/api/stories')
      .then((res) => {
        if (!res.ok) throw new Error('Failed to load stories');
        return res.json();
      })
      .then((data) => {
        if (!isMounted) return;
        if (Array.isArray(data) && data.length > 0) {
          setRecommendedStories(data.slice(0, 3));
        } else {
          setRecommendedStories(fallbackStories.slice(0, 3));
        }
      })
      .catch(() => {
        if (isMounted) {
          setRecommendedStories(fallbackStories.slice(0, 3));
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // Calculate estimated reading time
  const readingTime = useMemo(() => {
    if (!article) return 3;
    const text = stripHtml(`${article.introduction || ''} ${article.bodyContent || ''} ${article.conclusion || ''}`);
    const wordCount = text.split(/\s+/).filter(Boolean).length;
    return Math.max(1, Math.ceil(wordCount / 160));
  }, [article]);

  const handleShare = async () => {
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(window.location.href);
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
      }
    } catch {
      // Fallback
    }
  };

  if (loading) {
    return (
      <div className="article-details-page" dir="rtl">
        <div className="article-details-container text-center py-5">
          <div className="spinner-border text-primary my-5" role="status">
            <span className="visually-hidden">جاري التحميل...</span>
          </div>
          <p className="text-secondary">جاري تحميل المقال...</p>
        </div>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="article-details-page" dir="rtl">
        <div className="article-details-container text-center py-5">
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⚠️</div>
          <h2>المقال غير موجود أو تم حذفه</h2>
          <p className="text-secondary mt-2">عذراً، لم نتمكن من العثور على المقال المطلوب.</p>
          <button
            type="button"
            className="btn btn-primary mt-3 px-4 py-2"
            onClick={() => navigate('/articles')}
          >
            ← العودة لجميع المقالات
          </button>
        </div>
      </div>
    );
  }

  const dateText = formatArabicDate(article.publishedAt);

  return (
    <article className="article-details-page" dir="rtl">
      <div className="article-details-container">
        {/* Breadcrumbs */}
        <nav className="article-breadcrumbs" aria-label="مسار التصفح">
          <Link to="/">الرئيسية</Link>
          <span>/</span>
          <Link to="/articles">مقالات توعوية</Link>
          <span>/</span>
          <span className="text-truncate" style={{ maxWidth: '300px' }}>{article.title}</span>
        </nav>

        {/* Back Link */}
        <Link to="/articles" className="article-back-link">
          <span>←</span>
          <span>العودة لجميع المقالات</span>
        </Link>

        {/* Article Header */}
        <header className="article-header">
          <span className="article-header-category">{article.category}</span>
          <h1 className="article-header-title">{article.title}</h1>

          <div className="article-header-meta">
            <div className="article-meta-left">
              <span className="article-author-badge">
                <span>✍️</span>
                <span>{article.authorName || 'مشرف سوبر قيم'}</span>
              </span>
              <span>📅 {dateText}</span>
              <span>⏱️ قراءة {readingTime} دقائق</span>
            </div>

            <button
              type="button"
              className="article-share-btn"
              onClick={handleShare}
              aria-label="مشاركة المقال"
            >
              <span>{copied ? '✅ تم النسخ!' : '🔗 نسخ الرابط'}</span>
            </button>
          </div>
        </header>

        {/* Article Cover Image */}
        {article.imageUrl && (
          <div className="article-hero-image-wrapper">
            <img
              src={article.imageUrl}
              alt={article.title}
              className="article-hero-image"
            />
          </div>
        )}

        {/* 1. Introduction Section */}
        {article.introduction && (
          <section className="article-intro-box" aria-label="مقدمة المقال">
            <div dangerouslySetInnerHTML={{ __html: article.introduction }} />
          </section>
        )}

        {/* 2. Main Body Section */}
        {article.bodyContent && (
          <section className="article-body-content" aria-label="موضوع المقال">
            <div dangerouslySetInnerHTML={{ __html: article.bodyContent }} />
          </section>
        )}

        {/* 3. Conclusion Box */}
        {article.conclusion && (
          <section className="article-conclusion-box" aria-label="خاتمة المقال والتوصيات">
            <div className="article-conclusion-header">
              <span>💡</span>
              <span>الخاتمة والتوصيات التربوية</span>
            </div>
            <div
              className="article-conclusion-text"
              dangerouslySetInnerHTML={{ __html: article.conclusion }}
            />
          </section>
        )}

        {/* Bottom Section: Recommended Stories from Super Kayyem */}
        {recommendedStories.length > 0 && (
          <section className="recommended-stories-section" aria-label="قصص مقترحة للطفل">
            <div className="recommended-stories-header">
              <h2 className="recommended-stories-title">📚 قصص مقترحة لتطبيق هذه القيم مع طفلك</h2>
              <p className="recommended-stories-subtitle">
                اخترنا لك هذه القصص التفاعلية من مكتبة «سوبر قيّم» لتعزيز نفس القيمة الأخلاقية بأسلوب ممتع
              </p>
            </div>

            <div className="recommended-stories-grid">
              {recommendedStories.map((story) => (
                <Link
                  key={story.id}
                  to={`/story/${story.id}`}
                  className="story-mini-card"
                  aria-label={story.title}
                >
                  <img
                    src={story.coverImageUrl || story.coverImage}
                    alt={story.title}
                    className="story-mini-card-img"
                    loading="lazy"
                  />
                  <div className="story-mini-card-content">
                    <span className="story-mini-card-badge">{story.category || 'قيم نبيلة'}</span>
                    <h3 className="story-mini-card-title">{story.title}</h3>
                    <span className="story-mini-card-cta">اقرأ القصة مع طفلك ←</span>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </article>
  );
}

export default ArticleDetailsPage;
