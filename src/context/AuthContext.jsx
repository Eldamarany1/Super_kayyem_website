import React, { createContext, useContext, useState, useEffect } from 'react';
import {jwtDecode} from 'jwt-decode';
import apiClient from '../api/client';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isAuthLoaded, setIsAuthLoaded] = useState(false);

  useEffect(() => {
    // Hydrate session from localStorage
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decoded = jwtDecode(token);
        // Ensure token hasn't expired
        if (decoded.exp * 1000 > Date.now()) {
          setUser({
            id: decoded.nameid, // .NET places userId in nameid
            email: decoded.email,
            role: decoded.role,
            fullName: decoded.unique_name || decoded.given_name // depending on claims
          });
        } else {
          localStorage.removeItem('token');
        }
      } catch (e) {
        localStorage.removeItem('token');
      }
    }
    setIsAuthLoaded(true);
  }, []);

  const login = async (email, password) => {
    // Expected response shape from backend: { data: { token, ... } }
    const res = await apiClient.post('/auth/login', { email, password });
    if (res.success && res.data?.token) {
      localStorage.setItem('token', res.data.token);
      const decoded = jwtDecode(res.data.token);
      setUser({
        id: res.data.id || decoded.nameid,
        email: res.data.email,
        role: res.data.role,
        fullName: res.data.fullName
      });
      return true;
    }
    throw new Error(res.message || 'Login failed');
  };

  const register = async (fullName, email, password, whatsAppNumber) => {
    const res = await apiClient.post('/auth/register', { fullName, email, password, whatsAppNumber });
    if (res.success && res.data?.token) {
      localStorage.setItem('token', res.data.token);
      const decoded = jwtDecode(res.data.token);
      setUser({
        id: res.data.id || decoded.nameid,
        email: res.data.email,
        role: res.data.role,
        fullName: res.data.fullName
      });
      return true;
    }
    throw new Error(res.message || 'Registration failed');
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    window.location.href = '/login';
  };

  const value = {
    user,
    isLoggedIn: !!user,
    login,
    register,
    logout
  };

  if (!isAuthLoaded) {
    return <div>Loading session...</div>;
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
