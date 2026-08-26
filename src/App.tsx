import React, { useState, useEffect } from 'react';
import { translations } from './data/translations';
import { LanguageCode } from './types/i18n';
import { Vehicle, Station, JourneyOption, UserProfile, ThemeMode, RouteMode } from './types/transit';
import { BHUBANESWAR_STATIONS } from './data/cities/bhubaneswar';
import { transitSimulator } from './services/transitSimulator';
import { walletService } from './services/walletService';
import { sosService } from './services/sosService';
import { geolocationService, LiveLocationData } from './services/geolocationService';
import { IndiaLocationResult } from './services/indiaGeocodingService';

// Redesigned Musafir Layout & Core Components
import { MusafirHeader } from './components/layout/MusafirHeader';
import { MusafirSidebar, MusafirSidebarTab } from './components/layout/MusafirSidebar';
import { MusafirMap } from './components/map/MusafirMap';
import { BestRoutesCarousel } from './components/planner/BestRoutesCarousel';
import { JourneyDetailPanel } from './components/journey/JourneyDetailPanel';
import { PopupAIAssistant } from './components/ai/PopupAIAssistant';

// Modals
import { FareCalculatorModal } from './components/fare/FareCalculatorModal';
import { RewardsModal } from './components/rewards/RewardsModal';
import { TripAssuranceModal } from './components/refunds/TripAssuranceModal';
import { RideFeedbackModal } from './components/feedback/RideFeedbackModal';
import { AnnouncementsDrawer } from './components/announcements/AnnouncementsDrawer';
import { NearbyAmenitiesDrawer } from './components/amenities/NearbyAmenitiesDrawer';
import { SOSModal } from './components/safety/SOSModal';
import { FamilyShareModal } from './components/safety/FamilyShareModal';
import { MedicalIDModal } from './components/safety/MedicalIDModal';
import { WomenSafetyHub } from './components/safety/WomenSafetyHub';
import { WalletModal } from './components/wallet/WalletModal';
import { StudentHubModal } from './components/student/StudentHubModal';
import { ParcelBookingModal } from './components/parcel/ParcelBookingModal';
import { ScheduleRideModal } from './components/schedule/ScheduleRideModal';
import { CustomerSupportModal } from './components/support/CustomerSupportModal';
import { UserProfileView } from './components/user/UserProfileView';

