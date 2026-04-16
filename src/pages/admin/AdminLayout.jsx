// =============================================================
//  AdminLayout.jsx — Sidebar-based Admin Shell
//  Route: /admin  (parent for all admin child routes)
//  Guards: redirects to /login if not authenticated as Admin
// =============================================================
import { useState, useEffect } from 'react';
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const NAV_ITEMS = [
  { path: '/admin',                 label: 'لوحة التحكم',  icon: '📊', end: true  },
  { path: '/admin/stories',         label: 'القصص',        icon: '📚', end: false },
  { path: '/admin/stories/new',     label: 'قصة جديدة',   icon: '✏️', end: false },
  { path: '/admin/users',           label: 'المستخدمون',   icon: '👥', end: false },
  { path: '/admin/transactions',    label: 'المعاملات',    icon: '💳', end: false },
  { path: '/admin/discounts',       label: 'رموز الخصم',   icon: '🏷️', end: false },
  { path: '/admin/cms',             label: 'إدارة المحتوى', icon: '🖊️', end: false },
];

export default function AdminLayout() {
  const { user, isLoggedIn, logout } = useAuth();
  const navigate   = useNavigate();
  const location   = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  // ── Auth guard ────────────────────────────────────────────
  useEffect(() => {
    if (!isLoggedIn) { navigate('/login', { replace: true }); return; }
    if (user?.role !== 'Admin') { navigate('/', { replace: true }); }
  }, [isLoggedIn, user, navigate]);

  if (!isLoggedIn || user?.role !== 'Admin') return null;

  return (
    <div className={`admin-shell${collapsed ? ' admin-shell--collapsed' : ''}`} dir="rtl">

      {/* ── Sidebar ────────────────────────────────────────────── */}
      <aside className="admin-sidebar" aria-label="قائمة الإدارة">
        <div className="admin-sidebar__brand">
          {!collapsed && <span className="admin-sidebar__logo">🌟 Super Kayyem</span>}
          <button
            className="admin-sidebar__toggle"
            onClick={() => setCollapsed((c) => !c)}
            aria-label={collapsed ? 'توسيع القائمة' : 'طي القائمة'}
          >
            {collapsed ? '»' : '«'}
          </button>
        </div>

        <nav className="admin-nav">
          <ul className="admin-nav__list">
            {NAV_ITEMS.map(({ path, label, icon, end }) => (
              <li key={path} className="admin-nav__item">
                <NavLink
                  to={path}
                  end={end}
                  className={({ isActive }) =>
                    `admin-nav__link${isActive ? ' admin-nav__link--active' : ''}`
                  }
                  title={collapsed ? label : undefined}
                >
                  <span className="admin-nav__icon" aria-hidden="true">{icon}</span>
                  {!collapsed && <span className="admin-nav__label">{label}</span>}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        <div className="admin-sidebar__footer">
          {!collapsed && (
            <div className="admin-user-chip">
              <span className="admin-user-chip__avatar">
                {user?.fullName?.[0]?.toUpperCase() ?? 'A'}
              </span>
              <div className="admin-user-chip__info">
                <p className="admin-user-chip__name">{user?.fullName}</p>
                <p className="admin-user-chip__role">مشرف</p>
              </div>
            </div>
          )}
          <button
            id="admin-logout-btn"
            className="admin-logout-btn"
            onClick={logout}
            title="تسجيل الخروج"
            aria-label="تسجيل الخروج"
          >
            🚪
          </button>
        </div>
      </aside>

      {/* ── Main content area ──────────────────────────────────── */}
      <div className="admin-content">
        <header className="admin-topbar">
          <h2 className="admin-topbar__title">
            {NAV_ITEMS.find((n) => location.pathname === n.path ||
              (!n.end && location.pathname.startsWith(n.path) && n.path !== '/admin'))?.label
              ?? 'لوحة التحكم'}
          </h2>
          <div className="admin-topbar__actions">
            <button
              className="admin-topbar__new-btn"
              onClick={() => navigate('/admin/stories/new')}
            >
              + قصة جديدة
            </button>
          </div>
        </header>

        <main className="admin-main">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
