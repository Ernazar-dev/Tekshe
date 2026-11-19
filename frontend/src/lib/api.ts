import type {
  AdminOverview, AdminVacancy, AuditEntry, AuthResult, ChecklistStage, CommunityStats, Company, Grant, Level, Mentor, MentorProfileInput, NewRequest,
  OwnVacancy, RegisterInput, RequestItem, RevealedContact, Role, Stats, Student, StudentProfileInput, StudentsQuery, StudentsResponse, SupportTopic, User,
  UserStatus, Vacancy, VacancyInput, VacancyStatus, Video,
} from './types';

const BASE = (import.meta.env.VITE_API_URL || '/api').replace(/\/$/, '');
const TOKEN_KEY = 'tekshe:token';

/** Brauzer saqlawı bloklanǵan bolsa (jeke rejim) — token tek usı sessiyada, yadta saqlanadı */
let memoryToken: string | null = null;

export const tokenStore = {
  get(): string | null {
    try {
      return localStorage.getItem(TOKEN_KEY) ?? memoryToken;
    } catch {
      return memoryToken;
    }
  },
  set(token: string) {
    memoryToken = token;
    try {
      localStorage.setItem(TOKEN_KEY, token);
    } catch {
      /* saqlaw múmkin emes */
    }
  },
  clear() {
    memoryToken = null;
    try {
      localStorage.removeItem(TOKEN_KEY);
    } catch {
      /* saqlaw múmkin emes */
    }
  },
};

/** Token jaramsız bolıp qalsa (múddeti ótti, akkaunt bloklandı) — AuthProvider usı hádiyseni tıńlaydı */
export const UNAUTHORIZED_EVENT = 'tekshe:unauthorized';

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
    public readonly fieldErrors: Record<string, string[]> = {},
  ) {
    super(message);
  }
}

/** Bos mánislerdi taslap, query qatarın dúzedi */
const qs = (params: object = {}) => {
  const search = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (typeof v === 'string' && v.trim()) search.set(k, v.trim());
  }
  const s = search.toString();
  return s ? `?${s}` : '';
};

