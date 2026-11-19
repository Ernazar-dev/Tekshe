import path from 'node:path';
import { z } from 'zod';
import { LOGIN_RE } from '../utils/login.js';
import type { AccountCredentials, AccountRole } from '../data/store.js';

// .env bolsa — júklenedi (Node ≥ 20.12). Sırlar (JWT, parollar) tek usı jerde saqlanadı
try {
  process.loadEnvFile();
} catch {
  /* .env joq — JWT_SECRET kem bolǵanı ushın tómende qáte shıǵadı */
}

const ROLES = ['admin', 'mentor', 'student', 'employer'] as const satisfies readonly AccountRole[];

const login = z.string().regex(LOGIN_RE, 'login 3–32 belgi: háripler, sanlar, . _ - (@ bolmasın)').optional();
const password = z.string().min(8, 'parol keminde 8 belgi bolsın').optional();

/**
 * Render/Neon panelinen kóshirgende jiyi bolatuǵın artıqshalıqlardı alıp taslaydı:
 * ushındaǵı bos orınlar, qos/bir qosh tırnaq, Neon'nıń `psql '…'` buyrıǵı. Bos mán — berilmegen dep esaplanadı.
 */
const cleanDatabaseUrl = (v: unknown) => {
  if (typeof v !== 'string') return v;
  const cleaned = v
    .trim()
    .replace(/^psql\s+/i, '')
    .replace(/^['"]+|['"]+$/g, '')
    .trim();
  return cleaned === '' ? undefined : cleaned;
};

const schema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().int().positive().default(4000),
  CORS_ORIGIN: z.string().default('http://localhost:5173'),
  DATA_FILE: z.string().default('./data/db.json'),
  // Postgres (Neon) qosılıw URL'i. Berilse — JSON fayl ornına usı isletiledi
  DATABASE_URL: z.preprocess(cleanDatabaseUrl, z.string().regex(/^postgres(ql)?:\/\/\S+$/,'DATABASE_URL «postgresql://» menen baslanıwı hám bos orın bolmawı kerek').optional()),
  JWT_SECRET: z.string({ required_error: 'JWT_SECRET .env de kórsetilmegen' }).min(16, 'JWT_SECRET keminde 16 belgi bolsın'),
  ADMIN_LOGIN: login,
  ADMIN_PASSWORD: password,
  MENTOR_LOGIN: login,
  MENTOR_PASSWORD: password,
  STUDENT_LOGIN: login,
  STUDENT_PASSWORD: password,
  EMPLOYER_LOGIN: login,
  EMPLOYER_PASSWORD: password,
});

const parsed = schema.safeParse(process.env);
if (!parsed.success) {
  console.error('Qáte .env sazlawları (backend/.env.example ge qarań):', parsed.error.flatten().fieldErrors);
  process.exit(1);
}

const e = parsed.data;

// Hár rol ushın login + parol jup bolıwı kerek; berilmegen rol jaratılmaydı
const accounts: Partial<Record<AccountRole, AccountCredentials>> = {};
for (const role of ROLES) {
  const lg = e[`${role.toUpperCase()}_LOGIN` as keyof typeof e] as string | undefined;
  const pw = e[`${role.toUpperCase()}_PASSWORD` as keyof typeof e] as string | undefined;
  if (!lg !== !pw) {
    console.error(`${role.toUpperCase()}_LOGIN hám ${role.toUpperCase()}_PASSWORD birge berilıwi kerek.`);
    process.exit(1);
  }
  if (lg && pw) accounts[role] = { login: lg, password: pw };
}

if (e.NODE_ENV === 'production' && !e.DATABASE_URL) {
  console.error('Production rejiminde DATABASE_URL shárt (Render de fayl saqlanbaydı).');
  process.exit(1);
}

if (e.NODE_ENV === 'production' && !accounts.admin) {
  console.error('Production rejiminde ADMIN_LOGIN hám ADMIN_PASSWORD shárt.');
  process.exit(1);
}

export const env = {
  ...e,
  corsOrigins: e.CORS_ORIGIN.split(',').map((s) => s.trim()).filter(Boolean),
  dataFile: path.resolve(e.DATA_FILE),
  seed: { accounts },
};
