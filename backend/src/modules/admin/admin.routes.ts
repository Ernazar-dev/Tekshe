import { randomUUID } from 'node:crypto';
import { Router } from 'express';
import { z } from 'zod';
import { logAudit, newestFirst } from '../../data/queries.js';
import type { Store } from '../../data/store.js';
import { currentUser, toPublic, type Auth } from '../../middleware/auth.js';
import { validateBody, validateQuery } from '../../middleware/validate.js';
import type { Student, User } from '../../types.js';
import { toCsv } from '../../utils/csv.js';
import { asyncHandler, HttpError } from '../../utils/errors.js';
import { loginField } from '../../utils/login.js';
import { hashPassword } from '../../utils/password.js';
import { adminStudentSchema, filterStudents, STATUS_LABEL, studentsQuery, type StudentsQuery } from '../students/students.routes.js';

const usersQuery = z.object({
  role: z.enum(['admin', 'mentor', 'student', 'employer']).optional(),
  status: z.enum(['active', 'pending', 'blocked']).optional(),
  q: z.string().trim().max(100).optional().transform((v) => v || undefined),
});
const userStatusSchema = z.object({ status: z.enum(['active', 'pending', 'blocked'], { errorMap: () => ({ message: 'Status qáte' }) }) });
const vacancyQuery = z.object({ status: z.enum(['pending', 'approved', 'rejected']).optional() });
const vacancyStatusSchema = z.object({ status: z.enum(['approved', 'rejected', 'pending'], { errorMap: () => ({ message: 'Status qáte' }) }) });
const staffSchema = z.object({
  name: z.string({ required_error: 'Atı kiritilmegen' }).trim().min(2, 'Atı — keminde 2 belgi').max(80),
  login: loginField,
  password: z.string({ required_error: 'Parol kiritilmegen' }).min(8, 'Parol keminde 8 belgi').max(100),
});
const auditQuery = z.object({ limit: z.coerce.number().int().min(1).max(500).default(100) });

const STATUS_WORD = { active: 'tastıyıqladı', pending: 'kútiwge qaytardı', blocked: 'blokladı' } as const;
const VACANCY_WORD = { approved: 'maqulladı', rejected: 'ruxsat bermedi', pending: 'qayta tekseriwge qaytardı' } as const;

