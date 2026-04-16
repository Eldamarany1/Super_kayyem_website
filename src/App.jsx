// ============================================================
//  App.jsx — Root Component
//  Handles routing, global state (theme, auth), and layout
// ============================================================
import { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, useNavigate, useLocation, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import './App.css'

// Pages
import HomePage    from './pages/HomePage'
import LibraryPage from './pages/LibraryPage'
import AccountPage from './pages/AccountPage'
import LoginPage   from './pages/LoginPage'
import SignupPage  from './pages/SignupPage'
import StoryPage   from './pages/StoryPage'
import ReaderPage  from './pages/ReaderPage'

// Components
import Navbar      from './components/Navbar'
import Footer      from './components/Footer'
import RewardModal from './components/RewardModal'

// ──────────────────────────────────────────────
//  Inner App (needs Router context for hooks)
// ──────────────────────────────────────────────
function AppContent() {
  const [selectedStoryId, setSelectedStoryId] = useState(1)
  const [isDark,          setIsDark]          = useState(false)
  const [showModal,       setShowModal]       = useState(false)

  const { isLoggedIn } = useAuth()

  const navigate  = useNavigate()
  const location  = useLocation()

  // String-based navigation helper used by child pages
  const setCurrentPage = (page) => {
    const routes = {
      home:    '/',
      library: '/library',
      account: '/account',
      login:   '/login',
      signup:  '/signup',
      story:   '/story',
      reader:  '/reader',
    }
    if (routes[page]) navigate(routes[page])
  }

  // Scroll to top on every route change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [location.pathname])

  // Apply / remove dark-theme attribute on <body>
  useEffect(() => {
    document.body.setAttribute('data-theme', isDark ? 'dark' : 'light')
  }, [isDark])

  return (
    <div className="app" dir="rtl">
      <Navbar
        isDark={isDark}
        setIsDark={setIsDark}
        isLoggedIn={isLoggedIn}
      />

      <main>
        <Routes>
          {/* Public */}
          <Route path="/"      element={<HomePage setCurrentPage={setCurrentPage} />} />
          <Route path="/story" element={<StoryPage setCurrentPage={setCurrentPage} setShowModal={setShowModal} selectedStoryId={selectedStoryId} setSelectedStoryId={setSelectedStoryId} />} />

          {/* Auth */}
          <Route path="/login"  element={<LoginPage  setCurrentPage={setCurrentPage} />} />
          <Route path="/signup" element={<SignupPage setCurrentPage={setCurrentPage} />} />

          {/* Protected — redirect to /login if not logged in */}
          <Route path="/library" element={
            isLoggedIn
              ? <LibraryPage setCurrentPage={setCurrentPage} setSelectedStoryId={setSelectedStoryId} />
              : <Navigate to="/login" />
          } />
          <Route path="/account" element={
            isLoggedIn ? <AccountPage /> : <Navigate to="/login" />
          } />
          <Route path="/reader" element={
            <ReaderPage setCurrentPage={setCurrentPage} storyId={selectedStoryId} />
          } />
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

// ──────────────────────────────────────────────
//  Root — wraps everything in BrowserRouter
// ──────────────────────────────────────────────
function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App