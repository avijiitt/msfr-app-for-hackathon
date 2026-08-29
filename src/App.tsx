import React, { useState, useEffect } from 'react';
import { translations } from './data/translations';
import { LanguageCode } from './types/i18n';
import { Vehicle, Station, JourneyOption, UserProfile, ThemeMode, RouteMode } from './types/transit';
import { BHUBANESWAR_STATIONS, getHumanReadableLocationName } from './data/cities/bhubaneswar';
import { transitSimulator } from './services/transitSimulator';
import { walletService } from './services/walletService';
import { sosService } from './services/sosService';
import { geolocationService, LiveLocationData } from './services/geolocationService';
import { IndiaLocationResult, indiaGeocodingService, geocodeAddressIndia } from './services/indiaGeocodingService';
import { getStopCoordinates } from './data/busRoutesData';


// Redesigned Musafir Layout & Core Components
import { MusafirHeader } from './components/layout/MusafirHeader';
import { MusafirSidebar, MusafirSidebarTab } from './components/layout/MusafirSidebar';
import { MobileMenuDrawer } from './components/layout/MobileMenuDrawer';
import { MusafirMap } from './components/map/MusafirMap';
import { BestRoutesCarousel } from './components/planner/BestRoutesCarousel';
import { JourneyDetailPanel } from './components/journey/JourneyDetailPanel';
import { PopupAIAssistant } from './components/ai/PopupAIAssistant';
import { AIActionType } from './services/aiAssistantService';

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
import { LoginModal } from './components/auth/LoginModal';
import { authService, AuthUser } from './services/supabaseClient';
import { PermissionsModal } from './components/auth/PermissionsModal';
import { BusRoutesModal } from './components/routes/BusRoutesModal';
import { LanguageSelectModal } from './components/language/LanguageSelectModal';
import { tripService } from './services/tripService';
import { TripsHistoryModal } from './components/trips/TripsHistoryModal';
import { MobileAppView } from './components/mobile/MobileAppView';