async function send(path: string, init?: RequestInit): Promise<Response> {
  const token = tokenStore.get();
  try {
    return await fetch(`${BASE}${path}`, {
      ...init,
      headers: {
        Accept: 'application/json',
        ...(init?.body ? { 'Content-Type': 'application/json' } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...init?.headers,
      },
    });
  } catch {
    throw new ApiError(0, 'Server menen baylanıs joq. Internetti tekserip, qayta urınıp kóriń.');
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await send(path, init);
  const body: unknown = await res.json().catch(() => null);
  if (!res.ok) {
    const { message, errors } = (body ?? {}) as { message?: string; errors?: Record<string, string[]> };
    // Kiriw formasındaǵı 401 — «parol qáte», sessiya tamamlanıwı emes
    if (res.status === 401 && tokenStore.get() && !path.startsWith('/auth/login')) window.dispatchEvent(new Event(UNAUTHORIZED_EVENT));
    throw new ApiError(res.status, message || `Qáte: ${res.status}`, errors);
  }
  return body as T;
}

const json = (method: string, data?: unknown): RequestInit => ({ method, body: data === undefined ? undefined : JSON.stringify(data) });

/** Fayldı token menen júkleydi (CSV) — ápiwayı silteme Authorization jiberip almaydı */
async function download(path: string, filename: string) {
  const res = await send(path, { headers: { Accept: 'text/csv' } });
  if (!res.ok) {
    const body = (await res.json().catch(() => null)) as { message?: string } | null;
    throw new ApiError(res.status, body?.message || `Qáte: ${res.status}`);
  }
  const url = URL.createObjectURL(await res.blob());
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export const api = {
  /* Ashıq */
  stats: () => request<Stats>('/stats'),
  community: () => request<CommunityStats>('/community'),
  grants: (level?: Level) => request<{ data: Grant[]; levels: Level[] }>(`/grants${qs({ level })}`),
  mentors: (country?: string) => request<{ data: Mentor[]; countries: string[] }>(`/mentors${qs({ country })}`),
  vacancies: (field?: string) => request<{ data: Vacancy[]; fields: string[] }>(`/vacancies${qs({ field })}`),
  guides: () => request<{ checklists: ChecklistStage[]; videos: Video[] }>('/guides'),
  supportTopics: () => request<{ data: SupportTopic[] }>('/support-topics'),

  /* Akkaunt */
  login: (login: string, password: string) => request<AuthResult>('/auth/login', json('POST', { login, password })),
  register: (data: RegisterInput) => request<AuthResult>('/auth/register', json('POST', data)),
  me: () => request<User>('/auth/me'),
  updateMe: (data: { name: string; phone: string }) => request<User>('/auth/me', json('PATCH', data)),
  changePassword: (data: { current: string; next: string }) => request<{ ok: true }>('/auth/password', json('POST', data)),

  /* Soraw hám arza */
  createRequest: (data: NewRequest) => request<{ id: string }>('/requests', json('POST', data)),
  myRequests: () => request<{ data: RequestItem[] }>('/me/requests'),

  /* Student */
  studentPanel: () => request<{ profile: Student | null; checklist: string[]; recommended: Mentor[] }>('/me/student'),
  saveStudent: (data: StudentProfileInput) => request<Student>('/me/student', json('PUT', data)),
  saveChecklist: (done: string[]) => request<{ done: string[] }>('/me/checklist', json('PUT', { done })),

  /* Mentor */
  mentorProfile: () => request<{ profile: Mentor | null }>('/me/mentor'),
  saveMentor: (data: MentorProfileInput) => request<{ profile: Mentor }>('/me/mentor', json('PUT', data)),

  /* Tadbirkor */
  company: () => request<{ company: Company | null }>('/me/company'),
  saveCompany: (data: Company) => request<{ company: Company }>('/me/company', json('PUT', data)),
  ownVacancies: () => request<{ data: OwnVacancy[] }>('/me/vacancies'),
  createVacancy: (data: VacancyInput) => request<Vacancy>('/me/vacancies', json('POST', data)),
  updateVacancy: (id: string, data: VacancyInput) => request<Vacancy>(`/me/vacancies/${id}`, json('PUT', data)),
  deleteVacancy: (id: string) => request<null>(`/me/vacancies/${id}`, json('DELETE')),

  /* Mentor hám tadbirkor: kelgen sorawlar */
  inbox: () => request<{ data: RequestItem[] }>('/me/inbox'),
  reply: (id: string, data: { reply?: string; status?: 'new' | 'answered' | 'closed' }) => request<RequestItem>(`/me/inbox/${id}`, json('PATCH', data)),

  /* Admin */
  adminOverview: () => request<AdminOverview>('/admin/overview'),
  adminUsers: (params: { role?: Role; status?: UserStatus; q?: string }) => request<{ data: User[] }>(`/admin/users${qs(params)}`),
  setUserStatus: (id: string, status: UserStatus) => request<User>(`/admin/users/${id}`, json('PATCH', { status })),
  createStaff: (data: { name: string; login: string; password: string }) => request<User>('/admin/staff', json('POST', data)),
  adminVacancies: (status?: VacancyStatus) => request<{ data: AdminVacancy[] }>(`/admin/vacancies${qs({ status })}`),
  setVacancyStatus: (id: string, status: VacancyStatus) => request<Vacancy>(`/admin/vacancies/${id}`, json('PATCH', { status })),
  registry: (query: StudentsQuery) => request<StudentsResponse>(`/admin/students${qs(query)}`),
  addStudent: (data: StudentProfileInput & { name: string }) => request<Student>('/admin/students', json('POST', data)),
  deleteStudent: (id: string) => request<null>(`/admin/students/${id}`, json('DELETE')),
  revealStudent: (id: string) => request<RevealedContact>(`/admin/students/${id}/reveal`, json('POST')),
  downloadRegistry: (query: StudentsQuery) => download(`/admin/students/export.csv${qs(query)}`, 'tekshe-studentler.csv'),
  audit: () => request<{ data: AuditEntry[] }>('/admin/audit'),
};
