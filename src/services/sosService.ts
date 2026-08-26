import { UserProfile, EmergencyContact } from '../types/transit';
import { audioService } from './audioService';

const STORAGE_KEY_PROFILE = 'transitsync_user_profile';

const DEFAULT_PROFILE: UserProfile = {
  name: 'Abhijit Sahoo',
  email: 'abhijit.sahoo@example.com',
  phone: '+91 98765 43210',
  homeAddress: 'Plot #142, Sailashree Vihar, Bhubaneswar, Odisha',
  workAddress: 'InfoCity Tech Park Tower B, Patia, Bhubaneswar',
  bloodGroup: 'O+',
  medicalNotes: 'Mild Asthma, carrying inhaler. Penicillin allergy.',
  allergies: 'Penicillin, Dust mites',
  studentVerification: {
    isVerified: true,
    verificationMethod: 'digilocker',
    rollNo: '2023-CS-0842',
    collegeName: 'KIIT University, Bhubaneswar',
    courseName: 'B.Tech Computer Science',
    validUntil: '2027',
    verifiedAt: '2026-08-15',
  },
  isSeniorVerified: false,
  isWomenPassenger: false,
  familyShareActive: true,
  emergencyContacts: [
    { id: 'ec-1', name: 'Dr. S. Sahoo (Father)', phone: '+91 94370 12345', relation: 'Father' },
    { id: 'ec-2', name: 'Sunita Sahoo (Mother)', phone: '+91 94371 67890', relation: 'Mother' },
    { id: 'ec-3', name: 'Rohan Ray (Roommate/Friend)', phone: '+91 99370 54321', relation: 'Friend' },
  ],
};

class SOSService {
  private profile: UserProfile;
  private isSosActive = false;

  constructor() {
    const saved = localStorage.getItem(STORAGE_KEY_PROFILE);
    if (saved) {
      try {
        this.profile = { ...DEFAULT_PROFILE, ...JSON.parse(saved) };
      } catch {
        this.profile = DEFAULT_PROFILE;
      }
    } else {
      this.profile = DEFAULT_PROFILE;
      this.saveProfile(DEFAULT_PROFILE);
    }
  }

  public getProfile(): UserProfile {
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
