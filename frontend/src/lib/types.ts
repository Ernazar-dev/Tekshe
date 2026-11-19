/** Backend API tipleri (backend/src/types.ts penen birdey) */
export type StudentStatus = 'now' | 'back';
export type Level = 'Bakalavr' | 'Magistr' | 'PhD';
export type StageId = 'before' | 'arrive' | 'back';
export type RequestType = 'mentor' | 'vacancy';
export type Role = 'admin' | 'mentor' | 'student' | 'employer';
export type UserStatus = 'active' | 'pending' | 'blocked';
export type VacancyStatus = 'pending' | 'approved' | 'rejected';
export type RequestStatus = 'new' | 'answered' | 'closed';

export interface Company {
  name: string;
  city: string;
  stir: string;
  about: string;
}

export interface User {
  id: string;
  name: string;
  login: string;
  phone: string;
  role: Role;
  status: UserStatus;
  company?: Company;
  createdAt: string;
}

export interface Student {
  id: string;
  userId: string | null;
  name: string;
  status: StudentStatus;
  country: string;
  university: string;
  field: string;
  grant: string;
  years: string;
  createdAt: string;
}

export interface Grant {
  id: string;
  name: string;
  country: string;
  kind: 'Mámleketlik' | 'Shet el';
  levels: Level[];
  covers: string;
  site: string;
  url: string;
}

export interface Mentor {
  id: string;
  userId: string | null;
  name: string;
  initials: string;
  job: string;
  university: string;
  country: string;
  year: number;
  topics: string[];
  languages: string[];
  bio: string;
}

export interface Vacancy {
  id: string;
  ownerId: string | null;
  title: string;
  initials: string;
  company: string;
  field: string;
  city: string;
  type: string;
  requirement: string;
  status: VacancyStatus;
  createdAt: string;
}

export interface ChecklistStage {
  id: StageId;
  title: string;
  items: { id: string; title: string; description: string }[];
}

export interface Video {
  id: string;
  title: string;
  author: string;
}

export interface SupportTopic {
  title: string;
  description: string;
}

export interface Stats {
  students: number;
  graduates: number;
  countries: number;
  mentors: number;
  vacancies: number;
  grants: number;
}

export interface CommunityStats extends Stats {
  byCountry: { name: string; count: number }[];
  byField: { name: string; count: number }[];
}

export interface StudentsQuery {
  status?: StudentStatus;
  q?: string;
  country?: string;
  grant?: string;
  field?: string;
}

export interface StudentsResponse {
  data: Student[];
  total: number;
  counts: { all: number; now: number; back: number };
  facets: { countries: string[]; grants: string[]; fields: string[] };
}

export interface StudentProfileInput {
  status: StudentStatus;
  country: string;
  university: string;
  field: string;
  grant?: string;
  years?: string;
}

export interface MentorProfileInput {
  job: string;
  university: string;
  country: string;
  year: number;
  topics: string[];
  languages: string[];
  bio?: string;
}

export interface VacancyInput {
  title: string;
  field: string;
  city: string;
  type: string;
  requirement: string;
}

export interface NewRequest {
  type: RequestType;
  targetId: string;
  contact?: string;
  message: string;
}

/** Soraw: jiberiwshi (student) hám maqset (mentor yamasa vakansiya) kórinisi */
export interface RequestItem {
  id: string;
  type: RequestType;
  targetId: string;
  targetTitle: string;
  name: string;
  contact: string;
  message: string;
  status: RequestStatus;
  reply: string;
  createdAt: string;
  updatedAt: string;
}

export interface OwnVacancy extends Vacancy {
  applications: number;
}

export interface AdminVacancy extends Vacancy {
  ownerName: string | null;
  ownerStatus: UserStatus | null;
  stir: string | null;
}

export interface AuditEntry {
  id: string;
  actorName: string;
  action: string;
  targetLabel: string;
  createdAt: string;
}

export interface AdminOverview {
  users: Record<Role, number>;
  registry: { now: number; back: number };
  pendingUsers: number;
  pendingVacancies: number;
  openRequests: number;
  recentAudit: AuditEntry[];
}

export interface RevealedContact {
  name: string;
  hasAccount: boolean;
  phone: string | null;
}

export interface AuthResult {
  token: string;
  user: User;
}

export interface RegisterInput {
  name: string;
  login: string;
  password: string;
  phone?: string;
  role: Exclude<Role, 'admin'>;
}
