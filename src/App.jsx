// Main App Component
import { useState, useEffect } from 'react'
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

// Main App Component
function App() {
  const [currentPage, setCurrentPage] = useState('home')
  const [selectedStoryId, setSelectedStoryId] = useState(1)
  const [isDark, setIsDark] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  useEffect(() => {
    if (isDark) {
      document.body.setAttribute('data-theme', 'dark')
    } else {
      document.body.removeAttribute('data-theme')
    }
  }, [isDark])

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [currentPage])

  return (
    <div className="app" dir="rtl">
      <Navbar 
        currentPage={currentPage} 
        setCurrentPage={setCurrentPage} 
        isDark={isDark} 
        setIsDark={setIsDark}
        isLoggedIn={isLoggedIn}
        setIsLoggedIn={setIsLoggedIn}
      />

      <main id="app">
        {/* Page Routing */}
        {currentPage === 'home' && <HomePage setCurrentPage={setCurrentPage} />}
        {currentPage === 'about' && <AboutPage />}
        {currentPage === 'library' && <LibraryPage setCurrentPage={setCurrentPage} setSelectedStoryId={setSelectedStoryId} />}
        {currentPage === 'account' && <AccountPage />}
        
        {/* Authentication Pages */}
        {currentPage === 'login' && (
          <LoginPage setCurrentPage={setCurrentPage} setIsLoggedIn={setIsLoggedIn} />
        )}
        {currentPage === 'signup' && (
          <SignupPage setCurrentPage={setCurrentPage} setIsLoggedIn={setIsLoggedIn} />
        )}
        
        {/* All Pages - No login required */}
        {currentPage === 'story' && <StoryPage setCurrentPage={setCurrentPage} setShowModal={setShowModal} setSelectedStoryId={setSelectedStoryId} />}
        {currentPage === 'reader' && <ReaderPage setCurrentPage={setCurrentPage} storyId={selectedStoryId} />}
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

export default App

