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
