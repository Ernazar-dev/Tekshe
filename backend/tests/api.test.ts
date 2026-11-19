import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import request from 'supertest';
import { afterAll, beforeEach, describe, expect, it } from 'vitest';
import { createApp } from '../src/app.js';
import { JsonStore, type SeedOptions } from '../src/data/store.js';
import { csvCell } from '../src/utils/csv.js';

const SECRET = 'test-secret-test-secret';
// Testler ushın jeke akkauntlar — haqıyqıy .env ge baylanıspaǵan
const ADMIN = { login: 'test-admin', password: 'test-admin-pass' };
const ACCOUNTS = {
  admin: ADMIN,
  mentor: { login: 'test-mentor', password: 'test-mentor-pass' },
  student: { login: 'test-student', password: 'test-student-pass' },
  employer: { login: 'test-employer', password: 'test-employer-pass' },
};
const SEED: SeedOptions = { accounts: ACCOUNTS };

const makeApp = (store = new JsonStore(null, SEED), limits: { writeLimit?: number; authLimit?: number } = {}) =>
  createApp({ store, corsOrigins: ['http://localhost:5173'], jwtSecret: SECRET, writeLimit: 1000, authLimit: 1000, ...limits });

type App = ReturnType<typeof makeApp>;
const bearer = (token: string) => ({ Authorization: `Bearer ${token}` });

const login = async (app: App, loginName: string, password: string) => {
  const res = await request(app).post('/api/auth/login').send({ login: loginName, password });
  return res.body.token as string;
};
const adminToken = (app: App) => login(app, ADMIN.login, ADMIN.password);

let counter = 0;
const register = async (app: App, role: 'student' | 'mentor' | 'employer', over: Record<string, unknown> = {}) => {
  counter += 1;
  const login = `user${counter}`;
  const res = await request(app)
    .post('/api/auth/register')
    .send({ name: `Test ${role} ${counter}`, login, password: 'password123', role, ...over });
  return { res, login, token: res.body.token as string, user: res.body.user };
};

const approve = (app: App, admin: string, userId: string) => request(app).patch(`/api/admin/users/${userId}`).set(bearer(admin)).send({ status: 'active' });

const studentProfile = { status: 'now', country: 'Yaponiya', university: 'Tokyo universiteti', field: 'Robototexnika', grant: 'MEXT', years: '2024 - 2028' };
const mentorProfile = { job: 'Injener', university: 'MIT', country: 'AQSh', year: 2020, topics: ['Fulbright', 'Hújjet tapsırıw'], languages: ['qaraqalpaq', 'inglis'] };
const company = { name: 'Nókis Tech', city: 'Nókis', stir: '123456789', about: 'IT kompaniya' };
const vacancy = { title: 'Frontend programmist', field: 'IT', city: 'Nókis', type: 'Tolıq kún', requirement: 'React, TypeScript, inglis B2' };

describe('ashıq katalog', () => {
  const app = makeApp();

  it('health hám belgisiz marshrut', async () => {
    expect((await request(app).get('/api/health')).body).toEqual({ status: 'ok' });
    const res = await request(app).get('/api/joq');
    expect(res.status).toBe(404);
    expect(res.body.message).toBeTruthy();
  });

  it('grantlardı basqısh boyınsha filtrleydi, qáte basqısh — 400', async () => {
    expect((await request(app).get('/api/grants')).body.data).toHaveLength(9);
    const phd = await request(app).get('/api/grants?level=PhD');
    expect(phd.body.data.every((g: { levels: string[] }) => g.levels.includes('PhD'))).toBe(true);
    expect(phd.body.data.some((g: { id: string }) => g.id === 'chevening')).toBe(false);
    expect((await request(app).get('/api/grants?level=Doktor')).status).toBe(400);
  });

  it('mentorlar hám vakansiyalar filtrlenedi', async () => {
    expect((await request(app).get('/api/mentors').query({ country: 'Koreya' })).body.data).toHaveLength(1);
    const v = await request(app).get('/api/vacancies').query({ field: 'IT' });
    expect(v.body.data).toHaveLength(1);
    expect(v.body.data[0].title).toBe('Backend programmist');
  });

  it('statistika hám jámáát sanları tek ulıwma sanlar — atlar joq', async () => {
    const stats = await request(app).get('/api/stats');
    expect(stats.body).toMatchObject({ students: 5, graduates: 3, mentors: 6, vacancies: 6, grants: 9, countries: 7 });
    const community = await request(app).get('/api/community');
    expect(community.body.byCountry.length).toBeGreaterThan(0);
    expect(JSON.stringify(community.body)).not.toContain('Gúlnara');
  });

  it('studentler dizimi ashıq emes', async () => {
    expect((await request(app).get('/api/students')).status).toBe(404);
    expect((await request(app).get('/api/admin/students')).status).toBe(401);
  });
});

