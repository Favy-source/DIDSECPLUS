// User types
export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  created_at: string;
  updated_at: string;
}

// Alert types
export interface Alert {
  id: string;
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  category: 'kidnapping' | 'robbery' | 'assault' | 'suspicious' | 'other';
  latitude: number;
  longitude: number;
  location?: string;
  status: 'active' | 'investigating' | 'monitoring' | 'resolved';
  created_at: string;
  updated_at: string;
  created_by?: string;
}

// Ticket types
export interface Ticket {
  id: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  alert_id?: string;
  assigned_to?: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
  resolved_at?: string;
}

// Location types
export interface Location {
  id: string;
  name: string;
  state: string;
  latitude: number;
  longitude: number;
  description?: string;
}

// API Response types
export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}

// WebSocket message types
export interface WebSocketMessage {
  type: 'alert_created' | 'alert_updated' | 'ticket_created' | 'ticket_updated' | 'auth' | 'ping' | 'pong';
  data?: Alert | Ticket | User | Record<string, unknown>;
  token?: string;
}

// Authentication types
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  role?: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

// Form types
export interface CreateAlertForm {
  title: string;
  description: string;
  severity: Alert['severity'];
  category: Alert['category'];
  latitude: number;
  longitude: number;
  location?: string;
}

export interface UpdateAlertForm extends Partial<CreateAlertForm> {
  status?: Alert['status'];
}

export interface CreateTicketForm {
  title: string;
  description: string;
  priority: Ticket['priority'];
  alert_id?: string;
  assigned_to?: string;
}

export interface UpdateTicketForm extends Partial<CreateTicketForm> {
  status?: Ticket['status'];
}

// Filter types
export interface AlertFilters {
  severity?: Alert['severity'];
  category?: Alert['category'];
  status?: Alert['status'];
  location?: string;
  date_from?: string;
  date_to?: string;
  limit?: number;
  offset?: number;
}

export interface TicketFilters {
  status?: Ticket['status'];
  priority?: Ticket['priority'];
  assigned_to?: string;
  alert_id?: string;
  created_by?: string;
  limit?: number;
  offset?: number;
}

export interface UserFilters {
  role?: string;
  limit?: number;
  offset?: number;
}

// Map types
export interface MapAlert extends Alert {
  position: [number, number];
}

export interface MapBounds {
  north: number;
  south: number;
  east: number;
  west: number;
}

// Dashboard types
export interface DashboardStats {
  total_alerts: number;
  critical_alerts: number;
  active_alerts: number;
  resolved_alerts: number;
  total_tickets: number;
  open_tickets: number;
  in_progress_tickets: number;
  resolved_tickets: number;
  response_time_avg: number;
  alerts_by_severity: Record<Alert['severity'], number>;
  alerts_by_category: Record<Alert['category'], number>;
  tickets_by_status: Record<Ticket['status'], number>;
  recent_activity: ActivityItem[];
}

export interface ActivityItem {
  id: string;
  type: 'alert' | 'ticket' | 'user';
  action: 'created' | 'updated' | 'resolved' | 'assigned';
  title: string;
  description: string;
  timestamp: string;
  user_name?: string;
}

// Error types
export interface ApiError {
  message: string;
  code?: string;
  details?: Record<string, unknown>;
}

// Component prop types
export interface MapProps {
  alerts: Alert[];
  onAlertClick?: (alert: Alert) => void;
  height?: string;
  center?: [number, number];
  zoom?: number;
  filters?: AlertFilters;
}

export interface AlertListProps {
  alerts: Alert[];
  onAlertClick?: (alert: Alert) => void;
  loading?: boolean;
  error?: string;
}

export interface TicketListProps {
  tickets: Ticket[];
  onTicketClick?: (ticket: Ticket) => void;
  loading?: boolean;
  error?: string;
}

// Theme types (for dark mode support)
export interface Theme {
  mode: 'light' | 'dark';
  colors: {
    primary: string;
    secondary: string;
    background: string;
    surface: string;
    text: string;
    error: string;
    warning: string;
    success: string;
  };
}

// State management types (for Zustand stores)
// types/index.ts (or wherever your types are defined)
export interface AuthState {
  user: User | null;
  access_token: string | null;
  refresh_token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  getCurrentUser: () => Promise<void>;
  initializeAuth: () => Promise<void>; // New method
  setLoading: (loading: boolean) => void; // New method
  clearError: () => void;
}

export interface AlertState {
  alerts: Alert[];
  selectedAlert: Alert | null;
  filters: AlertFilters;
  isLoading: boolean;
  error: string | null;
  fetchAlerts: (filters?: AlertFilters) => Promise<void>;
  createAlert: (data: CreateAlertForm) => Promise<void>;
  updateAlert: (id: string, data: UpdateAlertForm) => Promise<void>;
  deleteAlert: (id: string) => Promise<void>;
  setSelectedAlert: (alert: Alert | null) => void;
  setFilters: (filters: AlertFilters) => void;
  clearError: () => void;
}

export interface TicketState {
  tickets: Ticket[];
  selectedTicket: Ticket | null;
  filters: TicketFilters;
  isLoading: boolean;
  error: string | null;
  fetchTickets: (filters?: TicketFilters) => Promise<void>;
  createTicket: (data: CreateTicketForm) => Promise<Ticket>;
  updateTicket: (id: string, data: UpdateTicketForm) => Promise<void>;
  deleteTicket: (id: string) => Promise<void>;
  setSelectedTicket: (ticket: Ticket | null) => void;
  setFilters: (filters: TicketFilters) => void;
  clearError: () => void;
}
