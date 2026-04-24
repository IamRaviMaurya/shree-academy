import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Teacher, LoginCredentials } from '../types';
import { authenticateTeacher, getTeacherById } from '../utils/auth';

interface AuthContextType {
  currentTeacher: Teacher | null;
  login: (credentials: LoginCredentials) => boolean;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_STORAGE_KEY = 'sa_current_teacher';

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentTeacher, setCurrentTeacher] = useState<Teacher | null>(null);

  // Load saved teacher on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(AUTH_STORAGE_KEY);
      if (saved) {
        const savedTeacher = JSON.parse(saved);
        // Refresh teacher data from hardcoded list to get latest fields like upiId
        const latestTeacher = getTeacherById(savedTeacher.id) || savedTeacher;
        setCurrentTeacher(latestTeacher);
        // Update local storage if it was refreshed
        if (latestTeacher !== savedTeacher) {
          localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(latestTeacher));
        }
      }
    } catch (error) {
      console.error('Error loading saved teacher:', error);
    }
  }, []);

  const login = (credentials: LoginCredentials): boolean => {
    const teacher = authenticateTeacher(credentials.username, credentials.password);
    if (teacher) {
      setCurrentTeacher(teacher);
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(teacher));
      return true;
    }
    return false;
  };

  const logout = () => {
    setCurrentTeacher(null);
    localStorage.removeItem(AUTH_STORAGE_KEY);
  };

  const value: AuthContextType = {
    currentTeacher,
    login,
    logout,
    isAuthenticated: !!currentTeacher,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};