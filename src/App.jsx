import { useState } from 'react';
import { CartProvider } from './context/CartContext';
import { ThemeProvider } from './context/ThemeContext';
import Header from './components/Header';
import Banner from './components/Banner';
import ProductsGrid from './components/ProductsGrid';
import Footer from './components/Footer';
import BookModal from './components/BookModal';
import RamadanModal from './components/RamadanModal';
import CartModal from './components/CartModal';
import PaymentModal from './components/PaymentModal';
import UserDataModal from './components/UserDataModal';
import Toast from './components/Toast';
import Login from './pages/Login';
import Signup from './pages/Signup';
import VideoBooks from './pages/VideoBooks';
import './App.css';

function App() {
  const [activeModal, setActiveModal] = useState(null);
  const [selectedBook, setSelectedBook] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [authMode, setAuthMode] = useState(null);
  const [currentPage, setCurrentPage] = useState('home');
  const [isAdmin, setIsAdmin] = useState(false);

  const openModal = (modalName) => {
    setActiveModal(modalName);
  };

  const closeModal = () => {
    setActiveModal(null);
  };

  const openAuth = (mode) => {
    setAuthMode(mode);
    setActiveModal('authModal');
  };

  const closeAuth = () => {
    setAuthMode(null);
    setActiveModal(null);
  };

  const switchToSignup = () => setAuthMode('signup');
  const switchToLogin = () => setAuthMode('login');

  const handleLogout = () => setIsLoggedIn(false);

  const handleOpenBookDetails = (book) => {
    setSelectedBook(book);
    openModal('bookModal');
  };

  const handleOpenCartFromBook = () => {
    setSelectedBook(null);
    openModal('cartModal');
  };

  const handleOpenPayment = () => {
    openModal('paymentModal');
  };

  const handleOpenUserData = () => {
    openModal('userDataModal');
  };

  const navigateTo = (page) => {
    setCurrentPage(page);
    window.scrollTo(0, 0);
  };

  return (
    <ThemeProvider>
      <CartProvider>
        <div className="App">
          <Header 
            onOpenCart={() => openModal('cartModal')} 
            onOpenLogin={() => openAuth('login')}
            onOpenSignup={() => openAuth('signup')}
            isLoggedIn={isLoggedIn}
            onLogout={handleLogout}
            onNavigate={navigateTo}
            isAdmin={isAdmin}
            onToggleAdmin={() => setIsAdmin(!isAdmin)}
          />
          
          {currentPage === 'home' && (
            <>
              <Banner onOpenRamadan={() => openModal('ramadanModal')} />
              <ProductsGrid onOpenDetails={handleOpenBookDetails} />
            </>
          )}
          
          {currentPage === 'videos' && (
            <VideoBooks 
              isAdmin={isAdmin} 
              onBack={() => navigateTo('home')}
            />
          )}
          
          <Footer />
          
          {/* Admin Toggle Info */}
          <div className={`admin-toggle ${isAdmin ? 'active' : ''}`}>
            <span>وضع المسؤول</span>
            <button onClick={() => setIsAdmin(!isAdmin)}>
              {isAdmin ? 'تشغيل' : 'إيقاف'}
            </button>
          </div>
          
          {/* Toast Notification */}
          <Toast />

          {/* Modals */}
          {activeModal === 'bookModal' && selectedBook && (
            <BookModal 
              book={selectedBook} 
              onClose={closeModal} 
              onOpenCart={handleOpenCartFromBook}
            />
          )}
          
          {activeModal === 'ramadanModal' && (
            <RamadanModal onClose={closeModal} />
          )}
          
          {activeModal === 'cartModal' && (
            <CartModal 
              onClose={closeModal} 
              onOpenPayment={handleOpenPayment}
            />
          )}
          
          {activeModal === 'paymentModal' && (
            <PaymentModal 
              onClose={closeModal} 
              onOpenUserData={handleOpenUserData}
            />
          )}
          
          {activeModal === 'userDataModal' && (
            <UserDataModal onClose={closeModal} />
          )}
          
          {/* Auth Modals */}
          {activeModal === 'authModal' && authMode === 'login' && (
            <Login 
              onSwitchToSignup={switchToSignup} 
              onClose={closeAuth} 
            />
          )}
          
          {activeModal === 'authModal' && authMode === 'signup' && (
            <Signup 
              onSwitchToLogin={switchToLogin} 
              onClose={closeAuth} 
            />
          )}
        </div>
      </CartProvider>
    </ThemeProvider>
  );
}

export default App;
