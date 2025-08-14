'use client';

import { useState } from 'react';
import { useSecurityAlerts } from '@/hooks/useWebSocket';
import { Bell, X, CheckCircle, AlertTriangle, AlertCircle, Zap } from 'lucide-react';

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

interface NotificationProps {
  onClose?: () => void;
  maxVisible?: number;
}

export function RealTimeNotifications({ onClose, maxVisible = 5 }: NotificationProps) {
  const { notifications, isConnected, clearNotifications } = useSecurityAlerts();
  const [isExpanded, setIsExpanded] = useState(false);

  const getIcon = (messageType: string, severity?: string) => {
    switch (messageType) {
      case 'alert_created':
        if (severity === 'critical') return <AlertCircle className="w-5 h-5 text-red-500" />;
        if (severity === 'high') return <AlertTriangle className="w-5 h-5 text-orange-500" />;
        return <Bell className="w-5 h-5 text-blue-500" />;
      case 'alert_resolved':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'system_status':
        return <Zap className="w-5 h-5 text-purple-500" />;
      default:
        return <Bell className="w-5 h-5 text-gray-500" />;
    }
  };

  const getTitle = (messageType: string) => {
    switch (messageType) {
      case 'alert_created': return 'New Security Alert';
      case 'alert_updated': return 'Alert Updated';
      case 'alert_resolved': return 'Alert Resolved';
      case 'system_status': return 'System Status';
      case 'user_connected': return 'User Connected';
      case 'user_disconnected': return 'User Disconnected';
      default: return 'Notification';
    }
  };

  const getMessage = (notification: WebSocketMessage) => {
    switch (notification.message_type) {
      case 'alert_created':
        return notification.data.alert?.title || 'New security alert created';
      case 'alert_updated':
        return `Alert ${notification.data.alert_id} has been updated`;
      case 'alert_resolved':
        return `Alert ${notification.data.alert_id} has been resolved`;
      case 'system_status':
        return notification.data.message || 'System status update';
      default:
        return notification.data.message || 'New notification';
    }
  };

  const getPriorityColor = (messageType: string, severity?: string) => {
    if (messageType === 'alert_created') {
      switch (severity) {
        case 'critical': return 'border-l-red-500 bg-red-50 dark:bg-red-900/20';
        case 'high': return 'border-l-orange-500 bg-orange-50 dark:bg-orange-900/20';
        case 'medium': return 'border-l-yellow-500 bg-yellow-50 dark:bg-yellow-900/20';
        case 'low': return 'border-l-blue-500 bg-blue-50 dark:bg-blue-900/20';
      }
    }
    if (messageType === 'alert_resolved') return 'border-l-green-500 bg-green-50 dark:bg-green-900/20';
    return 'border-l-gray-300 bg-gray-50 dark:bg-gray-800';
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return date.toLocaleDateString();
  };

  const visibleNotifications = isExpanded ? notifications : notifications.slice(0, maxVisible);

  if (notifications.length === 0) {
    return (
      <div className="fixed top-4 right-4 z-50">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-4 max-w-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {isConnected ? 'Connected' : 'Disconnected'}
              </span>
            </div>
            {onClose && (
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                title="Close notifications"
                aria-label="Close notifications"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
            No new notifications
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed top-4 right-4 z-50 max-w-sm">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
            <h3 className="font-medium text-gray-900 dark:text-white">
              Live Notifications ({notifications.length})
            </h3>
          </div>
          <div className="flex items-center space-x-2">
            {notifications.length > maxVisible && (
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
                title={isExpanded ? 'Show fewer notifications' : 'Show all notifications'}
              >
                {isExpanded ? 'Show less' : `+${notifications.length - maxVisible} more`}
              </button>
            )}
            <button
              onClick={clearNotifications}
              className="text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
              title="Clear all notifications"
            >
              Clear all
            </button>
            {onClose && (
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                title="Close notifications"
                aria-label="Close notifications"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Notifications List */}
        <div className="max-h-96 overflow-y-auto">
          {visibleNotifications.map((notification, index) => (
            <div
              key={`${notification.timestamp}-${index}`}
              className={`p-4 border-l-4 ${getPriorityColor(
                notification.message_type,
                notification.data.alert?.severity
              )} ${index < visibleNotifications.length - 1 ? 'border-b border-gray-200 dark:border-gray-700' : ''}`}
            >
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 mt-1">
                  {getIcon(notification.message_type, notification.data.alert?.severity)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {getTitle(notification.message_type)}
                    </p>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {formatTime(notification.timestamp)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                    {getMessage(notification)}
                  </p>
                  {notification.data.alert?.severity && (
                    <div className="mt-2">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        notification.data.alert.severity === 'critical'
                          ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                          : notification.data.alert.severity === 'high'
                          ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400'
                          : notification.data.alert.severity === 'medium'
                          ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                          : 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
                      }`}>
                        {notification.data.alert.severity.toUpperCase()}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="px-4 py-2 bg-gray-50 dark:bg-gray-700 text-center">
          <span className="text-xs text-gray-500 dark:text-gray-400">
            Real-time security monitoring active
          </span>
        </div>
      </div>
    </div>
  );
}

// Mini notification badge for header
export function NotificationBadge() {
  const { notifications, isConnected } = useSecurityAlerts();
  const [showNotifications, setShowNotifications] = useState(false);

  const unreadCount = notifications.length;
  const hasUrgent = notifications.some(n => 
    n.message_type === 'alert_created' && 
    n.data.alert?.severity === 'critical'
  );

  return (
    <>
      <button
        onClick={() => setShowNotifications(true)}
        className="relative p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        title={`${unreadCount} new notifications`}
        aria-label={`View ${unreadCount} notifications`}
      >
        <Bell className="w-6 h-6" />
        
        {/* Connection status */}
        <div className={`absolute -top-1 -left-1 w-3 h-3 rounded-full ${
          isConnected ? 'bg-green-500' : 'bg-red-500'
        }`} />
        
        {/* Notification count */}
        {unreadCount > 0 && (
          <span className={`absolute -top-1 -right-1 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 rounded-full ${
            hasUrgent ? 'bg-red-600 animate-pulse' : 'bg-blue-600'
          }`}>
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {showNotifications && (
        <RealTimeNotifications onClose={() => setShowNotifications(false)} />
      )}
    </>
  );
}
