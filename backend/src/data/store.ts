import { randomUUID } from 'node:crypto';
import { mkdir, readFile, rename, writeFile } from 'node:fs/promises';
import path from 'node:path';
import type { ContactRequest, Database, Role, Student, User } from '../types.js';
import { loginFromEmail } from '../utils/login.js';
import { hashPasswordSync, verifyPassword } from '../utils/password.js';
import { SEED_MENTORS, SEED_STUDENTS, SEED_VACANCIES } from './content.js';

export type AccountRole = 'admin' | 'mentor' | 'student' | 'employer';
export interface AccountCredentials {
  login: string;
  password: string;
}

export interface SeedOptions {
  /** Hár rol ushın bir akkaunt — maǵlıwmatlar .env den keledi. Berilmegen rol jaratılmaydı */
  accounts: Partial<Record<AccountRole, AccountCredentials>>;
}

const ACCOUNT_PROFILES: Record<AccountRole, { name: string; company?: User['company'] }> = {
  admin: { name: 'Administrator' },
  mentor: { name: 'Azamat Tleuov' },
  student: { name: 'Gúlnara Saparova' },
  employer: {
    name: 'Rustam Esbergenov',
    company: { name: 'IT kompaniya', city: 'Nókis', stir: '301234567', about: 'Programmalıq támiynat islep shıǵıw.' },
  },
};

const makeUser = (role: AccountRole, { login, password }: AccountCredentials, now: string): User => ({
  id: randomUUID(),
  name: ACCOUNT_PROFILES[role].name,
  login: login.toLowerCase(),
  phone: '',
  role,
  status: 'active',
  passwordHash: hashPasswordSync(password),
  createdAt: now,
  ...(ACCOUNT_PROFILES[role].company ? { company: ACCOUNT_PROFILES[role].company } : {}),
});

/** Akkauntti sol atlı úlgi mentor / student profili hám vakansiyalarǵa baylaydı */
const linkProfile = (db: Database, user: User) => {
  if (user.role === 'mentor') {
    const m = db.mentors.find((x) => x.name === user.name && !x.userId);
    if (m) m.userId = user.id;
  } else if (user.role === 'student') {
    const st = db.students.find((x) => x.name === user.name && !x.userId);
    if (st) st.userId = user.id;
  } else if (user.role === 'employer' && user.company) {
    for (const v of db.vacancies) if (v.company === user.company.name && !v.ownerId) v.ownerId = user.id;
  }
};

export const seed = ({ accounts }: SeedOptions): Database => {
  const now = new Date().toISOString();
  const db: Database = {
    users: [],
    students: SEED_STUDENTS.map((s) => ({ ...s, id: randomUUID(), userId: null, createdAt: now })),
    mentors: SEED_MENTORS.map((m) => ({ ...m, userId: null, bio: '' })),
    vacancies: SEED_VACANCIES.map((v) => ({ ...v, ownerId: null, status: 'approved' as const, createdAt: now })),
    requests: [],
    audit: [],
  };
  for (const [role, creds] of Object.entries(accounts) as [AccountRole, AccountCredentials][]) {
    const user = makeUser(role, creds, now);
    db.users.push(user);
    linkProfile(db, user);
  }
  return db;
};

/**
 * .env degi akkauntlardı bar bazaǵa sáykeslestiredi: joq bolsa — jaratadı,
 * parol ózgergen bolsa — jańalaydı. (Basqa maydanlarǵa tiymeydi.)
 */
export const syncAccounts = async (db: Database, { accounts }: SeedOptions) => {
  const now = new Date().toISOString();
  for (const [role, creds] of Object.entries(accounts) as [AccountRole, AccountCredentials][]) {
    const login = creds.login.toLowerCase();
    const existing = db.users.find((u) => u.login === login);
    if (!existing) {
      const user = makeUser(role, creds, now);
      db.users.push(user);
      linkProfile(db, user);
    } else if (existing.role === role && !(await verifyPassword(creds.password, existing.passwordHash))) {
      existing.passwordHash = hashPasswordSync(creds.password);
    }
  }
};

/** Eski bazadaǵı email maydanın login ge ótkeredi (@ ge shekemgi bólim, bántlikte san qosıladı) */
const toLoginUsers = (users: User[]): User[] => {
  const taken = new Set(users.map((u) => (u as { login?: string }).login).filter((l): l is string => !!l));
  return users.map((u) => {
    const { email, ...rest } = u as User & { email?: string };
    if (rest.login) return rest as User;
    const login = loginFromEmail(email ?? 'user', taken);
    taken.add(login);
    return { ...rest, login } as User;
  });
};

