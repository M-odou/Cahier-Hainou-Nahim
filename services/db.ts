import { Member, User, Contribution, Gender, Role, DahiraEvent } from '../types';

// Mock Data Service to simulate a Backend
class DatabaseService {
  private users: User[] = [
    { id: '1', name: 'Modou Gningue GUEYE', email: 'gueyemodougningue@gmail.com', role: 'SUPER_ADMIN', active: true, password: 'Passer123' },
    { id: '2', name: 'Fatou Ndiaye', email: 'finance@dahira.com', role: 'ADMIN', active: true, password: 'password' },
    { id: '3', name: 'Amadou Sow', email: 'membre@dahira.com', role: 'VIEWER', active: true, password: 'password' }
  ];

  private members: Member[] = [
    {
      id: '1',
      firstName: 'Cheikh',
      lastName: 'Fall',
      gender: Gender.Male,
      phone: '770000001',
      annualGoal: 12000,
      contributions: [
        { id: 'c1', memberId: '1', amount: 5000, date: '2023-10-15', recordedBy: '2' },
        { id: 'c2', memberId: '1', amount: 2000, date: '2023-11-01', recordedBy: '2' }
      ]
    },
    {
      id: '2',
      firstName: 'Aminata',
      lastName: 'Ba',
      gender: Gender.Female,
      phone: '770000002',
      annualGoal: 12000,
      contributions: [
        { id: 'c3', memberId: '2', amount: 12000, date: '2023-09-10', recordedBy: '2' }
      ]
    },
    {
      id: '3',
      firstName: 'Modou',
      lastName: 'Seck',
      gender: Gender.Boy,
      phone: '700000000',
      annualGoal: 6000,
      contributions: []
    }
  ];

  private events: DahiraEvent[] = [
    {
      id: 'e1',
      date: '2023-11-10',
      hostName: 'Famille Ndiaye',
      menTotal: 45000,
      womenTotal: 30000,
      socialTotal: 5000,
      recordedBy: '1'
    }
  ];

  // --- Auth ---
  login(email: string, password: string): User | null {
    const user = this.users.find(u => u.email === email && u.password === password && u.active);
    return user || null;
  }

  // --- Members ---
  getMembers(): Member[] {
    return [...this.members];
  }

  addMember(member: Omit<Member, 'id' | 'contributions'>): Member {
    const newMember: Member = {
      ...member,
      id: Math.random().toString(36).substr(2, 9),
      contributions: []
    };
    this.members.push(newMember);
    return newMember;
  }

  updateMember(id: string, data: Partial<Member>): void {
    const idx = this.members.findIndex(m => m.id === id);
    if (idx !== -1) {
      this.members[idx] = { ...this.members[idx], ...data };
    }
  }

  // --- Contributions ---
  addContribution(contribution: Omit<Contribution, 'id'>): Contribution {
    const newContribution: Contribution = {
      ...contribution,
      id: Math.random().toString(36).substr(2, 9),
    };

    const memberIdx = this.members.findIndex(m => m.id === contribution.memberId);
    if (memberIdx !== -1) {
      this.members[memberIdx].contributions.push(newContribution);
    }
    return newContribution;
  }

  getAllContributions(): Contribution[] {
    return this.members.flatMap(m => m.contributions);
  }

  // --- Dahira Events ---
  getDahiraEvents(): DahiraEvent[] {
    return [...this.events];
  }

  addDahiraEvent(event: Omit<DahiraEvent, 'id'>): DahiraEvent {
    const newEvent = { ...event, id: Math.random().toString(36).substr(2, 9) };
    this.events.push(newEvent);
    return newEvent;
  }

  // --- Users ---
  getUsers(): User[] {
    return [...this.users];
  }

  addUser(user: Omit<User, 'id'>): User {
    const newUser = { ...user, id: Math.random().toString(36).substr(2, 9) };
    this.users.push(newUser);
    return newUser;
  }

  toggleUserStatus(id: string): void {
    const u = this.users.find(u => u.id === id);
    if (u) u.active = !u.active;
  }

  updateUserRole(id: string, role: Role): void {
    const u = this.users.find(u => u.id === id);
    if (u) u.role = role;
  }
}

export const db = new DatabaseService();