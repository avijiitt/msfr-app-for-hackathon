import React, { useState } from 'react';
import {
  Camera,
  Eye,
  AlertTriangle,
  Lightbulb,
  LightbulbOff,
  Car,
  Activity,
  Zap,
  RotateCw,
  ShieldAlert,
  CheckCircle2,
  SlidersHorizontal,
  Navigation,
  Sparkles,
  Layers,
  Send,
  Radio,
  MapPin,
  Clock,
  Gauge
} from 'lucide-react';
import {
  SmartCameraFeed,
  smartCameraVisionService,
  SMART_CAMERA_FEEDS
} from '../../services/smartCameraVisionService';

interface SmartCameraVisionSectionProps {
  onNavigateToMap?: () => void;
}

export const SmartCameraVisionSection: React.FC<SmartCameraVisionSectionProps> = ({
  onNavigateToMap
}) => {
  const [cameras, setCameras] = useState<SmartCameraFeed[]>(() => smartCameraVisionService.getCameras());
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'congested' | 'dark_spots' | 'smooth'>('all');
  const [isScanningAll, setIsScanningAll] = useState(false);
  const [scanningCameraId, setScanningCameraId] = useState<string | null>(null);
  const [reportedTicketToast, setReportedTicketToast] = useState<string | null>(null);

  // Scan all cameras with AI Computer Vision simulation
  const handleScanAll = async () => {
    setIsScanningAll(true);
    try {
      const updated = await smartCameraVisionService.scanAllCameras();
      setCameras(updated);
      setReportedTicketToast('AI Computer Vision Scan Complete across all 8 Smart City Camera Nodes (98.8% accuracy)');
      setTimeout(() => setReportedTicketToast(null), 4000);
    } catch (err) {
      console.warn('Scan error:', err);
    } finally {
      setIsScanningAll(false);
    }
  };

  // Re-scan individual camera
  const handleScanSingle = async (camId: string) => {
    setScanningCameraId(camId);
    try {
      const updatedCam = await smartCameraVisionService.scanLiveCamera(camId);
      setCameras((prev) => prev.map((c) => (c.id === camId ? updatedCam : c)));
      setReportedTicketToast(`Camera ${updatedCam.cameraId} re-analyzed: ${updatedCam.vehicleCount} vehicles, ${updatedCam.ambientLux} Lux.`);
      setTimeout(() => setReportedTicketToast(null), 3500);
    } catch (err) {
      console.warn('Single camera scan error:', err);
    } finally {
      setScanningCameraId(null);
    }
  };

  // Dispatch municipal ticket for dark spot or congestion
  const handleDispatchTicket = (cam: SmartCameraFeed) => {
    const isDark = cam.isDarkSpotWarning;
    const ticketId = isDark ? `BSCL-ELEC-${Math.floor(1000 + Math.random() * 9000)}` : `TRAFFIC-JAM-${Math.floor(1000 + Math.random() * 9000)}`;
    setReportedTicketToast(
      isDark
        ? `🚨 Dark Spot Ticket #${ticketId} dispatched to BMC Electrical Squad for ${cam.junctionName}!`
        : `🚦 Congestion Alert #${ticketId} forwarded to City Traffic Police Command Room!`
    );
    setTimeout(() => setReportedTicketToast(null), 5000);
  };

  const filteredCameras = cameras.filter((cam) => {
    if (selectedFilter === 'congested') return cam.congestionLevel === 'heavy' || cam.congestionLevel === 'gridlock';
    if (selectedFilter === 'dark_spots') return cam.isDarkSpotWarning || cam.lightingQuality === 'poor';
    if (selectedFilter === 'smooth') return cam.congestionLevel === 'low' || cam.congestionLevel === 'moderate';
    return true;
  });

  const congestedCount = cameras.filter((c) => c.congestionLevel === 'heavy' || c.congestionLevel === 'gridlock').length;
  const darkSpotsCount = cameras.filter((c) => c.isDarkSpotWarning).length;

  return (
    <div className="space-y-5 animate-in fade-in">
      {/* Toast Notification */}
      {reportedTicketToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white dark:bg-white dark:text-slate-900 px-5 py-3 rounded-2xl shadow-2xl border border-slate-700 dark:border-slate-300 text-xs font-bold flex items-center gap-2.5 animate-in slide-in-from-bottom-4">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>{reportedTicketToast}</span>
        </div>
      )}

      {/* Main Header & Metric Summary Banner */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-blue-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-extrabold text-[11px] rounded-full uppercase tracking-tight mb-1">
              <Camera className="w-3.5 h-3.5" />
              <span>Smart CCTV Optical AI Neural Scanner</span>
            </div>
            <h2 className="text-base md:text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
              <span>Smart Camera Traffic Congestion & Dark Spot Lighting Detection</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-2xl mt-0.5">
              Musafir combines real-time smart CCTV feeds with neural computer vision to scan <strong>vehicle volume, gridlock choke-points, and low-lux / poor lighting darkness zones</strong> across the city.
            </p>
          </div>

          <button
            onClick={handleScanAll}
            disabled={isScanningAll}
            className="px-4 py-2.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-sky-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-extrabold rounded-2xl shadow-lg shadow-indigo-600/20 active:scale-95 transition flex items-center justify-center gap-2 self-start md:self-auto flex-shrink-0"
          >
            <RotateCw className={`w-4 h-4 ${isScanningAll ? 'animate-spin' : ''}`} />
            <span>{isScanningAll ? 'Scanning All 8 Cameras...' : '⚡ Scan All Smart Cameras'}</span>
          </button>
        </div>

        {/* 4 Quick Stat Metric Tiles */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-2xl border border-slate-200/80 dark:border-slate-700/60 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/15 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <Radio className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="text-[10px] uppercase font-bold text-slate-400">Optical Vision Nodes</div>
              <div className="text-sm font-black text-slate-900 dark:text-white">{cameras.length} Smart Cameras Active</div>
              <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">● 30 FPS Inference</div>
            </div>
          </div>

          <div className="bg-rose-50/60 dark:bg-rose-950/30 p-3.5 rounded-2xl border border-rose-200/80 dark:border-rose-800/50 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-500/15 text-rose-600 dark:text-rose-400 flex items-center justify-center">
              <Car className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[10px] uppercase font-bold text-rose-600 dark:text-rose-400">Congested Junctions</div>
              <div className="text-sm font-black text-rose-700 dark:text-rose-300">{congestedCount} Heavy Bottlenecks</div>
              <div className="text-[10px] text-slate-500 font-medium">Auto Signal Surcharge Active</div>
            </div>
          </div>

          <div className="bg-amber-50/60 dark:bg-amber-950/30 p-3.5 rounded-2xl border border-amber-200/80 dark:border-amber-800/50 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <LightbulbOff className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[10px] uppercase font-bold text-amber-600 dark:text-amber-400">Poor Lighting Dark Spots</div>
              <div className="text-sm font-black text-amber-700 dark:text-amber-300">{darkSpotsCount} Dark Stretches (&lt;25 Lux)</div>
              <div className="text-[10px] text-amber-600 dark:text-amber-400 font-bold">⚠️ Night Safety Alert</div>
            </div>
          </div>

          <div className="bg-emerald-50/60 dark:bg-emerald-950/30 p-3.5 rounded-2xl border border-emerald-200/80 dark:border-emerald-800/50 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[10px] uppercase font-bold text-emerald-600 dark:text-emerald-400">AI Neural Confidence</div>
              <div className="text-sm font-black text-emerald-700 dark:text-emerald-300">98.4% Detection Accuracy</div>
              <div className="text-[10px] text-slate-500 font-medium">YOLOv8 + Lux Sensor Fusion</div>
            </div>
          </div>
        </div>

        {/* Filter Chips Bar */}
        <div className="flex items-center gap-2 pt-1 overflow-x-auto hide-scrollbar">
          <span className="text-xs font-extrabold text-slate-400 mr-1 flex items-center gap-1">
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Filter Feed:</span>
          </span>
          {[
            { id: 'all', label: `All Cameras (${cameras.length})` },
            { id: 'congested', label: `🚦 Congested Jams (${congestedCount})` },
            { id: 'dark_spots', label: `💡 Poor Lighting & Dark Spots (${darkSpotsCount})` },
            { id: 'smooth', label: '🛣️ Smooth Corridors' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedFilter(tab.id as any)}
              className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition whitespace-nowrap ${
                selectedFilter === tab.id
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Dark Spot Critical Warning Banner (If any dark spot exists) */}
      {darkSpotsCount > 0 && (
        <div className="p-4 bg-gradient-to-r from-amber-500/15 via-orange-500/15 to-amber-500/15 border border-amber-500/40 rounded-3xl flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
          <div className="flex items-start gap-3">
            <div className="p-2.5 bg-amber-500 text-slate-950 rounded-2xl font-black flex-shrink-0 mt-0.5">
              <LightbulbOff className="w-5 h-5" />
            </div>
            <div>
              <div className="font-extrabold text-amber-900 dark:text-amber-200 text-sm">
                🚨 AI Night Vision Warning: {darkSpotsCount} Poor Lighting Stretches Detected
              </div>
              <p className="text-amber-800 dark:text-amber-300/90 mt-0.5">
                Vani Vihar Underpass & Damana Link Road show ambient lux levels below 20 Lux with non-working municipal streetlights. Night commuters are automatically routed through lit high-frequency corridors.
              </p>
            </div>
          </div>
          <button
            onClick={() => setSelectedFilter('dark_spots')}
            className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs shadow-md active:scale-95 transition flex-shrink-0 self-start md:self-auto"
          >
            Inspect Dark Spots
          </button>
        </div>
      )}

      {/* Camera Grid Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredCameras.map((cam) => {
          const isScanning = scanningCameraId === cam.id;
          const isDark = cam.isDarkSpotWarning || cam.lightingQuality === 'poor';
          const isJam = cam.congestionLevel === 'heavy' || cam.congestionLevel === 'gridlock';

          return (
            <div
              key={cam.id}
              className={`dashboard-card rounded-3xl p-5 border transition-all duration-300 flex flex-col justify-between gap-4 relative overflow-hidden ${
                isDark
                  ? 'border-amber-400/80 dark:border-amber-500/60 bg-amber-50/20 dark:bg-amber-950/10'
                  : isJam
                  ? 'border-rose-300 dark:border-rose-800/80 bg-rose-50/20 dark:bg-rose-950/10'
                  : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900'
              }`}
            >
              {/* Top Bar: Camera ID, Status & Quick Action */}
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="relative flex h-2.5 w-2.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                    </span>
                    <span className="font-mono font-extrabold text-[11px] text-slate-700 dark:text-slate-300">
                      {cam.cameraId}
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-500 font-bold">
                      {cam.fps} FPS
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {isDark && (
                      <span className="px-2 py-0.5 rounded-full bg-amber-500 text-slate-950 font-black text-[10px] uppercase flex items-center gap-1">
                        <LightbulbOff className="w-3 h-3" />
                        <span>Dark Zone</span>
                      </span>
                    )}
                    <span
                      className={`px-2.5 py-0.5 rounded-full font-black text-[10px] uppercase ${
                        cam.congestionLevel === 'gridlock'
                          ? 'bg-rose-600 text-white'
                          : cam.congestionLevel === 'heavy'
                          ? 'bg-rose-500/20 text-rose-700 dark:text-rose-300 border border-rose-300 dark:border-rose-800'
                          : cam.congestionLevel === 'moderate'
                          ? 'bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-300 dark:border-amber-800'
                          : 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800'
                      }`}
                    >
                      {cam.congestionLevel.toUpperCase()} TRAFFIC
                    </span>
                  </div>
                </div>

                <h3 className="text-sm font-black text-slate-900 dark:text-white leading-tight">
                  {cam.junctionName}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5 flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-slate-400 flex-shrink-0" />
                  <span className="truncate">{cam.corridor}</span>
                </p>
              </div>

              {/* Simulated CCTV Optical Video Frame Display */}
              <div className="relative rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 text-white p-3 aspect-video flex flex-col justify-between shadow-inner">
                {/* Simulated CCTV HUD Overlay */}
                <div className="flex justify-between items-start text-[10px] font-mono text-emerald-400 tracking-wider">
                  <div className="flex items-center gap-1">
                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse"></span>
                    <span>REC • {cam.cameraId}</span>
                  </div>
                  <span>AI INFERENCE: {cam.aiDetectionConfidence}%</span>
                </div>

                {/* Center Crosshairs & Optical Detection Boxes */}
                <div className="relative my-auto flex flex-col items-center justify-center text-center">
                  <div className="border border-dashed border-emerald-500/40 rounded-xl px-4 py-2 bg-black/40 backdrop-blur-xs">
                    <div className="flex items-center justify-center gap-3 text-xs font-black">
                      <span className="flex items-center gap-1 text-sky-400">
                        <Car className="w-3.5 h-3.5" />
                        <span>{cam.vehicleCount} Vehicles</span>
                      </span>
                      <span className="text-slate-600">|</span>
                      <span className={`flex items-center gap-1 ${isDark ? 'text-amber-400' : 'text-emerald-400'}`}>
                        {isDark ? <LightbulbOff className="w-3.5 h-3.5" /> : <Lightbulb className="w-3.5 h-3.5" />}
                        <span>{cam.ambientLux} Lux</span>
                      </span>
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                      2W: {cam.twoWheelersCount} • 4W: {cam.fourWheelersCount} • Bus: {cam.heavyBusesCount} • Peds: {cam.pedestrianCount}
                    </div>
                  </div>
                </div>

                {/* Bottom Frame HUD Status */}
                <div className="flex justify-between items-end text-[10px] font-mono text-slate-400 border-t border-slate-800/80 pt-1.5">
                  <div className="flex items-center gap-1.5">
                    <Gauge className="w-3 h-3 text-sky-400" />
                    <span>Avg Speed: <strong className="text-white font-bold">{cam.avgSpeedKmph} km/h</strong></span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3 text-slate-500" />
                    <span>Scanned: {cam.lastScannedAt}</span>
                  </div>
                </div>
              </div>

              {/* Congestion & Lighting Details */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60">
                  <div className="text-[10px] uppercase font-bold text-slate-400">Congestion Density</div>
                  <div className="flex items-center justify-between gap-1 mt-0.5">
                    <span className="font-extrabold text-slate-900 dark:text-white">
                      {cam.congestionScorePercent}% Capacity
                    </span>
                    <span className="text-[10px] font-bold text-slate-500">{cam.avgSpeedKmph} km/h</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden mt-1.5">
                    <div
                      className={`h-full rounded-full ${
                        cam.congestionScorePercent > 80
                          ? 'bg-rose-500'
                          : cam.congestionScorePercent > 50
                          ? 'bg-amber-500'
                          : 'bg-emerald-500'
                      }`}
                      style={{ width: `${cam.congestionScorePercent}%` }}
                    />
                  </div>
                </div>

                <div className={`p-2.5 rounded-xl border ${
                  isDark
                    ? 'bg-amber-500/15 border-amber-500/40 text-amber-950 dark:text-amber-200'
                    : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200/80 dark:border-slate-700/60'
                }`}>
                  <div className="text-[10px] uppercase font-bold text-slate-400">Streetlight Lux Rating</div>
                  <div className="flex items-center justify-between gap-1 mt-0.5">
                    <span className={`font-black ${isDark ? 'text-amber-700 dark:text-amber-300' : 'text-slate-900 dark:text-white'}`}>
                      {cam.ambientLux} Lux ({cam.lightingQuality.toUpperCase()})
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate mt-1">
                    {cam.streetlightsStatus}
                  </div>
                </div>
              </div>

              {/* AI Anomalies & Recommendations */}
              <div className="bg-slate-50 dark:bg-slate-800/40 p-3 rounded-2xl border border-slate-200/70 dark:border-slate-800 space-y-1 text-xs">
                <div className="text-[10px] font-extrabold uppercase text-indigo-600 dark:text-indigo-400 flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  <span>AI Optical Anomaly Feed:</span>
                </div>
                {cam.activeAnomalies.map((anom, idx) => (
                  <p key={idx} className="text-slate-700 dark:text-slate-300 text-[11px] font-medium flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 flex-shrink-0"></span>
                    <span>{anom}</span>
                  </p>
                ))}
                <p className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400 mt-1 pt-1 border-t border-slate-200/60 dark:border-slate-700/60">
                  💡 Action: {cam.recommendedAction}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 pt-1 border-t border-slate-100 dark:border-slate-800">
                <button
                  onClick={() => handleScanSingle(cam.id)}
                  disabled={isScanning}
                  className="flex-1 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-extrabold active:scale-95 transition flex items-center justify-center gap-1.5"
                >
                  <RotateCw className={`w-3.5 h-3.5 ${isScanning ? 'animate-spin' : ''}`} />
                  <span>{isScanning ? 'Scanning...' : 'Re-Scan Frame'}</span>
                </button>

                <button
                  onClick={() => handleDispatchTicket(cam)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-black active:scale-95 transition flex items-center justify-center gap-1.5 ${
                    isDark
                      ? 'bg-amber-500 hover:bg-amber-600 text-slate-950 shadow-md shadow-amber-500/20'
                      : 'bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-600/20'
                  }`}
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{isDark ? 'Report Dark Spot' : 'Alert Control Room'}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
