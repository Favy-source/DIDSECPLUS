// src/components/ConditionalAuthProvider.tsx
"use client";

import React from 'react';
import AuthProvider from '@/components/providers/AuthProvider';

interface ConditionalAuthProviderProps {
  children: React.ReactNode;
}

export function ConditionalAuthProvider({ children }: ConditionalAuthProviderProps) {
  // Always wrap children in AuthProvider so useAuth() has context
  return <AuthProvider>{children}</AuthProvider>;
}
