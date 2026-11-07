// ============================================================
//  App.jsx — Root Component
//  Clean React 19 SPA with React Router DOM
//  Routes: / (HomePage), /library (LibraryPage), /story/:id (StoryPage)
// ============================================================
import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import useTheme from './hooks/useTheme';
import { AuthProvider } from './context/AuthContext';
import './App.css';

// Pages
import HomePage from './pages/HomePage';
import LibraryPage from './pages/LibraryPage';
import StoryPage from './pages/StoryPage';
import ArticlesPage from './pages/ArticlesPage';
import ArticleDetailsPage from './pages/ArticleDetailsPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import ProfilePage from './pages/ProfilePage';

// Layout Components
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';

function AppContent() {
  // Initialize and bind theme hook
  useTheme();

  const location = useLocation();

  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [location.pathname]);

  return (
    <div className="app" dir="rtl">
      <Navbar />

      <main>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/library" element={<LibraryPage />} />
          <Route path="/story/:id" element={<StoryPage />} />
          <Route path="/articles" element={<ArticlesPage />} />
          <Route path="/articles/:id" element={<ArticleDetailsPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      <Footer />
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
