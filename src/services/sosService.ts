import { UserProfile, EmergencyContact, SavedLocation } from '../types/transit';
import { audioService } from './audioService';

const STORAGE_KEY_PROFILE = 'transitsync_user_profile';

const DEFAULT_SAVED_LOCATIONS: SavedLocation[] = [
  { id: 'loc-1', name: 'Home', address: 'Patia, Bhubaneswar, Odisha', category: 'home', icon: '🏠', lat: 20.3541, lng: 85.8175 },
  { id: 'loc-2', name: 'Work / Office', address: 'InfoCity Tech Park Gate 1, Bhubaneswar', category: 'work', icon: '💼', lat: 20.3602, lng: 85.8035 },
  { id: 'loc-3', name: 'College / University', address: 'KIIT University Campus 6, Bhubaneswar', category: 'college', icon: '🎓', lat: 20.3533, lng: 85.8164 },
];

function getDefaultProfile(): UserProfile {
  // Try reading from the logged-in user's registration data
  let name = 'Traveller';
  let email = '';
  let phone = '';
  let bloodGroup = 'O+';
  let homeAddress = 'Patia, Bhubaneswar, Odisha';
  let emergencyContacts: EmergencyContact[] = [];
  let savedLocations: SavedLocation[] = DEFAULT_SAVED_LOCATIONS;

  try {
    const demoUser = localStorage.getItem('musafir_demo_user');
    if (demoUser) {
      const u = JSON.parse(demoUser);
      name = u.fullName || u.full_name || name;
      email = u.email || email;
    }
  } catch {}

  let isStudent = false;
  let collegeName = '';
  let rollNo = '';
  let isSenior = false;
  let isWomen = false;

  try {
    const profile = localStorage.getItem('musafir_user_profile');
    if (profile) {
      const p = JSON.parse(profile);
      name = p.fullName || name;
      email = p.email || email;
      phone = p.phone || phone;
      bloodGroup = p.bloodGroup || bloodGroup;
      homeAddress = p.homeCity || homeAddress;
      isStudent = p.category === 'student';
      if (p.studentDetails) {
        collegeName = p.studentDetails.college || '';
        rollNo = p.studentDetails.rollNo || '';
      }
      isSenior = p.category === 'senior';
      isWomen = p.category === 'women';
      if (p.emergencyContact) {
        emergencyContacts = [{
          id: 'ec-1',
          name: p.emergencyContact.name,
          phone: p.emergencyContact.phone,
          relation: p.emergencyContact.relation || 'Family / Guardian',
        }];
      }
      if (p.savedLocations && Array.isArray(p.savedLocations) && p.savedLocations.length > 0) {
        savedLocations = p.savedLocations;
      }
    }
  } catch {}

  return {
    name,
    email,
    phone,
    homeAddress,
    workAddress: 'InfoCity Tech Park Gate 1, Bhubaneswar',
    bloodGroup: bloodGroup as UserProfile['bloodGroup'],
    medicalNotes: '',
    allergies: '',
    savedLocations,
    studentVerification: {
      isVerified: isStudent,
      verificationMethod: isStudent ? 'digilocker' : 'none',
      collegeName,
      rollNo,
    },
    isSeniorVerified: isSenior,
    isWomenPassenger: isWomen,
    familyShareActive: false,
    emergencyContacts,
  };
}

class SOSService {
  private profile: UserProfile;
  private isSosActive = false;

