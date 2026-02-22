import { useState } from 'react';
import './VideoBooks.css';

const sampleVideos = [
  {
    id: 1,
    title: 'مغامرات في عالم الطفولة',
    description: 'قصة ممتعة عن الأصدقاء الأربعة الذين اكتشفوا عالمًا سحريًا',
    thumbnail: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400&h=250&fit=crop',
    videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
    duration: '12:30',
    views: 1250,
    author: 'أحمد محمد',
    category: 'قصص مغامرات'
  },
  {
    id: 2,
    title: 'الحكايات التعليمية',
    description: 'تعلم الأرقام والحروف بطريقة ممتعة وتفاعلية',
    thumbnail: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=400&h=250&fit=crop',
    videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
    duration: '08:45',
    views: 2340,
    author: 'سارة علي',
    category: 'تعليمي'
  },
  {
    id: 4,
    title: 'رحلة إلى القمر',
    description: 'انضم إلى رحلة الفضاء المثيرة مع فريق من الرواد الصغار',
    thumbnail: 'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?w=400&h=250&fit=crop',
    videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
    duration: '20:10',
    views: 1890,
    author: 'ياسر إبراهيم',
    category: 'علوم وتكنولوجيا'
  },
  {
    id: 5,
    title: 'الأصدقاء الحقيقيون',
    description: 'قصة عن الصداقة الحقيقية والتعاون بين الأصدقاء',
    thumbnail: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=400&h=250&fit=crop',
    videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
    duration: '10:00',
    views: 980,
    author: 'فاطمة الزهراء',
    category: 'قصص اجتماعية'
  },
  {
    id: 6,
    title: 'عالم الطبيعة السحري',
    description: 'اكتشف عجائب الطبيعة والحيوانات من حول العالم',
    thumbnail: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=400&h=250&fit=crop',
    videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
    duration: '18:30',
    views: 2100,
    author: 'خالد محمد',
    category: 'تعليم أطفال'
  }
];

function VideoBooks({ isAdmin, onBack }) {
  const [videos, setVideos] = useState(sampleVideos);
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [newVideo, setNewVideo] = useState({
    title: '',
    description: '',
    category: '',
    videoUrl: ''
  });

  const handleUpload = (e) => {
    e.preventDefault();
    if (!newVideo.title || !newVideo.description) return;

    const video = {
      id: videos.length + 1,
      ...newVideo,
      thumbnail: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400&h=250&fit=crop',
      duration: '00:00',
      views: 0,
      author: 'أنت',
      category: newVideo.category || 'عام'
    };

    setVideos([video, ...videos]);
    setNewVideo({ title: '', description: '', category: '', videoUrl: '' });
    setShowUploadForm(false);
  };

  const handleDelete = (id) => {
    setVideos(videos.filter(v => v.id !== id));
  };

  return (
    <div className="video-books-page">
      <div className="video-page-header">
        <button className="back-btn" onClick={onBack}>
          <i className="fa-solid fa-arrow-right"></i> العودة
        </button>
        <h1><i className="fa-solid fa-book-open"></i> كتب الفيديو</h1>
        {isAdmin && (
          <button 
            className="upload-toggle-btn"
            onClick={() => setShowUploadForm(!showUploadForm)}
          >
            <i className="fa-solid fa-plus"></i> إضافة فيديو
          </button>
        )}
      </div>

      {/* Upload Form for Admin */}
      {isAdmin && showUploadForm && (
        <div className="upload-section">
          <h2><i className="fa-solid fa-cloud-upload-alt"></i> رفع فيديو جديد</h2>
          <form onSubmit={handleUpload} className="upload-form">
            <div className="form-row">
              <div className="form-group">
                <label>عنوان الفيديو</label>
                <input
                  type="text"
                  placeholder="أدخل عنوان الفيديو"
                  value={newVideo.title}
                  onChange={(e) => setNewVideo({...newVideo, title: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>الفئة</label>
                <select
                  value={newVideo.category}
                  onChange={(e) => setNewVideo({...newVideo, category: e.target.value})}
                >
                  <option value="">اختر الفئة</option>
                  <option value="قصص مغامرات">قصص مغامرات</option>
                  <option value="تعليمي">تعليمي</option>
                  <option value="قصص خيالية">قصص خيالية</option>
                  <option value="علوم وتكنولوجيا">علوم وتكنولوجيا</option>
                  <option value="قصص اجتماعية">قصص اجتماعية</option>
                </select>
              </div>
            </div>
            <div className="form-group">
              <label>وصف الفيديو</label>
              <textarea
                placeholder="أدخل وصف الفيديو"
                value={newVideo.description}
                onChange={(e) => setNewVideo({...newVideo, description: e.target.value})}
                required
              />
            </div>
            <div className="form-group">
              <label>رابط الفيديو</label>
              <input
                type="url"
                placeholder="https://example.com/video.mp4"
                value={newVideo.videoUrl}
                onChange={(e) => setNewVideo({...newVideo, videoUrl: e.target.value})}
              />
            </div>
            <div className="upload-area">
              <i className="fa-solid fa-cloud-upload-alt"></i>
              <p>اسحب الملفات هنا أو انقر للتصفح</p>
              <span>MP4, WebM - الحد الأقصى 500MB</span>
            </div>
            <button type="submit" className="submit-btn">
              <i className="fa-solid fa-upload"></i> رفع الفيديو
            </button>
          </form>
        </div>
      )}

      {/* Video Grid */}
      <div className="videos-grid">
        {videos.map((video) => (
          <div 
            key={video.id} 
            className="video-card"
            onClick={() => setSelectedVideo(video)}
          >
            <div className="video-thumbnail">
              <img src={video.thumbnail} alt={video.title} />
              <span className="video-duration">{video.duration}</span>
              <div className="play-overlay">
                <i className="fa-solid fa-play"></i>
              </div>
            </div>
            <div className="video-info">
              <span className="video-category">{video.category}</span>
              <h3>{video.title}</h3>
              <p>{video.description}</p>
              <div className="video-meta">
                <span><i className="fa-solid fa-user"></i> {video.author}</span>
                <span><i className="fa-solid fa-eye"></i> {video.views.toLocaleString()}</span>
              </div>
            </div>
            {isAdmin && (
              <button 
                className="delete-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete(video.id);
                }}
              >
                <i className="fa-solid fa-trash"></i>
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Video Player Modal */}
      {selectedVideo && (
        <div className="video-modal" onClick={() => setSelectedVideo(null)}>
          <div className="video-player-container" onClick={(e) => e.stopPropagation()}>
            <button className="close-video" onClick={() => setSelectedVideo(null)}>
              <i className="fa-solid fa-times"></i>
            </button>
            <video controls autoPlay>
              <source src={selectedVideo.videoUrl} type="video/mp4" />
              متصفحك لا يدعم تشغيل الفيديو
            </video>
            <div className="video-details">
              <span className="video-category">{selectedVideo.category}</span>
              <h2>{selectedVideo.title}</h2>
              <p>{selectedVideo.description}</p>
              <div className="video-stats">
                <span><i className="fa-solid fa-eye"></i> {selectedVideo.views.toLocaleString()} مشاهدة</span>
                <span><i className="fa-solid fa-user"></i> {selectedVideo.author}</span>
                <span><i className="fa-solid fa-clock"></i> {selectedVideo.duration}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default VideoBooks;
