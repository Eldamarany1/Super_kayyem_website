// Navigation Component - شريط التنقل
function Navbar({ currentPage, setCurrentPage, isDark, setIsDark, isLoggedIn, setIsLoggedIn }) {
  const handleLogout = () => {
    setIsLoggedIn(false)
    setCurrentPage('login')
  }

  return (
    <nav>
      <div className="container nav-container">
        <div className="logo" onClick={() => setCurrentPage('home')}>
          سوبر <span>قيم</span>
        </div>
        <ul className="nav-links">
          <li 
            onClick={() => setCurrentPage('home')} 
            id="nav-home" 
            className={currentPage === 'home' ? 'active' : ''}
          >
            الرئيسية
          </li>
          <li 
            onClick={() => {
              setCurrentPage('home')
              document.getElementById('stories')?.scrollIntoView({ behavior: 'smooth' })
            }} 
            id="nav-stories"
            className={currentPage === 'stories' ? 'active' : ''}
          >
            قصصنا
          </li>
          <li 
            onClick={() => {
              setCurrentPage('home')
              document.getElementById('parents')?.scrollIntoView({ behavior: 'smooth' })
            }} 
            id="nav-parents"
            className={currentPage === 'parents' ? 'active' : ''}
          >
            للآباء
          </li>
          <li 
            onClick={() => setCurrentPage('about')} 
            id="nav-about"
            className={currentPage === 'about' ? 'active' : ''}
          >
            من نحن
          </li>
          {/* Show Library and Account for demo */}
          <li 
            onClick={() => setCurrentPage('library')} 
            id="nav-library"
            className={currentPage === 'library' ? 'active' : ''}
          >
            مكتبتي
          </li>
          <li 
            onClick={() => setCurrentPage('account')} 
            id="nav-account"
            className={currentPage === 'account' ? 'active' : ''}
          >
            حسابي
          </li>
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
              <button className="btn btn-outline" onClick={() => setCurrentPage('signup')}>
                إنشاء حساب
              </button>
              <button className="btn btn-primary" onClick={() => setCurrentPage('login')}>
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