describe('autentifikaciya', () => {
  const app = makeApp();

  it('student dizimnen ótedi: token, aktiv status, parol xeshi qaytarılmaydı', async () => {
    const { res } = await register(app, 'student');
    expect(res.status).toBe(201);
    expect(res.body.user).toMatchObject({ role: 'student', status: 'active' });
    expect(res.body.user.passwordHash).toBeUndefined();
    expect(res.body.token).toBeTruthy();
  });

  it('mentor hám tadbirkor admin tastıyıqlawın kútedi, admin bolıp dizimnen ótip bolmaydı', async () => {
    expect((await register(app, 'mentor')).user.status).toBe('pending');
    expect((await register(app, 'employer')).user.status).toBe('pending');
    const res = await request(app).post('/api/auth/register').send({ name: 'Hacker', login: 'hacker', password: 'password123', role: 'admin' });
    expect(res.status).toBe(400);
    expect(res.body.errors.role).toBeDefined();
  });

  it('bir login eki ret dizimnen ótpeydi, qáte maǵlıwmat — maydan qáteleri', async () => {
    const { login: lg } = await register(app, 'student');
    const dup = await request(app).post('/api/auth/register').send({ name: 'Dup', login: lg.toUpperCase(), password: 'password123', role: 'student' });
    expect(dup.status).toBe(409);
    const bad = await request(app).post('/api/auth/register').send({ name: 'A', login: 'a@b', password: '123', role: 'student' });
    expect(bad.status).toBe(400);
    expect(Object.keys(bad.body.errors)).toEqual(expect.arrayContaining(['name', 'login', 'password']));
  });

  it('kiriw: durıs parol — token, qáte — 401, /me tokensiz — 401', async () => {
    const { login: lg } = await register(app, 'student');
    expect((await request(app).post('/api/auth/login').send({ login: lg, password: 'password123' })).status).toBe(200);
    expect((await request(app).post('/api/auth/login').send({ login: lg, password: 'qate-parol' })).status).toBe(401);
    expect((await request(app).post('/api/auth/login').send({ login: 'joq', password: 'password123' })).status).toBe(401);
    expect((await request(app).get('/api/auth/me')).status).toBe(401);
    expect((await request(app).get('/api/auth/me').set(bearer('buzilgan.token.bar'))).status).toBe(401);
  });

  it('profil hám parol ózgertiledi', async () => {
    const { token, login: lg } = await register(app, 'student');
    const patched = await request(app).patch('/api/auth/me').set(bearer(token)).send({ name: 'Jańa Atı', phone: '+998 90 123 45 67' });
    expect(patched.body).toMatchObject({ name: 'Jańa Atı', phone: '+998 90 123 45 67' });
    const wrong = await request(app).post('/api/auth/password').set(bearer(token)).send({ current: 'qate', next: 'newpassword1' });
    expect(wrong.status).toBe(400);
    expect((await request(app).post('/api/auth/password').set(bearer(token)).send({ current: 'password123', next: 'newpassword1' })).status).toBe(200);
    expect((await request(app).post('/api/auth/login').send({ login: lg, password: 'password123' })).status).toBe(401);
    expect((await request(app).post('/api/auth/login').send({ login: lg, password: 'newpassword1' })).status).toBe(200);
  });

  it('kiriw urınısları sheklengen', async () => {
    const limited = makeApp(new JsonStore(null, SEED), { authLimit: 3 });
    for (let i = 0; i < 3; i++) await request(limited).post('/api/auth/login').send({ login: 'abc', password: 'x' });
    expect((await request(limited).post('/api/auth/login').send({ login: 'abc', password: 'x' })).status).toBe(429);
  });
});

