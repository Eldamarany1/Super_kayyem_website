import { createContext, useContext, useState } from 'react';

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cart, setCart] = useState([]);
  const [toast, setToast] = useState({ show: false, message: '' });

  const addToCart = (book) => {
    if (!cart.find(item => item.id === book.id)) {
      setCart([...cart, book]);
      showToast(`تمت إضافة "${book.title}" للسلة!`);
      return true;
    }
    showToast(`"${book.title}" موجود بالفعل في السلة!`);
    return false;
  };

  const removeFromCart = (bookId) => {
    setCart(cart.filter(item => item.id !== bookId));
  };

  const clearCart = () => {
    setCart([]);
  };

  const getCartTotal = () => {
    return cart.reduce((total, item) => total + item.price, 0);
  };

  const showToast = (message) => {
    setToast({ show: true, message });
    setTimeout(() => setToast({ show: false, message: '' }), 3500);
  };

  return (
    <CartContext.Provider value={{ 
      cart, 
      addToCart, 
      removeFromCart, 
      clearCart, 
      getCartTotal, 
      toast 
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}
