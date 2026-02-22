import { useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import { useCart } from '../context/CartContext';

function Header({ onOpenCart, onOpenLogin, onOpenSignup, isLoggedIn, onLogout, onNavigate, isAdmin, onToggleAdmin }) {
  const { isDarkMode, toggleDarkMode } = useTheme();
  const { cart } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const handleNavigate = (page) => {
    onNavigate(page);
    setMobileMenuOpen(false);
  };

  return (
    <header>
      <div className="header-right">
        <button className="logo" onClick={() => handleNavigate('home')}>
          <i className="fa-solid fa-wand-magic-sparkles"></i> سوبر <span>قيّم</span>
        </button>

        <nav className="main-nav">

        <button className="video-source-btn text-right" onClick={() => handleNavigate('videos')}> كتب الفيديو
        <i className="fa-solid fa-book-open"></i>
        </button>

          {isAdmin && (
            <button 
              className="nav-link admin-active"
              onClick={onToggleAdmin}
            >
              <i className="fa-solid fa-shield-alt"></i> المسؤول
            </button>
          )}
        </nav>
      </div>
      
      <div className="header-actions">
        <button className="icon-btn" onClick={toggleDarkMode}>
          <i className={`fa-solid ${isDarkMode ? 'fa-sun' : 'fa-moon'}`}></i>
        </button>
        
        {isLoggedIn ? (
          <div className="user-menu">
            <button className="user-btn" onClick={() => setUserMenuOpen(!userMenuOpen)}>
              <i className="fa-solid fa-user-circle"></i>
            </button>
            {userMenuOpen && (
              <div className="user-dropdown">
                <button className="logout-btn" onClick={() => { onLogout(); setUserMenuOpen(false); }}>
                  <i className="fa-solid fa-sign-out-alt"></i> تسجيل الخروج
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="auth-buttons">
            <button className="login-btn" onClick={onOpenLogin}>
              <i className="fa-solid fa-sign-in-alt"></i> تسجيل الدخول
            </button>
            <button className="signup-btn" onClick={onOpenSignup}>
              إنشاء حساب
            </button>
          </div>
        )}
        
        <button className="cart-btn" onClick={onOpenCart}>
          <i className="fa-solid fa-cart-shopping"></i> السلة <span className="cart-count">{cart.length}</span>
        </button>
        <div className="mobile-menu-btn">
          <button className="video-source-btn-mobile" onClick={() => handleNavigate('videos')}>
            <i className="fa-solid fa-book-open "></i> كتب الفيديو
          </button>
        </div>
      </div>

    </header>
  );
}

export default Header;
