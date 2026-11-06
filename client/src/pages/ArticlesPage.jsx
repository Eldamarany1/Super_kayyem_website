// ============================================================
// ArticlesPage.jsx — All Parent Awareness Articles Page
// Displays all articles with search and category filters
// ============================================================

import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ARTICLES as fallbackArticles } from '../data/articles';
import { stripHtml, formatArabicDate } from '../utils/articleUtils';
import '../styles/Articles.css';

export function ArticlesPage() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('الكل');

  useEffect(() => {
    fetch('/api/articles')
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch articles');
        return res.json();
      })
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setArticles(data);
        } else {
          setArticles(fallbackArticles);
        }
      })
      .catch(() => {
        setArticles(fallbackArticles);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  // Compute unique categories
  const categories = useMemo(() => {
    const set = new Set();
    articles.forEach((a) => {
      if (a.category) set.add(a.category);
    });
    return ['الكل', ...Array.from(set)];
  }, [articles]);

  // Filtered articles based on search and category
  const filteredArticles = useMemo(() => {
    return articles.filter((article) => {
      const matchesCategory =
        selectedCategory === 'الكل' || article.category === selectedCategory;

      const q = searchQuery.trim().toLowerCase();
      const matchesSearch =
        !q ||
        article.title?.toLowerCase().includes(q) ||
        article.category?.toLowerCase().includes(q) ||
        article.authorName?.toLowerCase().includes(q) ||
        stripHtml(article.introduction).toLowerCase().includes(q) ||
        stripHtml(article.bodyContent).toLowerCase().includes(q);

      return matchesCategory && matchesSearch;
    });
  }, [articles, selectedCategory, searchQuery]);

  return (
    <div className="articles-page-wrapper" dir="rtl">
      <div className="parent-articles-container">
        {/* Page Header */}
        <header className="articles-page-header">
          <span className="parent-articles-tag">📚 مكتبة التوعية الأسرية</span>
          <h1 className="parent-articles-title">مقالات توعوية للآباء والمربين</h1>
          <p className="parent-articles-subtitle">
            مقالات ودراسات تربوية عملية تُعينك على فهم طفلك وتطوير مهاراته السلوكية والعاطفية وغرس القيم الأخلاقية
          </p>
        </header>

        {/* Search & Category Filter */}
        <div className="articles-search-filter-bar">
          <div className="articles-search-input-wrapper">
            <span className="articles-search-icon" aria-hidden="true">🔍</span>
            <input
              type="text"
              className="articles-search-input"
              placeholder="ابحث في المقالات بالكلمات المفتاحية، العنوان، أو اسم الناشر..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              aria-label="البحث في المقالات"
            />
          </div>

          <div className="articles-categories-pills" role="tablist" aria-label="تصنيفات المقالات">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                role="tab"
                aria-selected={selectedCategory === cat}
                className={`article-category-pill ${selectedCategory === cat ? 'active' : ''}`}
                onClick={() => setSelectedCategory(cat)}
              >
                {cat}
                {cat !== 'الكل' && (
                  <span className="ms-1 opacity-75">
                    ({articles.filter((a) => a.category === cat).length})
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Content Section */}
        {loading ? (
          <div className="articles-grid">
            <div className="article-skeleton-card" />
            <div className="article-skeleton-card" />
            <div className="article-skeleton-card" />
            <div className="article-skeleton-card" />
          </div>
        ) : filteredArticles.length === 0 ? (
          <div className="articles-empty-state">
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔎</div>
            <h3>لم نعثر على مقالات مطابقة لبحثك</h3>
            <p className="text-secondary mt-2">
              جرب البحث بكلمات أخرى أو اختر تصنيفاً مختلفاً.
            </p>
            <button
              type="button"
              className="btn btn-outline-primary mt-3 px-4 py-2"
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('الكل');
              }}
            >
              إعادة تعيين الفلاتر
            </button>
          </div>
        ) : (
          <div className="articles-grid">
            {filteredArticles.map((article) => {
              const excerpt = stripHtml(article.introduction);
              const dateText = formatArabicDate(article.publishedAt);

              return (
                <Link
                  key={article.id}
                  to={`/articles/${article.id}`}
                  className="article-card"
                  aria-label={article.title}
                >
                  <div className="article-card-img-wrapper">
                    <img
                      src={article.imageUrl || fallbackArticles[0].imageUrl}
                      alt={article.title}
                      className="article-card-img"
                      loading="lazy"
                    />
                    <span className="article-badge-category">{article.category}</span>
                  </div>

                  <div className="article-card-body">
                    <div className="article-card-meta">
                      <span className="article-card-author">✍️ {article.authorName || 'مشرف سوبر قيم'}</span>
                      <time dateTime={article.publishedAt}>{dateText}</time>
                    </div>

                    <h2 className="article-card-title">{article.title}</h2>

                    <p className="article-card-excerpt">
                      {excerpt.length > 130 ? `${excerpt.slice(0, 130)}...` : excerpt}
                    </p>

                    <div className="article-card-footer">
                      <span className="article-read-btn">
                        اقرأ المقال كاملًا <span>←</span>
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default ArticlesPage;