export const createAdminRouter = (store: Store, auth: Auth) => {
  const router = Router();
  router.use(auth.requireRole('admin'));

  router.get(
    '/overview',
    asyncHandler(async (_req, res) => {
      res.json(
        await store.read((db) => ({
          users: {
            student: db.users.filter((u) => u.role === 'student').length,
            mentor: db.users.filter((u) => u.role === 'mentor').length,
            employer: db.users.filter((u) => u.role === 'employer').length,
            admin: db.users.filter((u) => u.role === 'admin').length,
          },
          registry: { now: db.students.filter((s) => s.status === 'now').length, back: db.students.filter((s) => s.status === 'back').length },
          pendingUsers: db.users.filter((u) => u.status === 'pending').length,
          pendingVacancies: db.vacancies.filter((v) => v.status === 'pending').length,
          openRequests: db.requests.filter((r) => r.status === 'new').length,
          recentAudit: [...db.audit].sort(newestFirst).slice(0, 6),
        })),
      );
    }),
  );

  /* ───────────── Paydalanıwshılar ───────────── */
  router.get(
    '/users',
    validateQuery(usersQuery),
    asyncHandler(async (_req, res) => {
      const { role, status, q } = res.locals.query as z.infer<typeof usersQuery>;
      const needle = q?.toLocaleLowerCase();
      res.json({
        data: await store.read((db) =>
          db.users
            .filter((u) => (!role || u.role === role) && (!status || u.status === status))
            .filter((u) => !needle || [u.name, u.login, u.company?.name ?? ''].join(' ').toLocaleLowerCase().includes(needle))
            .sort(newestFirst)
            .map(toPublic),
        ),
      });
    }),
  );

  router.patch(
    '/users/:id',
    validateBody(userStatusSchema),
    asyncHandler(async (req, res) => {
      const { status } = req.body as z.infer<typeof userStatusSchema>;
      const me = currentUser(res);
      const user = await store.update((db) => {
        const u = db.users.find((x) => x.id === req.params.id);
        if (!u) throw new HttpError(404, 'Paydalanıwshı tabılmadı');
        if (u.id === me.id) throw new HttpError(400, 'Óz akkauntıńızdıń statusın ózgerte almaysız');
        u.status = status;
        logAudit(db, me, STATUS_WORD[status], `${u.name} (${u.login})`);
        return toPublic(u);
      });
      res.json(user);
    }),
  );

  /** Jańa xızmetker (admin) akkauntı — ashıq dizimnen admin bolıw múmkin emes */
  router.post(
    '/staff',
    validateBody(staffSchema),
    asyncHandler(async (req, res) => {
      const body = req.body as z.infer<typeof staffSchema>;
      const me = currentUser(res);
      const passwordHash = await hashPassword(body.password);
      const user = await store.update((db) => {
        if (db.users.some((u) => u.login === body.login)) throw new HttpError(409, 'Bul login menen akkaunt bar', { login: ['Bul login bánt'] });
        const created: User = {
          id: randomUUID(),
          name: body.name,
          login: body.login,
          phone: '',
          role: 'admin',
          status: 'active',
          passwordHash,
          createdAt: new Date().toISOString(),
        };
        db.users.push(created);
        logAudit(db, me, 'xızmetker akkauntın jarattı', `${created.name} (${created.login})`);
        return toPublic(created);
      });
      res.status(201).json(user);
    }),
  );

  /* ───────────── Vakansiyalar moderaciyası ───────────── */
  router.get(
    '/vacancies',
    validateQuery(vacancyQuery),
    asyncHandler(async (_req, res) => {
      const { status } = res.locals.query as z.infer<typeof vacancyQuery>;
      res.json({
        data: await store.read((db) =>
          db.vacancies
            .filter((v) => !status || v.status === status)
            .sort(newestFirst)
            .map((v) => {
              const owner = db.users.find((u) => u.id === v.ownerId);
              return { ...v, ownerName: owner?.name ?? null, ownerStatus: owner?.status ?? null, stir: owner?.company?.stir ?? null };
            }),
        ),
      });
    }),
  );

  router.patch(
    '/vacancies/:id',
    validateBody(vacancyStatusSchema),
    asyncHandler(async (req, res) => {
      const { status } = req.body as z.infer<typeof vacancyStatusSchema>;
      const me = currentUser(res);
      const vacancy = await store.update((db) => {
        const v = db.vacancies.find((x) => x.id === req.params.id);
        if (!v) throw new HttpError(404, 'Vakansiya tabılmadı');
        v.status = status;
        logAudit(db, me, `vakansiyanı ${VACANCY_WORD[status]}`, `${v.title} · ${v.company}`);
        return v;
      });
      res.json(vacancy);
    }),
  );

  /* ───────────── Studentler dizimi (tek xızmetkerler ushın) ───────────── */
  router.get(
    '/students',
    validateQuery(studentsQuery),
    asyncHandler(async (_req, res) => {
      const query = res.locals.query as StudentsQuery;
      // Kontakt maǵlıwmatları dizimde joq — tek «Kóriw» arqalı hám jurnalǵa jazılıp ashıladı
      res.json(await store.read((db) => filterStudents(db.students, query)));
    }),
  );

  router.get(
    '/students/export.csv',
    validateQuery(studentsQuery),
    asyncHandler(async (_req, res) => {
      const query = res.locals.query as StudentsQuery;
      const me = currentUser(res);
      const data = await store.update((db) => {
        const rows = filterStudents(db.students, query).data;
        logAudit(db, me, 'studentler dizimin CSV júklep aldı', `${rows.length} profil`);
        return rows;
      });
      const csv = toCsv([
        ['Atı-familiyası', 'Status', 'Mámleket', 'Universitet', 'Tarawı', 'Grant', 'Jıllar'],
        ...data.map((s) => [s.name, STATUS_LABEL[s.status], s.country, s.university, s.field, s.grant, s.years]),
      ]);
      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('Content-Disposition', 'attachment; filename="tekshe-studentler.csv"');
      res.send(csv);
    }),
  );

  router.post(
    '/students',
    validateBody(adminStudentSchema),
    asyncHandler(async (req, res) => {
      const body = req.body as z.infer<typeof adminStudentSchema>;
      const me = currentUser(res);
      const student: Student = { id: randomUUID(), userId: null, ...body, createdAt: new Date().toISOString() };
      await store.update((db) => {
        db.students.push(student);
        logAudit(db, me, 'studentti dizimge qostı', student.name);
      });
      res.status(201).json(student);
    }),
  );

  router.delete(
    '/students/:id',
    asyncHandler(async (req, res) => {
      const me = currentUser(res);
      await store.update((db) => {
        const i = db.students.findIndex((s) => s.id === req.params.id);
        if (i < 0) throw new HttpError(404, 'Student tabılmadı');
        const [removed] = db.students.splice(i, 1);
        logAudit(db, me, 'studentti dizimnen óshirdi', removed!.name);
      });
      res.status(204).end();
    }),
  );

  /** Kontaktı kóriw: kim hám qashan kórgeni jurnalǵa jazıladı */
  router.post(
    '/students/:id/reveal',
    asyncHandler(async (req, res) => {
      const me = currentUser(res);
      const contact = await store.update((db) => {
        const s = db.students.find((x) => x.id === req.params.id);
        if (!s) throw new HttpError(404, 'Student tabılmadı');
        const user = s.userId ? db.users.find((u) => u.id === s.userId) : null;
        logAudit(db, me, 'studenttiń kontaktın kórdi', s.name);
        return { name: s.name, hasAccount: !!user, phone: user?.phone || null };
      });
      res.json(contact);
    }),
  );

  /* ───────────── Jurnal ───────────── */
  router.get(
    '/audit',
    validateQuery(auditQuery),
    asyncHandler(async (_req, res) => {
      const { limit } = res.locals.query as z.infer<typeof auditQuery>;
      res.json({ data: await store.read((db) => [...db.audit].sort(newestFirst).slice(0, limit)) });
    }),
  );

  return router;
};
