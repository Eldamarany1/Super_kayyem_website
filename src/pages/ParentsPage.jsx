import { useState, useEffect } from 'react';
import apiClient from '../api/client';
import '../styles/ParentsPage.css';

export default function ParentsPage() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Scroll to top on load
    window.scrollTo(0, 0);
    fetchArticles();
  }, []);

  const fetchArticles = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get('/parent-articles');
      if (res.success && res.data) {
        // Public page should only display published articles
        const publishedArticles = res.data.filter(article => article.isPublished);
        setArticles(publishedArticles);
      }
    } catch (err) {
      console.error('Failed to fetch parents articles:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="parents-page">
      <div className="parents-banner">
        <h1 className="parents-banner__title">دليل الآباء والمربين</h1>
        <p className="parents-banner__desc">
          مجموعة من المقالات التربوية والنصائح القيمة لمساعدتكم في رحلة تربية أبنائكم
          وبناء جيل واعي يحمل قيماً نبيلة.
        </p>
      </div>

      <div className="container">
        {loading ? (
          <div className="parents-loading">جاري تحميل المقالات...</div>
        ) : articles.length === 0 ? (
          <div className="parents-empty">لا توجد مقالات منشورة حالياً، يرجى العودة لاحقاً.</div>
        ) : (
          <div className="parents-article-grid">
            {articles.map((article) => (
              <article key={article.id} className="parents-article-card">
                <img 
                  src={article.coverImageUrl || '/placeholder.png'} 
                  alt={article.title} 
                  className="parents-article-card__img"
                />
                <div className="parents-article-card__content">
                  <h2 className="parents-article-card__title">{article.title}</h2>
                  <p className="parents-article-card__snippet">
                    {article.content.length > 120 
                      ? `${article.content.substring(0, 120)}...` 
                      : article.content}
                  </p>
                  <div className="parents-article-card__footer">
                    <span className="parents-article-card__date">
                      {new Date(article.createdAt).toLocaleDateString('ar-EG')}
                    </span>
                    <a href="#" className="parents-article-card__read-more">
                      اقرأ المزيد ←
                    </a>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
