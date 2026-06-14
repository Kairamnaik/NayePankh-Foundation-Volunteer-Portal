import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';

// Configure default base URL for Axios
axios.defaults.baseURL = 'http://localhost:5001/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Set Authorization header for request
  const setAuthHeader = (token) => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete axios.defaults.headers.common['Authorization'];
    }
  };

  useEffect(() => {
    const loadUser = async () => {
      const storedUser = localStorage.getItem('user_data');
      if (storedUser) {
        try {
          const parsed = JSON.parse(storedUser);
          setAuthHeader(parsed.token);
          
          // Verify token by calling /auth/me
          const response = await axios.get('/auth/me');
          const fullUser = {
            ...parsed,
            hasProfile: response.data.hasProfile,
            profileStatus: response.data.profileStatus,
            volunteerProfile: response.data.volunteerProfile,
          };
          setUser(fullUser);
          localStorage.setItem('user_data', JSON.stringify(fullUser));
        } catch (error) {
          console.error('Failed to load user or token expired:', error);
          logout();
        }
      }
      setLoading(false);
    };

    loadUser();
  }, []);

  const signup = async (email, password, role) => {
    setLoading(true);
    try {
      const response = await axios.post('/auth/signup', { email, password, role });
      const userData = response.data;
      setUser(userData);
      setAuthHeader(userData.token);
      localStorage.setItem('user_data', JSON.stringify(userData));
      return { success: true };
    } catch (error) {
      setLoading(false);
      return {
        success: false,
        message: error.response?.data?.message || 'Signup failed',
      };
    }
  };

  const login = async (email, password) => {
    setLoading(true);
    try {
      const response = await axios.post('/auth/login', { email, password });
      const userData = response.data;
      setUser(userData);
      setAuthHeader(userData.token);
      localStorage.setItem('user_data', JSON.stringify(userData));
      return { success: true, user: userData };
    } catch (error) {
      setLoading(false);
      return {
        success: false,
        message: error.response?.data?.message || 'Login failed',
      };
    }
  };

  const logout = () => {
    setUser(null);
    setAuthHeader(null);
    localStorage.removeItem('user_data');
  };

  const refreshProfileStatus = async () => {
    if (!user) return;
    try {
      const response = await axios.get('/auth/me');
      const updatedUser = {
        ...user,
        hasProfile: response.data.hasProfile,
        profileStatus: response.data.profileStatus,
        volunteerProfile: response.data.volunteerProfile,
      };
      setUser(updatedUser);
      localStorage.setItem('user_data', JSON.stringify(updatedUser));
    } catch (error) {
      console.error('Error refreshing profile status:', error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        signup,
        login,
        logout,
        refreshProfileStatus,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
