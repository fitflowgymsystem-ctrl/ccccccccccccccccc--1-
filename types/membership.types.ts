export enum MembershipType {
  DAILY = 'Daily',
  MONTHLY = 'Monthly',
  QUARTERLY = 'Quarterly',
  BIANNUAL = 'Biannual',
  YEARLY = 'Yearly',
  LIFETIME = 'Lifetime'
}

export enum AccessStatus {
  GRANTED = 'GRANTED',
  DENIED = 'DENIED'
}

export interface AccessLog {
  id: number;
  gymId: string;
  userId: number;
  userName: string;
  userPhoto?: string;
  timestamp: string;
  status: AccessStatus;
  reason?: string;
  deviceId: string;
}

export interface PerkLog {
  id: number;
  type: 'InBody' | 'Guest Pass' | 'PT Session' | 'Free Group Class';
  date: string;
  staffName?: string;
}

export interface MembershipPlan {
  id: string;
  gymId: string;
  type: MembershipType;
  price: number;
  durationDays: number;
}

export interface Offer {
  id: number;
  gymId: string;
  title: string;
  code: string;
  discountValue: number;
  discountType: 'PERCENTAGE' | 'FIXED';
  validUntil: string;
  isActive: boolean;
}

export type ServiceCategory = 'Spa' | 'Group Class';
export type ServicePricingType = 'PER_SESSION' | 'PACKAGE' | 'SUBSCRIPTION';
export type ServiceStatus = 'AVAILABLE' | 'UNAVAILABLE';

export interface GymService {
  id: number;
  gymId: string;
  branchId: string;
  name: string;
  category: ServiceCategory;
  description: string;
  status: ServiceStatus;
  pricingType: ServicePricingType;
  price: number;
  validityDays?: number;
  packageSessions?: number;

  // Group Class Specific
  trainerName?: string;
  capacity?: number;
  room?: string;
  schedule?: string;
}

export interface ServiceSubscription {
  id: number;
  userId: number;
  serviceId: number;
  serviceName: string;
  purchaseDate: string;
  expiryDate: string;
  totalSessions: number;
  remainingSessions: number;
  status: 'active' | 'expired' | 'depleted';
  paymentStatus?: 'paid' | 'unpaid';
  price?: number;
}