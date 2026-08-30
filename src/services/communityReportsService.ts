/**
 * Citizen Community Reporting & Incident Verification Service
 * Empowers commuters to report overcrowding, blockages, poor lighting, cancellations, and earn Civic Karma points.
 */

export type ReportCategory = 
  | 'overcrowding'
  | 'road_blockage'
  | 'poor_lighting'
  | 'waterlogging'
  | 'bus_delayed_cancelled'
  | 'damaged_shelter'
  | 'safety_concern';

export interface CommunityReport {
  id: string;
  category: ReportCategory;
  title: string;
  description: string;
  locationName: string;
  lat: number;
  lng: number;
  reporterName: string;
  reportedAt: string;
  upvotes: number;
  hasUpvoted?: boolean;
  status: 'investigating' | 'verified_by_crut' | 'resolved';
  photoUrl?: string;
  severity: 'low' | 'moderate' | 'critical';
}

export interface CivicLeaderboardUser {
  rank: number;
  name: string;
  avatar: string;
  badge: string;
  reportsSubmitted: number;
  verifiedHelpfulCount: number;
  karmaPoints: number;
}

export const INITIAL_COMMUNITY_REPORTS: CommunityReport[] = [
  {
    id: 'cr-101',
    category: 'overcrowding',
    title: 'Mo Bus Route 10 Jam-Packed at Jayadev Vihar Stand',
    description: 'Doors cannot close due to heavy rush. 40+ commuters waiting at stop. Need an extra shuttle.',
    locationName: 'Jayadev Vihar Bus Bay #2, Bhubaneswar',
    lat: 20.3039,
    lng: 85.8188,
    reporterName: 'Ananya Sahoo',
    reportedAt: '10 mins ago',
    upvotes: 28,
    status: 'verified_by_crut',
    severity: 'critical',
  },
  {
    id: 'cr-102',
    category: 'poor_lighting',
    title: 'Broken Streetlights along Patia Station Walkway',
    description: 'Dark corridor behind KIIT Campus 6 walkway. Unsafe for night walking commuters.',
    locationName: 'Patia Railway Station North Walkway',
    lat: 20.3567,
    lng: 85.8166,
    reporterName: 'Subhasish Dash',
    reportedAt: '35 mins ago',
    upvotes: 42,
    status: 'investigating',
    severity: 'critical',
  },
  {
    id: 'cr-103',
    category: 'waterlogging',
    title: 'Waterlogging & Deep Pothole near Acharya Vihar Underpass',
    description: 'Buses slowing down to 5 km/h. Recommend taking flyover route.',
    locationName: 'Acharya Vihar Underpass, Bhubaneswar',
    lat: 20.3015,
    lng: 85.8340,
    reporterName: 'Priyanka Mohanty',
    reportedAt: '1 hour ago',
    upvotes: 19,
    status: 'resolved',
    severity: 'moderate',
  },
  {
    id: 'cr-104',
    category: 'damaged_shelter',
    title: 'Damaged Roof & Missing Display at Niladri Vihar Bus Stop',
    description: 'Digital ETA screen broken and shelter roof leaking.',
    locationName: 'Niladri Vihar Stop #4, CSPUR',
    lat: 20.3448,
    lng: 85.8062,
    reporterName: 'Rohan Jena',
    reportedAt: '2 hours ago',
    upvotes: 14,
    status: 'investigating',
    severity: 'low',
  },
];

export const CIVIC_LEADERBOARD: CivicLeaderboardUser[] = [
  { rank: 1, name: 'Priyanka Mohanty', avatar: '👩‍💼', badge: '🥇 City Guardian Champion', reportsSubmitted: 34, verifiedHelpfulCount: 142, karmaPoints: 1280 },
  { rank: 2, name: 'Subhasish Dash', avatar: '👨‍💻', badge: '🥈 Top Transit Inspector', reportsSubmitted: 28, verifiedHelpfulCount: 115, karmaPoints: 960 },
  { rank: 3, name: 'Ananya Sahoo', avatar: '👩‍🎓', badge: '🥉 Green Safety Hero', reportsSubmitted: 21, verifiedHelpfulCount: 88, karmaPoints: 750 },
  { rank: 4, name: 'Rohan Jena', avatar: '👨‍🔧', badge: '⭐ Verified Scout', reportsSubmitted: 16, verifiedHelpfulCount: 54, karmaPoints: 520 },
  { rank: 5, name: 'Avijeet Rout', avatar: '🚀', badge: '🌟 Active Commuter', reportsSubmitted: 12, verifiedHelpfulCount: 39, karmaPoints: 410 },
];
