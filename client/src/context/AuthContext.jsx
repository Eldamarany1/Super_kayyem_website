import { createContext, useContext, useState, useEffect, useCallback } from 'react';

const AuthContext = createContext(null);

const STORAGE_KEY = 'super_kayyem_user';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // Save to localStorage whenever user state changes
  useEffect(() => {
    if (user) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, [user]);

  // Two-way synchronization: fetch latest account data from MongoDB in background
  const refreshUser = useCallback(async () => {
    if (!user?.id) return;
    try {
      const res = await fetch(`/api/accounts/${user.id}`);
      if (res.ok) {
        const freshUser = await res.json();
        setUser(freshUser);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(freshUser));
      }
    } catch (err) {
      console.warn('Could not refresh user session from server:', err);
    }
  }, [user?.id]);

  // Run refresh on initial load if user is logged in
  useEffect(() => {
    if (user?.id) {
      refreshUser();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const login = useCallback((userData) => {
    setUser(userData);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(userData));
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  const updateUser = useCallback((updatedData) => {
    setUser((prev) => {
      const merged = { ...prev, ...updatedData };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
      return merged;
    });
  }, []);

  // Check if current user owns a story
  const ownsStory = useCallback(
    (storyId) => {
      if (!user) return false;
      const ids = user.ownedStoryIds || user.OwnedStoryIds || [];
      return ids.includes(Number(storyId));
    },
    [user]
  );

  // Add story to owned list ("Add to My Library")
  const ownStory = useCallback(
    async (storyId) => {
      if (!user?.id) return { success: false, error: 'يجب تسجيل الدخول أولاً' };
      try {
        const res = await fetch(`/api/accounts/${user.id}/own-story/${storyId}`, {
          method: 'POST',
        });
        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.error || 'فشل إضافة القصة');
        }
        const data = await res.json();
        updateUser({ ownedStoryIds: data.ownedStoryIds });
        return { success: true, ownedStoryIds: data.ownedStoryIds };
      } catch (err) {
        return { success: false, error: err.message };
      }
    },
    [user?.id, updateUser]
  );

  const value = {
    user,
    isAuthenticated: Boolean(user),
    login,
    logout,
    updateUser,
    refreshUser,
    ownsStory,
    ownStory,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default AuthContext;

