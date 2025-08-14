// Enhanced API client for SecurityAlert system
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';

interface Alert {
  id: number;
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  category: string;
  status: string;
  created_at: string;
  risk_score: number;
}

interface PaginatedAlerts {
  data: Alert[];
  total: number;
  page: number;
  limit: number;
}

export type Ticket = {
  id: number;
  user_name: string;
  category: string | null;
  priority: string | null;
  status: string | null;
  timestamp: string | null;
};

class ApiClient {
  private baseURL: string;
  private token: string | null = null;

  constructor(baseURL: string = API_BASE_URL) {
    this.baseURL = baseURL;
    
    // Get token from localStorage if available
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('access_token');
    }
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...(this.token && { Authorization: `Bearer ${this.token}` }),
        ...options.headers,
      },
      ...options,
    };

    const response = await fetch(url, config);
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Unknown error' }));
      throw new Error(error.message || `HTTP ${response.status}`);
    }
    
    return response.json();
  }

  // Authentication
  async login(username: string, password: string) {
    const response = await this.request<{ access_token: string; user: Record<string, unknown> }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });

    this.token = response.access_token;
    if (typeof window !== 'undefined') {
      localStorage.setItem('access_token', response.access_token);
    }
    
    return response;
  }

  async logout() {
    this.token = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('access_token');
    }
  }

  // Health check
  async checkHealth(): Promise<string> {
    const response = await fetch(`${this.baseURL}/api/health`);
    return response.text();
  }

  // Alerts
  async getAlerts(params?: {
    page?: number;
    limit?: number;
    severity?: string;
    status?: string;
    search?: string;
  }): Promise<PaginatedAlerts> {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key, value.toString());
        }
      });
    }
    
    return this.request<PaginatedAlerts>(`/api/alerts?${queryParams}`);
  }

  async createAlert(alert: Partial<Alert>): Promise<Alert> {
    return this.request<Alert>('/api/alerts', {
      method: 'POST',
      body: JSON.stringify(alert),
    });
  }

  // Dashboard statistics
  async getDashboardStats() {
    return this.request<{
      totalAlerts: number;
      criticalAlerts: number;
      resolvedAlerts: number;
      averageResponseTime: number;
      alertsByCategory: Record<string, number>;
      alertTrend: Array<{ date: string; count: number }>;
    }>('/api/dashboard/stats');
  }
}

export const apiClient = new ApiClient();

// Legacy functions for backward compatibility  
export async function checkHealth(): Promise<string> {
  return apiClient.checkHealth();
}

export async function getTickets(): Promise<Ticket[]> {
  const res = await fetch(`${API_BASE_URL}/tickets`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch tickets");
  return res.json();
}