describe('student paneli', () => {
  let app: App;
  beforeEach(() => {
    app = makeApp();
  });

  it('profil jaratadı hám jańalaydı, statistikada esaplanadı', async () => {
    const { token } = await register(app, 'student');
    expect((await request(app).get('/api/me/student').set(bearer(token))).body.profile).toBeNull();
    const created = await request(app).put('/api/me/student').set(bearer(token)).send(studentProfile);
    expect(created.status).toBe(200);
    expect(created.body.years).toBe('2024–2028');
    await request(app).put('/api/me/student').set(bearer(token)).send({ ...studentProfile, status: 'back' });
    const stats = await request(app).get('/api/stats');
    expect(stats.body).toMatchObject({ students: 5, graduates: 4 });
    expect((await request(app).put('/api/me/student').set(bearer(token)).send({ ...studentProfile, country: '' })).status).toBe(400);
  });

  it('sáykes mentorlar usınıladı', async () => {
    const { token } = await register(app, 'student');
    await request(app).put('/api/me/student').set(bearer(token)).send({ ...studentProfile, country: 'Koreya', field: 'IT' });
    const res = await request(app).get('/api/me/student').set(bearer(token));
    expect(res.body.recommended[0].country).toBe('Koreya');
  });

  it('tayarlıq dizimi serverde saqlanadı, belgisiz bántler taslanadı', async () => {
    const { token } = await register(app, 'student');
    const saved = await request(app).put('/api/me/checklist').set(bearer(token)).send({ done: ['before-passport', 'before-passport', 'joq-bent'] });
    expect(saved.body.done).toEqual(['before-passport']);
    expect((await request(app).get('/api/me/student').set(bearer(token))).body.checklist).toEqual(['before-passport']);
  });

  it('basqa rol student paneline kire almaydı', async () => {
    const { token } = await register(app, 'employer');
    expect((await request(app).get('/api/me/student').set(bearer(token))).status).toBe(403);
    expect((await request(app).get('/api/admin/overview').set(bearer(token))).status).toBe(403);
  });
});

describe('soraw hám arza', () => {
  let app: App;
  beforeEach(() => {
    app = makeApp();
  });
  const mentorRequest = { type: 'mentor', targetId: 'azamat-tleuov', message: 'DAAD hújjetleri boyınsha keńes kerek.' };

  it('student mentorǵa soraw jibere aladı; atı profilinen alınadı, tokensiz — 401', async () => {
    expect((await request(app).post('/api/requests').send(mentorRequest)).status).toBe(401);
    const { token, user } = await register(app, 'student');
    const res = await request(app).post('/api/requests').set(bearer(token)).send({ ...mentorRequest, contact: '@aruzhan_k' });
    expect(res.status).toBe(201);
    const mine = await request(app).get('/api/me/requests').set(bearer(token));
    expect(mine.body.data[0]).toMatchObject({ name: user.name, targetTitle: 'Azamat Tleuov', status: 'new', contact: '@aruzhan_k' });
  });

  it('qáte maǵlıwmat hám joq mentor', async () => {
    const { token } = await register(app, 'student');
    expect((await request(app).post('/api/requests').set(bearer(token)).send({ ...mentorRequest, message: 'qısqa' })).status).toBe(400);
    expect((await request(app).post('/api/requests').set(bearer(token)).send({ ...mentorRequest, contact: 'abc' })).status).toBe(400);
    expect((await request(app).post('/api/requests').set(bearer(token)).send({ ...mentorRequest, targetId: 'joq' })).status).toBe(404);
  });

  it('tadbirkor soraw jibere almaydı; vakansiyaǵa tek student, bir ret', async () => {
    const employer = await register(app, 'employer');
    expect((await request(app).post('/api/requests').set(bearer(employer.token)).send(mentorRequest)).status).toBe(403);
    const { token } = await register(app, 'student');
    const apply = { type: 'vacancy', targetId: 'backend-dev', message: 'Bilimim hám tájiriybem sáykes keledi.' };
    expect((await request(app).post('/api/requests').set(bearer(token)).send(apply)).status).toBe(201);
    expect((await request(app).post('/api/requests').set(bearer(token)).send(apply)).status).toBe(409);
    const mentor = await register(app, 'mentor');
    expect((await request(app).post('/api/requests').set(bearer(mentor.token)).send(apply)).status).toBe(403);
  });

  it('jazıw sorawları sheklengen, oqıw sheklenbeydi', async () => {
    const limited = makeApp(new JsonStore(null, SEED), { writeLimit: 2 });
    const { token } = await register(limited, 'student');
    await request(limited).post('/api/requests').set(bearer(token)).send(mentorRequest);
    await request(limited).post('/api/requests').set(bearer(token)).send({ ...mentorRequest, targetId: 'madina-aytmuratova' });
    expect((await request(limited).post('/api/requests').set(bearer(token)).send({ ...mentorRequest, targetId: 'bekzat-allambergenov' })).status).toBe(429);
    expect((await request(limited).get('/api/me/requests').set(bearer(token))).status).toBe(200);
  });
});

