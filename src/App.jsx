// Main App Component
import { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, useNavigate, useLocation, Navigate } from 'react-router-dom'
import './App.css'

// Import Pages
import HomePage from './pages/HomePage'
import LibraryPage from './pages/LibraryPage'
import AccountPage from './pages/AccountPage'
import AboutPage from './pages/AboutPage'
import LoginPage from './pages/LoginPage'
import SignupPage from './pages/SignupPage'
import StoryPage from './pages/StoryPage'
import ReaderPage from './pages/ReaderPage'

// Import Components
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import RewardModal from './components/RewardModal'

function AppContent() {
  const [selectedStoryId, setSelectedStoryId] = useState(1)
  const [isDark, setIsDark] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  
  const navigate = useNavigate()
  const location = useLocation()

  // Bridge function to support your existing pages without breaking them
  const setCurrentPage = (page) => {
    const routes = {
      home: '/',
      about: '/about',
      library: '/library',
      account: '/account',
      login: '/login',
      signup: '/signup',
      story: '/story',
      reader: '/reader'
    }
    if (routes[page]) navigate(routes[page])
  }

  // Scroll to top on route change, but only if not doing a hash scroll
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [location.pathname])

  // Theme toggle
  useEffect(() => {
    if (isDark) {
      document.body.setAttribute('data-theme', 'dark')
    } else {
      document.body.removeAttribute('data-theme')
    }
  }, [isDark])

  return (
    <div className="app" dir="rtl">
      <Navbar 
        isDark={isDark} 
        setIsDark={setIsDark}
        isLoggedIn={isLoggedIn}
        setIsLoggedIn={setIsLoggedIn}
      />

      <main id="app">
        <Routes>
          <Route path="/" element={<HomePage setCurrentPage={setCurrentPage} />} />
          <Route path="/about" element={<AboutPage />} />
          
          {/* Protected Routes */}
          <Route path="/library" element={
            isLoggedIn ? 
              <LibraryPage setCurrentPage={setCurrentPage} setSelectedStoryId={setSelectedStoryId} /> 
            : <Navigate to="/login" />
          } />
          <Route path="/account" element={
            isLoggedIn ? <AccountPage /> : <Navigate to="/login" />
          } />
          
          {/* Auth Routes */}
          <Route path="/login" element={<LoginPage setCurrentPage={setCurrentPage} setIsLoggedIn={setIsLoggedIn} />} />
          <Route path="/signup" element={<SignupPage setCurrentPage={setCurrentPage} setIsLoggedIn={setIsLoggedIn} />} />
          
          {/* Content Routes */}
          <Route path="/story" element={<StoryPage setCurrentPage={setCurrentPage} setShowModal={setShowModal} setSelectedStoryId={setSelectedStoryId} />} />
          <Route path="/reader" element={<ReaderPage setCurrentPage={setCurrentPage} storyId={selectedStoryId} />} />
        </Routes>
      </main>

      <Footer />

      <RewardModal 
        showModal={showModal} 
        setShowModal={setShowModal} 
        setCurrentPage={setCurrentPage} 
      />
    </div>
  )
}

// Wrap the app in BrowserRouter
function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  )
}

export default App