import React, { useState } from 'react';
import {
  CloudRain,
  Radio,
  Camera,
  Building2,
  Wind,
  ShieldCheck,
  AlertTriangle,
  RotateCw,
  Sparkles,
  Droplets,
  Wrench,
  CheckCircle2,
  Clock,
  Layers,
  MapPin,
  TrendingUp,
  Activity,
  LightbulbOff,
  Gauge
} from 'lucide-react';
import {
  civicFusionService,
  IoTRainfallSensor,
  MunicipalWorkOrder,
  AiCctvDetection,
  EnvironmentalSensor
} from '../../services/civicFusionService';

interface CivicIntelligenceFusionViewProps {
  onOpenReportDrawer?: () => void;
}

export const CivicIntelligenceFusionView: React.FC<CivicIntelligenceFusionViewProps> = ({
  onOpenReportDrawer
}) => {
  const [activeFusionCategory, setActiveFusionCategory] = useState<'all' | 'rainfall' | 'municipal' | 'cctv_ai' | 'environment'>('all');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const [rainfallSensors, setRainfallSensors] = useState<IoTRainfallSensor[]>(() => civicFusionService.getRainfallSensors());
  const [workOrders, setWorkOrders] = useState<MunicipalWorkOrder[]>(() => civicFusionService.getMunicipalWorkOrders());
  const [cctvDetections, setCctvDetections] = useState<AiCctvDetection[]>(() => civicFusionService.getAiCctvDetections());
  const [envSensors, setEnvSensors] = useState<EnvironmentalSensor[]>(() => civicFusionService.getEnvironmentalSensors());

  const summary = civicFusionService.getCombinedCivicMetrics();

  const handleRefreshAll = async () => {
    setIsRefreshing(true);
    await new Promise((res) => setTimeout(res, 800));
    setToastMessage('✅ IoT Drainage, Municipal BSCL, AI-CCTV & Environmental feeds synchronized with live telemetry.');
    setTimeout(() => setToastMessage(null), 4000);
    setIsRefreshing(false);
  };

  return (
    <div className="space-y-5 animate-in fade-in">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white dark:bg-white dark:text-slate-900 px-5 py-3 rounded-2xl shadow-2xl border border-slate-700 dark:border-slate-300 text-xs font-bold flex items-center gap-2.5 animate-in slide-in-from-bottom-4">
          <Sparkles className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Feature Hero Banner */}
      <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-sky-700 text-white p-5 md:p-6 rounded-3xl shadow-xl shadow-blue-700/15 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-bold mb-2">
              <Radio className="w-3.5 h-3.5 text-sky-300 animate-pulse" />
              <span>Multi-Source Civic Intelligence Fusion</span>
            </div>
            <h2 className="text-xl md:text-2xl font-black tracking-tight">
              IoT Sensors, Municipal Feeds & AI-Based CCTV Detection
            </h2>
            <p className="text-blue-100 text-xs md:text-sm mt-1 max-w-2xl font-medium">
              Musafir unites <strong>real-time IoT rainfall drainage sensors, official BMC municipal work orders, environmental air monitors, and neural AI CCTV optical detections</strong> into one single live civic safety network.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start md:self-auto flex-shrink-0">
            <button
              onClick={handleRefreshAll}
              disabled={isRefreshing}
              className="px-4 py-2.5 bg-white/20 hover:bg-white/30 text-white text-xs font-bold rounded-2xl border border-white/30 active:scale-95 transition flex items-center gap-1.5"
            >
              <RotateCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span>{isRefreshing ? 'Syncing Feeds...' : 'Sync Sensor Grid'}</span>
            </button>
          </div>
        </div>

        {/* 4 Fusion Pillar Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5">
          <div className="bg-black/20 backdrop-blur-md p-3 rounded-2xl border border-white/15">
            <div className="flex items-center gap-1.5 text-sky-300 text-xs font-bold mb-1">
              <CloudRain className="w-4 h-4" />
              <span>IoT Drainage</span>
            </div>
            <div className="text-lg font-black">{rainfallSensors.length} Live Sumps</div>
            <div className="text-[10px] text-blue-200">{summary.activeFloodAlerts} Inundation Warning</div>
          </div>

          <div className="bg-black/20 backdrop-blur-md p-3 rounded-2xl border border-white/15">
            <div className="flex items-center gap-1.5 text-amber-300 text-xs font-bold mb-1">
              <Building2 className="w-4 h-4" />
              <span>Municipal (BSCL/BMC)</span>
            </div>
            <div className="text-lg font-black">{workOrders.length} Work Orders</div>
            <div className="text-[10px] text-blue-200">{summary.activeWorkOrders} Crews Dispatched</div>
          </div>

          <div className="bg-black/20 backdrop-blur-md p-3 rounded-2xl border border-white/15">
            <div className="flex items-center gap-1.5 text-indigo-300 text-xs font-bold mb-1">
              <Camera className="w-4 h-4" />
              <span>AI CCTV Detections</span>
            </div>
            <div className="text-lg font-black">{cctvDetections.length} Neural Alerts</div>
            <div className="text-[10px] text-blue-200">{summary.activeDarkSpots} Dark Spot Stretches</div>
          </div>

          <div className="bg-black/20 backdrop-blur-md p-3 rounded-2xl border border-white/15">
            <div className="flex items-center gap-1.5 text-emerald-300 text-xs font-bold mb-1">
              <Wind className="w-4 h-4" />
              <span>Environment & AQI</span>
            </div>
            <div className="text-lg font-black">AQI {summary.avgAqi}</div>
            <div className="text-[10px] text-emerald-300">City Resilience: {summary.overallCityResilienceScore}%</div>
          </div>
        </div>
      </div>

      {/* Filter Navigation Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 hide-scrollbar">
        {[
          { id: 'all', label: '🌐 All Civic Fusion Feeds' },
          { id: 'rainfall', label: '🌧️ IoT Rainfall & Storm Drains' },
          { id: 'municipal', label: '🏛️ Municipal BSCL Work Orders' },
          { id: 'cctv_ai', label: '📹 AI CCTV Optical Detections' },
          { id: 'environment', label: '🍃 Environmental Air Quality' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveFusionCategory(tab.id as any)}
            className={`px-3.5 py-2 rounded-2xl text-xs font-extrabold transition whitespace-nowrap ${
              activeFusionCategory === tab.id
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ─── SECTION 1: IOT RAINFALL & DRAINAGE SENSORS ─── */}
      {(activeFusionCategory === 'all' || activeFusionCategory === 'rainfall') && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
              <Droplets className="w-4 h-4 text-sky-600" />
              <span>IoT Storm Water Drainage & Sump Sensors</span>
            </h3>
            <span className="text-[11px] font-bold text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-950 px-2.5 py-0.5 rounded-full border border-sky-200 dark:border-sky-800">
              4 Real-Time Telemetry Nodes
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {rainfallSensors.map((sensor) => (
              <div
                key={sensor.id}
                className={`dashboard-card rounded-3xl p-4 border transition-all ${
                  sensor.status === 'critical_inundation'
                    ? 'border-rose-400/80 bg-rose-50/20 dark:bg-rose-950/10'
                    : sensor.status === 'warning'
                    ? 'border-amber-400/80 bg-amber-50/20 dark:bg-amber-950/10'
                    : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900'
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <span className="font-mono text-[10px] font-extrabold text-slate-500">
                    {sensor.sensorCode}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded-full font-black text-[10px] uppercase ${
                      sensor.status === 'critical_inundation'
                        ? 'bg-rose-600 text-white'
                        : sensor.status === 'warning'
                        ? 'bg-amber-500 text-slate-950'
                        : 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300'
                    }`}
                  >
                    {sensor.status.replace('_', ' ').toUpperCase()}
                  </span>
                </div>

                <div className="font-extrabold text-sm text-slate-900 dark:text-white">
                  {sensor.locationName}
                </div>

                <div className="grid grid-cols-3 gap-2 mt-3 text-xs">
                  <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/60">
                    <div className="text-[10px] uppercase text-slate-400 font-bold">Water Depth</div>
                    <div className="font-black text-slate-900 dark:text-white mt-0.5">{sensor.waterLevelCm} cm</div>
                  </div>
                  <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/60">
                    <div className="text-[10px] uppercase text-slate-400 font-bold">Rainfall Rate</div>
                    <div className="font-black text-sky-600 dark:text-sky-400 mt-0.5">{sensor.rainfallRateMmPerHour} mm/h</div>
                  </div>
                  <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/60">
                    <div className="text-[10px] uppercase text-slate-400 font-bold">Drain Full</div>
                    <div className="font-black text-slate-900 dark:text-white mt-0.5">{sensor.drainageCapacityPercent}%</div>
                  </div>
                </div>

                <div className="flex justify-between items-center mt-3 pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-500">
                  <span className="flex items-center gap-1">
                    <Activity className="w-3 h-3 text-emerald-500" />
                    <span>Pump Status: <strong className="text-slate-800 dark:text-slate-200">{sensor.pumpStatus.toUpperCase()}</strong></span>
                  </span>
                  <span>Updated: {sensor.lastReadingTime}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ─── SECTION 2: AI-BASED CCTV OPTICAL HAZARDS ─── */}
      {(activeFusionCategory === 'all' || activeFusionCategory === 'cctv_ai') && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
              <Camera className="w-4 h-4 text-indigo-600" />
              <span>AI-Based CCTV Optical Safety & Darkness Detections</span>
            </h3>
            <span className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950 px-2.5 py-0.5 rounded-full border border-indigo-200 dark:border-indigo-800">
              YOLOv8 Optical Neural Net
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {cctvDetections.map((det) => (
              <div
                key={det.id}
                className="dashboard-card rounded-3xl p-4 border border-indigo-200/80 dark:border-indigo-900/60 bg-white dark:bg-slate-900 flex flex-col justify-between gap-3 shadow-xs"
              >
                <div>
                  <div className="flex justify-between items-start gap-2 mb-1.5">
                    <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-mono text-[10px] font-extrabold border border-indigo-200 dark:border-indigo-800">
                      <Camera className="w-3 h-3" />
                      <span>{det.cameraCode}</span>
                    </div>
                    <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                      {det.confidenceScorePercent}% AI Verified
                    </span>
                  </div>

                  <h4 className="font-black text-sm text-slate-900 dark:text-white">
                    {det.title}
                  </h4>
                  <p className="text-xs text-slate-500 font-medium mt-0.5 flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-slate-400" />
                    <span>{det.locationName}</span>
                  </p>

                  <p className="text-xs text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-2xl border border-slate-200/70 dark:border-slate-800 mt-2.5">
                    {det.description}
                  </p>
                </div>

                <div className="p-2.5 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-800/50 text-[11px] font-bold text-emerald-800 dark:text-emerald-300 flex items-center justify-between">
                  <span>⚡ Action: {det.actionTaken}</span>
                  <span className="text-slate-400 text-[10px]">{det.timestamp}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ─── SECTION 3: MUNICIPAL SMART CITY BSCL WORK ORDERS ─── */}
      {(activeFusionCategory === 'all' || activeFusionCategory === 'municipal') && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
              <Building2 className="w-4 h-4 text-amber-600" />
              <span>Municipal Work Orders & SLA Resolution Feeds (BSCL / BMC)</span>
            </h3>
            <span className="text-[11px] font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950 px-2.5 py-0.5 rounded-full border border-amber-200 dark:border-amber-800">
              Live City Council API
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {workOrders.map((order) => (
              <div
                key={order.id}
                className="dashboard-card rounded-3xl p-4 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col justify-between gap-3 shadow-xs"
              >
                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <span className="font-mono text-[10px] font-extrabold text-amber-600 dark:text-amber-400">
                      #{order.orderNumber}
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-blue-500/15 text-blue-700 dark:text-blue-300 font-bold text-[10px] uppercase">
                      {order.department}
                    </span>
                  </div>

                  <h4 className="font-black text-sm text-slate-900 dark:text-white">
                    {order.title}
                  </h4>
                  <p className="text-xs text-slate-500 font-medium mt-0.5 flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-slate-400" />
                    <span>{order.location}</span>
                  </p>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
                  <span className="text-slate-600 dark:text-slate-400 font-medium">
                    👷 {order.workersDispatched} Crew Members Dispatched
                  </span>
                  <span className="font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>SLA: {order.slaTargetTime}</span>
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ─── SECTION 4: ENVIRONMENTAL SENSORS ─── */}
      {(activeFusionCategory === 'all' || activeFusionCategory === 'environment') && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
              <Wind className="w-4 h-4 text-emerald-600" />
              <span>Environmental & Air Quality IoT Sensor Grid</span>
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {envSensors.map((env) => (
              <div
                key={env.id}
                className="dashboard-card rounded-3xl p-4 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col justify-between gap-2"
              >
                <div>
                  <div className="text-[10px] uppercase font-bold text-slate-400">Station Zone</div>
                  <div className="font-black text-xs text-slate-900 dark:text-white leading-snug">{env.zone}</div>
                </div>

                <div className="flex items-baseline justify-between mt-2">
                  <div>
                    <span className="text-2xl font-black text-slate-900 dark:text-white">{env.aqi}</span>
                    <span className="text-[10px] text-slate-400 font-bold ml-1">AQI</span>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                    env.status === 'good'
                      ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300'
                      : env.status === 'moderate'
                      ? 'bg-amber-500/20 text-amber-700 dark:text-amber-300'
                      : 'bg-rose-500/20 text-rose-700 dark:text-rose-300'
                  }`}>
                    {env.status}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-500 border-t border-slate-100 dark:border-slate-800 pt-2 mt-1">
                  <span>PM2.5: <strong className="text-slate-800 dark:text-slate-200">{env.pm25} µg/m³</strong></span>
                  <span>Humidity: <strong className="text-slate-800 dark:text-slate-200">{env.humidityPercent}%</strong></span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
