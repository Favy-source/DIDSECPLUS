import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Alert } from '@/types';

// Fix for default markers in React-Leaflet
delete (L.Icon.Default.prototype as unknown as { _getIconUrl: unknown })._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: '/leaflet/marker-icon-2x.png',
  iconUrl: '/leaflet/marker-icon.png',
  shadowUrl: '/leaflet/marker-shadow.png',
});

// Custom marker icons for different alert types
const createAlertIcon = (alertType: string, severity: string) => {
  const getColor = () => {
    switch (severity.toLowerCase()) {
      case 'high': return '#ef4444'; // red
      case 'critical': return '#dc2626'; // dark red
      case 'medium': return '#f59e0b'; // amber
      case 'low': return '#10b981'; // green
      default: return '#6b7280'; // gray
    }
  };

  const getShape = () => {
    switch (alertType.toLowerCase()) {
      case 'kidnapping': return '🚨';
      case 'robbery': return '💰';
      case 'assault': return '⚠️';
      case 'suspicious': return '👁️';
      default: return '📍';
    }
  };

  return L.divIcon({
    html: `
      <div style="
        background-color: ${getColor()};
        width: 25px;
        height: 25px;
        border-radius: 50%;
        border: 2px solid white;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 12px;
        box-shadow: 0 2px 4px rgba(0,0,0,0.2);
      ">
        ${getShape()}
      </div>
    `,
    className: 'custom-alert-marker',
    iconSize: [25, 25],
    iconAnchor: [12, 12],
  });
};

// Interface for map component props
interface SecurityMapProps {
  alerts: Alert[];
  onAlertClick?: (alert: Alert) => void;
  height?: string;
  center?: [number, number];
  zoom?: number;
}

// Map bounds for Nigeria (covering all 36 states)
const NIGERIA_BOUNDS: [[number, number], [number, number]] = [
  [4.0, 2.7], // Southwest corner
  [14.0, 14.7] // Northeast corner
];

const NIGERIA_CENTER: [number, number] = [9.0, 7.5]; // Approximate center of Nigeria

// Component to fit map to Nigeria bounds
const FitNigeriaBounds: React.FC = () => {
  const map = useMap();
  
  useEffect(() => {
    map.fitBounds(NIGERIA_BOUNDS);
  }, [map]);
  
  return null;
};

// Real-time alert updates component
const AlertUpdateHandler: React.FC<{ alerts: Alert[] }> = ({ alerts }) => {
  const map = useMap();
  
  useEffect(() => {
    // Auto-zoom to latest alert if it's recent (within 5 minutes)
    const latestAlert = alerts
      .filter(alert => {
        const alertTime = new Date(alert.created_at);
        const now = new Date();
        const diffMinutes = (now.getTime() - alertTime.getTime()) / (1000 * 60);
        return diffMinutes <= 5;
      })
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0];
    
    if (latestAlert && latestAlert.latitude && latestAlert.longitude) {
      map.setView([latestAlert.latitude, latestAlert.longitude], 12, {
        animate: true,
        duration: 1.5
      });
    }
  }, [alerts, map]);
  
  return null;
};

// Map controls component
const MapControls: React.FC<{
  filterSeverity: string;
  setFilterSeverity: (severity: string) => void;
  filterCategory: string;
  setFilterCategory: (category: string) => void;
}> = ({ filterSeverity, setFilterSeverity, filterCategory, setFilterCategory }) => {
  return (
    <div className="absolute top-4 right-4 z-[1000] bg-white p-4 rounded-lg shadow-lg">
      <h3 className="text-sm font-semibold mb-2">Filter Alerts</h3>
      
      <div className="mb-3">
        <label className="block text-xs font-medium text-gray-700 mb-1">
          Severity
        </label>
                <select
          title="Filter by severity"
          value={filterSeverity}
          onChange={(e) => setFilterSeverity(e.target.value)}
          className="px-3 py-1 border border-gray-300 rounded text-sm"
        >
          <option value="">All Severities</option>
          <option value="critical">Critical</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>
      </div>
      
      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1">
          Category
        </label>
        <select
          title="Filter by category"
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All Categories</option>
          <option value="kidnapping">Kidnapping</option>
          <option value="robbery">Robbery</option>
          <option value="assault">Assault</option>
          <option value="suspicious">Suspicious Activity</option>
          <option value="other">Other</option>
        </select>
      </div>
    </div>
  );
};

// Main Security Map Component
const SecurityMap: React.FC<SecurityMapProps> = ({
  alerts,
  onAlertClick,
  height = '500px',
  center = NIGERIA_CENTER,
  zoom = 6
}) => {
  const [filterSeverity, setFilterSeverity] = useState('');
  const [filterCategory, setFilterCategory] = useState('');

  // Filter alerts based on current filters
  const filteredAlerts = alerts.filter(alert => {
    const severityMatch = !filterSeverity || alert.severity.toLowerCase() === filterSeverity;
    const categoryMatch = !filterCategory || alert.category.toLowerCase() === filterCategory;
    return severityMatch && categoryMatch && alert.latitude && alert.longitude;
  });

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleString('en-NG', {
      timeZone: 'Africa/Lagos',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="relative w-full h-full">
      <div style={{ height: height || '500px' }} className="w-full">
        <MapContainer
          center={center}
          zoom={zoom}
          style={{ height: '100%', width: '100%' }}
          className="rounded-lg"
        >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        <FitNigeriaBounds />
        <AlertUpdateHandler alerts={filteredAlerts} />
        
        {filteredAlerts.map((alert) => (
          <Marker
            key={alert.id}
            position={[alert.latitude, alert.longitude]}
            icon={createAlertIcon(alert.category, alert.severity)}
            eventHandlers={{
              click: () => onAlertClick?.(alert),
            }}
          >
            <Popup className="custom-popup">
              <div className="p-2 min-w-[250px]">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-gray-800">{alert.title}</h3>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    alert.severity === 'critical' ? 'bg-red-100 text-red-800' :
                    alert.severity === 'high' ? 'bg-red-50 text-red-700' :
                    alert.severity === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {alert.severity.toUpperCase()}
                  </span>
                </div>
                
                <p className="text-sm text-gray-600 mb-2">{alert.description}</p>
                
                <div className="text-xs text-gray-500 space-y-1">
                  <div><strong>Category:</strong> {alert.category}</div>
                  <div><strong>Status:</strong> {alert.status}</div>
                  <div><strong>Time:</strong> {formatTime(alert.created_at)}</div>
                  {alert.location && (
                    <div><strong>Location:</strong> {alert.location}</div>
                  )}
                  <div><strong>Coordinates:</strong> {alert.latitude.toFixed(4)}, {alert.longitude.toFixed(4)}</div>
                </div>
                
                <button
                  onClick={() => onAlertClick?.(alert)}
                  className="mt-2 w-full px-3 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600 transition-colors"
                >
                  View Details
                </button>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
      </div>
      
      <MapControls
        filterSeverity={filterSeverity}
        setFilterSeverity={setFilterSeverity}
        filterCategory={filterCategory}
        setFilterCategory={setFilterCategory}
      />
      
      {/* Alert count indicator */}
      <div className="absolute bottom-4 left-4 z-[1000] bg-white px-3 py-2 rounded-lg shadow-lg">
        <div className="text-sm font-medium text-gray-800">
          Showing {filteredAlerts.length} of {alerts.length} alerts
        </div>
        <div className="text-xs text-gray-500">
          Last updated: {new Date().toLocaleTimeString()}
        </div>
      </div>
    </div>
  );
};

export default SecurityMap;
