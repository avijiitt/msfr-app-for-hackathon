export type LanguageCode = 'en' | 'or' | 'hi' | 'bn' | 'ta' | 'te' | 'mr' | 'gu' | 'kn' | 'ml' | 'pa';

export interface LanguageOption {
  code: LanguageCode;
  name: string;
  nativeName: string;
  flag: string;
}

export interface TranslationDictionary {
  // Common Navigation
  appTitle: string;
  tagline: string;
  navMap: string;
  navRoutes: string;
  navWallet: string;
  navSafety: string;
  navStudent: string;
  navProfile: string;
  navActivity: string;
  navSupport: string;
  navSchedule: string;
  
  // Header & Controls
  citySelect: string;
  offlineMode: string;
  offlineReady: string;
  onlineSync: string;
  emergencySOS: string;
  searchPlaceholder: string;
  darkMode: string;
  lightMode: string;
  
  // Route Filters
  filterFastest: string;
  filterCheapest: string;
  filterSenior?: string;
  filterNightSafe?: string;
  filterEco?: string;
  filterWeatherAware?: string;
  filterFewestTransfers?: string;
  filterSafest?: string;
  filterEcoFriendly?: string;
  filterAccessible?: string;
  
  // Route & Journey
  origin?: string;
  destination?: string;
  addStop?: string;
  planJourney?: string;
  fare?: string;
  duration?: string;
  transfers?: string;
  co2Saved?: string;
  bookTicket?: string;
  startTripSync?: string;
  scheduleTrip?: string;
  transferSafety?: string;
  safeTransfer?: string;
  tightTransfer?: string;
  criticalTransfer?: string;
  missedTransfer?: string;
  suggestedRoutes?: string;
  viewStopsTimeline?: string;
  buySingleTicket?: string;
  fareBreakdown?: string;
  bookFeederLastMile?: string;
  speedKmh?: string;
  nextStop?: string;
  eta?: string;
  occupancyLow?: string;
  occupancyModerate?: string;
  occupancyCrowded?: string;
  occupancyFull?: string;
  
  // Safety & SOS
  sosTitle: string;
  sosDescription: string;
  policeEmergency: string;
  womenHelpline: string;
  ambulanceMedical: string;
  shareLocationFamily: string;
  familyLocationSharing: string;
  bloodGroup: string;
  medicalId: string;
  womenBooking: string;
  womenSafeCoach: string;
  nightSafeCorridors: string;
  
  // Student Session & DigiLocker
  studentHubTitle: string;
  studentHubTagline: string;
  digilockerVerify: string;
  scanStudentIdOcr: string;
  studentVerifiedSuccess: string;
  studentPassGranted: string;
  
  // Wallet & Payments
  walletTitle: string;
  walletBalance: string;
  addMoney: string;
  quickPasses: string;
  studentPass: string;
  seniorCitizenPass: string;
  womenPinkPass: string;
  dailyPass: string;
  recentTransactions: string;
  payWithWallet: string;
  upiMaxLimit: string;
  
  // Announcements & Amenities
  liveAnnouncements: string;
  strikeAlerts: string;
  nearbyStoresHotels: string;
  storesAndMarkets: string;
  hospitals: string;
  pharmacies: string;
  policePosts: string;
  restrooms: string;
  parcelDelivery: string;
  alternatePhoneNotice: string;
  stationLockers: string;
  
  // Customer Support & Grievances
  customerSupportTitle: string;
  support24x7: string;
  fileGrievanceTicket: string;
  lostAndFound: string;
  
  // AI Travel Assistant
  aiAssistantName: string;
  aiTagline: string;
  askTransitAI: string;
  voiceInputSim: string;
  aiSuggestedPrompt1: string;
  aiSuggestedPrompt2: string;
  aiSuggestedPrompt3: string;
}
