import { z } from 'zod';
import type { Student } from '../../types.js';

export const STATUS_LABEL: Record<Student['status'], string> = { now: 'Oqıp atır', back: 'Pitkerip qayttı' };

const optionalText = z.string().trim().max(100).optional().transform((v) => v || undefined);

export const studentsQuery = z.object({
  status: z.enum(['now', 'back']).optional(),
  q: optionalText,
  country: optionalText,
  grant: optionalText,
  field: optionalText,
});
export type StudentsQuery = z.infer<typeof studentsQuery>;

const required = (label: string, max: number) =>
  z
    .string({ required_error: `${label} kiritilmegen` })
    .trim()
    .min(2, `${label} — keminde 2 belgi`)
    .max(max, `${label} — kóbi menen ${max} belgi`);

const YEARS_RE = /^(\d{4})\s*[–-]\s*(\d{4})$/;

/** Student profili (óziniń yamasa admin qosqan) */
export const studentProfileSchema = z.object({
  status: z.enum(['now', 'back'], { errorMap: () => ({ message: 'Status tańlanbaǵan' }) }),
  country: required('Mámleket', 50),
  university: required('Universitet', 100),
  field: required('Tarawı', 70),
  grant: z
    .string()
    .trim()
    .max(80)
    .optional()
    .transform((v) => v || 'Kórsetilmegen'),
  years: z
    .string()
    .trim()
    .optional()
    .transform((v, ctx) => {
      if (!v) return '—';
      const m = YEARS_RE.exec(v);
      const from = Number(m?.[1]);
      const to = Number(m?.[2]);
      if (!m || from < 1950 || to > 2100 || from > to) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Jıllar 2022–2026 formatında bolsın' });
        return z.NEVER;
      }
      return `${from}–${to}`;
    }),
});

/** Admin qosatuǵın student: profil + at */
export const adminStudentSchema = studentProfileSchema.extend({ name: required('Atı-familiyası', 80) });

const includes = (haystack: string, needle: string) => haystack.toLocaleLowerCase().includes(needle.toLocaleLowerCase());

/** Status filtrinen basqa barlıq filtrler */
const matchesFilters = (s: Student, { q, country, grant, field }: StudentsQuery) =>
  (!q || includes([s.name, s.university, s.field].join(' '), q)) &&
  (!country || s.country === country) &&
  (!grant || s.grant === grant) &&
  (!field || s.field === field);

const uniqueSorted = (values: string[]) => [...new Set(values)].sort((a, b) => a.localeCompare(b));

export const filterStudents = (all: readonly Student[], query: StudentsQuery) => {
  const base = all.filter((s) => matchesFilters(s, query));
  const data = query.status ? base.filter((s) => s.status === query.status) : base;
  return {
    data,
    total: data.length,
    // Status tablarındaǵı sanlar basqa filtrlerdi esapqa aladı
    counts: {
      all: base.length,
      now: base.filter((s) => s.status === 'now').length,
      back: base.filter((s) => s.status === 'back').length,
    },
    facets: {
      countries: uniqueSorted(all.map((s) => s.country)),
      grants: uniqueSorted(all.map((s) => s.grant)),
      fields: uniqueSorted(all.map((s) => s.field)),
    },
  };
};
