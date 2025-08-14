import { Alert, Ticket, User, WebSocketMessage } from '@/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';

class ApiClient {
  private baseUrl: string;
  private access_token: string | null = null;
  private refresh_token: string | null = null;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;

    // Try to get access_token and refresh_token from localStorage on client side
    if (typeof window !== 'undefined') {
      this.access_token = localStorage.getItem('access_token');
      this.refresh_token = localStorage.getItem('refresh_token');
    }
  }

  private getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (this.access_token) {
      headers['Authorization'] = `Bearer ${this.access_token}`;
    }

    return headers;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    const config: RequestInit = {
      ...options,
      headers: {
        ...this.getHeaders(),
        ...options.headers,
      },
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`API request failed for ${endpoint}:`, error);
      throw error;
    }
  }

  // Authentication methods
  async login(email: string, password: string): Promise<{ data: { access_token: string; refresh_token: string; user: User } }> {
    const response = await this.request<{ data: { access_token: string; refresh_token: string; user: User } }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    this.access_token = response.data.access_token;
    this.refresh_token = response.data.refresh_token;
    if (typeof window !== 'undefined') {
      localStorage.setItem('access_token', this.access_token);
      localStorage.setItem('refresh_token', this.refresh_token);
    }

    return response;
  }

  async register(userData: {
    name: string;
    email: string;
    password: string;
    role?: string;
  }): Promise<{ access_token: string; user: User }> {
    const response = await this.request<{ access_token: string; user: User }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });

    this.access_token = response.access_token;
    if (typeof window !== 'undefined') {
      localStorage.setItem('access_token', response.access_token);
    }

    return response;
  }

  async getCurrentUser(): Promise<{user: User}> {
    return this.request<{user: User}>('/auth/me');
  }

  logout(): void {
    this.access_token = null;
    this.refresh_token = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
    }
  }

  // Alert methods
  async getAlerts(params?: {
    severity?: string;
    category?: string;
    status?: string;
    location?: string;
    limit?: number;
    offset?: number;
  }): Promise<Alert[]> {
    const searchParams = new URLSearchParams();
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, value.toString());
        }
      });
    }

    const endpoint = `/alerts${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;
    return this.request<Alert[]>(endpoint);
  }

  async getAlert(id: string): Promise<Alert> {
    return this.request<Alert>(`/alerts/${id}`);
  }

  async createAlert(alertData: {
    title: string;
    description: string;
    severity: string;
    category: string;
    latitude: number;
    longitude: number;
    location?: string;
  }): Promise<Alert> {
    return this.request<Alert>('/alerts', {
      method: 'POST',
      body: JSON.stringify(alertData),
    });
  }

  async updateAlert(id: string, alertData: Partial<Alert>): Promise<Alert> {
    return this.request<Alert>(`/alerts/${id}`, {
      method: 'PUT',
      body: JSON.stringify(alertData),
    });
  }

  async deleteAlert(id: string): Promise<void> {
    await this.request<void>(`/alerts/${id}`, {
      method: 'DELETE',
    });
  }

  // Ticket methods
  async getTickets(params?: {
    status?: string;
    priority?: string;
    assigned_to?: string;
    alert_id?: string;
    limit?: number;
    offset?: number;
  }): Promise<Ticket[]> {
    const searchParams = new URLSearchParams();
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, value.toString());
        }
      });
    }

    const endpoint = `/tickets${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;
    return this.request<Ticket[]>(endpoint);
  }

  async getTicket(id: string): Promise<Ticket> {
    return this.request<Ticket>(`/tickets/${id}`);
  }

  async createTicket(ticketData: {
    title: string;
    description: string;
    priority: string;
    alert_id?: string;
    assigned_to?: string;
  }): Promise<Ticket> {
    return this.request<Ticket>('/tickets', {
      method: 'POST',
      body: JSON.stringify(ticketData),
    });
  }

  async updateTicket(id: string, ticketData: Partial<Ticket>): Promise<Ticket> {
    return this.request<Ticket>(`/tickets/${id}`, {
      method: 'PUT',
      body: JSON.stringify(ticketData),
    });
  }

  async deleteTicket(id: string): Promise<void> {
    await this.request<void>(`/tickets/${id}`, {
      method: 'DELETE',
    });
  }

  // User methods
  async getUsers(params?: {
    role?: string;
    limit?: number;
    offset?: number;
  }): Promise<User[]> {
    const searchParams = new URLSearchParams();
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, value.toString());
        }
      });
    }

    const endpoint = `/users${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;
    return this.request<User[]>(endpoint);
  }

  async getUser(id: string): Promise<User> {
    return this.request<User>(`/users/${id}`);
  }

  async updateUser(id: string, userData: Partial<User>): Promise<User> {
    return this.request<User>(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  }

  async deleteUser(id: string): Promise<void> {
    await this.request<void>(`/users/${id}`, {
      method: 'DELETE',
    });
  }

  // WebSocket connection for real-time updates
  connectWebSocket(onMessage: (data: WebSocketMessage) => void): WebSocket | null {
    if (typeof window === 'undefined') return null;

    const wsUrl = this.baseUrl.replace('http', 'ws') + '/ws';
    const ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      console.log('WebSocket connected');
      // Send authentication token if available
      if (this.access_token) {
        ws.send(JSON.stringify({ type: 'auth', token: this.access_token }));
      }
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data) as WebSocketMessage;
        onMessage(data);
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };

    ws.onclose = () => {
      console.log('WebSocket disconnected');
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    return ws;
  }

  // Set token externally (for SSR or initial auth)
  setToken(token: string): void {
    this.access_token = token;
    if (typeof window !== 'undefined') {
      localStorage.setItem('access_token', token);
    }
  }

  // Get current token
  getToken(): string | null {
    return this.access_token;
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    return this.access_token !== null;
  }
}

// Create a singleton instance
const apiClient = new ApiClient();

export default apiClient;
export { ApiClient };
