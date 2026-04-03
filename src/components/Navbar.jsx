// Navigation Component - Top navigation bar
import { Link, useNavigate, useLocation } from 'react-router-dom'

function Navbar({ isDark, setIsDark, isLoggedIn, setIsLoggedIn, isAdmin }) {
  const navigate = useNavigate()
  const location = useLocation()
  const currentPath = location.pathname

  // Handle user logout
  const handleLogout = () => {
    setIsLoggedIn(false)
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    localStorage.removeItem('is_admin')
    navigate('/login')
  }

  // Scroll to section on home page or navigate first
  const handleScrollTo = (id) => {
    if (currentPath !== '/') {
      navigate('/')
      setTimeout(() => {
        document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
      }, 100)
    } else {
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <nav>
      <div className="container nav-container">
        {/* Logo */}
        <Link to="/" className="logo">
          سوبر <span>قيم</span>
        </Link>

        {/* Navigation Links */}
        <ul className="nav-links">
          <li>
            <Link to="/" className={currentPath === '/' ? 'active' : ''}>
              الرئيسية
            </Link>
          </li>

          <li onClick={() => handleScrollTo('stories')}>
            قصصنا
          </li>

          {/* Links for logged-in users */}
          {isLoggedIn && (
            <>
              <li>
                <Link to="/library" className={currentPath === '/library' ? 'active' : ''}>
                  مكتبتي
                </Link>
              </li>

              {/* Admin-only link */}
              {isAdmin && (
                <li>
                  <Link
                    to="/admin/add-story"
                    className={currentPath === '/admin/add-story' ? 'active nav-admin-link' : 'nav-admin-link'}
                  >
                    ➕ إضافة قصة
                  </Link>
                </li>
              )}

              <li>
                <Link to="/account" className={currentPath === '/account' ? 'active' : ''}>
                  حسابي
                </Link>
              </li>
            </>
          )}

          <li>
            <Link to="/about" className={currentPath === '/about' ? 'active' : ''}>
              من نحن
            </Link>
          </li>
        </ul>

        {/* Theme Toggle and Auth Buttons */}
        <div className="nav-actions">
          <button
            className="theme-toggle"
            onClick={() => setIsDark(!isDark)}
            title="تغيير المظهر"
          >
            {isDark ? '☀️' : '🌙'}
          </button>

          {isLoggedIn ? (
            <button className="btn btn-outline" onClick={handleLogout}>
              تسجيل خروج
            </button>
          ) : (
            <>
              <button className="btn btn-outline" onClick={() => navigate('/signup')}>
                إنشاء حساب
              </button>
              <button className="btn btn-primary" onClick={() => navigate('/login')}>
                تسجيل دخول
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}

export default Navbar