describe('mentor paneli', () => {
  it('tastıyıqlanǵansha ashıq dizimde kórinbeydi; soraw → juwap tolıq aylanıwı', async () => {
    const app = makeApp();
    const admin = await adminToken(app);
    const mentor = await register(app, 'mentor');
    expect((await request(app).put('/api/me/mentor').set(bearer(mentor.token)).send({ ...mentorProfile, topics: [] })).status).toBe(400);
    const saved = await request(app).put('/api/me/mentor').set(bearer(mentor.token)).send({ ...mentorProfile, year: '2020' });
    expect(saved.body.profile).toMatchObject({ country: 'AQSh', year: 2020, userId: mentor.user.id });

    const before = await request(app).get('/api/mentors');
    expect(before.body.data.some((m: { country: string }) => m.country === 'AQSh')).toBe(false);

    expect((await approve(app, admin, mentor.user.id)).status).toBe(200);
    const after = await request(app).get('/api/mentors');
    const profile = after.body.data.find((m: { country: string }) => m.country === 'AQSh');
    expect(profile).toBeTruthy();

    const student = await register(app, 'student');
    await request(app).post('/api/requests').set(bearer(student.token)).send({ type: 'mentor', targetId: profile.id, message: 'Fulbright boyınsha keńes kerek.' });

    const inbox = await request(app).get('/api/me/inbox').set(bearer(mentor.token));
    expect(inbox.body.data).toHaveLength(1);
    const id = inbox.body.data[0].id;
    // Mentor tek óz sorawlarına juwap bere aladı
    const stranger = await register(app, 'mentor');
    expect((await request(app).patch(`/api/me/inbox/${id}`).set(bearer(stranger.token)).send({ reply: 'Menmen' })).status).toBe(404);

    const replied = await request(app).patch(`/api/me/inbox/${id}`).set(bearer(mentor.token)).send({ reply: 'Esse jazıwdan baslań.' });
    expect(replied.body).toMatchObject({ status: 'answered', reply: 'Esse jazıwdan baslań.' });
    const mine = await request(app).get('/api/me/requests').set(bearer(student.token));
    expect(mine.body.data[0]).toMatchObject({ status: 'answered', reply: 'Esse jazıwdan baslań.' });
  });

  it('bloklanǵan mentor dizimnen shıǵadı', async () => {
    const app = makeApp();
    const admin = await adminToken(app);
    const mentor = await register(app, 'mentor');
    await request(app).put('/api/me/mentor').set(bearer(mentor.token)).send(mentorProfile);
    await approve(app, admin, mentor.user.id);
    expect((await request(app).get('/api/mentors')).body.data.some((m: { country: string }) => m.country === 'AQSh')).toBe(true);
    await request(app).patch(`/api/admin/users/${mentor.user.id}`).set(bearer(admin)).send({ status: 'blocked' });
    expect((await request(app).get('/api/mentors')).body.data.some((m: { country: string }) => m.country === 'AQSh')).toBe(false);
  });
});

