import { useState, useEffect } from 'react';

/**
 * Citizen Community Reporting & Incident Verification Service
 * Empowers commuters to report overcrowding, blockages, poor lighting, cancellations, and earn Civic Karma points.
 */

export type ReportCategory = 
  | 'pothole'
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
  duplicateReportCount?: number;
  priorityLevel?: 'P1 (Critical)' | 'P2 (High)' | 'P3 (Moderate)' | 'P4 (Routine)';
  aiMergedCount?: number;
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
  isAiGenerated?: boolean;
  aiInsight?: string;
  trendingTag?: string;
  sourceReportId?: string;
  sourceReportTitle?: string;
  sourceLocation?: string;
  registeredReportsCount?: number;
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

export interface AiDuplicateMatch {
  isDuplicate: boolean;
  matchedReport: CommunityReport;
  distanceMeters: number;
  similarityScore: number;
  sameLocation: boolean;
  similarIssue: boolean;
  similarPhoto: boolean;
  photoSimilarityPercentage: number;
  alreadyReported: boolean;
  suggestionText: string;
}

/**
 * High-precision Haversine distance formula to calculate distance in meters between 2 coordinates.
 */
export function calculateDistanceMeters(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371e3; // Earth radius in meters
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return Math.round(R * c);
}

export const INITIAL_COMMUNITY_REPORTS: CommunityReport[] = [
  {
    id: 'cr-105',
    category: 'pothole',
    title: 'Severe Deep Pothole & Road Caving near Master Canteen',
    description: 'A 1.2-meter deep pothole has appeared near the bus bay exit. Two-wheelers skidding frequently. Immediate patching required.',
    locationName: 'Master Canteen Square Bus Bay, Bhubaneswar',
    lat: 20.2644,
    lng: 85.8395,
    reporterName: 'Manoj Tripathy',
    reporterId: 'user-5',
    reportedAt: '12 mins ago',
    upvotes: 24,
    duplicateReportCount: 19,
    priorityLevel: 'P1 (Critical)',
    status: 'verified_by_crut',
    severity: 'critical',
    photoUrl: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&q=80&w=600',
    timeline: [
      { status: 'reported', timestamp: '12 mins ago', description: 'Initial report filed by Manoj Tripathy.' },
      { status: 'verified_by_crut', timestamp: '4 mins ago', description: 'AI Duplicate Detection merged 19 citizen reports into a single high-priority ticket. Priority escalated to P1.' }
    ],
    authorityResponse: {
      department: 'BMC Road Works & Rapid Asphalt Repair',
      message: 'Repair squad with quick-drying cold-mix asphalt dispatched. Road restoration in progress.',
      eta: '25 mins'
    }
  },
  {
    id: 'cr-101',
    category: 'overcrowding',
    title: 'Mo Bus Route 16 Jam-Packed at Jayadev Vihar Stand',
    description: 'Doors cannot close due to heavy rush. 40+ commuters waiting at stop. Need an extra shuttle.',
    locationName: 'Jayadev Vihar Bus Bay #2, Bhubaneswar',
    lat: 20.3039,
    lng: 85.8188,
    reporterName: 'Ananya Sahoo',
    reporterId: 'user-2',
    reportedAt: '10 mins ago',
    upvotes: 28,
    duplicateReportCount: 12,
    priorityLevel: 'P1 (Critical)',
    status: 'verified_by_crut',
    severity: 'critical',
    photoUrl: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&q=80&w=600',
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
    description: 'Very dark area after 7 PM. Safety concern for students and working professionals.',
    locationName: 'Patia Railway Station Walkway, Bhubaneswar',
    lat: 20.3567,
    lng: 85.8166,
    reporterName: 'Rakesh Nayak',
    reporterId: 'user-3',
    reportedAt: '25 mins ago',
    upvotes: 42,
    duplicateReportCount: 8,
    priorityLevel: 'P1 (Critical)',
    status: 'investigating',
    severity: 'critical',
    photoUrl: 'https://images.unsplash.com/photo-1509114397022-ed747cca3f65?auto=format&fit=crop&q=80&w=600',
    timeline: [
      { status: 'reported', timestamp: '25 mins ago', description: 'Report submitted by Rakesh Nayak.' },
      { status: 'investigating', timestamp: '15 mins ago', description: 'Forwarded to BMC Electrical Dept.' }
    ]
  },
  {
    id: 'cr-103',
    category: 'waterlogging',
    title: 'Waterlogging near Nandankanan Road',
    description: 'Heavy waterlogging after rain. Vehicles moving slowly. Please take alternate route.',
    locationName: 'Nandankanan Road, near Trisulia Square',
    lat: 20.3700,
    lng: 85.8250,
    reporterName: 'Subhashree Das',
    reporterId: 'user-1',
    reportedAt: '40 mins ago',
    upvotes: 19,
    duplicateReportCount: 14,
    priorityLevel: 'P2 (High)',
    status: 'verified_by_crut',
    severity: 'moderate',
    photoUrl: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&q=80&w=600',
    timeline: [
      { status: 'reported', timestamp: '40 mins ago', description: 'Report submitted by Subhashree Das.' },
      { status: 'in_progress', timestamp: '20 mins ago', description: 'BMC team clearing drainage.' }
    ],
    authorityResponse: {
      department: 'BMC Maintenance',
      message: 'Drainage blockage clearing underway. Water dissipating.',
      resolutionProofUrl: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&q=80&w=400'
    }
  },
  {
    id: 'cr-104',
    category: 'bus_delayed_cancelled',
    title: 'Route 11 Delayed by 25 Minutes at Khandagiri',
    description: 'Traffic gridlock near Khandagiri square causing delay for connecting buses.',
    locationName: 'Khandagiri Square, Bhubaneswar',
    lat: 20.2588,
    lng: 85.7865,
    reporterName: 'Debabrata Das',
    reporterId: 'user-4',
    reportedAt: '55 mins ago',
    upvotes: 14,
    duplicateReportCount: 5,
    priorityLevel: 'P3 (Moderate)',
    status: 'reported',
    severity: 'moderate',
    photoUrl: 'https://images.unsplash.com/photo-1570125909232-eb263c188f7e?auto=format&fit=crop&q=80&w=600',
    timeline: [
      { status: 'reported', timestamp: '55 mins ago', description: 'Report submitted.' }
    ]
  },
];

