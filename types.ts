
export type Role = 'SUPER_ADMIN' | 'ADMIN' | 'VIEWER';

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