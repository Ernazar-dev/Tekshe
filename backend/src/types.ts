export type StudentStatus = 'now' | 'back';
export type Level = 'Bakalavr' | 'Magistr' | 'PhD';
export type GrantKind = 'Mámleketlik' | 'Shet el';
export type StageId = 'before' | 'arrive' | 'back';
export type RequestType = 'mentor' | 'vacancy';

/** admin — Jaslar isleri agentligi xızmetkeri; employer — tadbirkor (kárxana) */
export type Role = 'admin' | 'mentor' | 'student' | 'employer';
/** pending — admin tastıyıqlawın kútip atır (mentor: diplom, tadbirkor: STIR) */
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
  passwordHash: string;
  company?: Company;
  /** Student belgilegen tayarlıq dizimi bántleri */
  checklist?: string[];
  createdAt: string;
}

export type PublicUser = Omit<User, 'passwordHash'>;

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
  kind: GrantKind;
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

export interface ChecklistItem {
  id: string;
  title: string;
  description: string;
}

export interface ChecklistStage {
  id: StageId;
  title: string;
  items: ChecklistItem[];
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

export interface ContactRequest {
  id: string;
  type: RequestType;
  targetId: string;
  fromUserId: string;
  /** Jiberiwshiniń atı — mentorǵa/tadbirkorǵa kórsetiledi */
  name: string;
  /** Jiberiwshi óz erkine qosatuǵın baylanıs (májbúriy emes) */
  contact: string;
  message: string;
  status: RequestStatus;
  reply: string;
  createdAt: string;
  updatedAt: string;
}

/** Jurnal: kim, qashan, ne islegeni (maǵlıwmatlar qáwipsizligi ushın) */
export interface AuditEntry {
  id: string;
  actorId: string;
  actorName: string;
  action: string;
  targetLabel: string;
  createdAt: string;
}

export interface Database {
  users: User[];
  students: Student[];
  mentors: Mentor[];
  vacancies: Vacancy[];
  requests: ContactRequest[];
  audit: AuditEntry[];
}
