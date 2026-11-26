export type Role = 'student' | 'parent' | 'coach' | 'admin';
export type AccountStatus = 'pending' | 'approved' | 'rejected';

export interface UserProfile {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  role: Role;
  status: AccountStatus;
  /** Student records this account can see (own record for students, children for parents). */
  studentIds: string[];
  joinCode: string | null;
  createdAt: number;
  notifyPush?: boolean;
  notifyEmail?: boolean;
  notifySms?: boolean;
}

export interface Student {
  id: string;
  fullName: string;
  belt: string;
  beltColor: string;
  status: 'Active' | 'Inactive';
  membership: string;
  joinCode: string;
  photo?: string | null;
}

export interface AttendanceRecord {
  id: string;
  studentId: string;
  studentName: string;
  date: string;
  status: 'Present' | 'Late' | 'Absent' | 'Excused';
  className: string;
  markedBy: string;
}

export interface BeltTest {
  id: string;
  date: string;
  label: string;
  location: string;
  cost: number;
  registrationStatus: string;
}

export interface BeltRegistration {
  id: string;
  testId: string;
  studentId: string;
  studentName: string;
  status: 'Registered' | 'Paid';
  createdAt: number;
}

export interface Feedback {
  id: string;
  studentId: string;
  studentName: string;
  coachName: string;
  date: string;
  category: string;
  title: string;
  message: string;
  read: boolean;
}

export interface FinancialRecord {
  id: string;
  studentId: string;
  studentName: string;
  type: string;
  description: string;
  amount: number;
  status: 'Paid' | 'Due';
  timestamp: number;
  dueDate: string | null;
}

export interface ClassSession {
  id: string;
  day: string;
  startTime: string;
  endTime: string;
  className: string;
  location: string;
  coachName: string;
}

export interface NewsItem {
  id: string;
  title: string;
  excerpt: string;
  body: string;
  category: string;
  publishedAt: string;
  author: string;
  image: string;
}

export interface Location {
  id: string;
  name: string;
  address: string;
  phone: string;
  mapsUrl: string;
  hours: string;
}

export interface StaffRequest {
  id: string;
  uid: string;
  coachName: string;
  kind: 'Time off' | 'Coverage';
  date: string;
  details: string;
  status: 'Pending' | 'Approved' | 'Declined';
  createdAt: number;
}
