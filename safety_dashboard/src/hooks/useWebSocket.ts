'use client';

import { useEffect, useState, useCallback } from 'react';

interface Alert {
  id: string;
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'pending' | 'in_progress' | 'resolved';
  category: string;
  created_at: string;
  updated_at: string;
}

interface WebSocketMessage {
  message_type: 'alert_created' | 'alert_updated' | 'alert_resolved' | 'system_status' | 'user_connected' | 'user_disconnected' | 'heartbeat';
  data: {
    alert?: Alert;
    alert_id?: string;
    user_id?: string;
    status?: string;
    message?: string;
  };
  timestamp: string;
}

interface UseWebSocketOptions {
  onConnect?: () => void;
  onDisconnect?: () => void;
  onMessage?: (message: WebSocketMessage) => void;
  onError?: (error: Event) => void;
  reconnectAttempts?: number;
  reconnectInterval?: number;
}

export function useWebSocket(url: string, options: UseWebSocketOptions = {}) {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState<WebSocketMessage | null>(null);
  const [reconnectCount, setReconnectCount] = useState(0);

  const {
    onConnect,
    onDisconnect,
    onMessage,
    onError,
    reconnectAttempts = 5,
    reconnectInterval = 3000
  } = options;

  const sendMessage = useCallback((message: object | string) => {
    if (socket && isConnected) {
      socket.send(JSON.stringify(message));
    } else {
      console.warn('WebSocket is not connected');
    }
  }, [socket, isConnected]);

  const sendPing = useCallback(() => {
    sendMessage('ping');
  }, [sendMessage]);

  const disconnect = useCallback(() => {
    if (socket) {
      socket.close();
      setSocket(null);
      setIsConnected(false);
    }
  }, [socket]);

  useEffect(() => {
    let mounted = true;
    let ws: WebSocket | null = null;
    
    const connect = () => {
      if (!mounted) return;
      
      try {
        ws = new WebSocket(url);

        ws.onopen = () => {
          if (!mounted) return;
          console.log('🔌 WebSocket connected');
          setIsConnected(true);
          setReconnectCount(0);
          onConnect?.();
        };

        ws.onclose = () => {
          if (!mounted) return;
          console.log('🔌 WebSocket disconnected');
          setIsConnected(false);
          setSocket(null);
          onDisconnect?.();

          // Attempt to reconnect
          if (reconnectCount < reconnectAttempts) {
            console.log(`🔄 Attempting to reconnect... (${reconnectCount + 1}/${reconnectAttempts})`);
            setTimeout(() => {
              if (mounted) {
                setReconnectCount(prev => prev + 1);
                connect();
              }
            }, reconnectInterval);
          }
        };

        ws.onmessage = (event) => {
          if (!mounted) return;
          try {
            const message: WebSocketMessage = JSON.parse(event.data);
            setLastMessage(message);
            onMessage?.(message);
          } catch (error) {
            console.error('Failed to parse WebSocket message:', error);
          }
        };

        ws.onerror = (error) => {
          if (!mounted) return;
          console.error('WebSocket error:', error);
          onError?.(error);
        };

        if (mounted) {
          setSocket(ws);
        }
      } catch (error) {
        console.error('Failed to create WebSocket connection:', error);
      }
    };

    connect();

    return () => {
      mounted = false;
      if (ws) {
        ws.close();
      }
    };
  }, [url, onConnect, onDisconnect, onMessage, onError, reconnectCount, reconnectAttempts, reconnectInterval]);

  // Send periodic pings to keep connection alive
  useEffect(() => {
    if (isConnected) {
      const pingInterval = setInterval(() => {
        sendMessage('ping');
      }, 30000); // Ping every 30 seconds

      return () => clearInterval(pingInterval);
    }
  }, [isConnected, sendMessage]);

  return {
    socket,
    isConnected,
    lastMessage,
    sendMessage,
    sendPing,
    disconnect,
    reconnectCount
  };
}

// Hook specifically for security alerts
export function useSecurityAlerts() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [notifications, setNotifications] = useState<WebSocketMessage[]>([]);

  const wsUrl = process.env.NEXT_PUBLIC_BACKEND_URL 
    ? `${process.env.NEXT_PUBLIC_BACKEND_URL.replace('http', 'ws')}/api/ws`
    : 'ws://localhost:3000/api/ws';

  const { isConnected, lastMessage } = useWebSocket(wsUrl, {
    onConnect: () => {
      console.log('🛡️ Connected to SecurityAlert real-time updates');
    },
    onMessage: (message) => {
      switch (message.message_type) {
        case 'alert_created':
          if (message.data.alert) {
            setAlerts(prev => [message.data.alert!, ...prev]);
            setNotifications(prev => [message, ...prev.slice(0, 9)]); // Keep last 10 notifications
            
            // Show browser notification for critical alerts
            if (message.data.alert.severity === 'critical') {
              if (Notification.permission === 'granted') {
                new Notification('🚨 Critical Security Alert', {
                  body: `New critical alert: ${message.data.alert.title || 'Unnamed alert'}`,
                  icon: '/favicon.ico'
                });
              }
            }
          }
          break;
          
        case 'alert_updated':
          if (message.data.alert_id && message.data.alert) {
            setAlerts(prev => prev.map(alert => 
              alert.id === message.data.alert_id ? { ...alert, ...message.data.alert } : alert
            ));
            setNotifications(prev => [message, ...prev.slice(0, 9)]);
          }
          break;
          
        case 'alert_resolved':
          if (message.data.alert_id) {
            setAlerts(prev => prev.map(alert => 
              alert.id === message.data.alert_id ? { ...alert, status: 'resolved' as const } : alert
            ));
            setNotifications(prev => [message, ...prev.slice(0, 9)]);
          }
          break;
      }
    }
  });

  // Request notification permission on mount
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  const clearNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  return {
    alerts,
    notifications,
    isConnected,
    lastMessage,
    clearNotifications
  };
}
