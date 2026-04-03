// Main App Component
import { useState, useEffect, useMemo, useCallback } from 'react'
import { BrowserRouter, Routes, Route, useNavigate, useLocation, Navigate } from 'react-router-dom'
import api from './utils/api.js'
import './App.css'

// Import Pages and Components
import HomePage from './pages/HomePage'
import LibraryPage from './pages/LibraryPage'
import AccountPage from './pages/AccountPage'
import AboutPage from './pages/AboutPage'
import LoginPage from './pages/LoginPage'
import SignupPage from './pages/SignupPage'
import StoryPage from './pages/StoryPage'
import ReaderPage from './pages/ReaderPage'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import RewardModal from './components/RewardModal'
import AddStoryPage from './pages/AddStoryPage'

function AppContent() {
  // State for the selected story ID (null means no story selected)
  const [selectedStoryId, setSelectedStoryId] = useState(null)

  // State for dark mode theme
  const [isDark, setIsDark] = useState(false)

  // State for showing the reward modal popup
  const [showModal, setShowModal] = useState(false)

  // Check if user is logged in by looking for access token in localStorage
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    return localStorage.getItem('access_token') !== null
  })

  // Check if user is an admin
  const [isAdmin, setIsAdmin] = useState(() => {
    return localStorage.getItem('is_admin') === 'true'
  })

  // State for storing stories fetched from the API
  const [stories, setStories] = useState([])

  // State for loading status
  const [loading, setLoading] = useState(true)

  // State for API error messages
  const [error, setError] = useState(null)

  const navigate = useNavigate()
  const location = useLocation()

  // Fetch stories from Django API when component mounts
  useEffect(() => {
    const fetchStories = async () => {
      try {
        const response = await api.get('stories/')
        setStories(response.data)
        setLoading(false)
      } catch (err) {
        console.error("Connection Error:", err)
        setError("Could not load stories. Please try again later.")
        setLoading(false)
      }
    }
    fetchStories()
  }, [])

  // Navigate to a page by name (using useCallback to prevent unnecessary re-renders)
  const setCurrentPage = useCallback((page) => {
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
    if (routes[page]) {
      navigate(routes[page])
    }
  }, [navigate])

  // Scroll to top when page changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [location.pathname])

  // Apply dark theme to body element when isDark changes
  useEffect(() => {
    if (isDark) {
      document.body.setAttribute('data-theme', 'dark')
    } else {
      document.body.removeAttribute('data-theme')
    }
  }, [isDark])

  // Sync login state with localStorage
  // When user logs out, clear all tokens from storage
  useEffect(() => {
    if (isLoggedIn) {
      // User is logged in - token should already be set by LoginPage
    } else {
      // User logged out - clear all authentication tokens
      localStorage.removeItem('access_token')
      localStorage.removeItem('refresh_token')
      localStorage.removeItem('is_admin')
    }
  }, [isLoggedIn])

  // Find the current story object based on selected ID (memoized for performance)
  const currentStory = useMemo(() => {
    return stories.find(story => story.id === selectedStoryId)
  }, [stories, selectedStoryId])

  return (
    <div className="app" dir="rtl">
      {/* Navigation bar with theme and login state */}
      <Navbar
        isDark={isDark}
        setIsDark={setIsDark}
        isLoggedIn={isLoggedIn}
        setIsLoggedIn={setIsLoggedIn}
        isAdmin={isAdmin}
      />

      <main id="app">
        {loading ? (
          // Show loading message while fetching stories
          <div className="loading-screen">جاري تحميل القصص من الخادم...</div>
        ) : error ? (
          // Show error message if API fails
          <div className="loading-screen">{error}</div>
        ) : (
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<HomePage setCurrentPage={setCurrentPage} />} />
            <Route path="/about" element={<AboutPage />} />

            {/* Protected route: Library (requires login) */}
            <Route
              path="/library"
              element={
                isLoggedIn ? (
                  <LibraryPage
                    stories={stories}
                    setCurrentPage={setCurrentPage}
                    setSelectedStoryId={setSelectedStoryId}
                  />
                ) : (
                  <Navigate to="/login" />
                )
              }
            />

            {/* Protected route: Account (requires login) */}
            <Route
              path="/account"
              element={isLoggedIn ? <AccountPage /> : <Navigate to="/login" />}
            />

            {/* Auth routes */}
            <Route
              path="/login"
              element={
                <LoginPage setIsLoggedIn={setIsLoggedIn} setIsAdmin={setIsAdmin} />
              }
            />
            <Route
              path="/signup"
              element={
                <SignupPage
                  setCurrentPage={setCurrentPage}
                  setIsLoggedIn={setIsLoggedIn}
                />
              }
            />

            {/* Admin route: Add new story (requires admin role) */}
            <Route
              path="/admin/add-story"
              element={
                isAdmin ? (
                  <AddStoryPage setCurrentPage={setCurrentPage} />
                ) : (
                  <Navigate to="/library" />
                )
              }
            />

            {/* Story details page (requires a selected story) */}
            <Route
              path="/story"
              element={
                currentStory ? (
                  <StoryPage
                    story={currentStory}
                    setCurrentPage={setCurrentPage}
                    setShowModal={setShowModal}
                    setSelectedStoryId={setSelectedStoryId}
                  />
                ) : (
                  <Navigate to="/library" />
                )
              }
            />

            {/* Reader page for reading the story content */}
            <Route
              path="/reader"
              element={
                currentStory ? (
                  <ReaderPage story={currentStory} setCurrentPage={setCurrentPage} />
                ) : (
                  <Navigate to="/library" />
                )
              }
            />
          </Routes>
        )}
      </main>

      {/* Footer and reward modal */}
      <Footer />

      <RewardModal
        showModal={showModal}
        setShowModal={setShowModal}
        setCurrentPage={setCurrentPage}
      />
    </div>
  )
}

// App wrapper with BrowserRouter for routing functionality
function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  )
}

export default App