export const App: React.FC = () => {
  // Theme & Language
  const [themeMode, setThemeMode] = useState<ThemeMode>('light');
  const [currentLang, setCurrentLang] = useState<LanguageCode>(
    () => (localStorage.getItem('musafir_lang') as LanguageCode) || 'en'
  );
  const [isLangSelectOpen, setIsLangSelectOpen] = useState(false);

  // Auth State — show login on first load if profile registration not completed
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(authService.getCurrentUser());
  const [isLoginOpen, setIsLoginOpen] = useState(() => !localStorage.getItem('musafir_profile_completed'));
  const [isPermissionsOpen, setIsPermissionsOpen] = useState(false);

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
  const [isTripsOpen, setIsTripsOpen] = useState(false);
  const [isBusRoutesOpen, setIsBusRoutesOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  const t = translations[currentLang] || translations.en;

  // Track if any modal, drawer or search dropdown is currently open to hide floating map badges
  const isAnyModalOpen = Boolean(
    isSearchFocused ||
    isLoginOpen ||
    isPermissionsOpen ||
    isMobileMenuOpen ||
    isBusRoutesOpen ||
    isFareCalcOpen ||
    isRewardsOpen ||
    isTripAssuranceOpen ||
    isFeedbackOpen ||
    isAlertsOpen ||
    isAmenitiesOpen ||
    isSosOpen ||
    isFamilyShareOpen ||
    isMedicalIdOpen ||
    isWomenSafetyOpen ||
    isWalletOpen ||
    isStudentOpen ||
    isParcelOpen ||
    isScheduleOpen ||
    isSupportOpen ||
    isProfileOpen ||
    isTripsOpen
  );

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

  // Update simulator region when origin or dest coords change
  useEffect(() => {
    if (originCoords && destCoords) {
      const centerLat = (originCoords[0] + destCoords[0]) / 2;
      const centerLng = (originCoords[1] + destCoords[1]) / 2;
      transitSimulator.updateRegion(centerLat, centerLng, [originCoords, destCoords]);
    } else if (destCoords) {
      transitSimulator.updateRegion(destCoords[0], destCoords[1]);
    } else if (originCoords) {
      transitSimulator.updateRegion(originCoords[0], originCoords[1]);
    }
  }, [originCoords, destCoords]);

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

  const handleUseLiveGps = async () => {
    if (!isGpsActive) {
      setIsGpsActive(true);
      geolocationService.startLiveTracking();
      const livePos = await geolocationService.getCurrentLivePosition();
      setOriginCoords([livePos.lat, livePos.lng]);
      const readable = getHumanReadableLocationName(livePos.lat, livePos.lng);
      setOriginQuery(`Current Location (${readable.replace('Pinned Location ', '')})`);
    } else {
      geolocationService.stopLiveTracking();
      setIsGpsActive(false);
    }
  };

  // Reactive Origin Coordinates Geocoding
  useEffect(() => {
    if (!originQuery) return;
    const resolved = getStopCoordinates(originQuery);
    if (resolved && (resolved[0] !== 20.2961 || resolved[1] !== 85.8245 || originQuery.toLowerCase().includes('master canteen') || originQuery.toLowerCase().includes('station'))) {
      setOriginCoords(resolved);
    } else {
      const local = indiaGeocodingService.searchLocations(originQuery)[0];
      if (local) {
        setOriginCoords([local.lat, local.lng]);
      } else if (originQuery.length > 2 && !originQuery.includes('Current Location')) {
        geocodeAddressIndia(originQuery).then((res) => {
          if (res[0]) setOriginCoords([res[0].lat, res[0].lng]);
        });
      }
    }
  }, [originQuery]);

  // Reactive Destination Coordinates Geocoding
  useEffect(() => {
    if (!destQuery) return;
    const resolved = getStopCoordinates(destQuery);
    if (resolved && (resolved[0] !== 20.2961 || resolved[1] !== 85.8245 || destQuery.toLowerCase().includes('master canteen') || destQuery.toLowerCase().includes('station'))) {
      setDestCoords(resolved);
    } else {
      const local = indiaGeocodingService.searchLocations(destQuery)[0];
      if (local) {
        setDestCoords([local.lat, local.lng]);
      } else if (destQuery.length > 2) {
        geocodeAddressIndia(destQuery).then((res) => {
          if (res[0]) setDestCoords([res[0].lat, res[0].lng]);
        });
      }
    }
  }, [destQuery]);

  const handleSearch = (from: string, to: string) => {
    setOriginQuery(from);
    setDestQuery(to);

    // Auto-resolve stop coordinates for map polyline and stoppage plotting
    const origCoord = getStopCoordinates(from);
    const dstCoord = getStopCoordinates(to);
    if (origCoord) {
      setOriginCoords(origCoord);
    } else {
      const local = indiaGeocodingService.searchLocations(from)[0];
      if (local) setOriginCoords([local.lat, local.lng]);
    }

    if (dstCoord) {
      setDestCoords(dstCoord);
    } else {
      const local = indiaGeocodingService.searchLocations(to)[0];
      if (local) setDestCoords([local.lat, local.lng]);
    }
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

  // Called when user sets a location on the map
  const handleSelectLocationOnMap = (lat: number, lng: number, name?: string, type: 'origin' | 'dest' = 'dest') => {
    const cleanName = name || getHumanReadableLocationName(lat, lng);
    if (type === 'origin') {
      setOriginCoords([lat, lng]);
      setOriginQuery(cleanName);
    } else {
      setDestCoords([lat, lng]);
      setDestQuery(cleanName);
    }
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
    } else if (tab === 'trips') {
      setIsTripsOpen(true);
    } else if (tab === 'tracking') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('musafir_demo_user');
    localStorage.removeItem('musafir_user_profile');
    localStorage.removeItem('musafir_profile_completed');
    localStorage.removeItem('transitsync_user_profile');
    localStorage.removeItem('msfr_trips_history');
    localStorage.removeItem('msfr_active_passes');
    localStorage.removeItem('musafir_welcome_bonus_credited');
    authService.setSessionUser(null);
    setCurrentUser(null);
    sosService.reloadProfile();
    setUserProfile(sosService.getProfile());
    setIsProfileOpen(false);
    setIsMobileMenuOpen(false);
    setIsLoginOpen(true);
  };

  const handleExecuteAIAction = (actionType: AIActionType, payload?: string) => {
    switch (actionType) {
      case 'open_parcel_booking':
      case 'open_parcel_sync':
        setIsParcelOpen(true);
        break;
      case 'open_wallet':
        setIsWalletOpen(true);
        break;
      case 'open_fare':
        setIsFareCalcOpen(true);
        break;
      case 'open_rewards':
        setIsRewardsOpen(true);
        break;
      case 'open_refund':
        setIsTripAssuranceOpen(true);
        break;
      case 'open_student':
        setIsStudentOpen(true);
        break;
      case 'open_schedule':
        setIsScheduleOpen(true);
        break;
      case 'open_support':
        setIsSupportOpen(true);
        break;
      case 'open_amenities':
        setIsAmenitiesOpen(true);
        break;
      case 'open_alerts':
        setIsAlertsOpen(true);
        break;
      case 'open_share_location':
        setIsFamilyShareOpen(true);
        break;
      case 'open_medical_id':
        setIsMedicalIdOpen(true);
        break;
      case 'open_women_safety':
        setIsWomenSafetyOpen(true);
        break;
      case 'open_my_trips':
        setIsTripsOpen(true);
        break;
      case 'trigger_sos':
        setIsSosOpen(true);
        break;
      case 'toggle_theme':
        handleToggleTheme();
        break;
      case 'open_planner':
        if (payload) {
          setDestQuery(payload);
        }
        window.scrollTo({ top: 0, behavior: 'smooth' });
        break;
      default:
        break;
    }
  };

  const handleStartNavigation = async () => {
    const recorded = await tripService.recordTrip({
      origin: originQuery,
      destination: destQuery,
      originCoords,
      destCoords,
      distanceKm: 8.5,
      durationMins: 24,
      fareAmount: 25,
      mode: 'bus',
      routeName: 'Smart Transit Corridor',
      status: 'in_progress',
    });

    alert(`🚀 Real-time navigation started!\n\n📍 Trip Recorded in Database:\n• Route: ${originQuery} ➔ ${destQuery}\n• Booking Ref: ${recorded.booking_reference}\n• Estimated Fare: ₹${recorded.fare_amount}\n\nLive GPS tracking & turn-by-turn guidance active.`);

    setTimeout(() => {
      setIsFeedbackOpen(true);
    }, 4000);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#0B1120] text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors duration-200">
      {/* ─── Dedicated Mobile User View (Folder: src/components/mobile/) ─── */}
      <div className="block md:hidden">
        <MobileAppView
          originQuery={originQuery}
          destQuery={destQuery}
          onOriginChange={setOriginQuery}
          onDestChange={setDestQuery}
          onSearch={(orig, dest) => handleSearch(orig, dest)}
          onSelectDestination={(dest) => {
            setDestQuery(dest);
            handleSearch(originQuery || 'Jayadev Vihar', dest);
          }}
          onOpenMenu={() => setIsMobileMenuOpen(true)}
          onOpenProfile={() => setIsProfileOpen(true)}
          onOpenAlerts={() => setIsAlertsOpen(true)}
          onOpenLanguage={() => setIsLangSelectOpen(true)}
          onOpenWallet={() => setIsWalletOpen(true)}
          onOpenBusRoutes={() => setIsBusRoutesOpen(true)}
          onOpenFareCalc={() => setIsFareCalcOpen(true)}
          onOpenTripsHistory={() => setIsTripsOpen(true)}
          onTriggerSOS={() => setIsSosOpen(true)}
          themeMode={themeMode}
          onToggleTheme={handleToggleTheme}
          currentLang={currentLang}
          walletBalance={walletBalance}
          userName={userProfile.name}
          vehicles={vehicles}
          userLocation={userLocation}
          originCoords={originCoords}
          destCoords={destCoords}
          onSelectLocationOnMap={handleSelectLocationOnMap}
          onOriginSelected={handleOriginSelected}
          onDestSelected={handleDestSelected}
          onUseLiveGps={handleUseLiveGps}
          isGpsActive={isGpsActive}
        />

      </div>

      {/* ─── Tablet & Desktop 3-Column Modern Workspace ─── */}
      <div className="hidden md:flex flex-col flex-1">
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
          userInitial={userProfile.name ? userProfile.name.charAt(0).toUpperCase() : 'U'}
          userName={userProfile.name}
          onOriginSelected={handleOriginSelected}
          onDestSelected={handleDestSelected}
          onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
          onSearchFocusChange={setIsSearchFocused}
          onOpenBusRoutes={() => setIsBusRoutesOpen(true)}
          currentLang={currentLang}
          onOpenLanguageModal={() => setIsLangSelectOpen(true)}
          t={t}
        />

        {/* 2. Main 3-Column Dashboard Body */}
        <div className="flex-1 max-w-[1600px] w-full mx-auto flex flex-col lg:flex-row gap-4 sm:gap-6 p-3 sm:p-6 pb-24 lg:pb-6">
          {/* Column 1: Left Aligned Sidebar */}
          <div className="hidden lg:block flex-shrink-0">
            <MusafirSidebar
              activeTab={activeTab}
              onTabChange={handleSidebarTabChange}
              onOpenNearbyStops={() => setIsAmenitiesOpen(true)}
              onOpenShareLocation={() => setIsFamilyShareOpen(true)}
              onOpenSOS={() => setIsSosOpen(true)}
              onOpenStudent={() => setIsStudentOpen(true)}
              onOpenBusRoutes={() => setIsBusRoutesOpen(true)}
              onSelectSavedPlace={(place) => setDestQuery(place)}
              t={t}
            />
          </div>

          {/* Column 2: Center Main Content (Large Map + Best Routes Cards) */}
          <main className="flex-1 flex flex-col gap-6 min-w-0">
            <MusafirMap
              vehicles={vehicles}
              userLocation={userLocation}
              onSelectLocationOnMap={handleSelectLocationOnMap}
              themeMode={themeMode}
              isOffline={isOffline}
              originCoords={originCoords}
              destCoords={destCoords}
              originName={originQuery}
              destinationName={destQuery}
              isAnyModalOpen={isAnyModalOpen}
            />

            <BestRoutesCarousel
              originName={originQuery}
              destinationName={destQuery}
              originCoords={originCoords}
              destCoords={destCoords}
              selectedRouteId={selectedRouteId}
              onSelectRoute={(id) => setSelectedRouteId(id)}
              activeFilterMode={activeFilterMode}
              onFilterModeChange={(mode) => setActiveFilterMode(mode)}
              onOpenLiveUpdates={() => alert('Real-time fleet GPS tracking active across all routes.')}
              onOpenSmartAlerts={() => setIsAlertsOpen(true)}
              onOpenSafeJourney={() => setIsFamilyShareOpen(true)}
              onOpenSaveMore={() => setIsFareCalcOpen(true)}
              onOpenFareCalc={() => setIsFareCalcOpen(true)}
              onSelectDestination={(dest) => {
                setDestQuery(dest);
                handleSearch(originQuery || 'Current Location', dest);
              }}
              t={t}
            />
          </main>

          {/* Column 3: Right Sidebar (Your Journey Panel) */}
          <JourneyDetailPanel
            originName={originQuery}
            destinationName={destQuery}
            originCoords={originCoords}
            destCoords={destCoords}
            selectedRouteId={selectedRouteId}
            onStartNavigation={handleStartNavigation}
            onShareTrip={() => setIsFamilyShareOpen(true)}
            onBookPass={() => setIsWalletOpen(true)}
            onOpenTripAssurance={() => setIsTripAssuranceOpen(true)}
            onOpenScheduleRide={() => setIsScheduleOpen(true)}
            onOpenFareDetails={() => setIsFareCalcOpen(true)}
            t={t}
          />
        </div>
      </div>

      {/* 3. Floating Popup AI Assistant (Bottom Right) */}
      <PopupAIAssistant
        onExecuteAction={handleExecuteAIAction}
        t={t}
        currentLang={currentLang}
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
        originName={originQuery}
        destName={destQuery}
        originCoords={originCoords}
        destCoords={destCoords}
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

      <TripsHistoryModal
        isOpen={isTripsOpen}
        onClose={() => setIsTripsOpen(false)}
        onSelectTripRoute={(orig, dest) => {
          setOriginQuery(orig);
          setDestQuery(dest);
          handleSearch(orig, dest);
        }}
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
              onSelectLocation={(dest) => {
                setIsProfileOpen(false);
                setDestQuery(dest);
                handleSearch(originQuery || 'Current Location', dest);
              }}
              onLogout={handleLogout}
              t={t}
              currentLang={currentLang}
              onLanguageChange={setCurrentLang}
            />
          </div>
        </div>
      )}

      {/* Login / Sign Up Modal */}
      <LoginModal
        isOpen={isLoginOpen}
        onClose={() => setIsLoginOpen(false)}
        onSuccess={() => {
          setCurrentUser(authService.getCurrentUser());
          setUserProfile(sosService.getProfile());
          setWalletBalance(walletService.getBalance());
          setIsLoginOpen(false);
          // Show permissions modal after successful login (only once)
          const hasAskedPerms = localStorage.getItem('musafir_perms_asked');
          if (!hasAskedPerms) {
            setIsPermissionsOpen(true);
            localStorage.setItem('musafir_perms_asked', '1');
          } else if (!localStorage.getItem('musafir_lang_selected')) {
            setIsLangSelectOpen(true);
          }
        }}
      />

      {/* Indian Multi-Language Selection Modal (Post-login onboarding & Profile) */}
      <LanguageSelectModal
        isOpen={isLangSelectOpen}
        currentLang={currentLang}
        onSelectLanguage={(code) => {
          setCurrentLang(code);
          localStorage.setItem('musafir_lang', code);
          localStorage.setItem('musafir_lang_selected', 'true');
          try {
            document.documentElement.lang = code;
          } catch {}
          setIsLangSelectOpen(false);
        }}
        onClose={() => setIsLangSelectOpen(false)}
      />

      {/* Bus Routes Network Modal (82+ CRUT Mo Bus Lines) */}
      <BusRoutesModal
        isOpen={isBusRoutesOpen}
        onClose={() => setIsBusRoutesOpen(false)}
        onSelectRoute={(orig, dest) => {
          setOriginQuery(orig);
          setDestQuery(dest);
          handleSearch(orig, dest);
        }}
      />

      {/* Permissions Request Modal (location, notifications) */}
      <PermissionsModal
        isOpen={isPermissionsOpen}
        onComplete={() => {
          setIsPermissionsOpen(false);
          if (!localStorage.getItem('musafir_lang_selected')) {
            setIsLangSelectOpen(true);
          }
        }}
      />



      {/* 6. Mobile Slide-Over Navigation Drawer */}
      <MobileMenuDrawer
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        activeTab={activeTab}
        onTabChange={handleSidebarTabChange}
        walletBalance={walletBalance}
        onOpenNearbyStops={() => setIsAmenitiesOpen(true)}
        onOpenShareLocation={() => setIsFamilyShareOpen(true)}
        onOpenSOS={() => setIsSosOpen(true)}
        onOpenStudent={() => setIsStudentOpen(true)}
        onOpenWomenSafety={() => setIsWomenSafetyOpen(true)}
        onOpenProfile={() => setIsProfileOpen(true)}
        onLogout={handleLogout}
        themeMode={themeMode}
        onToggleTheme={handleToggleTheme}
        t={t}
      />
    </div>
  );
};

export default App;
