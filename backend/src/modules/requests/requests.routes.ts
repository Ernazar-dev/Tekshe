import { randomUUID } from 'node:crypto';
import { Router } from 'express';
import { z } from 'zod';
import type { Store } from '../../data/store.js';
import { currentUser, type Auth } from '../../middleware/auth.js';
import { validateBody } from '../../middleware/validate.js';
import type { ContactRequest } from '../../types.js';
import { asyncHandler, HttpError } from '../../utils/errors.js';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^\+?[\d\s()-]{7,20}$/;
const TELEGRAM_RE = /^@\w{4,32}$/;

export const createRequestSchema = z.object({
  type: z.enum(['mentor', 'vacancy'], { errorMap: () => ({ message: 'Soraw túri qáte' }) }),
  targetId: z.string().trim().min(1).max(60),
  // Baylanıs májbúriy emes: juwap platforma ishinde keledi. Tek óz erkin menen qosılatuǵın qosımsha jol.
  contact: z
    .string()
    .trim()
    .max(100)
    .refine((v) => !v || EMAIL_RE.test(v) || PHONE_RE.test(v) || TELEGRAM_RE.test(v), 'Telefon, e-mail yamasa Telegram (@username) kiritiń')
    .optional()
    .transform((v) => v ?? ''),
  message: z
    .string({ required_error: 'Sorawıńızdı jazıń' })
    .trim()
    .min(10, 'Soraw — keminde 10 belgi')
    .max(1000, 'Soraw — kóbi menen 1000 belgi'),
});

export const createRequestsRouter = (store: Store, auth: Auth) => {
  const router = Router();

  // Mentorǵa soraw hám vakansiyaǵa arza — tek student (yamasa mentor) kirgennen keyin; baylanıs platforma arqalı
  router.post(
    '/',
    auth.requireRole('student', 'mentor'),
    validateBody(createRequestSchema),
    asyncHandler(async (req, res) => {
      const body = req.body as z.infer<typeof createRequestSchema>;
      const me = currentUser(res);
      const created = await store.update((db) => {
        if (body.type === 'mentor') {
          const mentor = db.mentors.find((m) => m.id === body.targetId);
          const owner = mentor?.userId ? db.users.find((u) => u.id === mentor.userId) : null;
          if (!mentor || (owner && owner.status !== 'active')) throw new HttpError(404, 'Mentor tabılmadı');
          if (mentor.userId === me.id) throw new HttpError(400, 'Ózińizge soraw jibere almaysız');
        } else {
          if (me.role !== 'student') throw new HttpError(403, 'Vakansiyaǵa tek studentler arza bere aladı');
          const vacancy = db.vacancies.find((v) => v.id === body.targetId && v.status === 'approved');
          if (!vacancy) throw new HttpError(404, 'Vakansiya tabılmadı');
          if (db.requests.some((r) => r.type === 'vacancy' && r.targetId === vacancy.id && r.fromUserId === me.id)) {
            throw new HttpError(409, 'Siz bul vakansiyaǵa aldın arza bergensiz');
          }
        }
        const now = new Date().toISOString();
        const request: ContactRequest = {
          id: randomUUID(),
          type: body.type,
          targetId: body.targetId,
          fromUserId: me.id,
          name: me.name,
          contact: body.contact,
          message: body.message,
          status: 'new',
          reply: '',
          createdAt: now,
          updatedAt: now,
        };
        db.requests.push(request);
        return request;
      });
      res.status(201).json({ id: created.id, createdAt: created.createdAt });
    }),
  );

  return router;
};
