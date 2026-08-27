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
    helplinesNotified: string[];
    familyContactsNotified: EmergencyContact[];
    medicalCardSummary: string;
  } {
    this.isSosActive = true;
    audioService.startSiren();

    const dispatchId = 'SOS-MSFR-' + Math.floor(100000 + Math.random() * 900000);
    const trackingLink = `https://msfr.app/live/sos/${dispatchId}`;

    const alertMessage = `🚨 [MSFR EMERGENCY SOS ALERT] 🚨\nUser: ${this.profile.name} (${this.profile.phone})\nLocation: Lat ${currentCoords[0].toFixed(5)}, Lng ${currentCoords[1].toFixed(5)} near ${nearestStationName}.\nBlood Group: ${this.profile.bloodGroup}\nMedical Alert: ${this.profile.medicalNotes}\nLive GPS Tracking: ${trackingLink}\nImmediate response requested via MSFR Transit Safety Network.`;

    return {
      dispatchId,
      alertMessage,
      helplinesNotified: ['112 (National Emergency)', '1091 (Women Safety Helpline)', '108 (Ambulance / Medical Response)'],
      familyContactsNotified: this.profile.emergencyContacts,
      medicalCardSummary: `Blood Group: ${this.profile.bloodGroup} | Allergies: ${this.profile.allergies}`,
    };
  }

  public cancelEmergencySOS() {
    this.isSosActive = false;
    audioService.stopSiren();
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
