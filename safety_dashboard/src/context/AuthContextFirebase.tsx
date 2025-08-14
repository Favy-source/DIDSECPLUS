"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { User as FirebaseUser } from 'firebase/auth';
import { 
  firebaseAuth, 
  onAuthStateChange, 
  UserProfile, 
  UserRole 
} from '@/lib/firebase';

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  rank: string;
  department: string;
  stationId: string;
  profileImage?: string;
  permissions: string[];
  lastLogin: string;
  role: 'user' | 'police' | 'admin' | 'super_admin';
}

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  firebaseUser: FirebaseUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  register: (userData: RegisterData) => Promise<boolean>;
  updateProfile: (userData: Partial<User>) => Promise<boolean>;
  hasRole: (role: string | string[]) => boolean;
  hasPermission: (permission: string) => boolean;
  resetPassword: (email: string) => Promise<boolean>;
}

interface RegisterData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  rank: string;
  department: string;
  stationId: string;
  phone?: string;
  role?: 'user' | 'police' | 'admin' | 'super_admin';
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const isAuthenticated = !!firebaseUser && !!userProfile;

  // Listen to Firebase auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChange(async (fbUser) => {
      setFirebaseUser(fbUser);
      
      if (fbUser) {
        try {
          // Get user profile from PostgreSQL backend
          const profile = await firebaseAuth.getUserProfile(fbUser);
          if (profile) {
            setUserProfile(profile);
            
            // Map to our User interface
            const mappedUser: User = {
              id: profile.id,
              firstName: profile.firstName,
              lastName: profile.lastName,
              email: profile.email,
              rank: profile.rank || 'Officer',
              department: profile.department,
              stationId: profile.stationId,
              profileImage: profile.profileImage,
              permissions: profile.permissions,
              lastLogin: profile.lastLogin,
              role: profile.role as 'user' | 'police' | 'admin' | 'super_admin',
            };
            setUser(mappedUser);
          } else {
            setUser(null);
            setUserProfile(null);
          }
        } catch (error) {
          console.error('Error fetching user profile:', error);
          setUser(null);
          setUserProfile(null);
        }
      } else {
        setUser(null);
        setUserProfile(null);
      }
      
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      await firebaseAuth.signIn(email, password);
      return true;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await firebaseAuth.signOut();
      setUser(null);
      setUserProfile(null);
      setFirebaseUser(null);
      router.push('/auth/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const register = async (userData: RegisterData): Promise<boolean> => {
    try {
      setIsLoading(true);
      
      const userProfileData = {
        email: userData.email,
        firstName: userData.firstName,
        lastName: userData.lastName,
        role: (userData.role || 'viewer') as UserRole,
        rank: userData.rank,
        department: userData.department,
        stationId: userData.stationId,
        phone: userData.phone,
        permissions: [],
        lastLogin: new Date().toISOString()
      };

      // Use the integrated Firebase + PostgreSQL signup function
      await firebaseAuth.signUp(userData.email, userData.password, userProfileData);
      
      return true;
    } catch (error) {
      console.error('Registration error:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const updateProfile = async (userData: Partial<User>): Promise<boolean> => {
    try {
      if (!firebaseUser) return false;
      
      await firebaseAuth.updateUserProfile(firebaseUser, userData);
      
      // Update local state
      if (userProfile) {
        const updatedProfile = { ...userProfile, ...userData };
        setUserProfile(updatedProfile);
        
        const updatedUser: User = {
          ...user!,
          ...userData
        };
        setUser(updatedUser);
      }
      
      return true;
    } catch (error) {
      console.error('Update profile error:', error);
      return false;
    }
  };

  const hasRole = (roles: string | string[]): boolean => {
    return firebaseAuth.hasRole(userProfile, roles as UserRole | UserRole[]);
  };

  const hasPermission = (permission: string): boolean => {
    return firebaseAuth.hasPermission(userProfile, permission);
  };

  const resetPassword = async (email: string): Promise<boolean> => {
    try {
      await firebaseAuth.resetPassword(email);
      return true;
    } catch (error) {
      console.error('Password reset error:', error);
      return false;
    }
  };

  const value: AuthContextType = {
    user,
    userProfile,
    firebaseUser,
    isLoading,
    isAuthenticated,
    login,
    logout,
    register,
    updateProfile,
    hasRole,
    hasPermission,
    resetPassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
