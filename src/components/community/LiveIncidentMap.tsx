import React from 'react';
import { MapContainer, TileLayer, Marker, Popup, ZoomControl, useMap } from 'react-leaflet';
import L from 'leaflet';
import { CommunityReport } from '../../services/communityReportsService';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet's default icon path issues
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom colored markers based on category/severity
const createCustomIcon = (color: string) => {
  return L.divIcon({
    className: 'custom-div-icon',
    html: `
      <div style="
        background-color: ${color};
        width: 20px;
        height: 20px;
        border-radius: 50%;
        border: 3px solid white;
        box-shadow: 0 0 10px rgba(0,0,0,0.5);
      "></div>
    `,
    iconSize: [20, 20],
    iconAnchor: [10, 10],
    popupAnchor: [0, -10],
  });
};

const categoryColors: Record<string, string> = {
  overcrowding: '#e11d48', // rose-600
  poor_lighting: '#d97706', // amber-600
  waterlogging: '#2563eb', // blue-600
  road_blockage: '#9333ea', // purple-600
  bus_delayed_cancelled: '#475569', // slate-600
  damaged_shelter: '#64748b', // slate-500
  safety_concern: '#dc2626', // red-600
};

interface LiveIncidentMapProps {
  reports: CommunityReport[];
  onReportClick: (report: CommunityReport) => void;
}

// Map bounds component to recenter based on active reports
const MapBoundsEnforcer: React.FC<{ reports: CommunityReport[] }> = ({ reports }) => {
  const map = useMap();
  React.useEffect(() => {
    if (reports.length > 0) {
      const bounds = L.latLngBounds(reports.map(r => [r.lat, r.lng]));
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
    }
  }, [reports, map]);
  return null;
};

export const LiveIncidentMap: React.FC<LiveIncidentMapProps> = ({ reports, onReportClick }) => {
  return (
    <div className="relative w-full h-[60vh] md:h-[70vh] rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-sm z-0">
      <MapContainer
        center={[20.2961, 85.8245]} // Default to Bhubaneswar
        zoom={13}
        className="w-full h-full"
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://maps.google.com">Google Maps</a>'
          url="https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}"
          maxZoom={20}
        />
        <ZoomControl position="bottomright" />
        <MapBoundsEnforcer reports={reports} />

        {reports.map((report) => (
          <Marker 
            key={report.id} 
            position={[report.lat, report.lng]}
            icon={createCustomIcon(categoryColors[report.category] || '#64748b')}
            eventHandlers={{
              click: () => onReportClick(report),
            }}
          >
            <Popup className="rounded-xl overflow-hidden custom-popup">
              <div className="p-1 -m-1 cursor-pointer" onClick={() => onReportClick(report)}>
                <div className="text-[10px] font-black uppercase text-purple-600 mb-1">
                  {report.category.replace('_', ' ')}
                </div>
                <h4 className="font-bold text-xs text-slate-800 leading-tight">
                  {report.title}
                </h4>
                <p className="text-[10px] text-slate-500 mt-1 line-clamp-2">
                  {report.description}
                </p>
                <div className="text-[10px] font-bold text-blue-600 mt-2 flex items-center gap-1">
                  View Full Details →
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
      
      {/* Floating map legend / actions */}
      <div className="absolute top-4 left-4 z-[400] flex flex-col gap-2">
        <div className="bg-white/90 backdrop-blur-md dark:bg-slate-900/90 p-3 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-800 pointer-events-auto">
          <h4 className="text-[10px] font-black text-slate-500 uppercase mb-2">Live Map Filters</h4>
          <div className="grid grid-cols-2 gap-x-4 gap-y-1">
            {Object.entries(categoryColors).slice(0, 4).map(([cat, color]) => (
              <div key={cat} className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
                <span className="text-[10px] font-bold text-slate-700 dark:text-slate-300 capitalize">
                  {cat.split('_')[0]}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
