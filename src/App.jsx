// ============================================================
//  App.jsx — Root Component
//  Handles routing, global state (theme, auth), and layout
// ============================================================
import { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, useNavigate, useLocation, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import { CartProvider } from './context/CartContext'
import './App.css'

// Pages — public
import HomePage        from './pages/HomePage'
import LibraryPage     from './pages/LibraryPage'
import MyLibraryPage  from './pages/MyLibraryPage'
import AccountPage     from './pages/AccountPage'
import LoginPage       from './pages/LoginPage'
import SignupPage      from './pages/SignupPage'
import StoryPage       from './pages/StoryPage'
import ParentsPage     from './pages/ParentsPage'

// Pages — reader
import FlipbookReader  from './pages/FlipbookReader'

// Pages — admin
import AdminLayout     from './pages/admin/AdminLayout'
import Dashboard       from './pages/admin/Dashboard'
import StoryEditor     from './pages/admin/StoryEditor'
import AdminParentsArticles from './pages/admin/AdminParentsArticles'

// Components
import Navbar          from './components/Navbar'
import Footer          from './components/Footer'
import RewardModal     from './components/RewardModal'

// ──────────────────────────────────────────────
//  Inner App (needs Router context for hooks)
// ──────────────────────────────────────────────
function AppContent() {
  const [selectedStoryId, setSelectedStoryId] = useState(null)
  const [isDark,          setIsDark]          = useState(false)
  const [showModal,       setShowModal]       = useState(false)

  const { isLoggedIn } = useAuth()

  const navigate  = useNavigate()
  const location  = useLocation()

  // Hide Navbar/Footer on the admin section and the fullscreen reader
  const isAdminRoute  = location.pathname.startsWith('/admin')
  const isReaderRoute = location.pathname.startsWith('/reader')
  const hideShell = isAdminRoute || isReaderRoute

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
      {!hideShell && (
        <Navbar
          isDark={isDark}
          setIsDark={setIsDark}
          isLoggedIn={isLoggedIn}
        />
      )}

      <main>
        <Routes>
          {/* ── Public ────────────────────────────────────── */}
          <Route path="/"      element={<HomePage setCurrentPage={setCurrentPage} />} />
          <Route path="/parents" element={<ParentsPage />} />
          <Route path="/story" element={
            <StoryPage
              setCurrentPage={setCurrentPage}
              setShowModal={setShowModal}
              selectedStoryId={selectedStoryId}
              setSelectedStoryId={setSelectedStoryId}
            />
          } />

          {/* ── Auth ──────────────────────────────────────── */}
          <Route path="/login"  element={<LoginPage  setCurrentPage={setCurrentPage} />} />
          <Route path="/signup" element={<SignupPage setCurrentPage={setCurrentPage} />} />

          {/* ── Protected user routes ─────────────────────── */}
          <Route path="/library" element={
            isLoggedIn
              ? <LibraryPage setCurrentPage={setCurrentPage} setSelectedStoryId={setSelectedStoryId} />
              : <Navigate to="/login" />
          } />
          <Route path="/my-library" element={
            isLoggedIn ? <MyLibraryPage /> : <Navigate to="/login" />
          } />
          <Route path="/account" element={
            isLoggedIn ? <AccountPage /> : <Navigate to="/login" />
          } />

          {/* ── Flipbook reader ───────────────────────────── */}
          {/* /reader/:id — id comes from URL params in FlipbookReader */}
          <Route path="/reader/:id" element={<FlipbookReader />} />
          {/* Legacy /reader route without id — redirect back */}
          <Route path="/reader" element={<Navigate to="/" />} />

          {/* ── Admin section (nested routes) ─────────────── */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route index          element={<Dashboard />} />
            <Route path="stories/new" element={<StoryEditor />} />
            {/* Placeholder routes — add full pages as needed */}
            <Route path="stories"     element={<Dashboard />} />
            <Route path="users"       element={<Dashboard />} />
            <Route path="transactions" element={<Dashboard />} />
            <Route path="discounts"   element={<Dashboard />} />
            <Route path="cms"         element={<Dashboard />} />
            <Route path="parents-articles" element={<AdminParentsArticles />} />
          </Route>
        </Routes>
      </main>

      {!hideShell && <Footer />}

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
        <CartProvider>
          <AppContent />
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App