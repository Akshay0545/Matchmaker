import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../utils/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('tdc_token');
    const userData = localStorage.getItem('tdc_user');
    if (token && userData) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      setUser(JSON.parse(userData));
    }
    setLoading(false);
  }, []);

  const login = async (username, password) => {
    const res = await api.post('/auth/login', { username, password });
    const { token, matchmaker } = res.data;
    localStorage.setItem('tdc_token', token);
    localStorage.setItem('tdc_user', JSON.stringify(matchmaker));
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    setUser(matchmaker);
    return matchmaker;
  };

  const logout = () => {
    localStorage.removeItem('tdc_token');
    localStorage.removeItem('tdc_user');
    delete api.defaults.headers.common['Authorization'];
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
