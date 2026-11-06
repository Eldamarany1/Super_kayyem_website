// ============================================================
//  Navbar.jsx — Clean Responsive Navigation Bar
//  Routes: Home (/), Library (/library)
//  Zero cart, zero auth, zero admin links.
// ============================================================
import { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import ThemeToggle from '../ui/ThemeToggle';
import { useAuth } from '../../context/AuthContext';
import '../../styles/Navbar.css';

export function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const currentPath = location.pathname;
  const [menuOpen, setMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef(null);

  const { user, isAuthenticated, logout } = useAuth();

  const closeMenu = () => {
    setMenuOpen(false);
    setUserMenuOpen(false);
  };

  const handleLogout = () => {
    logout();
    closeMenu();
    navigate('/');
  };

  // Close user dropdown if clicked outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setUserMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const avatarUrl = user?.profilePictureUrl || user?.avatarUrl;
  const displayName = user?.firstName ? `${user.firstName} ${user?.lastName || ''}`.trim() : 'المستخدم';

  return (
    <header className="navbar-wrapper">
      <nav aria-label="التنقل الرئيسي">
        <div className="container nav-container">
          {/* Brand Logo */}
          <Link to="/" className="logo" onClick={closeMenu} aria-label="الصفحة الرئيسية لسوبر قيم">
            سوبر <span>قيم</span>
          </Link>

          {/* Navigation Links */}
          <ul className={`nav-links ${menuOpen ? 'nav-links--open' : ''}`}>
            <li>
              <Link
                to="/"
                className={currentPath === '/' ? 'active' : ''}
                onClick={closeMenu}
              >
                الرئيسية
              </Link>
            </li>
            <li>
              <Link
                to="/library"
                className={currentPath === '/library' ? 'active' : ''}
                onClick={closeMenu}
              >
                قصصنا
              </Link>
            </li>
            <li>
              <Link
                to="/articles"
                className={currentPath.startsWith('/articles') ? 'active' : ''}
                onClick={closeMenu}
              >
                مقالات توعوية للآباء
              </Link>
            </li>

            {/* Mobile Auth Section */}
            <li className="nav-auth-mobile">
              {isAuthenticated ? (
                <div className="mobile-user-box">
                  <div className="d-flex align-items-center gap-2 mb-2">
                    {avatarUrl ? (
                      <img src={avatarUrl} alt={displayName} className="nav-user-avatar" />
                    ) : (
                      <div className="nav-user-avatar-placeholder">
                        {user.firstName ? user.firstName.charAt(0) : '👤'}
                      </div>
                    )}
                    <span className="fw-bold">{displayName}</span>
                  </div>
                  <Link to="/profile" className="btn btn-outline-primary w-100 mb-2" onClick={closeMenu}>
                    الملف الشخصي
                  </Link>
                  <button type="button" className="btn btn-outline-danger w-100 mb-2" onClick={handleLogout}>
                    تسجيل الخروج
                  </button>
                  <ThemeToggle />
                </div>
              ) : (
                <>
                  <Link to="/login" className="btn btn-sec nav-auth-btn-mobile" onClick={closeMenu}>
                    تسجيل الدخول
                  </Link>
                  <Link to="/signup" className="btn btn-primary nav-auth-btn-mobile" onClick={closeMenu}>
                    إنشاء حساب
                  </Link>
                  <ThemeToggle />
                </>
              )}
            </li>
          </ul>

          {/* Desktop Controls: Auth and Theme */}
          <div className="nav-controls">
            {isAuthenticated ? (
              <div className="nav-user-dropdown-container" ref={userMenuRef}>
                <button
                  type="button"
                  className="nav-user-btn"
                  onClick={() => setUserMenuOpen((prev) => !prev)}
                  aria-expanded={userMenuOpen}
                >
                  {avatarUrl ? (
                    <img src={avatarUrl} alt={displayName} className="nav-user-avatar" />
                  ) : (
                    <div className="nav-user-avatar-placeholder">
                      {user.firstName ? user.firstName.charAt(0) : '👤'}
                    </div>
                  )}
                  <span className="nav-user-name">{displayName}</span>
                  <span className="nav-chevron">▾</span>
                </button>

                {userMenuOpen && (
                  <div className="nav-user-dropdown-menu">
                    <div className="nav-dropdown-header">
                      <strong>{displayName}</strong>
                      <small className="text-secondary d-block">{user.email}</small>
                    </div>
                    <hr className="my-1" />
                    <Link to="/profile" className="nav-dropdown-item" onClick={closeMenu}>
                      ⚙️ الملف الشخصي
                    </Link>
                    <Link to="/library" className="nav-dropdown-item" onClick={closeMenu}>
                      📚 مكتبة القصص
                    </Link>
                    <Link to="/articles" className="nav-dropdown-item" onClick={closeMenu}>
                      📝 مقالات الآباء
                    </Link>
                    <hr className="my-1" />
                    <button type="button" className="nav-dropdown-item text-danger" onClick={handleLogout}>
                      🚪 تسجيل الخروج
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link to="/login" className="btn btn-sec nav-auth-btn" onClick={closeMenu}>
                  تسجيل الدخول
                </Link>
                <Link to="/signup" className="btn btn-primary nav-auth-btn" onClick={closeMenu}>
                  إنشاء حساب
                </Link>
              </>
            )}

            <ThemeToggle />
          </div>

          {/* Mobile Menu Toggle (Hamburger) */}
          <button
            type="button"
            className={`hamburger ${menuOpen ? 'hamburger--open' : ''}`}
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label={menuOpen ? 'إغلاق القائمة' : 'فتح القائمة'}
            aria-expanded={menuOpen}
          >
            <span /><span /><span />
          </button>
        </div>

        {menuOpen && (
          <div
            className="nav-backdrop"
            onClick={closeMenu}
            aria-hidden="true"
          />
        )}
      </nav>
    </header>
  );
}

export default Navbar;
