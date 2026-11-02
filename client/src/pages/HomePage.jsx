// ============================================================
//  HomePage.jsx — Home page
// ============================================================
import { useState, useEffect } from 'react';
import HeroSection from '../components/sections/HeroSection';
import StoriesSection from '../components/sections/StoriesSection';
import StoryDetailsModal from '../components/ui/StoryDetailsModal';
import { STORIES as fallbackStories } from '../data/stories';
import '../styles/HomePage.css';

export function HomePage() {
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStory, setSelectedStory] = useState(null);

  useEffect(() => {
    fetch('/api/stories')
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch stories');
        return res.json();
      })
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setStories(data);
        } else {
          setStories(fallbackStories);
        }
      })
      .catch(() => {
        setStories(fallbackStories);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const handleExploreScroll = () => {
    const el = document.getElementById('featured-stories');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="home-page-container">
      <HeroSection onExploreClick={handleExploreScroll} />

      <StoriesSection
        stories={stories}
        loading={loading}
        onStoryClick={(story) => setSelectedStory(story)}
      />

      {selectedStory && (
        <StoryDetailsModal
          story={selectedStory}
          onClose={() => setSelectedStory(null)}
        />
      )}
    </div>
  );
}

export default HomePage;
