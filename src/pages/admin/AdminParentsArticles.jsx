import { useState, useEffect } from 'react';
import apiClient from '../../api/client';
import '../../styles/AdminParentsArticles.css';

export default function AdminParentsArticles() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingArticle, setEditingArticle] = useState(null);
  
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    coverImageUrl: '',
    isPublished: false
  });

  useEffect(() => {
    fetchArticles();
  }, []);

  const fetchArticles = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get('/parent-articles');
      if (res.success && res.data) {
        setArticles(res.data);
      }
    } catch (err) {
      console.error('Failed to fetch articles:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (article = null) => {
    if (article) {
      setEditingArticle(article);
      setFormData({
        title: article.title,
        content: article.content,
        coverImageUrl: article.coverImageUrl,
        isPublished: article.isPublished
      });
    } else {
      setEditingArticle(null);
      setFormData({
        title: '',
        content: '',
        coverImageUrl: '',
        isPublished: false
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingArticle(null);
  };

  const handleSave = async () => {
    try {
      if (editingArticle) {
        await apiClient.put(`/parent-articles/${editingArticle.id}`, formData);
      } else {
        await apiClient.post('/parent-articles', formData);
      }
      handleCloseModal();
      fetchArticles();
    } catch (err) {
      console.error('Failed to save article:', err);
      alert('حدث خطأ أثناء حفظ المقال');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('هل أنت متأكد من حذف هذا المقال؟')) return;
    try {
      await apiClient.delete(`/parent-articles/${id}`);
      fetchArticles();
    } catch (err) {
      console.error('Failed to delete article:', err);
      alert('حدث خطأ أثناء الحذف');
    }
  };

  return (
    <div className="admin-parent-articles">
      <div className="admin-parent-articles__header">
        <h2 className="admin-parent-articles__title">إدارة مقالات الآباء</h2>
        <button className="btn btn-primary" onClick={() => handleOpenModal()}>
          + مقال جديد
        </button>
      </div>

      {loading ? (
        <p>جاري التحميل...</p>
      ) : articles.length === 0 ? (
        <p className="empty-state">لا يوجد مقالات حتى الآن.</p>
      ) : (
        <div className="admin-parent-articles__list">
          {articles.map((article) => (
            <div key={article.id} className="admin-parent-card">
              <img 
                src={article.coverImageUrl || '/placeholder-image.png'} 
                alt={article.title} 
                className="admin-parent-card__img" 
              />
              <div className="admin-parent-card__content">
                <span className={`admin-parent-card__status ${article.isPublished ? 'admin-parent-card__status--published' : 'admin-parent-card__status--draft'}`}>
                  {article.isPublished ? 'منشور' : 'مسودة'}
                </span>
                <h3 className="admin-parent-card__title">{article.title}</h3>
                <div className="admin-parent-card__actions">
                  <button className="btn btn-outline" onClick={() => handleOpenModal(article)}>
                    تعديل
                  </button>
                  <button className="btn btn-danger" onClick={() => handleDelete(article.id)}>
                    حذف
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {isModalOpen && (
        <div className="admin-parent-modal-overlay" onClick={handleCloseModal}>
          <div className="admin-parent-modal" onClick={e => e.stopPropagation()}>
            <h3 className="admin-parent-modal__title">
              {editingArticle ? 'تعديل المقال' : 'إضافة مقال جديد'}
            </h3>
            
            <div className="admin-parent-modal__form-group">
              <label className="admin-parent-modal__label">عنوان المقال</label>
              <input 
                type="text" 
                className="admin-parent-modal__input" 
                value={formData.title}
                onChange={e => setFormData({...formData, title: e.target.value})}
              />
            </div>

            <div className="admin-parent-modal__form-group">
              <label className="admin-parent-modal__label">رابط صورة الغلاف</label>
              <input 
                type="text" 
                className="admin-parent-modal__input" 
                value={formData.coverImageUrl}
                onChange={e => setFormData({...formData, coverImageUrl: e.target.value})}
              />
            </div>

            <div className="admin-parent-modal__form-group">
              <label className="admin-parent-modal__label">محتوى المقال</label>
              <textarea 
                className="admin-parent-modal__textarea"
                value={formData.content}
                onChange={e => setFormData({...formData, content: e.target.value})}
              />
            </div>

            <div className="admin-parent-modal__form-group admin-parent-modal__form-group--checkbox">
              <input 
                type="checkbox" 
                id="isPublished"
                checked={formData.isPublished}
                onChange={e => setFormData({...formData, isPublished: e.target.checked})}
                className="admin-parent-modal__checkbox"
              />
              <label htmlFor="isPublished" className="admin-parent-modal__label">
                نشر المقال (متاح للعامة)
              </label>
            </div>

            <div className="admin-parent-modal__actions">
              <button className="btn btn-outline" onClick={handleCloseModal}>
                إلغاء
              </button>
              <button className="btn btn-primary" onClick={handleSave}>
                حفظ المقال
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
