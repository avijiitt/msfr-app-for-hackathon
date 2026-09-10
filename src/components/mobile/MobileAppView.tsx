import React, { useState } from 'react';
import { MobileHeader } from './MobileHeader';
import { MobileNavigation, MobileTab } from './MobileNavigation';
import { MobileTripPlanner } from './MobileTripPlanner';
import { MobileLiveMap } from './MobileLiveMap';
import { MobileRideDetails } from './MobileRideDetails';
import { Vehicle } from '../../types/transit';
import { LanguageCode } from '../../types/i18n';
import { LiveLocationData } from '../../services/geolocationService';

import { IndiaLocationResult } from '../../services/indiaGeocodingService';

import { TransportationHubView } from '../transportation/TransportationHubView';
import { LogisticsHubView } from '../logistics/LogisticsHubView';
import { CommunityHubView } from '../community/CommunityHubView';
import { translations } from '../../data/translations';
import { DeliveryWaypoint } from '../../services/logisticsOptimizerService';
import { calculateDynamicETA } from '../../services/etaService';
import { isBhubaneswarRegion } from '../../services/fareMatrixService';

interface MobileAppViewProps {
  originQuery: string;
  destQuery: string;
  onOriginChange: (val: string) => void;
  onDestChange: (val: string) => void;
  onSearch: (orig: string, dest: string) => void;
  onSelectDestination: (dest: string) => void;
  onOpenMenu: () => void;
  onOpenProfile: () => void;
  onOpenAlerts: () => void;
  onOpenLanguage: () => void;
  onOpenWallet: () => void;
  onOpenBusRoutes: () => void;
  onOpenAI?: () => void;
  onOpenFareCalc: () => void;
  onOpenTripsHistory: () => void;
  onTriggerSOS: () => void;
  themeMode: 'light' | 'dark';
  onToggleTheme: () => void;
  currentLang: LanguageCode;
  walletBalance: number;
  userName?: string;
  vehicles: Vehicle[];
  userLocation: LiveLocationData | null;
  originCoords: [number, number] | null;
  destCoords: [number, number] | null;
  onSelectLocationOnMap: (lat: number, lng: number, name?: string, type?: 'origin' | 'dest') => void;
  onOriginSelected?: (result: IndiaLocationResult) => void;
  onDestSelected?: (result: IndiaLocationResult) => void;
  onUseLiveGps?: () => void;
  isGpsActive?: boolean;
  logisticsWaypoints?: DeliveryWaypoint[];
  onLogisticsWaypointsChange?: (waypoints: DeliveryWaypoint[]) => void;
}

