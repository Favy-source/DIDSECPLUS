"use client";

import React from 'react';
import { usePathname } from 'next/navigation';
// ...existing code...

interface ConditionalAuthProviderProps {
  children: React.ReactNode;
}

export function ConditionalAuthProvider({ children }: ConditionalAuthProviderProps) {
  // Firebase/AuthProvider is no longer used. Always return children directly.
  return <>{children}</>;
}