describe('tadbirkor paneli', () => {
  it('kárxana → vakansiya → moderaciya → ashıq dizim → arza → juwap', async () => {
    const app = makeApp();
    const admin = await adminToken(app);
    const employer = await register(app, 'employer');

    // Kárxana maǵlıwmatısız vakansiya jaratıp bolmaydı
    expect((await request(app).post('/api/me/vacancies').set(bearer(employer.token)).send(vacancy)).status).toBe(400);
    expect((await request(app).put('/api/me/company').set(bearer(employer.token)).send({ ...company, stir: '123' })).status).toBe(400);
    expect((await request(app).put('/api/me/company').set(bearer(employer.token)).send(company)).status).toBe(200);

    const created = await request(app).post('/api/me/vacancies').set(bearer(employer.token)).send(vacancy);
    expect(created.status).toBe(201);
    expect(created.body).toMatchObject({ status: 'pending', company: 'Nókis Tech', initials: 'NT' });
    const publicTitles = async () => (await request(app).get('/api/vacancies')).body.data.map((v: { title: string }) => v.title);
    expect(await publicTitles()).not.toContain('Frontend programmist');

    // Tadbirkordıń ózi tastıyıqlanbaǵan bolsa — vakansiya maqullansa da kórinbeydi
    await request(app).patch(`/api/admin/vacancies/${created.body.id}`).set(bearer(admin)).send({ status: 'approved' });
    expect(await publicTitles()).not.toContain('Frontend programmist');
    await approve(app, admin, employer.user.id);
    expect(await publicTitles()).toContain('Frontend programmist');

    const student = await register(app, 'student');
    await request(app).post('/api/requests').set(bearer(student.token)).send({ type: 'vacancy', targetId: created.body.id, message: 'Tájiriybem bar, arza beremen.' });
    const mine = await request(app).get('/api/me/vacancies').set(bearer(employer.token));
    expect(mine.body.data[0].applications).toBe(1);

    const inbox = await request(app).get('/api/me/inbox').set(bearer(employer.token));
    expect(inbox.body.data[0]).toMatchObject({ targetTitle: 'Frontend programmist', status: 'new' });
    await request(app).patch(`/api/me/inbox/${inbox.body.data[0].id}`).set(bearer(employer.token)).send({ reply: 'Sáwbetke shaqıramız.' });
    expect((await request(app).get('/api/me/requests').set(bearer(student.token))).body.data[0].reply).toBe('Sáwbetke shaqıramız.');

    // Tahrirlengen vakansiya qayta tekseriwge qaytadı
    const edited = await request(app).put(`/api/me/vacancies/${created.body.id}`).set(bearer(employer.token)).send({ ...vacancy, title: 'Senior frontend' });
    expect(edited.body.status).toBe('pending');
    expect(await publicTitles()).not.toContain('Senior frontend');
  });

  it('basqa tadbirkordıń vakansiyasın ózgerte almaydı', async () => {
    const app = makeApp();
    const a = await register(app, 'employer');
    const b = await register(app, 'employer');
    await request(app).put('/api/me/company').set(bearer(a.token)).send(company);
    const v = await request(app).post('/api/me/vacancies').set(bearer(a.token)).send(vacancy);
    expect((await request(app).put(`/api/me/vacancies/${v.body.id}`).set(bearer(b.token)).send(vacancy)).status).toBe(404);
    expect((await request(app).delete(`/api/me/vacancies/${v.body.id}`).set(bearer(b.token))).status).toBe(404);
    expect((await request(app).delete(`/api/me/vacancies/${v.body.id}`).set(bearer(a.token))).status).toBe(204);
  });
});

