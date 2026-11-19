import { randomUUID } from 'node:crypto';
import { Router } from 'express';
import { z } from 'zod';
import { CHECKLISTS } from '../../data/content.js';
import { initials, newestFirst, publicMentors, withTarget } from '../../data/queries.js';
import type { Store } from '../../data/store.js';
import { currentUser, type Auth } from '../../middleware/auth.js';
import { validateBody } from '../../middleware/validate.js';
import type { Database, Vacancy } from '../../types.js';
import { asyncHandler, HttpError } from '../../utils/errors.js';
import { studentProfileSchema } from '../students/students.routes.js';

const text = (label: string, min: number, max: number) =>
  z
    .string({ required_error: `${label} kiritilmegen` })
    .trim()
    .min(min, `${label} — keminde ${min} belgi`)
    .max(max, `${label} — kóbi menen ${max} belgi`);

const list = (label: string, max: number) =>
  z
    .array(z.string().trim().min(2, `${label} — keminde 2 belgi`).max(40, `${label} — kóbi menen 40 belgi`), { required_error: `${label} kiritilmegen` })
    .min(1, `${label} — keminde bir mánis`)
    .max(max, `${label} — kóbi menen ${max} mánis`);

const mentorSchema = z.object({
  job: text('Kásip', 2, 80),
  university: text('Universitet', 2, 100),
  country: text('Mámleket', 2, 50),
  year: z.coerce.number({ invalid_type_error: 'Pitkergen jıl san bolsın' }).int().min(1950, 'Jıl qáte').max(2100, 'Jıl qáte'),
  topics: list('Temalar', 8),
  languages: list('Tiller', 6),
  bio: z.string().trim().max(500, 'Kóbi menen 500 belgi').optional().transform((v) => v ?? ''),
});

const companySchema = z.object({
  name: text('Kárxana atı', 2, 80),
  city: text('Qala', 2, 50),
  stir: z.string({ required_error: 'STIR kiritilmegen' }).trim().regex(/^\d{9}$/, 'STIR — 9 san'),
  about: z.string().trim().max(500, 'Kóbi menen 500 belgi').optional().transform((v) => v ?? ''),
});

const VACANCY_TYPES = ['Tolıq kún', 'Yarım kún', 'Onlayn'] as const;
const vacancySchema = z.object({
  title: text('Lawazım', 3, 80),
  field: text('Taraw', 2, 50),
  city: text('Qala', 2, 50),
  type: z.enum(VACANCY_TYPES, { errorMap: () => ({ message: 'Jumıs túri tańlanbaǵan' }) }),
  requirement: text('Talap', 5, 300),
});

const checklistSchema = z.object({ done: z.array(z.string().max(60)).max(100) });
const replySchema = z.object({
  reply: z.string().trim().max(1000, 'Kóbi menen 1000 belgi').optional(),
  status: z.enum(['new', 'answered', 'closed']).optional(),
});

const ALL_ITEM_IDS = new Set(CHECKLISTS.flatMap((s) => s.items.map((i) => i.id)));

/** Mentor yamasa tadbirkorǵa kelgen sorawlar */
const inboxFor = (db: Readonly<Database>, userId: string, role: 'mentor' | 'employer') => {
  const targets =
    role === 'mentor'
      ? new Set(db.mentors.filter((m) => m.userId === userId).map((m) => m.id))
      : new Set(db.vacancies.filter((v) => v.ownerId === userId).map((v) => v.id));
  const type = role === 'mentor' ? 'mentor' : 'vacancy';
  return db.requests.filter((r) => r.type === type && targets.has(r.targetId));
};

