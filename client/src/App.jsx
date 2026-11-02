// ============================================================
//  App.jsx — Root Component
//  Clean React 19 SPA with React Router DOM
//  Routes: / (HomePage), /library (LibraryPage), /story/:id (StoryPage)
// ============================================================
import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import useTheme from './hooks/useTheme';
import './App.css';

// Pages
import HomePage from './pages/HomePage';
import LibraryPage from './pages/LibraryPage';
import StoryPage from './pages/StoryPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';

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
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
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
      <AppContent />
    </BrowserRouter>
  );
}

export default App;
