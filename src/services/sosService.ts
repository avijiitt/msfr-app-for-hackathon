import { UserProfile, EmergencyContact } from '../types/transit';
import { audioService } from './audioService';

const STORAGE_KEY_PROFILE = 'transitsync_user_profile';

function getDefaultProfile(): UserProfile {
  // Try reading from the logged-in user's registration data
  let name = 'Traveller';
  let email = '';
  let phone = '';
  let bloodGroup = 'O+';
  let homeAddress = '';
  let emergencyContacts: EmergencyContact[] = [];

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
    }
  } catch {}

  return {
    name,
    email,
    phone,
    homeAddress,
    workAddress: '',
    bloodGroup: bloodGroup as UserProfile['bloodGroup'],
    medicalNotes: '',
    allergies: '',
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
        // If parsed has stale dummy email, ignore it
        if (parsed.email === 'abhijit.sahoo@example.com' || !parsed.name || parsed.name === 'Abhijit Sahoo') {
          this.profile = defaultProf;
        } else {
          this.profile = { ...defaultProf, ...parsed, name: defaultProf.name !== 'Traveller' ? defaultProf.name : parsed.name, email: defaultProf.email || parsed.email, phone: defaultProf.phone || parsed.phone };
        }
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
    if (active.name !== 'Traveller' || active.email) {
      return {
        ...this.profile,
        name: active.name !== 'Traveller' ? active.name : this.profile.name,
        email: active.email || this.profile.email,
        phone: active.phone || this.profile.phone,
        bloodGroup: active.bloodGroup || this.profile.bloodGroup,
        homeAddress: active.homeAddress || this.profile.homeAddress,
        emergencyContacts: active.emergencyContacts.length > 0 ? active.emergencyContacts : this.profile.emergencyContacts,
      };
    }
    return { ...this.profile };
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
