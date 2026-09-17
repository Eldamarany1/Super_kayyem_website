import { Link } from 'react-router-dom';
import StoryCard from '../ui/StoryCard';
import SkeletonCard from '../ui/SkeletonCard';
import '../../styles/StoriesSection.css';

export function StoriesSection({ stories, loading, onStoryClick }) {
  return (
    <section id="featured-stories" className="stories-section">
      <div className="container">
        <header className="stories-section__header">
          <h2 className="stories-section__title">مغامرات شيقة وقيم أصيلة</h2>
          <p className="stories-section__subtitle">
            مجموعة مختارة بعناية لتغرس الفضيلة والشجاعة والتعاون في نفوس أبطالنا الصغار
          </p>
        </header>

        <div className="stories-section__grid">
          {loading ? (
            Array.from({ length: 3 }).map((_, index) => (
              <SkeletonCard key={index} />
            ))
          ) : stories && stories.length > 0 ? (
            stories.slice(0, 3).map((story) => (
              <StoryCard
                key={story.id}
                story={story}
                onClick={onStoryClick}
              />
            ))
          ) : (
            <p>لا توجد قصص متاحة حالياً.</p>
          )}
        </div>

        <div className="stories-section__footer">
          <Link to="/library" className="stories-section__more-btn">
            <span>تصفح جميع القصص في المكتبة</span>
            <span>←</span>
          </Link>
        </div>
      </div>
    </section>
  );
}

export default StoriesSection;
