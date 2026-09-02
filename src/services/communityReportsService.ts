import { useState, useEffect } from 'react';

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

export type ReportStatus = 'reported' | 'investigating' | 'verified_by_crut' | 'in_progress' | 'resolved';
export type SeverityLevel = 'low' | 'moderate' | 'critical' | 'emergency';

export interface TimelineEvent {
  status: ReportStatus;
  timestamp: string;
  description: string;
}

export interface AuthorityResponse {
  department: string;
  message: string;
  eta?: string;
  resolutionProofUrl?: string;
}

export interface CommunityReport {
  id: string;
  category: ReportCategory;
  title: string;
  description: string;
  locationName: string;
  lat: number;
  lng: number;
  reporterName: string;
  reporterId?: string; // e.g., 'current-user' to filter 'My Reports'
  reportedAt: string;
  upvotes: number;
  hasUpvoted?: boolean;
  status: ReportStatus;
  photoUrl?: string;
  evidenceUrls?: string[];
  severity: SeverityLevel;
  timeline: TimelineEvent[];
  authorityResponse?: AuthorityResponse;
  isEmergency?: boolean;
}

export interface CommunityPollOption {
  id: string;
  text: string;
  votes: number;
}

export interface CommunityPoll {
  id: string;
  question: string;
  locationContext: string;
  options: CommunityPollOption[];
  totalVotes: number;
  hasVoted?: boolean;
  selectedOptionId?: string;
  expiresInDays: number;
}

export interface CivicLeaderboardUser {
  rank: number;
  name: string;
  avatar: string;
  badge: string;
  reportsSubmitted: number;
  verifiedHelpfulCount: number;
  karmaPoints: number;
  trustScore: number;
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
    reporterId: 'user-2',
    reportedAt: '10 mins ago',
    upvotes: 28,
    status: 'verified_by_crut',
    severity: 'critical',
    timeline: [
      { status: 'reported', timestamp: '10 mins ago', description: 'Report submitted by Ananya Sahoo.' },
      { status: 'verified_by_crut', timestamp: '2 mins ago', description: 'CRUT dispatcher acknowledged the crowding.' }
    ],
    authorityResponse: {
      department: 'CRUT Dispatch Team',
      message: 'We have dispatched an additional 45-Min Express bus to Jayadev Vihar. It should arrive in 8 mins.',
      eta: '8 mins'
    }
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
    reporterId: 'user-3',
    reportedAt: '35 mins ago',
    upvotes: 42,
    status: 'investigating',
    severity: 'critical',
    timeline: [
      { status: 'reported', timestamp: '35 mins ago', description: 'Report submitted.' },
      { status: 'investigating', timestamp: '30 mins ago', description: 'Forwarded to BMC Electrical Dept.' }
    ]
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
    reporterId: 'user-1',
    reportedAt: '1 hour ago',
    upvotes: 19,
    status: 'resolved',
    severity: 'moderate',
    timeline: [
      { status: 'reported', timestamp: '1 hour ago', description: 'Report submitted.' },
      { status: 'in_progress', timestamp: '45 mins ago', description: 'BMC team clearing drainage.' },
      { status: 'resolved', timestamp: '15 mins ago', description: 'Water cleared. Pothole barricaded for repair.' }
    ],
    authorityResponse: {
      department: 'BMC Maintenance',
      message: 'Drainage blockage cleared. Temporary barricades placed around the pothole.',
      resolutionProofUrl: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&q=80&w=400'
    }
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
    reporterId: 'user-4',
    reportedAt: '2 hours ago',
    upvotes: 14,
    status: 'reported',
    severity: 'low',
    timeline: [
      { status: 'reported', timestamp: '2 hours ago', description: 'Report submitted.' }
    ]
  },
];

export const INITIAL_POLLS: CommunityPoll[] = [
  {
    id: 'poll-1',
    question: 'Should Mo Bus Route 10 operate 24/7 during weekends?',
    locationContext: 'City-wide',
    totalVotes: 1245,
    expiresInDays: 3,
    options: [
      { id: 'p1-opt1', text: 'Yes, it is much needed for night shifts', votes: 980 },
      { id: 'p1-opt2', text: 'No, current timing (till 11 PM) is fine', votes: 265 }
    ]
  },
  {
    id: 'poll-2',
    question: 'Where should the new E-Rickshaw feeder stand be placed at Master Canteen?',
    locationContext: 'Master Canteen Square',
    totalVotes: 832,
    expiresInDays: 5,
    options: [
      { id: 'p2-opt1', text: 'Near Platform 1 Exit', votes: 512 },
      { id: 'p2-opt2', text: 'Opposite to Lalchand Jewellers', votes: 210 },
      { id: 'p2-opt3', text: 'Inside the main bus depot', votes: 110 }
    ]
  }
];

