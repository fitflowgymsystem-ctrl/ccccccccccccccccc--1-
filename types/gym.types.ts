
export enum GymSubscriptionPlan {
  TRIAL = 'Trial',
  BASIC = 'Basic',
  PRO = 'Pro',
  ELITE = 'Elite',
  ENTERPRISE = 'Enterprise'
}

export interface GymModules {
  pos: boolean;
  trainers: boolean;
  attendance: boolean;
  financials: boolean;
  workoutPlans: boolean;
}

export interface Branch {
  id: string;
  name: string;
  address?: string;
  phone?: string;
}

export interface GymProfile {
  id: string;
  name: string;
  ownerName: string;
  email: string;
  phone: string;
  adminUsername?: string;
  adminPassword?: string;
  subscriptionPlan: GymSubscriptionPlan;
  subscriptionExpiry: string;
  isActive: boolean;
  logoUrl?: string;
  createdAt: string;
  enabledModules: GymModules;
  branches?: Branch[];
}

export interface AccessDevice {
  id: string;
  gymId: string;
  name: string;
  type: 'Fingerprint' | 'FaceID' | 'RFID';
  connectionType: 'Ethernet' | 'Serial';
  ip: string;
  port: number;
  status: 'online' | 'offline';
  isCluster: boolean;
  clusterIps?: string[];
  commKey?: string;
  lastSync?: string;
}

export interface Equipment {
  id: number;
  gymId: string;
  name: string;
  status: 'Operational' | 'Under Maintenance' | 'Broken';
  lastMaintenance: string;
  nextMaintenance: string;
}