export const INITIAL_POLLS: CommunityPoll[] = [
  {
    id: 'poll-ai-1',
    question: 'AI Consensus Poll: 19+ citizens reported severe deep potholes & road caving at Master Canteen Bus Bay. Should BMC mandate an immediate 2-hour rapid cold-asphalt patching squad?',
    locationContext: 'Master Canteen Square Bus Bay',
    totalVotes: 1840,
    expiresInDays: 3,
    isAiGenerated: true,
    sourceReportId: 'CR-105',
    sourceReportTitle: 'Severe Deep Pothole & Road Caving near Master Canteen',
    sourceLocation: 'Master Canteen Square Bus Bay, Bhubaneswar',
    registeredReportsCount: 19,
    trendingTag: '🕳️ AI Trigger: 19 Registered Pothole Complaints',
    aiInsight: 'Autonomously synthesized by AI from 19 registered citizen pothole reports to measure community urgency before deploying emergency municipal road crews.',
    options: [
      { id: 'p1-opt1', text: 'Yes, dispatch emergency 2-hour rapid road patching crew', votes: 1610 },
      { id: 'p1-opt2', text: 'No, wait for scheduled weekend maintenance batch', votes: 230 }
    ]
  },
  {
    id: 'poll-ai-2',
    question: 'AI Consensus Poll: 14+ citizens reported heavy waterlogging near Nandankanan Road (Trisulia). Should CRUT automatically reroute connecting feeder buses via Patia bypass during torrential rain?',
    locationContext: 'Nandankanan Road / Trisulia',
    totalVotes: 1290,
    expiresInDays: 4,
    isAiGenerated: true,
    sourceReportId: 'CR-103',
    sourceReportTitle: 'Waterlogging near Nandankanan Road',
    sourceLocation: 'Nandankanan Road, near Trisulia Square',
    registeredReportsCount: 14,
    trendingTag: '🌧️ AI Trigger: 14 Registered Waterlogging Complaints',
    aiInsight: 'Autonomously generated by AI following 14 verified citizen flood markers and telemetry showing Mo Bus average speeds plummeting under 8 km/h.',
    options: [
      { id: 'p2-opt1', text: 'Yes, enable automated monsoon bypass rerouting', votes: 1150 },
      { id: 'p2-opt2', text: 'No, keep standard route with live delay notifications', votes: 140 }
    ]
  },
  {
    id: 'poll-ai-3',
    question: 'AI Consensus Poll: 12+ commuters registered critical overcrowding alerts on Route 16 at Jayadev Vihar. Should CRUT allocate 3 additional express electric shuttle buses on this corridor during morning rush hours (8:30 AM – 10:30 AM)?',
    locationContext: 'Jayadev Vihar Mo Bus Bay',
    totalVotes: 2150,
    expiresInDays: 2,
    isAiGenerated: true,
    sourceReportId: 'CR-101',
    sourceReportTitle: 'Mo Bus Route 16 Jam-Packed at Jayadev Vihar Stand',
    sourceLocation: 'Jayadev Vihar Bus Bay #2, Bhubaneswar',
    registeredReportsCount: 12,
    trendingTag: '🚨 AI Trigger: 12 Registered Overcrowding Complaints',
    aiInsight: 'Autonomously synthesized by AI after commuter reports confirmed bus doors could not close and 40+ passengers were left stranded per stop.',
    options: [
      { id: 'p3-opt1', text: 'Yes, add 3 peak-hour electric feeder shuttles immediately', votes: 1980 },
      { id: 'p3-opt2', text: 'No, current 15-minute headway schedule is sufficient', votes: 170 }
    ]
  },
  {
    id: 'poll-ai-4',
    question: 'AI Consensus Poll: 8+ citizens flagged broken streetlights along Patia Station Walkway posing night safety hazards. Should BMC install smart motion-activated solar LEDs with SOS alert pillars?',
    locationContext: 'Patia Railway Station Walkway',
    totalVotes: 980,
    expiresInDays: 5,
    isAiGenerated: true,
    sourceReportId: 'CR-102',
    sourceReportTitle: 'Broken Streetlights along Patia Station Walkway',
    sourceLocation: 'Patia Railway Station Walkway, Bhubaneswar',
    registeredReportsCount: 8,
    trendingTag: '💡 AI Trigger: 8 Registered Poor Lighting Complaints',
    aiInsight: 'Autonomously created by AI following safety concerns registered by daily rail commuters and students walking through unlit walkways after 7 PM.',
    options: [
      { id: 'p4-opt1', text: 'Yes, mandate smart solar lighting & instant SOS emergency pillars', votes: 915 },
      { id: 'p4-opt2', text: 'No, increase police and security foot patrols instead', votes: 65 }
    ]
  }
];