export const App: React.FC = () => {
  // Theme & Language
  const [themeMode, setThemeMode] = useState<ThemeMode>('light');
  const [currentLang, setCurrentLang] = useState<LanguageCode>('en');

  // Sidebar & Navigation
  const [activeTab, setActiveTab] = useState<MusafirSidebarTab>('plan');

  // Search Origin, Destination & 6 Optimization Modes
  const [originQuery, setOriginQuery] = useState('Jayadev Vihar');
  const [destQuery, setDestQuery] = useState('KIIT Square, Bhubaneswar');
  // Real geocoded coordinates for map panning (null = not yet geocoded)
  const [originCoords, setOriginCoords] = useState<[number, number] | null>([20.3039, 85.8188]);
  const [destCoords, setDestCoords] = useState<[number, number] | null>([20.3541, 85.8175]);
  const [selectedRouteId, setSelectedRouteId] = useState('route-rec');
  const [activeFilterMode, setActiveFilterMode] = useState<RouteMode>('fastest');

  // Offline Mode State
  const [isOffline, setIsOffline] = useState(false);

  // Real-Time GPS Location
  const [isGpsActive, setIsGpsActive] = useState(false);
  const [userLocation, setUserLocation] = useState<LiveLocationData>(geolocationService.getLocation());

  // Fleet & Simulator
  const [vehicles, setVehicles] = useState<Vehicle[]>(transitSimulator.getVehicles());

  // User Profile & Wallet
  const [walletBalance, setWalletBalance] = useState(walletService.getBalance());
  const [userProfile, setUserProfile] = useState<UserProfile>(sosService.getProfile());

  // Modals
  const [isFareCalcOpen, setIsFareCalcOpen] = useState(false);
  const [isRewardsOpen, setIsRewardsOpen] = useState(false);
  const [isTripAssuranceOpen, setIsTripAssuranceOpen] = useState(false);
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const [isAlertsOpen, setIsAlertsOpen] = useState(false);
  const [isAmenitiesOpen, setIsAmenitiesOpen] = useState(false);
  const [isSosOpen, setIsSosOpen] = useState(false);
  const [isFamilyShareOpen, setIsFamilyShareOpen] = useState(false);
  const [isMedicalIdOpen, setIsMedicalIdOpen] = useState(false);
  const [isWomenSafetyOpen, setIsWomenSafetyOpen] = useState(false);
  const [isWalletOpen, setIsWalletOpen] = useState(false);
  const [isStudentOpen, setIsStudentOpen] = useState(false);
  const [isParcelOpen, setIsParcelOpen] = useState(false);
  const [isScheduleOpen, setIsScheduleOpen] = useState(false);
  const [isSupportOpen, setIsSupportOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const t = translations[currentLang] || translations.en;

  // Simulator Lifecycle
  useEffect(() => {
    transitSimulator.start();
    const unsub = transitSimulator.subscribe((newVehicles) => {
      setVehicles(newVehicles);
    });
    return () => {
      unsub();
      transitSimulator.stop();
    };
  }, []);

  // GPS Geolocation Subscription
  useEffect(() => {
    const unsub = geolocationService.subscribe((loc) => {
      setUserLocation(loc);
    });
    return () => unsub();
  }, []);

  // Theme effect
  useEffect(() => {
    const root = document.documentElement;
    if (themeMode === 'dark') {
      root.classList.add('dark');
      root.classList.remove('light');
    } else {
      root.classList.add('light');
      root.classList.remove('dark');
    }
  }, [themeMode]);

  const handleToggleTheme = () => {
    setThemeMode((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const handleUseLiveGps = () => {
    if (!isGpsActive) {
      geolocationService.startLiveTracking();
      setIsGpsActive(true);
      setOriginQuery('Current Location (GPS)');
    } else {
      geolocationService.stopLiveTracking();
      setIsGpsActive(false);
    }
  };

  const handleSearch = (from: string, to: string) => {
    setOriginQuery(from);
    setDestQuery(to);
  };

  // Called when user picks a location from dropdown (has real lat/lng)
  const handleOriginSelected = (result: IndiaLocationResult) => {
    setOriginCoords([result.lat, result.lng]);
    setOriginQuery(result.name);
  };

  const handleDestSelected = (result: IndiaLocationResult) => {
    setDestCoords([result.lat, result.lng]);
    setDestQuery(result.name);
  };

  // Called when user clicks directly on the map
  const handleSelectLocationOnMap = (lat: number, lng: number) => {
    const pinned = `Pinned Location (${lat.toFixed(4)}, ${lng.toFixed(4)})`;
    setDestQuery(pinned);
    setDestCoords([lat, lng]);
  };


  const handleSidebarTabChange = (tab: MusafirSidebarTab) => {
    setActiveTab(tab);
    if (tab === 'fare_calc') {
      setIsFareCalcOpen(true);
    } else if (tab === 'rewards') {
      setIsRewardsOpen(true);
    } else if (tab === 'refunds') {
      setIsTripAssuranceOpen(true);
    } else if (tab === 'alerts') {
      setIsAlertsOpen(true);
    } else if (tab === 'schedule') {
      setIsScheduleOpen(true);
    } else if (tab === 'parcel') {
      setIsParcelOpen(true);
    } else if (tab === 'wallet') {
      setIsWalletOpen(true);
    } else if (tab === 'settings') {
      setIsProfileOpen(true);
    }
  };

  const handleStartNavigation = () => {
    alert('🚀 Real-time navigation started! Turn-by-turn guidance and live vehicle GPS updates active.');
    setTimeout(() => {
      setIsFeedbackOpen(true);
    }, 4000);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#0B1120] text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors duration-200">
      {/* 1. Top Header */}
      <MusafirHeader
        originQuery={originQuery}
        setOriginQuery={setOriginQuery}
        destQuery={destQuery}
        setDestQuery={setDestQuery}
        onSearch={handleSearch}
        onUseLiveGps={handleUseLiveGps}
        isGpsActive={isGpsActive}
        isOffline={isOffline}
        onToggleOffline={() => setIsOffline(!isOffline)}
        walletBalance={walletBalance}
        onOpenWallet={() => setIsWalletOpen(true)}
        themeMode={themeMode}
        onToggleTheme={handleToggleTheme}
        unreadAlertsCount={3}
        onOpenAlerts={() => setIsAlertsOpen(true)}
        onOpenProfile={() => setIsProfileOpen(true)}
        onOriginSelected={handleOriginSelected}
        onDestSelected={handleDestSelected}
      />

      {/* 2. Main 3-Column Dashboard Body */}
      <div className="flex-1 max-w-[1600px] w-full mx-auto flex flex-col lg:flex-row gap-4 sm:gap-6 p-3 sm:p-6">
        {/* Column 1: Left Aligned Sidebar (Not bulky) */}
        <MusafirSidebar
          activeTab={activeTab}
          onTabChange={handleSidebarTabChange}
          onOpenNearbyStops={() => setIsAmenitiesOpen(true)}
          onOpenShareLocation={() => setIsFamilyShareOpen(true)}
          onOpenSOS={() => setIsSosOpen(true)}
          onOpenStudent={() => setIsStudentOpen(true)}
          onSelectSavedPlace={(place) => setDestQuery(place)}
        />

        {/* Column 2: Center Main Content (Large Map + Best Routes Cards + Highlight Badges) */}
        <main className="flex-1 flex flex-col gap-6 min-w-0">
          {/* Large Map Canvas — pans to real India coordinates */}
          <MusafirMap
            vehicles={vehicles}
            userLocation={userLocation}
            onSelectLocationOnMap={handleSelectLocationOnMap}
            themeMode={themeMode}
            isOffline={isOffline}
            destinationName={destQuery}
            originCoords={originCoords}
            destCoords={destCoords}
          />

          {/* Best Routes for You Section (with 6 Smart Optimization Modes) */}
          <BestRoutesCarousel
            selectedRouteId={selectedRouteId}
            onSelectRoute={(id) => setSelectedRouteId(id)}
            activeFilterMode={activeFilterMode}
            onFilterModeChange={(mode) => setActiveFilterMode(mode)}
            onOpenLiveUpdates={() => alert('Real-time fleet GPS tracking active across all routes.')}
            onOpenSmartAlerts={() => setIsAlertsOpen(true)}
            onOpenSafeJourney={() => setIsFamilyShareOpen(true)}
            onOpenSaveMore={() => setIsFareCalcOpen(true)}
          />
        </main>

        {/* Column 3: Right Sidebar (Your Journey Panel with Multiple Stops) */}
        <JourneyDetailPanel
          onStartNavigation={handleStartNavigation}
          onShareTrip={() => setIsFamilyShareOpen(true)}
          onBookPass={() => setIsWalletOpen(true)}
          onOpenTripAssurance={() => setIsTripAssuranceOpen(true)}
          onOpenScheduleRide={() => setIsScheduleOpen(true)}
          onOpenFareDetails={() => setIsFareCalcOpen(true)}
        />
      </div>

      {/* 3. Floating Popup AI Assistant (Bottom Right) */}
      <PopupAIAssistant
        onOpenFareMatrix={() => setIsFareCalcOpen(true)}
        onOpenRewards={() => setIsRewardsOpen(true)}
        onOpenTripAssurance={() => setIsTripAssuranceOpen(true)}
        onOpenSOS={() => setIsSosOpen(true)}
      />

      {/* 4. Modals */}
      <FareCalculatorModal
        isOpen={isFareCalcOpen}
        onClose={() => setIsFareCalcOpen(false)}
        originName={originQuery}
        destName={destQuery}
      />

      <RewardsModal
        isOpen={isRewardsOpen}
        onClose={() => setIsRewardsOpen(false)}
        onCoinsUpdated={() => setWalletBalance(walletService.getBalance())}
      />

      <TripAssuranceModal
        isOpen={isTripAssuranceOpen}
        onClose={() => setIsTripAssuranceOpen(false)}
        onRefundClaimed={(newBal) => setWalletBalance(newBal)}
      />

      <RideFeedbackModal
        isOpen={isFeedbackOpen}
        onClose={() => setIsFeedbackOpen(false)}
      />

      <ParcelBookingModal
        isOpen={isParcelOpen}
        onClose={() => setIsParcelOpen(false)}
        t={t}
      />

      <ScheduleRideModal
        isOpen={isScheduleOpen}
        onClose={() => setIsScheduleOpen(false)}
        t={t}
      />

      <AnnouncementsDrawer
        isOpen={isAlertsOpen}
        onClose={() => setIsAlertsOpen(false)}
        t={t}
      />

      <NearbyAmenitiesDrawer
        isOpen={isAmenitiesOpen}
        onClose={() => setIsAmenitiesOpen(false)}
        t={t}
      />

      <SOSModal
        isOpen={isSosOpen}
        onClose={() => setIsSosOpen(false)}
        userProfile={userProfile}
        currentCoords={[userLocation.lat, userLocation.lng]}
        nearestStationName={originQuery}
        t={t}
      />

      <FamilyShareModal
        isOpen={isFamilyShareOpen}
        onClose={() => setIsFamilyShareOpen(false)}
        userProfile={userProfile}
        onUpdateProfile={setUserProfile}
        t={t}
      />

      <MedicalIDModal
        isOpen={isMedicalIdOpen}
        onClose={() => setIsMedicalIdOpen(false)}
        userProfile={userProfile}
        onUpdateProfile={setUserProfile}
        t={t}
      />

      <WomenSafetyHub
        isOpen={isWomenSafetyOpen}
        onClose={() => setIsWomenSafetyOpen(false)}
        onOpenPinkPass={() => setIsWalletOpen(true)}
        onPlanNightSafe={() => setActiveFilterMode('night')}
        t={t}
      />

      <WalletModal
        isOpen={isWalletOpen}
        onClose={() => setIsWalletOpen(false)}
        walletBalance={walletBalance}
        onBalanceUpdated={setWalletBalance}
        t={t}
      />

      <StudentHubModal
        isOpen={isStudentOpen}
        onClose={() => setIsStudentOpen(false)}
        userProfile={userProfile}
        onUpdateProfile={setUserProfile}
        onPassClaimed={() => setIsWalletOpen(true)}
        t={t}
      />

      <CustomerSupportModal
        isOpen={isSupportOpen}
        onClose={() => setIsSupportOpen(false)}
        t={t}
      />

      {isProfileOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="max-w-2xl w-full bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setIsProfileOpen(false)}
              className="absolute top-4 right-4 p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 font-bold"
            >
              ✕
            </button>
            <UserProfileView
              userProfile={userProfile}
              onUpdateProfile={setUserProfile}
              onOpenStudent={() => {
                setIsProfileOpen(false);
                setIsStudentOpen(true);
              }}
              onOpenSupport={() => {
                setIsProfileOpen(false);
                setIsSupportOpen(true);
              }}
              t={t}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
