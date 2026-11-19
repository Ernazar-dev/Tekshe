import { Router } from 'express';
import { z } from 'zod';
import { CHECKLISTS, GRANTS, LEVELS, SUPPORT_TOPICS, VIDEOS } from '../../data/content.js';
import { publicMentors, publicVacancies } from '../../data/queries.js';
import type { Store } from '../../data/store.js';
import { validateQuery } from '../../middleware/validate.js';
import type { Database } from '../../types.js';
import { asyncHandler } from '../../utils/errors.js';

const uniqueSorted = (values: string[]) => [...new Set(values)].sort((a, b) => a.localeCompare(b));
const countBy = (values: string[]) =>
  Object.entries(values.reduce<Record<string, number>>((acc, v) => ({ ...acc, [v]: (acc[v] ?? 0) + 1 }), {}))
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));

const optionalText = z.string().trim().max(100).optional().transform((v) => v || undefined);

const grantsQuery = z.object({ level: z.enum(['Bakalavr', 'Magistr', 'PhD']).optional() });
const mentorsQuery = z.object({ country: optionalText });
const vacanciesQuery = z.object({ field: optionalText });

/** Ashıq statistika — jeke maǵlıwmat joq, tek ulıwma sanlar */
export const publicStats = (db: Readonly<Database>) => ({
  students: db.students.filter((s) => s.status === 'now').length,
  graduates: db.students.filter((s) => s.status === 'back').length,
  countries: new Set(db.students.map((s) => s.country)).size,
  mentors: publicMentors(db).length,
  vacancies: publicVacancies(db).length,
  grants: GRANTS.length,
});

export const createCatalogRouter = (store: Store) => {
  const router = Router();

  router.get('/grants', validateQuery(grantsQuery), (_req, res) => {
    const { level } = res.locals.query as z.infer<typeof grantsQuery>;
    res.json({ data: level ? GRANTS.filter((g) => g.levels.includes(level)) : GRANTS, levels: LEVELS });
  });

  router.get(
    '/mentors',
    validateQuery(mentorsQuery),
    asyncHandler(async (_req, res) => {
      const { country } = res.locals.query as z.infer<typeof mentorsQuery>;
      res.json(
        await store.read((db) => {
          const all = publicMentors(db);
          return { data: country ? all.filter((m) => m.country === country) : all, countries: uniqueSorted(all.map((m) => m.country)) };
        }),
      );
    }),
  );

  router.get(
    '/vacancies',
    validateQuery(vacanciesQuery),
    asyncHandler(async (_req, res) => {
      const { field } = res.locals.query as z.infer<typeof vacanciesQuery>;
      res.json(
        await store.read((db) => {
          const all = publicVacancies(db);
          return { data: field ? all.filter((v) => v.field === field) : all, fields: uniqueSorted(all.map((v) => v.field)) };
        }),
      );
    }),
  );

  router.get('/guides', (_req, res) => {
    res.json({ checklists: CHECKLISTS, videos: VIDEOS });
  });

  router.get('/support-topics', (_req, res) => {
    res.json({ data: SUPPORT_TOPICS });
  });

  router.get(
    '/stats',
    asyncHandler(async (_req, res) => {
      res.json(await store.read(publicStats));
    }),
  );

  /** Jámáát sahifası ushın: mámleket hám taraw boyınsha ulıwma sanlar (atlar hám kontaktlar joq) */
  router.get(
    '/community',
    asyncHandler(async (_req, res) => {
      res.json(
        await store.read((db) => ({
          ...publicStats(db),
          byCountry: countBy(db.students.map((s) => s.country)),
          byField: countBy(db.students.map((s) => s.field)).slice(0, 8),
        })),
      );
    }),
  );

  return router;
};