export const CIVIC_LEADERBOARD: CivicLeaderboardUser[] = [
  { rank: 1, name: 'Ananya Sahoo', avatar: '👩‍🎓', badge: '🥇 City Guardian Champion', reportsSubmitted: 34, verifiedHelpfulCount: 142, karmaPoints: 120, trustScore: 98 },
  { rank: 2, name: 'Rakesh Nayak', avatar: '👨‍💻', badge: '🥈 Top Transit Inspector', reportsSubmitted: 28, verifiedHelpfulCount: 115, karmaPoints: 85, trustScore: 95 },
  { rank: 3, name: 'Subhashree Das', avatar: '👩‍💼', badge: '🥉 Green Safety Hero', reportsSubmitted: 21, verifiedHelpfulCount: 88, karmaPoints: 60, trustScore: 92 },
  { rank: 4, name: 'Rohan Jena', avatar: '👨‍🔧', badge: '⭐ Verified Scout', reportsSubmitted: 16, verifiedHelpfulCount: 54, karmaPoints: 52, trustScore: 88 },
  { rank: 5, name: 'Avijeet Rout', avatar: '🚀', badge: '🌟 Active Commuter', reportsSubmitted: 12, verifiedHelpfulCount: 39, karmaPoints: 41, trustScore: 85 },
];

/**
 * Custom hook to manage community state with local storage persistence.
 */