describe('admin paneli', () => {
  let app: App;
  let admin: string;
  beforeEach(async () => {
    app = makeApp();
    admin = await adminToken(app);
  });

  it('tek admin kire aladı', async () => {
    expect((await request(app).get('/api/admin/overview')).status).toBe(401);
    const student = await register(app, 'student');
    expect((await request(app).get('/api/admin/overview').set(bearer(student.token))).status).toBe(403);
    const overview = await request(app).get('/api/admin/overview').set(bearer(admin));
    expect(overview.body.users).toMatchObject({ admin: 1, mentor: 1, student: 2, employer: 1 });
  });

  it('paydalanıwshılardı filtrleydi, tastıyıqlaydı hám bloklaydı', async () => {
    const pending = await register(app, 'mentor', { name: 'Kútip Turǵan' });
    const list = await request(app).get('/api/admin/users').query({ status: 'pending' }).set(bearer(admin));
    expect(list.body.data.map((u: { name: string }) => u.name)).toContain('Kútip Turǵan');
    expect(list.body.data[0].passwordHash).toBeUndefined();

    expect((await request(app).get('/api/admin/users').query({ role: 'employer', q: 'it kompan' }).set(bearer(admin))).body.data).toHaveLength(1);

    await request(app).patch(`/api/admin/users/${pending.user.id}`).set(bearer(admin)).send({ status: 'blocked' });
    // Bloklanǵan paydalanıwshınıń eski tokeni jumıs islemeydi hám kire almaydı
    expect((await request(app).get('/api/auth/me').set(bearer(pending.token))).status).toBe(401);
    const loginRes = await request(app).post('/api/auth/login').send({ login: pending.login, password: 'password123' });
    expect(loginRes.status).toBe(403);
  });

  it('óz statusın ózgerte almaydı, belgisiz paydalanıwshı — 404', async () => {
    const me = await request(app).get('/api/auth/me').set(bearer(admin));
    expect((await request(app).patch(`/api/admin/users/${me.body.id}`).set(bearer(admin)).send({ status: 'blocked' })).status).toBe(400);
    expect((await request(app).patch('/api/admin/users/joq').set(bearer(admin)).send({ status: 'active' })).status).toBe(404);
    expect((await request(app).patch(`/api/admin/users/${me.body.id}`).set(bearer(admin)).send({ status: 'qate' })).status).toBe(400);
  });

  it('jańa xızmetker akkauntı jaratadı', async () => {
    const res = await request(app).post('/api/admin/staff').set(bearer(admin)).send({ name: 'Jańa Xızmetker', login: 'staff1', password: 'staffpass123' });
    expect(res.status).toBe(201);
    expect(res.body.role).toBe('admin');
    expect((await request(app).post('/api/auth/login').send({ login: 'staff1', password: 'staffpass123' })).status).toBe(200);
    expect((await request(app).post('/api/admin/staff').set(bearer(admin)).send({ name: 'Dup', login: 'staff1', password: 'staffpass123' })).status).toBe(409);
  });

  it('studentler dizimi: filtrler, kontakt jasırın, «Kóriw» jurnalǵa jazıladı', async () => {
    const list = await request(app).get('/api/admin/students').query({ status: 'back' }).set(bearer(admin));
    expect(list.body.total).toBe(3);
    expect(list.body.counts).toEqual({ all: 8, now: 5, back: 3 });
    expect((await request(app).get('/api/admin/students').query({ q: 'kaist' }).set(bearer(admin))).body.data).toHaveLength(1);
    const body = JSON.stringify(list.body);
    expect(body).not.toContain('@tekshe.uz');
    expect(body).not.toContain('phone');

    const withAccount = (await request(app).get('/api/admin/students').query({ q: 'Gúlnara' }).set(bearer(admin))).body.data[0];
    const revealed = await request(app).post(`/api/admin/students/${withAccount.id}/reveal`).set(bearer(admin));
    expect(revealed.body).toMatchObject({ name: 'Gúlnara Saparova', phone: null });
    const noAccount = (await request(app).get('/api/admin/students').query({ q: 'Tleuov' }).set(bearer(admin))).body.data[0];
    expect((await request(app).post(`/api/admin/students/${noAccount.id}/reveal`).set(bearer(admin))).body).toMatchObject({ phone: null });

    const audit = await request(app).get('/api/admin/audit').set(bearer(admin));
    expect(audit.body.data[0]).toMatchObject({ action: 'studenttiń kontaktın kórdi', actorName: 'Administrator' });
    expect(audit.body.data.filter((a: { action: string }) => a.action === 'studenttiń kontaktın kórdi')).toHaveLength(2);
  });

  it('student qosadı, óshiredi; CSV filtr hám jurnaldı esapqa aladı, formulalardı ekranlaydı', async () => {
    const added = await request(app)
      .post('/api/admin/students')
      .set(bearer(admin))
      .send({ ...studentProfile, name: '=HYPERLINK("x")' });
    expect(added.status).toBe(201);
    expect((await request(app).post('/api/admin/students').set(bearer(admin)).send({ ...studentProfile, name: ' ', years: '2030-2020' })).body.errors).toMatchObject({
      name: expect.anything(),
      years: expect.anything(),
    });

    const csv = await request(app).get('/api/admin/students/export.csv').query({ country: 'Yaponiya' }).set(bearer(admin));
    expect(csv.headers['content-type']).toContain('text/csv');
    const lines = csv.text.replace('﻿', '').split('\r\n');
    expect(lines).toHaveLength(2);
    expect(lines[1]).toContain(`"'=HYPERLINK(""x"")"`);
    expect((await request(app).get('/api/admin/students/export.csv')).status).toBe(401);

    expect((await request(app).delete(`/api/admin/students/${added.body.id}`).set(bearer(admin))).status).toBe(204);
    expect((await request(app).delete(`/api/admin/students/${added.body.id}`).set(bearer(admin))).status).toBe(404);
    const actions = (await request(app).get('/api/admin/audit').set(bearer(admin))).body.data.map((a: { action: string }) => a.action);
    expect(actions).toEqual(expect.arrayContaining(['studentler dizimin CSV júklep aldı', 'studentti dizimnen óshirdi']));
  });

  it('vakansiyalardı moderaciyalaydı', async () => {
    const employer = await register(app, 'employer');
    await request(app).put('/api/me/company').set(bearer(employer.token)).send(company);
    const created = await request(app).post('/api/me/vacancies').set(bearer(employer.token)).send(vacancy);
    const pending = await request(app).get('/api/admin/vacancies').query({ status: 'pending' }).set(bearer(admin));
    expect(pending.body.data[0]).toMatchObject({ title: 'Frontend programmist', stir: '123456789', ownerStatus: 'pending' });
    expect((await request(app).patch(`/api/admin/vacancies/${created.body.id}`).set(bearer(admin)).send({ status: 'rejected' })).body.status).toBe('rejected');
    expect((await request(app).get('/api/me/vacancies').set(bearer(employer.token))).body.data[0].status).toBe('rejected');
  });
});

