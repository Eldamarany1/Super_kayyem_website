// Navigation Component - شريط التنقل
import { Link, useNavigate, useLocation } from 'react-router-dom'

function Navbar({ isDark, setIsDark, isLoggedIn, setIsLoggedIn }) {
  const navigate = useNavigate()
  const location = useLocation()
  const currentPath = location.pathname

  const handleLogout = () => {
    setIsLoggedIn(false)
    navigate('/login')
  }

  const handleScrollTo = (id) => {
    if (currentPath !== '/') {
      navigate('/')
      // Slight delay to ensure the home page DOM is painted before scrolling
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
        <Link to="/" className="logo" style={{ textDecoration: 'none' }}>
          سوبر <span>قيم</span>
        </Link>
        <ul className="nav-links">
          <li>
            <Link to="/" className={currentPath === '/' ? 'active' : ''}>الرئيسية</Link>
          </li>
          <li 
            onClick={() => handleScrollTo('stories')} 
            style={{ cursor: 'pointer' }}
          >
            قصصنا
          </li>
          <li 
            onClick={() => handleScrollTo('parents')} 
            style={{ cursor: 'pointer' }}
          >
            للآباء
          </li>
          <li>
            <Link to="/about" className={currentPath === '/about' ? 'active' : ''}>من نحن</Link>
          </li>
          
          {/* True Conditional Rendering for Protected Routes */}
          {isLoggedIn && (
            <>
              <li>
                <Link to="/library" className={currentPath === '/library' ? 'active' : ''}>مكتبتي</Link>
              </li>
              <li>
                <Link to="/account" className={currentPath === '/account' ? 'active' : ''}>حسابي</Link>
              </li>
            </>
          )}
        </ul>
        <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
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