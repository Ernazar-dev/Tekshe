import { randomUUID } from 'node:crypto';
import { Router } from 'express';
import { z } from 'zod';
import type { Store } from '../../data/store.js';
import { currentUser, toPublic, type Auth } from '../../middleware/auth.js';
import { validateBody } from '../../middleware/validate.js';
import type { User } from '../../types.js';
import { asyncHandler, HttpError } from '../../utils/errors.js';
import { hashPassword, verifyPassword } from '../../utils/password.js';
import { loginField } from '../../utils/login.js';
import { signToken } from '../../utils/token.js';

const password = z.string({ required_error: 'Parol kiritiń' }).min(8, 'Parol keminde 8 belgi').max(100);
const name = z.string({ required_error: 'Atıńızdı kiritiń' }).trim().min(2, 'Atıńız — keminde 2 belgi').max(80);
const phone = z
  .string()
  .trim()
  .max(20)
  .refine((v) => !v || /^\+?[\d\s()-]{7,20}$/.test(v), 'Telefon nomeri qáte')
  .optional()
  .transform((v) => v ?? '');

export const registerSchema = z.object({
  name,
  login: loginField,
  password,
  phone,
  // Admin ózin-ózi dizimnen óte almaydı
  role: z.enum(['student', 'mentor', 'employer'], { errorMap: () => ({ message: 'Rol tańlanbaǵan' }) }),
});
const loginSchema = z.object({ login: z.string({ required_error: 'Login kiritiń' }).trim().toLowerCase().min(1, 'Login kiritiń'), password: z.string({ required_error: 'Parol kiritiń' }).min(1, 'Parol kiritiń') });
const profileSchema = z.object({ name, phone });
const passwordSchema = z.object({ current: z.string({ required_error: 'Házirgi paroldı kiritiń' }).min(1, 'Házirgi paroldı kiritiń'), next: password });

export const createAuthRouter = (store: Store, auth: Auth, secret: string) => {
  const router = Router();
  const issue = (user: User) => ({ token: signToken({ sub: user.id, role: user.role }, secret), user: toPublic(user) });

  router.post(
    '/register',
    validateBody(registerSchema),
    asyncHandler(async (req, res) => {
      const body = req.body as z.infer<typeof registerSchema>;
      const passwordHash = await hashPassword(body.password);
      const user = await store.update((db) => {
        if (db.users.some((u) => u.login === body.login)) throw new HttpError(409, 'Bul login menen akkaunt bar', { login: ['Bul login bánt'] });
        const created: User = {
          id: randomUUID(),
          name: body.name,
          login: body.login,
          phone: body.phone,
          role: body.role,
          // Mentor hám tadbirkordı admin tastıyıqlaydı
          status: body.role === 'student' ? 'active' : 'pending',
          passwordHash,
          createdAt: new Date().toISOString(),
        };
        db.users.push(created);
        return created;
      });
      res.status(201).json(issue(user));
    }),
  );

  router.post(
    '/login',
    validateBody(loginSchema),
    asyncHandler(async (req, res) => {
      const body = req.body as z.infer<typeof loginSchema>;
      const user = await store.read((db) => db.users.find((u) => u.login === body.login));
      // Paydalanıwshı tabılmasa da xesh tekseriledi — juwap waqtı arqalı login anıqlanbawı ushın
      const ok = await verifyPassword(body.password, user?.passwordHash ?? `scrypt$${'0'.repeat(32)}$${'0'.repeat(128)}`);
      if (!user || !ok) throw new HttpError(401, 'Login yamasa parol qáte');
      if (user.status === 'blocked') throw new HttpError(403, 'Akkauntıńız bloklanǵan. Administratorǵa xabarlasıń.');
      res.json(issue(user));
    }),
  );

  router.get('/me', auth.requireAuth, (_req, res) => {
    res.json(currentUser(res));
  });

  router.patch(
    '/me',
    auth.requireAuth,
    validateBody(profileSchema),
    asyncHandler(async (req, res) => {
      const body = req.body as z.infer<typeof profileSchema>;
      const me = currentUser(res);
      const user = await store.update((db) => {
        const u = db.users.find((x) => x.id === me.id)!;
        u.name = body.name;
        u.phone = body.phone;
        // Atı basqa jerlerde de jańalanadı
        for (const m of db.mentors) if (m.userId === u.id) m.name = u.name;
        for (const s of db.students) if (s.userId === u.id) s.name = u.name;
        return toPublic(u);
      });
      res.json(user);
    }),
  );

  router.post(
    '/password',
    auth.requireAuth,
    validateBody(passwordSchema),
    asyncHandler(async (req, res) => {
      const body = req.body as z.infer<typeof passwordSchema>;
      const me = currentUser(res);
      const stored = await store.read((db) => db.users.find((u) => u.id === me.id)!.passwordHash);
      if (!(await verifyPassword(body.current, stored))) throw new HttpError(400, 'Házirgi parol qáte', { current: ['Parol qáte'] });
      const passwordHash = await hashPassword(body.next);
      await store.update((db) => {
        db.users.find((u) => u.id === me.id)!.passwordHash = passwordHash;
      });
      res.json({ ok: true });
    }),
  );

  return router;
};
