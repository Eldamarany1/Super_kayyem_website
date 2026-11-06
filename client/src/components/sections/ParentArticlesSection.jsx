// ============================================================
// ParentArticlesSection.jsx — Homepage Section for Parent Articles
// Displays the 3 latest parent awareness articles
// ============================================================

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ARTICLES as fallbackArticles } from '../../data/articles';
import { stripHtml, formatArabicDate } from '../../utils/articleUtils';
import '../../styles/Articles.css';

export function ParentArticlesSection() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    fetch('/api/articles')
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch articles');
        return res.json();
      })
      .then((data) => {
        if (!isMounted) return;
        if (Array.isArray(data) && data.length > 0) {
          setArticles(data.slice(0, 3));
        } else {
          setArticles(fallbackArticles.slice(0, 3));
        }
      })
      .catch(() => {
        if (isMounted) {
          setArticles(fallbackArticles.slice(0, 3));
        }
      })
      .finally(() => {
        if (isMounted) {
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <section className="parent-articles-section" aria-labelledby="parent-articles-heading">
      <div className="parent-articles-container">
        <div className="parent-articles-header">
          <span className="parent-articles-tag">🌱 إرشاد وتوعية أسرية</span>
          <h2 id="parent-articles-heading" className="parent-articles-title">
            مقالات توعوية للآباء والمربين
          </h2>
          <p className="parent-articles-subtitle">
            نصائح وإرشادات تربوية متخصصة لبناء شخصية طفلك، وتعديل السلوك وغرس القيم النبيلة بأسلوب عملي ومتوازن
          </p>
        </div>

        {loading ? (
          <div className="articles-grid">
            <div className="article-skeleton-card" />
            <div className="article-skeleton-card" />
            <div className="article-skeleton-card" />
          </div>
        ) : (
          <div className="articles-grid">
            {articles.map((article) => {
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

                    <h3 className="article-card-title">{article.title}</h3>

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

        <div className="parent-articles-cta">
          <Link to="/articles" className="btn-explore-all">
            استكشف جميع المقالات <span>←</span>
          </Link>
        </div>
      </div>
    </section>
  );
}

export default ParentArticlesSection;