export const createMeRouter = (store: Store, auth: Auth) => {
  const router = Router();
  router.use(auth.requireAuth);

  /* ───────────── Ortaq: jibergen sorawlarım ───────────── */
  router.get(
    '/requests',
    auth.requireRole('student', 'mentor'),
    asyncHandler(async (_req, res) => {
      const me = currentUser(res);
      res.json({
        data: await store.read((db) =>
          db.requests
            .filter((r) => r.fromUserId === me.id)
            .sort(newestFirst)
            .map((r) => withTarget(db, r)),
        ),
      });
    }),
  );

  /* ───────────── Student ───────────── */
  router.get(
    '/student',
    auth.requireRole('student'),
    asyncHandler(async (_req, res) => {
      const me = currentUser(res);
      res.json(
        await store.read((db) => {
          const profile = db.students.find((s) => s.userId === me.id) ?? null;
          const user = db.users.find((u) => u.id === me.id)!;
          // Mámleket yamasa taraw boyınsha sáykes mentorlar
          const recommended = profile
            ? publicMentors(db)
                .map((m) => ({
                  m,
                  score: Number(m.country === profile.country) * 2 + Number(m.topics.some((t) => t.toLocaleLowerCase() === profile.field.toLocaleLowerCase())),
                }))
                .filter((x) => x.score > 0)
                .sort((a, b) => b.score - a.score)
                .slice(0, 3)
                .map((x) => x.m)
            : [];
          return { profile, checklist: (user.checklist ?? []).filter((id) => ALL_ITEM_IDS.has(id)), recommended };
        }),
      );
    }),
  );

  router.put(
    '/student',
    auth.requireRole('student'),
    validateBody(studentProfileSchema),
    asyncHandler(async (req, res) => {
      const body = req.body as z.infer<typeof studentProfileSchema>;
      const me = currentUser(res);
      const profile = await store.update((db) => {
        const existing = db.students.find((s) => s.userId === me.id);
        if (existing) return Object.assign(existing, body, { name: me.name });
        const created = { id: randomUUID(), userId: me.id, name: me.name, ...body, createdAt: new Date().toISOString() };
        db.students.push(created);
        return created;
      });
      res.json(profile);
    }),
  );

  router.put(
    '/checklist',
    auth.requireRole('student'),
    validateBody(checklistSchema),
    asyncHandler(async (req, res) => {
      const { done } = req.body as z.infer<typeof checklistSchema>;
      const me = currentUser(res);
      const saved = [...new Set(done.filter((id) => ALL_ITEM_IDS.has(id)))];
      await store.update((db) => {
        db.users.find((u) => u.id === me.id)!.checklist = saved;
      });
      res.json({ done: saved });
    }),
  );

  /* ───────────── Mentor ───────────── */
  router.get(
    '/mentor',
    auth.requireRole('mentor'),
    asyncHandler(async (_req, res) => {
      const me = currentUser(res);
      res.json({ profile: await store.read((db) => db.mentors.find((m) => m.userId === me.id) ?? null) });
    }),
  );

  router.put(
    '/mentor',
    auth.requireRole('mentor'),
    validateBody(mentorSchema),
    asyncHandler(async (req, res) => {
      const body = req.body as z.infer<typeof mentorSchema>;
      const me = currentUser(res);
      const profile = await store.update((db) => {
        const existing = db.mentors.find((m) => m.userId === me.id);
        const fields = { ...body, name: me.name, initials: initials(me.name) };
        if (existing) return Object.assign(existing, fields);
        const created = { id: randomUUID(), userId: me.id, ...fields };
        db.mentors.push(created);
        return created;
      });
      res.json({ profile });
    }),
  );

  /* ───────────── Tadbirkor ───────────── */
  router.get('/company', auth.requireRole('employer'), (_req, res) => {
    res.json({ company: currentUser(res).company ?? null });
  });

  router.put(
    '/company',
    auth.requireRole('employer'),
    validateBody(companySchema),
    asyncHandler(async (req, res) => {
      const company = req.body as z.infer<typeof companySchema>;
      const me = currentUser(res);
      await store.update((db) => {
        db.users.find((u) => u.id === me.id)!.company = company;
        // Kárxana atı bar vakansiyalarda da jańalanadı
        for (const v of db.vacancies) if (v.ownerId === me.id) v.company = company.name;
      });
      res.json({ company });
    }),
  );

  router.get(
    '/vacancies',
    auth.requireRole('employer'),
    asyncHandler(async (_req, res) => {
      const me = currentUser(res);
      res.json({
        data: await store.read((db) =>
          db.vacancies
            .filter((v) => v.ownerId === me.id)
            .sort(newestFirst)
            .map((v) => ({ ...v, applications: db.requests.filter((r) => r.type === 'vacancy' && r.targetId === v.id).length })),
        ),
      });
    }),
  );

  router.post(
    '/vacancies',
    auth.requireRole('employer'),
    validateBody(vacancySchema),
    asyncHandler(async (req, res) => {
      const body = req.body as z.infer<typeof vacancySchema>;
      const me = currentUser(res);
      if (!me.company) throw new HttpError(400, 'Aldın kárxana maǵlıwmatın toltırıń');
      const company = me.company;
      const vacancy = await store.update((db) => {
        const created: Vacancy = {
          id: randomUUID(),
          ownerId: me.id,
          initials: initials(company.name),
          company: company.name,
          ...body,
          // Hár vakansiyanı moderator tekseredi
          status: 'pending',
          createdAt: new Date().toISOString(),
        };
        db.vacancies.push(created);
        return created;
      });
      res.status(201).json(vacancy);
    }),
  );

  router.put(
    '/vacancies/:id',
    auth.requireRole('employer'),
    validateBody(vacancySchema),
    asyncHandler(async (req, res) => {
      const body = req.body as z.infer<typeof vacancySchema>;
      const me = currentUser(res);
      const vacancy = await store.update((db) => {
        const v = db.vacancies.find((x) => x.id === req.params.id && x.ownerId === me.id);
        if (!v) throw new HttpError(404, 'Vakansiya tabılmadı');
        Object.assign(v, body, { status: 'pending' as const });
        return v;
      });
      res.json(vacancy);
    }),
  );

  router.delete(
    '/vacancies/:id',
    auth.requireRole('employer'),
    asyncHandler(async (req, res) => {
      const me = currentUser(res);
      await store.update((db) => {
        const i = db.vacancies.findIndex((x) => x.id === req.params.id && x.ownerId === me.id);
        if (i < 0) throw new HttpError(404, 'Vakansiya tabılmadı');
        db.vacancies.splice(i, 1);
      });
      res.status(204).end();
    }),
  );

  /* ───────────── Mentor hám tadbirkor: kelgen sorawlar ───────────── */
  router.get(
    '/inbox',
    auth.requireRole('mentor', 'employer'),
    asyncHandler(async (_req, res) => {
      const me = currentUser(res);
      res.json({
        data: await store.read((db) =>
          inboxFor(db, me.id, me.role as 'mentor' | 'employer')
            .sort(newestFirst)
            .map((r) => withTarget(db, r)),
        ),
      });
    }),
  );

  router.patch(
    '/inbox/:id',
    auth.requireRole('mentor', 'employer'),
    validateBody(replySchema),
    asyncHandler(async (req, res) => {
      const body = req.body as z.infer<typeof replySchema>;
      const me = currentUser(res);
      const updated = await store.update((db) => {
        const r = inboxFor(db, me.id, me.role as 'mentor' | 'employer').find((x) => x.id === req.params.id);
        if (!r) throw new HttpError(404, 'Soraw tabılmadı');
        if (body.reply !== undefined) r.reply = body.reply;
        r.status = body.status ?? (body.reply ? 'answered' : r.status);
        r.updatedAt = new Date().toISOString();
        return withTarget(db, r);
      });
      res.json(updated);
    }),
  );

  return router;
};
