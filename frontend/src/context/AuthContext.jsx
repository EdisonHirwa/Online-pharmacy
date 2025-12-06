import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkSession();
  }, []);

  const checkSession = async () => {
    try {
      const response = await axios.get('http://localhost/Online_pharmacy/Backend/controllers/authController.php?action=check_session', {
        withCredentials: true
      });
      if (response.data.isLoggedIn) {
        setUser(response.data.user);
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error("Session check failed", error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      const response = await axios.post('http://localhost/Online_pharmacy/Backend/controllers/authController.php?action=login', {
        email,
        password
      }, {
        withCredentials: true
      });
      if (response.status === 200) {
        setUser(response.data.user);
        return { success: true, user: response.data.user };
      }
    } catch (error) {
      return { success: false, message: error.response?.data?.message || "Login failed" };
    }
  };

  const logout = async () => {
    try {
      await axios.post('http://localhost/Online_pharmacy/Backend/controllers/authController.php?action=logout', {}, {
        withCredentials: true
      });
      setUser(null);
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  const register = async (userData) => {
    try {
      const response = await axios.post('http://localhost/Online_pharmacy/Backend/controllers/authController.php?action=register', userData);
      return { success: true, message: response.data.message };
    } catch (error) {
      return { success: false, message: error.response?.data?.message || "Registration failed" };
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, register, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
