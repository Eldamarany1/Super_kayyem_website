// ============================================================
//  Navbar.jsx — Responsive Navigation Bar
//  Includes: logo, nav links, theme toggle, auth buttons,
//            and a hamburger menu for mobile screens.
// ============================================================
import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'

import { useAuth } from '../context/AuthContext'

function Navbar({ isDark, setIsDark }) {
  const navigate     = useNavigate()
  const location     = useLocation()
  const currentPath  = location.pathname
  const [menuOpen, setMenuOpen] = useState(false)
  const { isLoggedIn, logout } = useAuth()

  // Log out and redirect
  const handleLogout = () => {
    logout()
    setMenuOpen(false)
  }

  // Scroll to a section on the homepage; navigate there first if needed
  const handleScrollTo = (id) => {
    setMenuOpen(false)
    if (currentPath !== '/') {
      navigate('/')
      setTimeout(() => {
        document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
      }, 150)
    } else {
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
    }
  }

  const closeMenu = () => setMenuOpen(false)

  return (
    <nav>
      <div className="container nav-container">

        {/* Logo */}
        <Link to="/" className="logo" onClick={closeMenu}>
          سوبر <span>قيم</span>
        </Link>

        {/* Desktop nav links */}
        <ul className={`nav-links ${menuOpen ? 'nav-links--open' : ''}`}>
          <li>
            <Link to="/" className={currentPath === '/' ? 'active' : ''} onClick={closeMenu}>
              الرئيسية
            </Link>
          </li>
          <li onClick={() => handleScrollTo('stories')}>قصصنا</li>
          <li onClick={() => handleScrollTo('parents')}>للآباء</li>

          {isLoggedIn && (
            <>
              <li>
                <Link to="/library" className={currentPath === '/library' ? 'active' : ''} onClick={closeMenu}>
                  مكتبتي
                </Link>
              </li>
              <li>
                <Link to="/account" className={currentPath === '/account' ? 'active' : ''} onClick={closeMenu}>
                  حسابي
                </Link>
              </li>
            </>
          )}

          {/* Auth buttons rendered inside the mobile menu */}
          <li className="nav-auth-mobile">
            <button className="theme-toggle" onClick={() => setIsDark(!isDark)} title="تغيير المظهر">
              {isDark ? '☀️' : '🌙'}
            </button>
            {isLoggedIn ? (
              <button className="btn btn-outline" onClick={handleLogout}>تسجيل خروج</button>
            ) : (
              <>
                <button className="btn btn-outline" onClick={() => { navigate('/signup'); closeMenu() }}>إنشاء حساب</button>
                <button className="btn btn-primary" onClick={() => { navigate('/login'); closeMenu() }}>تسجيل دخول</button>
              </>
            )}
          </li>
        </ul>

        {/* Desktop-only controls (theme + auth) */}
        <div className="nav-controls">
          <button className="theme-toggle" onClick={() => setIsDark(!isDark)} title="تغيير المظهر">
            {isDark ? '☀️' : '🌙'}
          </button>
          {isLoggedIn ? (
            <button className="btn btn-outline" onClick={handleLogout}>تسجيل خروج</button>
          ) : (
            <>
              <button className="btn btn-outline" onClick={() => navigate('/signup')}>إنشاء حساب</button>
              <button className="btn btn-primary"  onClick={() => navigate('/login')}>تسجيل دخول</button>
            </>
          )}
        </div>

        {/* Hamburger toggle (mobile only) */}
        <button
          className={`hamburger ${menuOpen ? 'hamburger--open' : ''}`}
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="فتح القائمة"
        >
          <span />
          <span />
          <span />
        </button>

      </div>

      {/* Mobile: full-width overlay when open */}
      {menuOpen && <div className="nav-backdrop" onClick={closeMenu} />}
    </nav>
  )
}

export default Navbar