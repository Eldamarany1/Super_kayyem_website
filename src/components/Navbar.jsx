// ============================================================
//  Navbar.jsx — Responsive Navigation Bar
//  Routes:
//    /library    → قصصنا  (public story store)
//    /my-library → مكتبتي (user's personal purchased books)
// ============================================================
import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import CheckoutModal from './CheckoutModal';
import '../styles/Navbar.css';

function Navbar({ isDark, setIsDark }) {
  const navigate    = useNavigate();
  const location    = useLocation();
  const currentPath = location.pathname;

  const [menuOpen,      setMenuOpen]      = useState(false);
  const [cartOpen,      setCartOpen]      = useState(false);
  const [checkoutItems, setCheckoutItems] = useState(null);
  const cartDrawerRef = useRef(null);

  const { isLoggedIn, user, logout } = useAuth();
  const { items, cartTotal, removeFromCart } = useCart();

  const isAdmin = user?.role === 'Admin';

  const handleLogout = () => { logout(); setMenuOpen(false); };

  const handleScrollTo = (id) => {
    setMenuOpen(false);
    if (currentPath !== '/') {
      navigate('/');
      setTimeout(() => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' }), 150);
    } else {
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const closeMenu = () => setMenuOpen(false);

  // Close cart drawer on outside click
  useEffect(() => {
    const handler = (e) => {
      if (cartOpen && cartDrawerRef.current && !cartDrawerRef.current.contains(e.target)) {
        setCartOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [cartOpen]);

  // Lock body scroll while cart is open
  useEffect(() => {
    document.body.style.overflow = cartOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [cartOpen]);

  const handleBuyAll = () => {
    if (items.length === 0) return;
    setCartOpen(false);
    setCheckoutItems([...items]);
  };

  return (
    <>
      <nav>
        <div className="container nav-container">

          {/* Logo */}
          <Link to="/" className="logo" onClick={closeMenu}>
            سوبر <span>قيم</span>
          </Link>

          {/* Nav links */}
          <ul className={`nav-links ${menuOpen ? 'nav-links--open' : ''}`}>
            <li>
              <Link to="/" className={currentPath === '/' ? 'active' : ''} onClick={closeMenu}>
                الرئيسية
              </Link>
            </li>

            {/* قصصنا → PUBLIC store at /library */}
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
                to="/parents"
                className={currentPath === '/parents' ? 'active' : ''}
                onClick={closeMenu}
              >
                للآباء
              </Link>
            </li>

            {/* Authenticated non-admin user links */}
            {isLoggedIn && !isAdmin && (
              <>
                {/* مكتبتي → PERSONAL purchases at /my-library */}
                <li>
                  <Link
                    to="/my-library"
                    className={currentPath === '/my-library' ? 'active' : ''}
                    onClick={closeMenu}
                  >
                    مكتبتي
                  </Link>
                </li>
                <li>
                  <Link
                    to="/account"
                    className={currentPath === '/account' ? 'active' : ''}
                    onClick={closeMenu}
                  >
                    حسابي
                  </Link>
                </li>
              </>
            )}

            {/* Admin quick links */}
            {isAdmin && (
              <>
                <li>
                  <Link
                    to="/admin"
                    className={currentPath.startsWith('/admin') ? 'active' : ''}
                    onClick={closeMenu}
                  >
                    📊 لوحة التحكم
                  </Link>
                </li>
                <li>
                  <Link
                    to="/admin/stories/new"
                    className={currentPath === '/admin/stories/new' ? 'active' : ''}
                    onClick={closeMenu}
                  >
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
                  <button className="btn btn-outline" onClick={() => { navigate('/signup'); closeMenu(); }}>إنشاء حساب</button>
                  <button className="btn btn-primary"  onClick={() => { navigate('/login');  closeMenu(); }}>تسجيل دخول</button>
                </>
              )}
            </li>
          </ul>

          {/* Desktop-only controls */}
          <div className="nav-controls">
            <button className="theme-toggle" onClick={() => setIsDark(!isDark)} title="تغيير المظهر">
              {isDark ? '☀️' : '🌙'}
            </button>

            {/* Cart Icon + Badge */}
            <button
              id="navbar-cart-btn"
              onClick={() => setCartOpen(true)}
              aria-label="عربة التسوق"
              className="navbar-cart-btn"
            >
              🛒
              {items.length > 0 && (
                <span className="navbar-cart-badge">{items.length}</span>
              )}
            </button>

            {isAdmin && (
              <button
                id="nav-add-story-btn"
                className="btn btn-yellow navbar-add-story-btn"
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

      {/* ── Cart Backdrop */}
      <div
        onClick={() => setCartOpen(false)}
        className={`cart-backdrop ${cartOpen ? 'cart-backdrop--visible' : 'cart-backdrop--hidden'}`}
      />

      {/* ── Cart Drawer */}
      <div
        ref={cartDrawerRef}
        dir="rtl"
        className={`cart-drawer ${cartOpen ? 'cart-drawer--open' : 'cart-drawer--closed'}`}
      >
        {/* Drawer Header */}
        <div className="cart-drawer__header">
          <div className="cart-drawer__header-left">
            <span className="cart-drawer__header-icon">🛒</span>
            <h2 className="cart-drawer__title">سلة التسوق</h2>
          </div>
          <div className="cart-drawer__header-right">
            {items.length > 0 && (
              <span className="cart-drawer__count-badge">{items.length} قصة</span>
            )}
            <button
              onClick={() => setCartOpen(false)}
              className="cart-drawer__close-btn"
              aria-label="إغلاق السلة"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Drawer Body */}
        <div className="cart-drawer__body">
          {items.length === 0 ? (
            <div className="cart-empty">
              <span className="cart-empty__icon">🛒</span>
              <p className="cart-empty__title">سلتك فارغة</p>
              <p className="cart-empty__sub">تصفح مكتبتنا وأضف قصصًا رائعة</p>
              <button
                className="btn btn-primary cart-empty__cta"
                onClick={() => { setCartOpen(false); navigate('/library'); }}
              >
                تصفح القصص
              </button>
            </div>
          ) : (
            <div className="cart-items">
              {items.map((story) => (
                <div key={story.id} className="cart-item">
                  {/* Thumbnail */}
                  <div className="cart-item__thumb">
                    {story.coverUrl ? (
                      <img
                        src={story.coverUrl}
                        alt={story.title}
                        className="cart-item__thumb-img"
                      />
                    ) : (
                      <span className="cart-item__thumb-placeholder">📖</span>
                    )}
                  </div>

                  {/* Info */}
                  <div className="cart-item__info">
                    <p className="cart-item__title">{story.title}</p>
                    <span className="cart-item__price">
                      {parseFloat(story.price).toFixed(2)} ج.م
                    </span>
                  </div>

                  {/* Remove */}
                  <button
                    onClick={() => removeFromCart(story.id)}
                    title="إزالة"
                    className="cart-item__remove-btn"
                    aria-label="إزالة من السلة"
                  >
                    🗑️
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Drawer Footer */}
        {items.length > 0 && (
          <div className="cart-drawer__footer">
            <div className="cart-total-row">
              <span className="cart-total-row__label">إجمالي السعر</span>
              <span className="cart-total-row__value">{cartTotal.toFixed(2)} ج.م</span>
            </div>
            <button
              id="cart-buy-all-btn"
              onClick={handleBuyAll}
              className="cart-buy-all-btn"
            >
              <span>💳</span>
              شراء الكل ({items.length} قصص)
            </button>
          </div>
        )}
      </div>

      {/* Checkout modal triggered from cart "Buy All" */}
      {checkoutItems && (
        <CheckoutModal
          items={checkoutItems}
          onClose={() => setCheckoutItems(null)}
        />
      )}
    </>
  );
}

export default Navbar;