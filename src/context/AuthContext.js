'use client';

import { createContext, useState, useEffect, useContext } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import authService from '@/services/authService';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hasProfile, setHasProfile] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Check if user is logged in
    const token = Cookies.get('token');
    if (token) {
      loadUser(token);
    } else {
      setLoading(false);
    }
  }, []);

  // Load user data with the token
  const loadUser = async (token) => {
    try {
      // Use real API service
      const res = await authService.loadUser();
      setUser(res.user);
      setHasProfile(res.hasProfile);
      setLoading(false);
    } catch (err) {
      Cookies.remove('token');
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      setUser(null);
      setLoading(false);
      setError('Authentication failed. Please log in again.');
    }
  };

  // Register user
  const register = async (userData) => {
    try {
      setLoading(true);
      setError(null);
      // Use real API service
      await authService.register(userData);
      
      // After successful registration, redirect to login page
      setLoading(false);
      router.push('/login?registered=true');
      return true;
    } catch (err) {
      setLoading(false);
      setError(err.message || 'Registration failed');
      return false;
    }
  };

  // Login user
  const login = async (email, password) => {
    try {
      setLoading(true);
      setError(null);
      // Use real API service
      const res = await authService.login(email, password);
      
      // Save token to cookie
      Cookies.set('token', res.token, { expires: 1 }); // Expires in 1 day
      
      // Update state
      setUser(res.user);
      setHasProfile(res.hasProfile);
      setLoading(false);
      console.log('User logged in:', res.user.user_type);
      // Redirect based on profile status
      if (res.user.user_type === 'Doctor') {
        router.push('/dashboard');
      } else if (res.user.user_type === 'Patient') {
        router.push('/profile');
      }else{
        router.push('/admin/dashboard'); // Default redirect
      }
      return true;
    } catch (err) {
      setLoading(false);
      setError(err.message || 'Invalid credentials');
      return false;
    }
  };

  // Logout user
  const logout = () => {
    Cookies.remove('token');
    authService.logout();
    setUser(null);
    router.push('/login');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        hasProfile,
        register,
        login,
        logout,
        isAuthenticated: !!user
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

export default AuthContext;