describe('.env akkauntları', () => {
  it('hár rol ushın akkaunt islep turadi', async () => {
    const app = makeApp();
    for (const { login: lg, password } of Object.values(ACCOUNTS)) {
      const res = await request(app).post('/api/auth/login').send({ login: lg, password });
      expect(res.status).toBe(200);
      expect(res.body.user.status).toBe('active');
    }
    const mentor = await login(app, ACCOUNTS.mentor.login, ACCOUNTS.mentor.password);
    expect((await request(app).get('/api/me/mentor').set(bearer(mentor))).body.profile.name).toBe('Azamat Tleuov');
  });

  it('tek berilgen rollar jaratıladı', async () => {
    const app = makeApp(new JsonStore(null, { accounts: { admin: { login: 'boss', password: 'strongpass1' } } }));
    const mentor = ACCOUNTS.mentor;
    expect((await request(app).post('/api/auth/login').send({ login: mentor.login, password: mentor.password })).status).toBe(401);
    expect((await request(app).post('/api/auth/login').send({ login: 'boss', password: 'strongpass1' })).status).toBe(200);
  });

  it('bar bazada .env degi parol ózgerse jańalanadı, jańa rol qosıladı', async () => {
    const dir2 = await mkdtemp(path.join(os.tmpdir(), 'tekshe-sync-'));
    try {
      const file = path.join(dir2, 'db.json');
      await makeApp(new JsonStore(file, { accounts: { admin: ADMIN } })).get('/api/health');
      const next: SeedOptions = { accounts: { admin: { ...ADMIN, password: 'rotated-pass-1' }, mentor: ACCOUNTS.mentor } };
      const app = makeApp(new JsonStore(file, next));
      expect((await request(app).post('/api/auth/login').send(ADMIN)).status).toBe(401);
      expect((await request(app).post('/api/auth/login').send({ login: ADMIN.login, password: 'rotated-pass-1' })).status).toBe(200);
      expect((await request(app).post('/api/auth/login').send(ACCOUNTS.mentor)).status).toBe(200);
    } finally {
      await rm(dir2, { recursive: true, force: true });
    }
  });
});

