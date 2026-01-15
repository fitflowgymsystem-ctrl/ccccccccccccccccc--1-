
import { WorkoutPlan, WaterLog } from './workout.types';
import { MembershipType, PerkLog } from './membership.types';
import { PrivateSessionLog, InstallmentPlan } from './finance.types';

// --- Common Types ---
export enum Gender {
  MALE = 'Male',
  FEMALE = 'Female'
}

export enum UserRole {
  SUPER_ADMIN = 'SUPER_ADMIN',
  ADMIN = 'ADMIN',
  EMPLOYEE = 'EMPLOYEE',
  TRAINER = 'TRAINER',
  MEMBER = 'MEMBER'
}

export interface TrainerSchedule {
  day: string;
  startTime: string;
  endTime: string;
}

// --- InBody Measurement Types ---
export interface InBodyMeasurement {
  id: number;
  date: string; // ISO date format
  weight: number; // kg
  fatPercentage: number; // %
  muscleMass: number; // kg
  bmi: number;
  visceralFat: number; // level 1-20
  bodyWater: number; // %
  metabolicAge?: number;
  basalMetabolicRate?: number; // BMR in kcal
  notes?: string;
}

export type ActivityLevel = 'sedentary' | 'light' | 'moderate' | 'active' | 'extra';
export type FitnessGoalType = 'maintain' | 'lose_slow' | 'lose_fast' | 'gain_slow' | 'gain_fast';

export interface CalorieCalculation {
  bmr: number;
  tdee: number; // Total Daily Energy Expenditure
  targetCalories: number;
  protein: number; // grams
  carbs: number; // grams
  fats: number; // grams
}

// --- Base Staff (Common Fields) ---
export interface BaseStaff {
  id: number;
  gymId: string;
  name: string;
  idCardNumber?: string;
  phone: string;
  email?: string;
  address?: string;
  dob?: string;
  gender: Gender;
  username?: string;
  password?: string;
  photoUrl?: string;
  fingerprintId?: string;
  role: UserRole;
  isActive: boolean;
  status: 'active' | 'inactive';
  schedule?: TrainerSchedule[];
  hireDate?: string;
  branch?: string;
}

// --- Specific Roles ---
export interface Trainer extends BaseStaff {
  specialty: string;
  experienceYears: number;
  bio?: string;
  certificates?: string[]; // URLs or file names
  commissionRate: number;
  baseSalary: number;
  totalCommissionEarned: number;
  attendanceLogs?: any[];
}

export interface Employee extends BaseStaff {
  jobTitle: string;
  baseSalary: number;
  permissions?: string[];
  attendanceLogs?: any[];
}

// --- Existing User & Session ---
export interface User {
  id: number;
  gymId: string;
  gym_name?: string;
  role?: UserRole | string;
  name: string;
  phone: string;
  gender: Gender;
  membershipType: MembershipType;
  joinDate: string;
  expiryDate: string;
  isActive: boolean;
  isFrozen: boolean;
  frozenUntil?: string | null;
  fingerprintId: string;
  photoUrl?: string;
  balance: number;
  perks: {
    inbodySessions: number;
    guestPasses: number;
    ptSessions: number;
    groupClasses: boolean;
    freeGroupClassCount?: number;
    freeGroupClassId?: number | string;
    spaAccess: boolean;
    privateLocker: boolean;
    towelService: boolean;
    barDiscount: boolean;
  };
  perkLogs?: PerkLog[];
  activeOfferId?: number;
  assignedTrainerId?: number;
  isPrivate?: boolean;
  privateSessionPrice?: number;
  privateLogs?: PrivateSessionLog[];
  workoutPlan?: WorkoutPlan;
  waterLogs?: WaterLog[];
  // --- New Fields (Profile) ---
  email?: string;
  dob?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  branch?: string;
  // --- New Fields (Health) ---
  fitnessGoal?: string;
  weight?: number;
  height?: number;
  fatPercentage?: number;
  medicalConditions?: string;
  bloodType?: string;
  inbodyMeasurements?: InBodyMeasurement[];
  activityLevel?: ActivityLevel;
  fitnessGoalType?: FitnessGoalType;
  // --- New Fields (Financial) ---
  paymentMethod?: string;
  totalPaid?: number;
  installmentPlans?: InstallmentPlan[];
}

export interface UserSession {
  id: number | string;
  name: string;
  role: UserRole;
  gymId: string;
  username?: string;
  memberData?: User;
  email?: string;
}
