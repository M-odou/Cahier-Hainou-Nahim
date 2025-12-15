import { Member, User, Contribution, Gender, Role, DahiraEvent, TourSchedule } from '../types';

// Mock Data Service to simulate a Backend
class DatabaseService {
  private users: User[] = [
    { id: '1', name: 'Modou Gningue GUEYE', email: 'gueyemodougningue@gmail.com', role: 'SUPER_ADMIN', active: true, password: 'Passer123' },
    { id: '2', name: 'Fatou Ndiaye', email: 'finance@dahira.com', role: 'ADMIN', active: true, password: 'password' },
    // A user that is also a member (linked via memberId)
    { id: '4', name: 'Cheikh Fall', email: 'cheikh.fall@gmail.com', role: 'MEMBER', active: true, memberId: '1' } 
  ];

  private members: Member[] = [
    {
      id: '1',
      firstName: 'Cheikh',
      lastName: 'Fall',
      gender: Gender.Male,
      phone: '770000001',
      email: 'cheikh.fall@gmail.com',
      location: 'Ouest Foire',
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
      location: 'Parcelles Assainies U.26',
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
      location: 'Keur Massar',
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

  private tourSchedules: TourSchedule[] = [
    { id: 'ts1', date: '2023-12-03', memberId: '1' },
    { id: 'ts2', date: '2023-12-10', memberId: '2' }
  ];

  // --- Auth ---
  login(identifier: string, password?: string): User | null {
    // 1. First, try to login as a System User (Admin/Super Admin) using Email
    const systemUser = this.users.find(u => u.email === identifier && u.password === password && u.active);
    if (systemUser) return systemUser;

    // 2. If not a system user, try to login as a Member using Phone Number
    // Normalize phone number (remove spaces)
    const cleanIdentifier = identifier.replace(/\s+/g, '');
    
    // Find member by phone
    const member = this.members.find(m => m.phone.replace(/\s+/g, '') === cleanIdentifier);

    if (member) {
        // If the phone number matches a member, we authorize the login.
        // In a real application, we would verify the password or send an OTP here.
        // For this sync facilitation request, finding the number allows access (simulating OTP verification or match).
        
        // Check if there is already a User account linked to this member
        const linkedUser = this.users.find(u => u.memberId === member.id && u.active);
        
        if (linkedUser) {
            return linkedUser;
        } else {
            // Create a temporary session User object for this member
            // This ensures members can login even if an Admin hasn't explicitly created a "User" account for them yet.
            return {
                id: `session_${member.id}`,
                name: `${member.firstName} ${member.lastName}`,
                email: member.email || '',
                role: 'MEMBER',
                memberId: member.id,
                active: true
            };
        }
    }

    return null;
  }

  // Simulate Google Login
  // In a real app, this would verify the token from Google
  loginWithGoogle(email: string): User | null {
    // 1. Check if user already exists
    let user = this.users.find(u => u.email === email);
    
    // 2. If user exists, return it
    if (user && user.active) return user;

    // 3. If user doesn't exist, check if a MEMBER has this email to auto-link
    const member = this.members.find(m => m.email === email);

    if (member) {
        // Create a new User linked to this member
        const newUser: User = {
            id: Math.random().toString(36).substring(2, 9),
            name: `${member.firstName} ${member.lastName}`,
            email: email,
            role: 'MEMBER', // Default role for Google signup
            active: true,
            memberId: member.id
        };
        this.users.push(newUser);
        return newUser;
    }

    // 4. If neither, we could create a new 'blank' user, but for this app logic, 
    // we assume admins create members first. Let's return null or a temp user.
    // For the mock, let's auto-create a user but without a member link (PENDING state)
    // Or just reject. Let's create a Viewer user.
    const newGuestUser: User = {
        id: Math.random().toString(36).substring(2, 9),
        name: email.split('@')[0],
        email: email,
        role: 'MEMBER',
        active: true
    };
    this.users.push(newGuestUser);
    return newGuestUser;
  }

  // --- Members ---
  getMembers(): Member[] {
    return [...this.members];
  }

  getMemberById(id: string): Member | undefined {
    return this.members.find(m => m.id === id);
  }

  addMember(member: Omit<Member, 'id' | 'contributions'>): Member {
    const newMember: Member = {
      ...member,
      id: Math.random().toString(36).substring(2, 9),
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
      id: Math.random().toString(36).substring(2, 9),
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

  // --- Dahira Events (History) ---
  getDahiraEvents(): DahiraEvent[] {
    return [...this.events];
  }

  addDahiraEvent(event: Omit<DahiraEvent, 'id'>): DahiraEvent {
    const newEvent = { ...event, id: Math.random().toString(36).substring(2, 9) };
    this.events.push(newEvent);
    return newEvent;
  }

  // --- Tour Schedules (Planning) ---
  getTourSchedules(): TourSchedule[] {
    return [...this.tourSchedules];
  }

  saveTourSchedules(schedules: Omit<TourSchedule, 'id'>[]): void {
    // Remove existing schedules for the same dates to avoid duplicates/conflicts
    const datesToUpdate = schedules.map(s => s.date);
    this.tourSchedules = this.tourSchedules.filter(s => !datesToUpdate.includes(s.date));
    
    // Add new ones
    const newItems = schedules.map(s => ({
      ...s,
      id: Math.random().toString(36).substring(2, 9)
    }));
    this.tourSchedules.push(...newItems);
  }

  deleteTourSchedule(id: string): void {
    this.tourSchedules = this.tourSchedules.filter(s => s.id !== id);
  }

  // --- Users ---
  getUsers(): User[] {
    return [...this.users];
  }

  addUser(user: Omit<User, 'id'>): User {
    const newUser = { ...user, id: Math.random().toString(36).substring(2, 9) };
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