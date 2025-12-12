
import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface AdminCredentials {
  email: string;
  password: string;
}

interface AuthContextType {
  isAdmin: boolean;
  adminCredentials: AdminCredentials;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  updateCredentials: (email: string, password: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const DEFAULT_ADMIN_EMAIL = 'admin@brandedbykyle.com';
const DEFAULT_ADMIN_PASSWORD = 'BrandedByKyle2025!';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminCredentials, setAdminCredentials] = useState<AdminCredentials>({
    email: DEFAULT_ADMIN_EMAIL,
    password: DEFAULT_ADMIN_PASSWORD,
  });

  useEffect(() => {
    loadCredentials();
    checkAuthStatus();
  }, []);

  const loadCredentials = async () => {
    try {
      const stored = await AsyncStorage.getItem('adminCredentials');
      if (stored) {
        setAdminCredentials(JSON.parse(stored));
      }
    } catch (error) {
      console.log('Error loading credentials:', error);
    }
  };

  const checkAuthStatus = async () => {
    try {
      const authStatus = await AsyncStorage.getItem('isAdminLoggedIn');
      setIsAdmin(authStatus === 'true');
    } catch (error) {
      console.log('Error checking auth status:', error);
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    if (email === adminCredentials.email && password === adminCredentials.password) {
      setIsAdmin(true);
      await AsyncStorage.setItem('isAdminLoggedIn', 'true');
      return true;
    }
    return false;
  };

  const logout = async () => {
    setIsAdmin(false);
    await AsyncStorage.removeItem('isAdminLoggedIn');
  };

  const updateCredentials = async (email: string, password: string) => {
    const newCredentials = { email, password };
    setAdminCredentials(newCredentials);
    await AsyncStorage.setItem('adminCredentials', JSON.stringify(newCredentials));
  };

  return (
    <AuthContext.Provider value={{ isAdmin, adminCredentials, login, logout, updateCredentials }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
