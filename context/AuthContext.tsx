import React, { createContext, useState, useEffect, ReactNode, useCallback } from 'react';
import type { User, Role } from '../types';
import { generateUsers, generateRolesAndPermissions } from '../services/geminiService';

interface AuthContextType {
  user: User | null;
  currentRole: Role | null;
  loading: boolean;
  login: (email: string, password: string, userType: 'admin' | 'employee') => Promise<boolean>;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [currentRole, setCurrentRole] = useState<Role | null>(null);
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        setLoading(true);
        // In a real app, this would be one API call. Here we simulate fetching static user/role data.
        const [generatedUsers, generatedRoles] = await Promise.all([generateUsers(), generateRolesAndPermissions()]);
        setUsers(generatedUsers);
        setRoles(generatedRoles);

        const storedUser = localStorage.getItem('authUser');
        if (storedUser) {
          const parsedUser: User = JSON.parse(storedUser);
          const role = generatedRoles.find(r => r.id === parsedUser.roleId);
          setUser(parsedUser);
          setCurrentRole(role || null);
        }
      } catch (error) {
        console.error("Failed to initialize auth data:", error);
      } finally {
        setLoading(false);
      }
    };
    initializeAuth();
  }, []);

  const login = useCallback(async (email: string, password: string, userType: 'admin' | 'employee'): Promise<boolean> => {
    // This is a mock login function. In a real app, you'd verify the password against a hash.
    const foundUser = users.find(u => u.email === email && u.userType === userType);

    if (foundUser) {
      const role = roles.find(r => r.id === foundUser.roleId);
      if (role) {
        setUser(foundUser);
        setCurrentRole(role);
        localStorage.setItem('authUser', JSON.stringify(foundUser));
        return true;
      }
    }
    return false;
  }, [users, roles]);

  const logout = useCallback(() => {
    setUser(null);
    setCurrentRole(null);
    localStorage.removeItem('authUser');
  }, []);

  const value = { user, currentRole, loading, login, logout };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
