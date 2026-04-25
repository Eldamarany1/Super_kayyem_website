// ============================================================
//  CartContext.jsx — Global Shopping Cart State
//  Manages: cart items, add/remove/clear, total price, toast
// ============================================================
import { createContext, useContext, useState, useCallback, useEffect } from 'react';

const CartContext = createContext(null);

// ── Toast component (self-contained, portal-style) ──────────
function Toast({ message, type, onDone }) {
  useEffect(() => {
    const t = setTimeout(onDone, 3000);
    return () => clearTimeout(t);
  }, [onDone]);

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '28px',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 9999,
        background: type === 'error' ? '#dc2626' : '#16a34a',
        color: '#fff',
        padding: '14px 28px',
        borderRadius: '50px',
        fontFamily: "'Cairo', sans-serif",
        fontWeight: 700,
        fontSize: '1rem',
        boxShadow: '0 8px 30px rgba(0,0,0,0.25)',
        animation: 'cartToastIn 0.35s cubic-bezier(0.34,1.56,0.64,1) both',
        whiteSpace: 'nowrap',
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
      }}
    >
      <span>{type === 'error' ? '⚠️' : '✅'}</span>
      {message}
      <style>{`
        @keyframes cartToastIn {
          from { opacity:0; transform: translateX(-50%) translateY(20px) scale(0.9); }
          to   { opacity:1; transform: translateX(-50%) translateY(0)    scale(1);   }
        }
      `}</style>
    </div>
  );
}

// ── Provider ─────────────────────────────────────────────────
export function CartProvider({ children }) {
  const [items, setItems]   = useState([]);   // { id, title, price, coverUrl }
  const [toast, setToast]   = useState(null); // { message, type }

  const showToast = useCallback((message, type = 'success') => {
    setToast({ message, type });
  }, []);

  const dismissToast = useCallback(() => setToast(null), []);

  // ── addToCart ────────────────────────────────────────────
  const addToCart = useCallback((story) => {
    setItems((prev) => {
      const exists = prev.some((s) => s.id === story.id);
      if (exists) {
        showToast('هذه القصة موجودة بالفعل في السلة', 'error');
        return prev;
      }
      showToast(`تمت إضافة "${story.title}" إلى السلة`);
      return [
        ...prev,
        {
          id:       story.id,
          title:    story.title,
          price:    story.price ?? story.basePrice ?? 0,
          coverUrl: story.coverUrl ?? story.coverImageUrl ?? '',
        },
      ];
    });
  }, [showToast]);

  // ── removeFromCart ───────────────────────────────────────
  const removeFromCart = useCallback((storyId) => {
    setItems((prev) => prev.filter((s) => s.id !== storyId));
  }, []);

  // ── clearCart ────────────────────────────────────────────
  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  // ── derived ──────────────────────────────────────────────
  const cartTotal = items.reduce((sum, s) => sum + (parseFloat(s.price) || 0), 0);

  const value = {
    items,
    cartTotal,
    addToCart,
    removeFromCart,
    clearCart,
  };

  return (
    <CartContext.Provider value={value}>
      {children}
      {toast && (
        <Toast
          key={toast.message + Date.now()}
          message={toast.message}
          type={toast.type}
          onDone={dismissToast}
        />
      )}
    </CartContext.Provider>
  );
}

// ── Hook ─────────────────────────────────────────────────────
export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used inside <CartProvider>');
  return ctx;
}

export default CartContext;