export const MobileAppView: React.FC<MobileAppViewProps> = ({
  originQuery,
  destQuery,
  onOriginChange,
  onDestChange,
  onSearch,
  onSelectDestination,
  onOpenMenu,
  onOpenProfile,
  onOpenAlerts,
  onOpenLanguage,
  onOpenWallet,
  onOpenBusRoutes,
  onOpenAI,
  onOpenFareCalc,
  onOpenTripsHistory,
  onTriggerSOS,
  themeMode,
  onToggleTheme,
  currentLang,
  walletBalance,
  userName,
  vehicles,
  userLocation,
  originCoords,
  destCoords,
  onSelectLocationOnMap,
  onOriginSelected,
  onDestSelected,
  onUseLiveGps,
  isGpsActive = false,
  logisticsWaypoints,
  onLogisticsWaypointsChange,
}) => {

  const [activeTab, setActiveTab] = useState<MobileTab>('home');
  const [isRideDetailsOpen, setIsRideDetailsOpen] = useState(false);

  const t = translations[currentLang] || translations.en;

  const handleTabChange = (tab: MobileTab) => {
    setActiveTab(tab);
    setIsRideDetailsOpen(false);
    if (tab === 'profile') {
      onOpenProfile();
    }
  };

  const isBbsrArea = isBhubaneswarRegion(originQuery, destQuery, originCoords, destCoords);
  const dynamicDistanceKm = React.useMemo(() => {
    if (originCoords && destCoords) {
      const latDiff = originCoords[0] - destCoords[0];
      const lngDiff = (originCoords[1] - destCoords[1]) * Math.cos((originCoords[0] * Math.PI) / 180);
      const direct = Math.sqrt(latDiff * latDiff + lngDiff * lngDiff) * 111.32;
      const roadFactor = direct < 3 ? 1.40 : direct > 15 ? 1.25 : 1.32;
      return Math.max(1.0, Math.round(direct * roadFactor * 10) / 10);
    }
    return 8.5;
  }, [originCoords, destCoords]);

  const selectedRideDuration = React.useMemo(() => {
    if (!originCoords || !destCoords) return undefined;
    if (!isBbsrArea) {
      return calculateDynamicETA({ distanceKm: dynamicDistanceKm, mode: 'train', isIntercity: true }).totalDurationMins;
    }
    return calculateDynamicETA({ distanceKm: dynamicDistanceKm, mode: 'bus', hasPriorityLane: true }).totalDurationMins;
  }, [dynamicDistanceKm, isBbsrArea, originCoords, destCoords]);

  const selectedRideDistance = originCoords && destCoords ? dynamicDistanceKm : undefined;

  return (
    <div className="flex flex-col min-h-screen w-full bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 overflow-x-hidden antialiased">
      {/* Fixed Mobile TopAppBar */}
      <MobileHeader
        onOpenMenu={onOpenMenu}
        onOpenProfile={onOpenProfile}
        onOpenAlerts={onOpenAlerts}
        onOpenLanguage={onOpenLanguage}
        onOpenWallet={onOpenWallet}
        onOpenBusRoutes={onOpenBusRoutes}
        onOpenAI={onOpenAI}
        onTriggerSOS={onTriggerSOS}
        themeMode={themeMode}
        onToggleTheme={onToggleTheme}
        currentLang={currentLang}
        walletBalance={walletBalance}
        userName={userName}
      />

      {/* Main View Area */}
      <main className="flex-1 w-full relative">
        {isRideDetailsOpen ? (
          <MobileRideDetails
            originName={originQuery}
            destinationName={destQuery}
            onBack={() => setIsRideDetailsOpen(false)}
            onShareTrip={() => {}}
            onScheduleTrip={() => {}}
            onStartTracking={() => {
              setIsRideDetailsOpen(false);
              setActiveTab('map');
            }}
          />
        ) : activeTab === 'map' ? (
          <MobileLiveMap
            vehicles={vehicles}
            userLocation={userLocation}
            originCoords={originCoords}
            destCoords={destCoords}
            originQuery={originQuery}
            destQuery={destQuery}
            themeMode={themeMode}
            onSelectLocationOnMap={onSelectLocationOnMap}
            onBackToPlanner={() => setActiveTab('home')}
            onOpenRideDetails={() => setIsRideDetailsOpen(true)}
            selectedRideDuration={selectedRideDuration}
            selectedRideDistance={selectedRideDistance}
            selectedRideLabel="Fastest"
          />
        ) : activeTab === 'transportation' ? (
          <TransportationHubView
            originName={originQuery}
            destinationName={destQuery}
            onSelectRoute={(rId) => {
              onSearch(originQuery, destQuery);
              setActiveTab('home');
            }}
            onNavigateToMap={() => setActiveTab('map')}
          />
        ) : activeTab === 'logistics' ? (
          <LogisticsHubView
            waypoints={logisticsWaypoints}
            onWaypointsChange={onLogisticsWaypointsChange}
            onNavigateToMap={() => setActiveTab('map')}
          />
        ) : activeTab === 'community' ? (
          <CommunityHubView
            onNavigateToMap={() => setActiveTab('map')}
          />
        ) : (
          <MobileTripPlanner
            originQuery={originQuery}
            destQuery={destQuery}
            onOriginChange={onOriginChange}
            onDestChange={onDestChange}
            onSearch={onSearch}
            onSelectDestination={onSelectDestination}
            onOpenFareCalc={onOpenFareCalc}
            onTrackTrip={() => setIsRideDetailsOpen(true)}
            onOriginSelected={onOriginSelected}
            onDestSelected={onDestSelected}
            onOpenBusRoutes={onOpenBusRoutes}
            onOpenAlerts={onOpenAlerts}
            onUseLiveGps={onUseLiveGps}
            isGpsActive={isGpsActive}
            t={t}
          />
        )}
      </main>

      {/* Fixed Mobile BottomNavBar */}
      <MobileNavigation
        activeTab={activeTab}
        onTabChange={handleTabChange}
      />
    </div>
  );
};
