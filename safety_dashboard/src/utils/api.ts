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
  // If mock data is enabled, try to synthesize tickets from available alerts
  if (process.env.NEXT_PUBLIC_ENABLE_MOCK_DATA === 'true') {
    try {
      // Try to fetch alerts from backend (if available). If it fails we'll fallback to generated mock alerts.
      const res = await fetch(`${API_BASE_URL}/alerts?limit=1000`, { cache: 'no-store' });
      if (res.ok) {
        const payload = await res.json();
        // Support both { data: Alert[] } and Alert[] shapes
        const alerts: Alert[] = Array.isArray(payload) ? payload : payload.data || [];
        return createTicketsFromAlerts(alerts);
      }
    } catch (err) {
      // ignore and generate fallback mock alerts below
    }

    // Fallback: generate a small set of mock alerts so every ticket matches an alert
    const fallbackMockAlerts: Alert[] = Array.from({ length: 12 }).map((_, i) => ({
      id: i + 1,
      title: `Mock Alert ${i + 1}`,
      description: `Automatically generated mock alert ${i + 1}`,
      severity: i % 4 === 0 ? 'critical' : i % 3 === 0 ? 'high' : i % 2 === 0 ? 'medium' : 'low',
      category: 'incident',
      status: 'open',
      created_at: new Date(Date.now() - i * 60000).toISOString(),
      risk_score: Math.floor(Math.random() * 100),
    } as Alert));

    return createTicketsFromAlerts(fallbackMockAlerts);
  }

  // If not using mock data, call the real endpoint
  const res = await fetch(`${API_BASE_URL}/tickets`, { cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to fetch tickets');
  return res.json();
}

/**
 * Create ticket objects from alerts. This ensures every ticket corresponds to an alert.
 * The UI can call this helper when it already has alerts to ensure tickets mirror alerts.
 */
export function createTicketsFromAlerts(alerts: Alert[]): Ticket[] {
  return alerts.map((a, idx) => ({
    id: typeof a.id === 'number' ? a.id : idx + 1,
    user_name: 'Automated Alert',
    category: a.category || null,
    priority: severityToPriority(a.severity),
    status: a.status || 'open',
    timestamp: a.created_at || new Date().toISOString(),
  }));
}

function severityToPriority(sev: Alert['severity']): string | null {
  switch (sev) {
    case 'critical':
      return 'P1';
    case 'high':
      return 'P2';
    case 'medium':
      return 'P3';
    case 'low':
      return 'P4';
    default:
      return null;
  }
}