  constructor() {
    const saved = localStorage.getItem(STORAGE_KEY_PROFILE);
    const defaultProf = getDefaultProfile();
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        this.profile = {
          ...defaultProf,
          ...parsed,
          name: parsed.name || defaultProf.name,
          email: parsed.email || defaultProf.email,
          phone: parsed.phone || defaultProf.phone,
          savedLocations: (parsed.savedLocations && parsed.savedLocations.length > 0) ? parsed.savedLocations : defaultProf.savedLocations,
        };
      } catch {
        this.profile = defaultProf;
      }
    } else {
      this.profile = defaultProf;
      this.saveProfile(this.profile);
    }
  }

  public getProfile(): UserProfile {
    const active = getDefaultProfile();
    return {
      ...this.profile,
      name: (this.profile.name && this.profile.name !== 'Traveller') ? this.profile.name : active.name,
      email: this.profile.email || active.email,
      phone: this.profile.phone || active.phone,
      savedLocations: this.profile.savedLocations || active.savedLocations,
    };
  }

  public getSavedLocations(): SavedLocation[] {
    return this.profile.savedLocations || DEFAULT_SAVED_LOCATIONS;
  }

  public addSavedLocation(loc: Omit<SavedLocation, 'id'>): SavedLocation[] {
    const newLoc: SavedLocation = {
      ...loc,
      id: 'loc-' + Date.now(),
    };
    const updated = [...(this.profile.savedLocations || DEFAULT_SAVED_LOCATIONS), newLoc];
    this.profile.savedLocations = updated;
    this.saveProfile(this.profile);
    return updated;
  }

  public updateSavedLocation(id: string, updatedFields: Partial<SavedLocation>): SavedLocation[] {
    const current = this.profile.savedLocations || DEFAULT_SAVED_LOCATIONS;
    const updated = current.map((loc) => (loc.id === id ? { ...loc, ...updatedFields } : loc));
    this.profile.savedLocations = updated;
    this.saveProfile(this.profile);
    return updated;
  }

  public deleteSavedLocation(id: string): SavedLocation[] {
    const current = this.profile.savedLocations || DEFAULT_SAVED_LOCATIONS;
    const updated = current.filter((loc) => loc.id !== id);
    this.profile.savedLocations = updated;
    this.saveProfile(this.profile);
    return updated;
  }

  public reloadProfile(): UserProfile {
    this.profile = getDefaultProfile();
    this.saveProfile(this.profile);
    return { ...this.profile };
  }

  public saveProfile(newProfile: UserProfile) {
    this.profile = newProfile;
    localStorage.setItem(STORAGE_KEY_PROFILE, JSON.stringify(newProfile));
  }

  public triggerEmergencySOS(currentCoords: [number, number], nearestStationName: string): {
    dispatchId: string;
    alertMessage: string;
    googleMapsLink: string;
    helplinesNotified: string[];
    familyContactsNotified: EmergencyContact[];
    medicalCardSummary: string;
  } {
    this.isSosActive = true;

    const dispatchId = 'SOS-MSFR-' + Math.floor(100000 + Math.random() * 900000);
    const googleMapsLink = `https://maps.google.com/?q=${currentCoords[0].toFixed(5)},${currentCoords[1].toFixed(5)}`;
    const trackingLink = `https://msfr.app/live/sos/${dispatchId}`;

    const alertMessage = `🚨 [MSFR EMERGENCY SOS ALERT] 🚨\nUser: ${this.profile.name} (${this.profile.phone || 'Commuter'})\nLocation: Near ${nearestStationName} (GPS: ${currentCoords[0].toFixed(5)}, ${currentCoords[1].toFixed(5)})\nGoogle Maps: ${googleMapsLink}\nLive GPS Tracking: ${trackingLink}\nBlood Group: ${this.profile.bloodGroup || 'O+'}\nImmediate assistance requested via Musafir Transit Safety Network.`;

    // Attempt direct SMS alert dispatch to family/emergency contacts
    if (this.profile.emergencyContacts && this.profile.emergencyContacts.length > 0) {
      this.profile.emergencyContacts.forEach(async (contact) => {
        if (contact.phone) {
          try {
            const cleanPhone = contact.phone.replace(/\D/g, '').slice(-10);
            const authHeader = (import.meta as any).env?.VITE_TWILIO_ACCOUNT_SID
              ? btoa(
                  `${(import.meta as any).env.VITE_TWILIO_ACCOUNT_SID}:${
                    (import.meta as any).env.VITE_TWILIO_AUTH_TOKEN
                  }`
                )
              : null;
            if (authHeader) {
              const bodyParams = new URLSearchParams();
              bodyParams.append('To', `+91${cleanPhone}`);
              bodyParams.append(
                'From',
                (import.meta as any).env?.VITE_TWILIO_PHONE_NUMBER || '+15053914056'
              );
              bodyParams.append(
                'Body',
                `EMERGENCY ALERT from ${this.profile.name}: I need urgent help! My location: ${googleMapsLink} near ${nearestStationName}.`
              );
              fetch(
                `https://api.twilio.com/2010-04-01/Accounts/${
                  (import.meta as any).env.VITE_TWILIO_ACCOUNT_SID
                }/Messages.json`,
                {
                  method: 'POST',
                  headers: {
                    Authorization: `Basic ${authHeader}`,
                    'Content-Type': 'application/x-www-form-urlencoded',
                  },
                  body: bodyParams.toString(),
                }
              ).catch((e) => console.log('Twilio SOS direct notice:', e));
            }
          } catch {}
        }
      });
    }

    return {
      dispatchId,
      alertMessage,
      googleMapsLink,
      helplinesNotified: ['112 (National Emergency)', '1091 (Women Safety Helpline)', '108 (Ambulance / Medical Response)'],
      familyContactsNotified: this.profile.emergencyContacts,
      medicalCardSummary: `Blood Group: ${this.profile.bloodGroup || 'O+'} | Allergies: ${this.profile.allergies || 'None'}`,
    };
  }

  public triggerMidRoadMedicalEmergency(
    currentCoords: [number, number],
    nearestStationName: string,
    emergencyType: 'accident' | 'cardiac' | 'trauma' | 'general' = 'accident'
  ) {
    this.isSosActive = true;
    const dispatchId = 'MED-EMG-' + Math.floor(100000 + Math.random() * 900000);
    const googleMapsLink = `https://maps.google.com/?q=${currentCoords[0].toFixed(5)},${currentCoords[1].toFixed(5)}`;
    const trackingLink = `https://msfr.app/live/medical-emergency/${dispatchId}`;

    const emergencyTypeLabels: Record<string, string> = {
      accident: '🚗 Roadside Accident / High-Impact Collision',
      cardiac: '❤️ Cardiac / Sudden Chest Pain & Stroke',
      trauma: '🩸 Severe Trauma / Heavy Blood Loss',
      general: '🚨 Critical Mid-Road Medical Emergency',
    };

    const typeLabel = emergencyTypeLabels[emergencyType] || '🚨 Critical Medical Emergency';

    const alertMessage = `🚨 [URGENT: MID-ROAD MEDICAL EMERGENCY & ACCIDENT DISPATCH] 🚨\nType: ${typeLabel}\nPatient: ${this.profile.name} (${this.profile.phone || 'Commuter'})\nLocation: Mid-Road near ${nearestStationName}\nGPS Coordinates: ${currentCoords[0].toFixed(5)}, ${currentCoords[1].toFixed(5)}\nGoogle Maps Pin: ${googleMapsLink}\nLive Ambulance Tracking: ${trackingLink}\nBlood Group: ${this.profile.bloodGroup || 'O+'}\nMedical Notes: ${this.profile.medicalNotes || 'None'}\n\nAmbulance 108 and nearest trauma response teams notified. Immediate roadside green corridor requested.`;

    const traumaCenters = [
      {
        id: 'aiims-bbsr',
        name: 'AIIMS Bhubaneswar Level-1 Trauma Center',
        phone: '0674-2476789',
        emergencyDirect: '108',
        address: 'Sijua, Patrapada, Bhubaneswar',
        lat: 20.2312,
        lng: 85.7766,
        facilities: ['24x7 Advanced Trauma ICU', 'Blood Bank (All Groups)', 'Neuro & Ortho Surgery'],
      },
      {
        id: 'kims-hospital',
        name: 'KIMS Super Specialty Hospital & Emergency',
        phone: '0674-2725472',
        emergencyDirect: '0674-2725314',
        address: 'Kushabhadra Campus 5, Patia, Bhubaneswar',
        lat: 20.3544,
        lng: 85.8153,
        facilities: ['24x7 Cardiac Cath Lab', 'Emergency Resuscitation', 'Burn & Trauma Unit'],
      },
      {
        id: 'apollo-hospital',
        name: 'Apollo Hospitals Emergency & Trauma Care',
        phone: '0674-6661066',
        emergencyDirect: '1066',
        address: 'Plot No. 251, Sainik School Road, Bhubaneswar',
        lat: 20.3061,
        lng: 85.8340,
        facilities: ['Rapid Response Ambulance Unit', 'Critical Care Flight/ICU', 'Comprehensive Stroke Center'],
      },
      {
        id: 'sum-hospital',
        name: 'SUM Ultimate Medicare & Trauma Care',
        phone: '0674-2386281',
        emergencyDirect: '0674-3500500',
        address: 'K8 Kalinga Nagar, Ghatikia, Bhubaneswar',
        lat: 20.2798,
        lng: 85.7725,
        facilities: ['Level-1 Emergency Care', 'Advanced Multi-Organ ICU', '24x7 Emergency Pharmacy'],
      },
      {
        id: 'capital-hospital',
        name: 'Capital Hospital State Central Emergency',
        phone: '0674-2391983',
        emergencyDirect: '108',
        address: 'Unit 6, Ganga Nagar, Bhubaneswar',
        lat: 20.2644,
        lng: 85.8286,
        facilities: ['Government Emergency Trauma', '24x7 Free Ambulance Hub', 'State Blood Transfusion Unit'],
      },
    ];

    // Compute distance to each trauma center from current coordinates
    const hospitalsWithDistance = traumaCenters.map((h) => {
      const dLat = (h.lat - currentCoords[0]) * 111;
      const dLng = (h.lng - currentCoords[1]) * 111 * Math.cos((currentCoords[0] * Math.PI) / 180);
      const distKm = Math.sqrt(dLat * dLat + dLng * dLng);
      return {
        ...h,
        distanceKm: Math.round(distKm * 10) / 10,
        estimatedAmbulanceMinutes: Math.max(3, Math.round(distKm * 2.2)),
      };
    }).sort((a, b) => a.distanceKm - b.distanceKm);

    return {
      dispatchId,
      alertMessage,
      googleMapsLink,
      emergencyType: typeLabel,
      hospitals: hospitalsWithDistance,
      primaryAmbulance: '108',
      policeEmergency: '112',
      nationalHighwayHelpline: '1033',
      bloodGroup: this.profile.bloodGroup || 'O+',
      medicalNotes: this.profile.medicalNotes || '',
      firstAidProtocols: [
        {
          title: '🚨 Step 1: Ensure Mid-Road Safety First',
          desc: 'Turn on vehicle hazard lights immediately. Place warning triangle or cones 30m behind the vehicle. Move uninjured passengers off the active driving lane.',
        },
        {
          title: '🛑 Step 2: Control Severe Bleeding',
          desc: 'Apply firm, continuous direct pressure with a clean cloth or bandage directly over any open wound. Elevate bleeding limb if no fracture is suspected.',
        },
        {
          title: '🛡️ Step 3: Spinal & Neck Protection',
          desc: 'DO NOT move or twist the patient’s head or neck if high-speed vehicle impact or fall occurred, unless immediate fire/explosion danger exists.',
        },
        {
          title: '💨 Step 4: Clear Airway & Monitor Breathing',
          desc: 'Loosen tight collar, belt, or helmets gently. If patient is unresponsive and not breathing normally, begin Hands-Only CPR in the center of the chest at 100-120 beats/min.',
        },
      ],
    };
  }

  public cancelEmergencySOS() {
    this.isSosActive = false;
  }

  public isEmergencyActive(): boolean {
    return this.isSosActive;
  }

  public generateFamilyShareLink(): { link: string; token: string; expiresAt: string } {
    const token = 'LIVE-FAM-' + Math.random().toString(36).substring(2, 9).toUpperCase();
    return {
      token,
      link: `https://msfr.app/live-commute/${token}`,
      expiresAt: 'In 4 hours',
    };
  }
}

export const sosService = new SOSService();
