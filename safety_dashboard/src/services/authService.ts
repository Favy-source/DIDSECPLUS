import { auth } from '@/lib/firebase';
import { User as FirebaseUser } from 'firebase/auth';

// Response types for backend API
interface TokenExchangeResponse {
  token: string;
  user: {
    id: string;
    email: string;
    name: string;
    role: string;
  };
}

interface BackendAuthResponse {
  success: boolean;
  data?: TokenExchangeResponse;
  error?: string;
}

export class AuthService {
  private static instance: AuthService;
  private backendJWT: string | null = null;
  private apiBaseUrl: string;

  private constructor() {
    this.apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
  }

  static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  /**
   * Exchange Firebase ID token for Backend JWT
   * This is the bridge between Firebase Auth and our Rust backend
   */
  async exchangeFirebaseToken(firebaseToken: string): Promise<string> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/api/auth/firebase-exchange`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          firebase_token: firebaseToken
        }),
      });

      if (response.ok) {
        const data: TokenExchangeResponse = await response.json();
        this.backendJWT = data.token;
        localStorage.setItem('backendJWT', data.token);
        localStorage.setItem('backendUser', JSON.stringify(data.user));
        return data.token;
      } else {
        const errorText = await response.text();
        throw new Error(`Token exchange failed: ${response.status} - ${errorText}`);
      }
    } catch (error) {
      console.error('Firebase to Backend token exchange failed:', error);
      throw new Error(`Authentication failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get current backend JWT token
   * Will attempt to retrieve from memory or localStorage
   */
  getBackendJWT(): string | null {
    if (!this.backendJWT) {
      this.backendJWT = localStorage.getItem('backendJWT');
    }
    return this.backendJWT;
  }

  /**
   * Get backend user information
   */
  getBackendUser(): any | null {
    const userStr = localStorage.getItem('backendUser');
    return userStr ? JSON.parse(userStr) : null;
  }

  /**
   * Check if backend JWT is valid
   */
  async isBackendJWTValid(): Promise<boolean> {
    const token = this.getBackendJWT();
    if (!token) return false;

    try {
      const response = await fetch(`${this.apiBaseUrl}/api/auth/verify`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      return response.ok;
    } catch {
      return false;
    }
  }

  /**
   * Get authenticated API headers for backend requests
   */
  async getAuthHeaders(firebaseUser?: FirebaseUser | null): Promise<HeadersInit> {
    try {
      let backendJWT = this.getBackendJWT();

      // If no backend JWT or it's invalid, try to get one
      if (!backendJWT || !(await this.isBackendJWTValid())) {
        if (firebaseUser) {
          const firebaseToken = await firebaseUser.getIdToken(true); // Force refresh
          backendJWT = await this.exchangeFirebaseToken(firebaseToken);
        } else {
          throw new Error('No Firebase user available for token exchange');
        }
      }

      return {
        'Authorization': `Bearer ${backendJWT}`,
        'Content-Type': 'application/json',
      };
    } catch (error) {
      console.error('Failed to get auth headers:', error);
      throw error;
    }
  }

  /**
   * Make authenticated API request
   */
  async authenticatedRequest(
    endpoint: string,
    options: RequestInit = {},
    firebaseUser?: FirebaseUser | null
  ): Promise<Response> {
    try {
      const headers = await this.getAuthHeaders(firebaseUser);
      
      const response = await fetch(`${this.apiBaseUrl}${endpoint}`, {
        ...options,
        headers: {
          ...headers,
          ...(options.headers || {}),
        },
      });

      // If unauthorized, clear tokens and throw error
      if (response.status === 401) {
        this.clearTokens();
        throw new Error('Authentication failed - please log in again');
      }

      return response;
    } catch (error) {
      console.error('Authenticated request failed:', error);
      throw error;
    }
  }

  /**
   * Clear all authentication tokens
   */
  clearTokens(): void {
    this.backendJWT = null;
    localStorage.removeItem('backendJWT');
    localStorage.removeItem('backendUser');
  }

  /**
   * Logout from both Firebase and Backend
   */
  async logout(): Promise<void> {
    try {
      await auth.signOut();
      this.clearTokens();
    } catch (error) {
      console.error('Logout failed:', error);
      throw error;
    }
  }

  /**
   * Initialize authentication state
   * Call this when the app starts
   */
  async initializeAuth(): Promise<void> {
    return new Promise((resolve) => {
      const unsubscribe = auth.onAuthStateChanged(async (firebaseUser) => {
        if (firebaseUser) {
          try {
            // Ensure we have a valid backend JWT
            if (!this.getBackendJWT() || !(await this.isBackendJWTValid())) {
              const firebaseToken = await firebaseUser.getIdToken();
              await this.exchangeFirebaseToken(firebaseToken);
            }
          } catch (error) {
            console.error('Auth initialization failed:', error);
            this.clearTokens();
          }
        } else {
          this.clearTokens();
        }
        unsubscribe();
        resolve();
      });
    });
  }
}

// Export singleton instance
export const authService = AuthService.getInstance();

// Utility function for making authenticated API calls
export async function apiCall(
  endpoint: string,
  options: RequestInit = {},
  firebaseUser?: FirebaseUser | null
): Promise<any> {
  const response = await authService.authenticatedRequest(endpoint, options, firebaseUser);
  
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`API call failed: ${response.status} - ${errorText}`);
  }

  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    return await response.json();
  } else {
    return await response.text();
  }
}
