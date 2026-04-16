// ============================================================
//  Navbar.jsx — Responsive Navigation Bar
//  Includes: logo, nav links, theme toggle, auth buttons,
//            admin quick-links, and a hamburger menu for mobile.
// ============================================================
import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

function Navbar({ isDark, setIsDark }) {
  const navigate    = useNavigate()
  const location    = useLocation()
  const currentPath = location.pathname
  const [menuOpen, setMenuOpen] = useState(false)
  const { isLoggedIn, user, logout } = useAuth()

  const isAdmin = user?.role === 'Admin'

  const handleLogout = () => { logout(); setMenuOpen(false) }

  const handleScrollTo = (id) => {
    setMenuOpen(false)
    if (currentPath !== '/') {
      navigate('/')
      setTimeout(() => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' }), 150)
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

        {/* Nav links — desktop + mobile panel */}
        <ul className={`nav-links ${menuOpen ? 'nav-links--open' : ''}`}>
          <li>
            <Link to="/" className={currentPath === '/' ? 'active' : ''} onClick={closeMenu}>الرئيسية</Link>
          </li>
          <li onClick={() => handleScrollTo('stories')}>قصصنا</li>
          <li onClick={() => handleScrollTo('parents')}>للآباء</li>

          {isLoggedIn && !isAdmin && (
            <>
              <li>
                <Link to="/library" className={currentPath === '/library' ? 'active' : ''} onClick={closeMenu}>مكتبتي</Link>
              </li>
              <li>
                <Link to="/account" className={currentPath === '/account' ? 'active' : ''} onClick={closeMenu}>حسابي</Link>
              </li>
            </>
          )}

          {/* Admin quick links */}
          {isAdmin && (
            <>
              <li>
                <Link to="/admin" className={currentPath.startsWith('/admin') ? 'active' : ''} onClick={closeMenu}>
                  📊 لوحة التحكم
                </Link>
              </li>
              <li>
                <Link to="/admin/stories/new" className={currentPath === '/admin/stories/new' ? 'active' : ''} onClick={closeMenu}>
                  ✏️ إضافة قصة
                </Link>
              </li>
            </>
          )}

          {/* Auth buttons inside mobile menu */}
          <li className="nav-auth-mobile">
            <button className="theme-toggle" onClick={() => setIsDark(!isDark)} title="تغيير المظهر">
              {isDark ? '☀️' : '🌙'}
            </button>
            {isLoggedIn ? (
              <button className="btn btn-outline" onClick={handleLogout}>تسجيل خروج</button>
            ) : (
              <>
                <button className="btn btn-outline" onClick={() => { navigate('/signup'); closeMenu() }}>إنشاء حساب</button>
                <button className="btn btn-primary"  onClick={() => { navigate('/login');  closeMenu() }}>تسجيل دخول</button>
              </>
            )}
          </li>
        </ul>

        {/* Desktop-only controls */}
        <div className="nav-controls" style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <button className="theme-toggle" onClick={() => setIsDark(!isDark)} title="تغيير المظهر">
            {isDark ? '☀️' : '🌙'}
          </button>

          {isAdmin && (
            <button
              id="nav-add-story-btn"
              className="btn btn-yellow"
              style={{ padding: '8px 16px', fontSize: '0.9rem' }}
              onClick={() => navigate('/admin/stories/new')}
            >
              ✏️ إضافة قصة
            </button>
          )}

          {isLoggedIn ? (
            <button className="btn btn-outline" onClick={handleLogout}>تسجيل خروج</button>
          ) : (
            <>
              <button className="btn btn-outline" onClick={() => navigate('/signup')}>إنشاء حساب</button>
              <button className="btn btn-primary"  onClick={() => navigate('/login')}>تسجيل دخول</button>
            </>
          )}
        </div>

        {/* Hamburger (mobile only) */}
        <button
          className={`hamburger ${menuOpen ? 'hamburger--open' : ''}`}
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="فتح القائمة"
        >
          <span /><span /><span />
        </button>

      </div>

      {menuOpen && <div className="nav-backdrop" onClick={closeMenu} />}
    </nav>
  )
}

export default Navbar