/** Eski versiyadaǵı bazanı (tek students + requests) jańa strukturaǵa ótkeredi */
export const migrate = (raw: Partial<Record<keyof Database, unknown[]>>, fresh: () => Database): Database => {
  const missing = (['users', 'students', 'mentors', 'vacancies', 'requests', 'audit'] as const).filter((k) => !Array.isArray(raw[k]));
  const base = missing.length ? fresh() : null;
  const pick = <K extends keyof Database>(k: K): Database[K] => (Array.isArray(raw[k]) ? (raw[k] as Database[K]) : base![k]);
  return {
    users: toLoginUsers(pick('users')),
    mentors: pick('mentors'),
    audit: pick('audit'),
    vacancies: pick('vacancies'),
    students: pick('students').map((s: Student) => ({ ...s, userId: s.userId ?? null })),
    requests: pick('requests').map((r: ContactRequest) => ({
      ...r,
      fromUserId: r.fromUserId ?? '',
      status: r.status ?? 'new',
      reply: r.reply ?? '',
      updatedAt: r.updatedAt ?? r.createdAt,
    })),
  };
};

/** Barlıq saqlaw usılları (JSON fayl, Postgres) usı interfeysti orınlaydı */
export interface Store {
  /** Tek oqıw — nátiyjeni ózgertpeń */
  read<T>(fn: (db: Readonly<Database>) => T): Promise<T>;
  /** Ózgeris: sátli saqlansa ǵana qabıl etiledi; fn qáte shıǵarsa — hesh nárse ózgermeydi */
  update<T>(fn: (db: Database) => T): Promise<T>;
}

/**
 * JSON-faylǵa saqlanatuǵın kishi maǵlıwmatlar bazası.
 * Barlıq ózgerisler navbet penen orınlanadı (bir waqıttaǵı jazıwlar bir-birin óshirmeydi),
 * fayl aldın waqıtsha faylǵa jazılıp, keyin atı ózgertiledi — jazıw úzilse de baza buzılmaydı.
 * `file` = null bolsa — tek yadta (testler ushın).
 */
export class JsonStore implements Store {
  private db: Database | null = null;
  private queue: Promise<unknown> = Promise.resolve();

  constructor(
    private readonly file: string | null,
    private readonly seedOptions: SeedOptions = { accounts: {} },
  ) {}

  private async load(): Promise<Database> {
    if (this.db) return this.db;
    const fresh = () => seed(this.seedOptions);
    if (!this.file) return (this.db = fresh());
    try {
      const parsed: unknown = JSON.parse(await readFile(this.file, 'utf8'));
      if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) throw new Error(`${this.file}: baza strukturası qáte`);
      const db = migrate(parsed as Partial<Record<keyof Database, unknown[]>>, fresh);
      await syncAccounts(db, this.seedOptions);
      if (JSON.stringify(db) !== JSON.stringify(parsed)) await this.persist(db);
      this.db = db;
    } catch (err) {
      if ((err as NodeJS.ErrnoException).code !== 'ENOENT') throw err;
      this.db = fresh();
      await this.persist(this.db);
    }
    return this.db;
  }

  private async persist(db: Database) {
    if (!this.file) return;
    await mkdir(path.dirname(this.file), { recursive: true });
    const tmp = `${this.file}.${process.pid}.tmp`;
    await writeFile(tmp, JSON.stringify(db, null, 2), 'utf8');
    await rename(tmp, this.file);
  }

  /** Tek oqıw — nátiyjeni ózgertpeń (bazanıń ózi qaytarıladı, kóshirmesi emes) */
  async read<T>(fn: (db: Readonly<Database>) => T): Promise<T> {
    await this.queue;
    return fn(await this.load());
  }

  /** Ózgeris: kóshirmede orınlanadı, faylǵa sátli jazılsa ǵana qabıl etiledi */
  update<T>(fn: (db: Database) => T): Promise<T> {
    const run = this.queue.then(async () => {
      const draft = structuredClone(await this.load());
      const result = fn(draft);
      await this.persist(draft);
      this.db = draft;
      return result;
    });
    // Qáte navbetti toqtatpawı kerek
    this.queue = run.catch(() => undefined);
    return run;
  }
}
