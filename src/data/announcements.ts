import { Incident } from '../types/transit';

export const MOCK_ANNOUNCEMENTS: Incident[] = [
  {
    id: 'INC-01',
    type: 'strike',
    title: 'Auto-Rickshaw Union Partial Strike',
    description: 'Auto-rickshaw strike reported near Master Canteen & Railway Station. Mo Bus feeders and Metro Orange line have deployed 4 additional feeder shuttles.',
    affectedLines: ['AUTO-LASTMILE', 'MOBUS-10'],
    severity: 'medium',
    timestamp: '10 mins ago',
    locationName: 'Master Canteen Zone',
  },
  {
    id: 'INC-02',
    type: 'weather_flood',
    title: 'Monsoon Waterlogging Alert: Jaydev Vihar Underpass',
    description: 'Moderate waterlogging at Jaydev Vihar underpass. Mo Bus 10 rerouted via Flyover bypass (+4 min buffer added). TransitSync has auto-updated transfer calculations.',
    affectedLines: ['MOBUS-10', 'MOBUS-11'],
    severity: 'high',
    timestamp: '25 mins ago',
    locationName: 'Jaydev Vihar Underpass',
  },
  {
    id: 'INC-03',
    type: 'festival_special',
    title: 'Raja / Festival Night Transit Special Service',
    description: 'All Metro and Pink Safe Buses operating extended night owl hours with dedicated women-safety marshals until 1:00 AM.',
    affectedLines: ['METRO-ORANGE', 'PINK-EV', 'MOBUS-NIGHT'],
    severity: 'low',
    timestamp: '1 hour ago',
    locationName: 'Citywide Corridor',
  },
  {
    id: 'INC-04',
    type: 'breakdown',
    title: 'Mo Bus #204 Minor Mechanical Delay',
    description: 'Bus #204 paused at Vani Vihar for wheel inspection. Trailing bus #208 arriving in 3 mins.',
    affectedLines: ['MOBUS-11'],
    severity: 'medium',
    timestamp: 'Just now',
    locationName: 'Vani Vihar',
  },
];
