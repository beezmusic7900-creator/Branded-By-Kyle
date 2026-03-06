
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

const DEFAULT_ADMIN_EMAIL = 'brandedbykyle@gmail.com';
const DEFAULT_ADMIN_PASSWORD = 'Kyleesdad16';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminCredentials, setAdminCredentials] = useState<AdminCredentials>({
    email: DEFAULT_ADMIN_EMAIL,
    password: DEFAULT_ADMIN_PASSWORD,
  });

  useEffect(() => {
    console.log('AuthContext: Initializing');
    loadCredentials();
    checkAuthStatus();
  }, []);

  const loadCredentials = async () => {
    try {
      const stored = await AsyncStorage.getItem('adminCredentials');
      if (stored) {
        const parsed = JSON.parse(stored);
        setAdminCredentials(parsed);
        console.log('AuthContext: Loaded custom admin credentials');
      }
    } catch (error) {
      console.error('AuthContext: Error loading credentials:', error);
    }
  };

  const checkAuthStatus = async () => {
    try {
      const authStatus = await AsyncStorage.getItem('isAdminLoggedIn');
      const isLoggedIn = authStatus === 'true';
      setIsAdmin(isLoggedIn);
      console.log('AuthContext: Admin logged in:', isLoggedIn);
    } catch (error) {
      console.error('AuthContext: Error checking auth status:', error);
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    console.log('AuthContext: Login attempt for:', email);
    if (email === adminCredentials.email && password === adminCredentials.password) {
      setIsAdmin(true);
      await AsyncStorage.setItem('isAdminLoggedIn', 'true');
      console.log('AuthContext: Login successful');
      return true;
    }
    console.log('AuthContext: Login failed - invalid credentials');
    return false;
  };

  const logout = async () => {
    console.log('AuthContext: Logging out');
    setIsAdmin(false);
    await AsyncStorage.removeItem('isAdminLoggedIn');
  };

  const updateCredentials = async (email: string, password: string) => {
    console.log('AuthContext: Updating credentials');
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