describe('JsonStore', () => {
  let dir = '';
  afterAll(async () => {
    if (dir) await rm(dir, { recursive: true, force: true });
  });

  it('faylǵa saqlaydı, qayta oqıydı hám bir waqıttaǵı jazıwlardı joǵaltpaydı', async () => {
    dir = await mkdtemp(path.join(os.tmpdir(), 'tekshe-'));
    const file = path.join(dir, 'db.json');
    const app = makeApp(new JsonStore(file, SEED));
    const admin = await adminToken(app);
    await Promise.all(Array.from({ length: 10 }, (_, i) => request(app).post('/api/admin/students').set(bearer(admin)).send({ ...studentProfile, name: `Student ${i}` })));
    expect(JSON.parse(await readFile(file, 'utf8')).students).toHaveLength(18);
    const reopened = makeApp(new JsonStore(file, SEED));
    expect((await request(reopened).get('/api/community')).body.students + (await request(reopened).get('/api/community')).body.graduates).toBe(18);
  });

  it('eski formattaǵı bazanı (tek students + requests) jańa strukturaǵa ótkeredi', async () => {
    dir = dir || (await mkdtemp(path.join(os.tmpdir(), 'tekshe-')));
    const file = path.join(dir, 'old.json');
    const old = {
      students: [{ id: 's1', name: 'Eski Student', status: 'now', country: 'Koreya', university: 'KAIST', field: 'IT', grant: 'GKS', years: '2023–2027', createdAt: '2026-01-01T00:00:00.000Z' }],
      requests: [{ id: 'r1', type: 'mentor', targetId: 'azamat-tleuov', name: 'A', contact: '+998901234567', message: 'Eski soraw xabarı', createdAt: '2026-01-01T00:00:00.000Z' }],
    };
    await writeFile(file, JSON.stringify(old), 'utf8');
    const app = makeApp(new JsonStore(file, SEED));
    const admin = await adminToken(app);
    const list = await request(app).get('/api/admin/students').set(bearer(admin));
    expect(list.body.data).toMatchObject([{ name: 'Eski Student', userId: null }]);
    expect((await request(app).get('/api/mentors')).body.data).toHaveLength(6);
    const saved = JSON.parse(await readFile(file, 'utf8'));
    expect(Object.keys(saved).sort()).toEqual(['audit', 'mentors', 'requests', 'students', 'users', 'vacancies']);
    expect(saved.requests[0]).toMatchObject({ status: 'new', reply: '', fromUserId: '' });
  });
});

describe('csvCell', () => {
  it('tırnaq hám formulalardı ekranlaydı', () => {
    expect(csvCell('a"b')).toBe('"a""b"');
    expect(csvCell('+123')).toBe(`"'+123"`);
    expect(csvCell(null)).toBe('""');
  });
});
