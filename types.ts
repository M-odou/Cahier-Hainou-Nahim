
export type Role = 'SUPER_ADMIN' | 'ADMIN' | 'VIEWER' | 'MEMBER';

export enum Gender {
  Male = 'Homme',
  Female = 'Femme',
  Boy = 'Garçon',
  Girl = 'Fille'
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  memberId?: string; // Links the login user to the specific member data
  password?: string; // In a real app, never store plain text
  active: boolean;
}

export interface Contribution {
  id: string;
  memberId: string;
  amount: number;
  date: string; // ISO Date string
  recordedBy: string; // User ID
}

export interface Member {
  id: string;
  firstName: string;
  lastName: string;
  gender: Gender;
  phone: string;
  email?: string; // Added to link with User account
  location?: string; // Quartier ou Adresse
  annualGoal: number;
  contributions: Contribution[];
}

export interface DahiraEvent {
  id: string;
  date: string;
  hostName: string;
  menTotal: number;
  womenTotal: number;
  socialTotal: number;
  recordedBy: string;
}

export interface TourSchedule {
  id: string;
  date: string; // ISO Date string
  memberId: string;
  note?: string;
}

export interface DashboardStats {
  totalCollected: number;
  totalExpected: number;
  maleCollected: number;
  femaleCollected: number;
  childCollected: number;
  memberCount: number;
}