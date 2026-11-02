// ============================================================
//  Navbar.jsx — Clean Responsive Navigation Bar
//  Routes: Home (/), Library (/library)
//  Zero cart, zero auth, zero admin links.
// ============================================================
import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import ThemeToggle from '../ui/ThemeToggle';
import '../../styles/Navbar.css';

export function Navbar() {
  const location = useLocation();
  const currentPath = location.pathname;
  const [menuOpen, setMenuOpen] = useState(false);

  const closeMenu = () => setMenuOpen(false);

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
            <li className="nav-auth-mobile">
              <Link to="/login" className="btn btn-sec nav-auth-btn-mobile" onClick={closeMenu}>تسجيل الدخول</Link>
              <Link to="/signup" className="btn btn-primary nav-auth-btn-mobile" onClick={closeMenu}>إنشاء حساب</Link>
              <ThemeToggle />
            </li>
          </ul>

          {/* Desktop Controls: Auth and Theme */}
          <div className="nav-controls">
                      <Link to="/login" className="btn btn-sec nav-auth-btn" onClick={closeMenu}>تسجيل الدخول</Link>
            <Link to="/signup" className="btn btn-primary nav-auth-btn" onClick={closeMenu}>إنشاء حساب</Link>
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