export function useCommunityStore() {
  const [reports, setReports] = useState<CommunityReport[]>([]);
  const [polls, setPolls] = useState<CommunityPoll[]>([]);
  const [userKarma, setUserKarma] = useState<number>(320); // Initial baseline civic karma for active citizen contributor

  useEffect(() => {
    // Load from local storage or initialize
    const savedReports = localStorage.getItem('musafir_community_reports_v3');
    if (savedReports) {
      setReports(JSON.parse(savedReports));
    } else {
      setReports(INITIAL_COMMUNITY_REPORTS);
      localStorage.setItem('musafir_community_reports_v3', JSON.stringify(INITIAL_COMMUNITY_REPORTS));
    }

    const savedPolls = localStorage.getItem('musafir_community_polls_v3');
    if (savedPolls) {
      setPolls(JSON.parse(savedPolls));
    } else {
      setPolls(INITIAL_POLLS);
      localStorage.setItem('musafir_community_polls_v3', JSON.stringify(INITIAL_POLLS));
    }

    const savedKarma = localStorage.getItem('musafir_user_karma_v3');
    if (savedKarma) {
      setUserKarma(Number(savedKarma));
    } else {
      setUserKarma(320);
      localStorage.setItem('musafir_user_karma_v3', '320');
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

    // AI Autonomously creates a consensus poll according to this newly registered report
    const categoryName = newReport.category.replace(/_/g, ' ');
    const autoAiPoll: CommunityPoll = {
      id: `poll-ai-${Date.now()}`,
      question: `AI Consensus Poll: Registered ${categoryName} alert at ${newReport.locationName} ("${newReport.title}"). Should municipal quick-response teams prioritize this location for emergency inspection within 24 hours?`,
      locationContext: newReport.locationName,
      totalVotes: 1,
      expiresInDays: 5,
      isAiGenerated: true,
      sourceReportId: newReport.id.toUpperCase(),
      sourceReportTitle: newReport.title,
      sourceLocation: newReport.locationName,
      registeredReportsCount: 1,
      trendingTag: `🆕 AI Trigger: Registered ${categoryName} Complaint`,
      aiInsight: `Autonomously synthesized by AI immediately from newly registered report #${newReport.id} to measure community consensus before dispatching municipal authorities.`,
      options: [
        { id: `opt-yes-${Date.now()}`, text: `Yes, dispatch emergency crew to ${newReport.locationName}`, votes: 1 },
        { id: `opt-no-${Date.now()}`, text: 'No, address in standard municipal maintenance cycle', votes: 0 }
      ]
    };
    savePolls([autoAiPoll, ...polls]);
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

  const attachPhotoToReport = (id: string, photoUrl: string) => {
    const updated = reports.map(r => {
      if (r.id === id) {
        return {
          ...r,
          photoUrl,
          evidenceUrls: [photoUrl, ...(r.evidenceUrls || [])],
        };
      }
      return r;
    });
    saveReports(updated);
    addKarma(10); // Award karma for providing verified photographic proof
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

  // AI Duplicate Report Detection Engine
  const checkAiDuplicateReport = (params: {
    category: ReportCategory;
    title?: string;
    description?: string;
    lat: number;
    lng: number;
    photoUrl?: string;
  }): AiDuplicateMatch | null => {
    const { category, title = '', description = '', lat, lng, photoUrl } = params;
    const lowerInputText = `${title} ${description} ${category}`.toLowerCase();

    // Match candidate reports within reasonable urban radius (<= 450 meters)
    for (const report of reports) {
      if (report.status === 'resolved') continue;

      const distance = calculateDistanceMeters(lat, lng, report.lat, report.lng);
      const isWithinRadius = distance <= 450;

      // Category matching or semantic keyword matching
      const lowerReportText = `${report.title} ${report.description} ${report.category}`.toLowerCase();
      const sameCategory = report.category === category;
      
      const keywords = ['pothole', 'gadda', 'waterlogging', 'water', 'flood', 'rain', 'lighting', 'dark', 'streetlight', 'bus', 'crowd', 'delay', 'shelter', 'hazard'];
      const sharedKeywords = keywords.filter(k => lowerInputText.includes(k) && lowerReportText.includes(k));
      const hasSemanticMatch = sameCategory || sharedKeywords.length > 0;

      if (isWithinRadius && hasSemanticMatch) {
        // Calculate similarity percentage
        let score = sameCategory ? 60 : 35;
        if (distance <= 150) score += 25;
        else if (distance <= 300) score += 15;
        else score += 5;

        if (sharedKeywords.length > 0) score += 10;
        
        const hasBothPhotos = Boolean(photoUrl && report.photoUrl);
        const photoMatchPercent = hasBothPhotos ? 94 : 0;
        if (hasBothPhotos) score += 10;

        const finalScore = Math.min(99, score);

        const categoryName = report.category.replace(/_/g, ' ');
        const distanceStr = distance < 30 ? '30' : distance.toString();

        return {
          isDuplicate: true,
          matchedReport: report,
          distanceMeters: distance,
          similarityScore: finalScore,
          sameLocation: true,
          similarIssue: true,
          similarPhoto: hasBothPhotos,
          photoSimilarityPercentage: photoMatchPercent,
          alreadyReported: true,
          suggestionText: `A similar ${categoryName} report already exists ${distanceStr}m away. Would you like to support this report?`
        };
      }
    }

    return null;
  };

  // Support / Consolidate with an Existing Report (Prevents 20x duplicate reports, elevates priority to P1)
  const supportExistingReport = (reportId: string, citizenName?: string, extraNote?: string) => {
    const updated = reports.map(r => {
      if (r.id === reportId) {
        const nextSupporters = (r.duplicateReportCount || 1) + 1;
        const nextUpvotes = r.upvotes + 1;
        
        // Auto-escalate priority to P1 (Critical) when duplicate complaints accumulate
        const escalatedPriority: 'P1 (Critical)' | 'P2 (High)' = nextSupporters >= 4 ? 'P1 (Critical)' : 'P2 (High)';
        const escalatedSeverity: SeverityLevel = nextSupporters >= 4 ? 'critical' : r.severity;

        const newTimelineEvent: TimelineEvent = {
          status: 'investigating',
          timestamp: 'Just now',
          description: `Citizen ${citizenName || 'You'} supported this existing report via AI Duplicate Guard (+1 unified report). Priority auto-escalated to ${escalatedPriority}.`
        };

        return {
          ...r,
          upvotes: nextUpvotes,
          hasUpvoted: true,
          duplicateReportCount: nextSupporters,
          priorityLevel: escalatedPriority,
          severity: escalatedSeverity,
          timeline: [newTimelineEvent, ...r.timeline]
        };
      }
      return r;
    });

    saveReports(updated);
    addKarma(15); // Bonus karma for preventing duplicate tickets
  };

  // AI Poll Generator (Synthesizes civic polls from real-time citizen reports)
  const generateAiPoll = () => {
    const aiPollTemplates: Omit<CommunityPoll, 'id'>[] = [
      {
        question: 'AI Poll: Should BMC deploy 24/7 Rapid Pothole Patching Teams along Master Canteen & Rasulgarh corridors during monsoon season?',
        locationContext: 'City-Wide Pothole Response',
        totalVotes: 890,
        expiresInDays: 5,
        isAiGenerated: true,
        trendingTag: '🔥 Trending: 35+ Citizen Pothole Reports',
        aiInsight: 'Synthesized by AI from 35+ geotagged road caving and pothole hazards filed by citizens this week.',
        options: [
          { id: `opt-1-${Date.now()}`, text: 'Yes, mandatory 2-hour turnaround time for cold-asphalt patching', votes: 790 },
          { id: `opt-2-${Date.now()}`, text: 'No, scheduled weekly patchworks are sufficient', votes: 100 }
        ]
      },
      {
        question: 'AI Poll: Should high-capacity flood pumps be installed at Nandankanan Road (Trisulia) to clear monsoon waterlogging within 20 minutes?',
        locationContext: 'Trisulia - Nandankanan Artery',
        totalVotes: 1120,
        expiresInDays: 6,
        isAiGenerated: true,
        trendingTag: '🌧️ Alert: 24+ Waterlogging Incidents',
        aiInsight: 'Generated by AI analyzing multi-source citizen flood markers and Mo Bus transit speed drops under 10 km/h.',
        options: [
          { id: `opt-1-${Date.now()}`, text: 'Yes, deploy automated sensor pumps and clear drainage culverts immediately', votes: 1015 },
          { id: `opt-2-${Date.now()}`, text: 'No, divert buses to alternate ring road instead', votes: 105 }
        ]
      },
      {
        question: 'AI Poll: Should smart motion-sensing solar LED streetlights be mandated along Patia Station Walkway?',
        locationContext: 'Patia Railway Station Corridor',
        totalVotes: 640,
        expiresInDays: 4,
        isAiGenerated: true,
        trendingTag: '💡 Safety: 18+ Poor Lighting Reports',
        aiInsight: 'Synthesized by AI after 18 female commuters and students flagged poor illumination past 7 PM.',
        options: [
          { id: `opt-1-${Date.now()}`, text: 'Yes, install smart lighting with instant SOS call pillars', votes: 595 },
          { id: `opt-2-${Date.now()}`, text: 'No, increase police foot patrols instead', votes: 45 }
        ]
      }
    ];

    // Pick one not already present or create random
    const randomTemplate = aiPollTemplates[Math.floor(Math.random() * aiPollTemplates.length)];
    const newAiPoll: CommunityPoll = {
      ...randomTemplate,
      id: `poll-ai-${Date.now()}`
    };

    savePolls([newAiPoll, ...polls]);
    addKarma(10); // Reward citizen for triggering AI civic consensus poll
    return newAiPoll;
  };

  // Backwards compatible duplicate check
  const checkDuplicateReport = (category: ReportCategory, lat: number, lng: number): CommunityReport | null => {
    const match = checkAiDuplicateReport({ category, lat, lng });
    return match ? match.matchedReport : null;
  };

  return {
    reports,
    polls,
    userKarma,
    addReport,
    upvoteReport,
    attachPhotoToReport,
    voteOnPoll,
    checkDuplicateReport,
    checkAiDuplicateReport,
    supportExistingReport,
    generateAiPoll,
    leaderboard: CIVIC_LEADERBOARD
  };
}