export const CIVIC_LEADERBOARD: CivicLeaderboardUser[] = [
  { rank: 1, name: 'Priyanka Mohanty', avatar: '👩‍💼', badge: '🥇 City Guardian Champion', reportsSubmitted: 34, verifiedHelpfulCount: 142, karmaPoints: 1280, trustScore: 98 },
  { rank: 2, name: 'Subhasish Dash', avatar: '👨‍💻', badge: '🥈 Top Transit Inspector', reportsSubmitted: 28, verifiedHelpfulCount: 115, karmaPoints: 960, trustScore: 95 },
  { rank: 3, name: 'Ananya Sahoo', avatar: '👩‍🎓', badge: '🥉 Green Safety Hero', reportsSubmitted: 21, verifiedHelpfulCount: 88, karmaPoints: 750, trustScore: 92 },
  { rank: 4, name: 'Rohan Jena', avatar: '👨‍🔧', badge: '⭐ Verified Scout', reportsSubmitted: 16, verifiedHelpfulCount: 54, karmaPoints: 520, trustScore: 88 },
  { rank: 5, name: 'Avijeet Rout', avatar: '🚀', badge: '🌟 Active Commuter', reportsSubmitted: 12, verifiedHelpfulCount: 39, karmaPoints: 410, trustScore: 85 },
];

/**
 * Custom hook to manage community state with local storage persistence.
 */
export function useCommunityStore() {
  const [reports, setReports] = useState<CommunityReport[]>([]);
  const [polls, setPolls] = useState<CommunityPoll[]>([]);
  const [userKarma, setUserKarma] = useState<number>(120); // Default user karma

  useEffect(() => {
    // Load from local storage or initialize
    const savedReports = localStorage.getItem('musafir_community_reports');
    if (savedReports) {
      setReports(JSON.parse(savedReports));
    } else {
      setReports(INITIAL_COMMUNITY_REPORTS);
      localStorage.setItem('musafir_community_reports', JSON.stringify(INITIAL_COMMUNITY_REPORTS));
    }

    const savedPolls = localStorage.getItem('musafir_community_polls');
    if (savedPolls) {
      setPolls(JSON.parse(savedPolls));
    } else {
      setPolls(INITIAL_POLLS);
      localStorage.setItem('musafir_community_polls', JSON.stringify(INITIAL_POLLS));
    }

    const savedKarma = localStorage.getItem('musafir_user_karma');
    if (savedKarma) {
      setUserKarma(Number(savedKarma));
    }
  }, []);

  const saveReports = (newReports: CommunityReport[]) => {
    setReports(newReports);
    localStorage.setItem('musafir_community_reports', JSON.stringify(newReports));
  };

  const savePolls = (newPolls: CommunityPoll[]) => {
    setPolls(newPolls);
    localStorage.setItem('musafir_community_polls', JSON.stringify(newPolls));
  };

  const addKarma = (points: number) => {
    const newKarma = userKarma + points;
    setUserKarma(newKarma);
    localStorage.setItem('musafir_user_karma', newKarma.toString());
  };

  const addReport = (report: Omit<CommunityReport, 'id' | 'reportedAt' | 'upvotes' | 'timeline' | 'status'>) => {
    const newReport: CommunityReport = {
      ...report,
      id: `cr-${Date.now()}`,
      reportedAt: 'Just now',
      upvotes: 1,
      hasUpvoted: true,
      status: 'reported',
      timeline: [
        { status: 'reported', timestamp: 'Just now', description: 'Report submitted by You.' }
      ]
    };
    saveReports([newReport, ...reports]);
    addKarma(25); // Award karma for submitting
  };

  const upvoteReport = (id: string) => {
    const updated = reports.map(r => {
      if (r.id === id) {
        const isUpvoted = r.hasUpvoted;
        return {
          ...r,
          upvotes: isUpvoted ? r.upvotes - 1 : r.upvotes + 1,
          hasUpvoted: !isUpvoted,
        };
      }
      return r;
    });
    saveReports(updated);
    // Optional: Add 2 karma for upvoting/confirming an issue
    if (!reports.find(r => r.id === id)?.hasUpvoted) {
      addKarma(2);
    }
  };

  const voteOnPoll = (pollId: string, optionId: string) => {
    const updated = polls.map(p => {
      if (p.id === pollId && !p.hasVoted) {
        return {
          ...p,
          hasVoted: true,
          selectedOptionId: optionId,
          totalVotes: p.totalVotes + 1,
          options: p.options.map(o => 
            o.id === optionId ? { ...o, votes: o.votes + 1 } : o
          )
        };
      }
      return p;
    });
    savePolls(updated);
    addKarma(5); // Award karma for participating in a poll
  };

  // Duplicate detection utility
  const checkDuplicateReport = (category: ReportCategory, lat: number, lng: number): CommunityReport | null => {
    // Mock simple radius check (in a real app, use Haversine formula)
    const threshold = 0.005; // ~500m roughly
    return reports.find(r => 
      r.category === category && 
      r.status !== 'resolved' &&
      Math.abs(r.lat - lat) < threshold && 
      Math.abs(r.lng - lng) < threshold
    ) || null;
  };

  return {
    reports,
    polls,
    userKarma,
    addReport,
    upvoteReport,
    voteOnPoll,
    checkDuplicateReport,
    leaderboard: CIVIC_LEADERBOARD
  };
}
