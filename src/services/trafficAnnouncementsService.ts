export interface TrafficAnnouncement {
  id: string;
  type: 'traffic' | 'strike' | 'flood' | 'construction' | 'festival';
  title: string;
  location: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  impactDescription: string;
  suggestedAction: string;
  timestamp: string;
  affectedLines: string[];
}

export const LIVE_TRAFFIC_ANNOUNCEMENTS: TrafficAnnouncement[] = [
  {
    id: 'ANN-01',
    type: 'traffic',
    title: 'Heavy Traffic Congestion on NH16 Corridor',
    location: 'Jayadev Vihar to Vani Vihar Square',
    severity: 'medium',
    impactDescription: 'Vehicle speeds reduced to 18 km/h due to flyover maintenance.',
    suggestedAction: 'Take Metro Line or Pink Express bus bypassing service lanes.',
    timestamp: '5 mins ago',
    affectedLines: ['Bus 24A', 'Mo Bus 10', 'DTC-E502'],
  },
  {
    id: 'ANN-02',
    type: 'flood',
    title: 'Monsoon Waterlogging Underpass Alert',
    location: 'Patia KIIT Underpass & Station Subways',
    severity: 'high',
    impactDescription: 'Moderate water accumulation on low-lying underpasses.',
    suggestedAction: 'Buses rerouted over elevated main highway bridge.',
    timestamp: '20 mins ago',
    affectedLines: ['Bus 18', 'Pink-EV 1'],
  },
  {
    id: 'ANN-03',
    type: 'strike',
    title: 'All Public Transport Operating Normally (No Strikes)',
    location: 'Pan-India Operations',
    severity: 'low',
    impactDescription: 'All city bus fleets, metro lines, and suburban local trains running at 100% frequency.',
    suggestedAction: 'Normal schedule applies with on-time live tracking.',
    timestamp: 'Updated Today 09:00 AM',
    affectedLines: ['All City Fleets'],
  },
];
